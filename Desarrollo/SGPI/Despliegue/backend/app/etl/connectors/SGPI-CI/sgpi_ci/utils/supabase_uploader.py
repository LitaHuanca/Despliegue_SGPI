import json
from decimal import Decimal
from typing import Any, Dict, List

from sgpi_ci.config import settings, DEFAULT_CHUNK_SIZE


class SupabaseUploader:
    """
    Encapsula la comunicación con Supabase mediante llamadas RPC.
    Usa SUPABASE_SERVICE_KEY para operar con SECURITY DEFINER (bypasa RLS).
    """

    def __init__(self) -> None:
        self._client = None

    def _get_client(self):
        """Inicializa el cliente Supabase de forma lazy (solo cuando se necesita)."""
        if self._client is None:
            settings.validate()
            try:
                from supabase import create_client
                self._client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_KEY,
                )
            except ImportError:
                raise RuntimeError(
                    "El paquete 'supabase' no está instalado.\n"
                    "Ejecuta: pip install supabase"
                )
        return self._client

    @staticmethod
    def _serialize(obj: Any) -> Any:
        """Convierte Decimal a float para serialización JSON."""
        if isinstance(obj, Decimal):
            return float(obj)
        raise TypeError(f"Tipo no serializable: {type(obj)}")

    def upload(
        self,
        rpc_name: str,
        records: List[Dict[str, Any]],
        chunk_size: int = DEFAULT_CHUNK_SIZE,
        quiet: bool = False,
    ) -> Dict[str, int]:
        """
        Envía registros validados a Supabase en batches mediante llamada RPC.

        Args:
            rpc_name:   Nombre de la función RPC en Supabase.
            records:    Lista de dicts validados por Pydantic.
            chunk_size: Registros por llamada (default: 200).
            quiet:      Suprime mensajes de progreso si True.

        Returns:
            {'insertados': n, 'actualizados': n, 'fallidos': n}

        Raises:
            ConnectionError: [EX4] Si hay un error de red durante la carga.
        """
        client = self._get_client()

        totals: Dict[str, int] = {"procesados": 0, "fallidos": 0}

        chunks = [
            records[i : i + chunk_size]
            for i in range(0, len(records), chunk_size)
        ]
        total_chunks = len(chunks)

        for idx, chunk in enumerate(chunks, 1):
            if not quiet:
                print(f"  Chunk {idx}/{total_chunks} — {len(chunk)} registros...")

            try:
                # Serializar Decimal → float antes de enviar
                payload_json = json.loads(
                    json.dumps(chunk, default=self._serialize)
                )

                response = client.rpc(
                    rpc_name, {"payload": payload_json}
                ).execute()

                if response.data and isinstance(response.data, dict):
                    totals["procesados"]  += response.data.get("procesados", 0)
                    totals["fallidos"]    += response.data.get("fallidos", 0)

            except Exception as e:
                # [EX4]: Cada chunk es una llamada RPC independiente.
                # Si el chunk N falla, los chunks 1..N-1 ya fueron commiteados en Supabase.
                # NO hay rollback de la importación completa — solo del chunk fallido.
                committed = idx - 1
                raise ConnectionError(
                    f"[EX4] Error en chunk {idx}/{total_chunks} de la carga a Supabase.\n"
                    f"Los {committed} chunk(s) anteriores ya fueron commiteados y NO se revierten.\n"
                    f"Ejecuta '--preview' para diagnosticar el archivo antes de reintentar.\n"
                    f"Detalle técnico: {e}"
                ) from e

        return totals
