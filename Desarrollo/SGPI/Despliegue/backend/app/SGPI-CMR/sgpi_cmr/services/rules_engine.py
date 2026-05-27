from typing import Dict, Any, Tuple, Optional
from sgpi_cmr.schemas.incoming import InvestigadorInput, ProyectoInput, PublicacionInput, AsesorTesisInput
from sgpi_cmr.services.name_normalizer import normalizer

class ReconciliationRulesEngine:
    """
    Motor de Reglas para el Módulo de Reconciliación.
    Prioridades:
    1. Regla de Oro: Ingreso Manual (BD actual) > Cualquier fuente automática
    2. Investigador: RENACYT > RAIS
    3. Proyecto: VRIP > RAIS
    4. Publicacion: Indexadas > RAIS
    """

    def _is_manual_override(self, current_record: Dict[str, Any], field_name: str) -> bool:
        # Aquí se asume que en algún lado podríamos tener la meta-data de si fue edición manual.
        # Por ahora, si el campo ya existe y viene de una edición manual, asumimos True.
        # Para el prototipo, asumimos que si no es nulo, no se debe pisar ciegamente a menos que
        # la fuente ganadora tenga precedencia sobre la fuente actual.
        # TODO: Integrar lógica real de 'origen_dato' cuando el modelo soporte meta-datos de fuentes.
        return False 

    def reconcile_investigador(self, current: Optional[Dict[str, Any]], incoming: InvestigadorInput, fuente: str) -> Tuple[Dict[str, Any], bool, str]:
        """
        Retorna (merged_data, requires_quarantine, reason)
        """
        incoming_dict = incoming.model_dump(exclude_unset=True, exclude_none=True)
        if not current:
            # Nuevo registro, insertarlo tal cual
            return incoming_dict, False, ""

        merged = current.copy()
        requires_quarantine = False
        reason = ""

        # Regla: RENACYT gana a RAIS en grado, categoria, puntaje, etc.
        for field, value in incoming_dict.items():
            if field in ['grado_academico_max', 'categoria_renacyt', 'estado_renacyt', 'codigo_renacyt']:
                if fuente == 'RENACYT':
                    merged[field] = value
                elif fuente == 'RAIS' and not current.get(field):
                    merged[field] = value
                elif fuente == 'RAIS' and current.get(field):
                    # Conflicto: RAIS trata de pisar data que ya existe (posiblemente de RENACYT)
                    # No sobreescribir.
                    pass
            else:
                if fuente == 'RAIS' and current.get(field):
                    pass # RAIS nunca pisa datos que ya existen (Regla de oro simplificada)
                elif not current.get(field) or self._is_manual_override(current, field) == False:
                    merged[field] = value
                    
        return merged, requires_quarantine, reason

    def reconcile_proyecto(self, current: Optional[Dict[str, Any]], incoming: ProyectoInput, fuente: str) -> Tuple[Dict[str, Any], bool, str]:
        incoming_dict = incoming.model_dump(exclude_unset=True, exclude_none=True)
        if not current:
            return incoming_dict, False, ""

        merged = current.copy()
        
        # Regla: VRIP gana a RAIS
        for field, value in incoming_dict.items():
            if fuente == 'VRIP':
                merged[field] = value
            elif fuente == 'RAIS' and not current.get(field):
                merged[field] = value

        return merged, False, ""

    def reconcile_publicacion(self, current: Optional[Dict[str, Any]], incoming: PublicacionInput, fuente: str) -> Tuple[Dict[str, Any], bool, str]:
        incoming_dict = incoming.model_dump(exclude_unset=True, exclude_none=True)
        if not current:
            return incoming_dict, False, ""

        merged = current.copy()
        
        # Regla: Indexadas (Scopus/WoS) ganan a RAIS
        # Si la fuente es Scopus/WoS, sobreescribe RAIS. Si es RAIS, solo llena vacíos.
        es_indexada = fuente in ['Scopus', 'Web of Science', 'SciELO']
        for field, value in incoming_dict.items():
            if es_indexada:
                merged[field] = value
            elif fuente == 'RAIS' and not current.get(field):
                merged[field] = value

        # Si no hay DOI ni título muy similar, esto debería marcarse en la API para ir a cuarentena.
        return merged, False, ""

    def reconcile_asesor_tesis(self, padron_investigadores: Dict[str, str], incoming: AsesorTesisInput) -> Tuple[Dict[str, Any], bool, str]:
        incoming_dict = incoming.model_dump(exclude_unset=True, exclude_none=True)
        
        # Regla: Cybertesis solo trae texto libre de asesor ("Perez, Juan"). 
        # Intentar cruzar por DNI si viene, o usar Fuzzy Matching contra el padrón.
        dni_encontrado = incoming_dict.get("dni_asesor")
        
        if not dni_encontrado:
            match = normalizer.find_best_match(incoming_dict["asesor_texto"], padron_investigadores)
            if match:
                dni_encontrado, score = match
        
        if dni_encontrado:
            incoming_dict["dni_asesor_reconciliado"] = dni_encontrado
            return incoming_dict, False, ""
        else:
            return incoming_dict, True, "No se pudo hacer match del asesor de tesis por nombre con la confianza requerida."

rules_engine = ReconciliationRulesEngine()
