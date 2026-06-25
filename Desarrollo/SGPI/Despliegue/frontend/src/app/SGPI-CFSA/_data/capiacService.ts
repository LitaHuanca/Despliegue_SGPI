import { apiClient } from '../../../SGPI-CFU/lib/api/client';

export interface LogEntry {
  id: string;
  fechaHora: string; // ISO 8601
  evento: string;
  usuario: string;
  estado: 'EXITO' | 'FALLO' | 'ADVERTENCIA';
  detail: object;
}

export interface ConfiguracionResponse {
  clave: string;
  valor: any;
  descripcion: string | null;
  updated_at: string;
}

export interface GetLogsParams {
  tipo_evento?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  skip?: number;
  limit?: number;
}

export interface UsuarioResponse {
  id_usuario: string;
  correo_institucional: string;
  rol_sistema: string;
  estado_cuenta: boolean;
  created_at: string;
}

export interface UsuarioCreate {
  correo_institucional: string;
  rol_sistema: string;
  estado_cuenta?: boolean;
}

export const capiacService = {
  // Configuración
  async getConfiguraciones(): Promise<ConfiguracionResponse[]> {
    return apiClient.get<ConfiguracionResponse[]>('/configuracion');
  },

  async updateConfiguracion(clave: string, valor: any, descripcion?: string): Promise<ConfiguracionResponse> {
    return apiClient.put<ConfiguracionResponse>(`/configuracion/${clave}`, { valor, descripcion });
  },

  // Logs
  async getLogsAuditoria(params?: GetLogsParams): Promise<LogEntry[]> {
    const searchParams = new URLSearchParams();
    if (params?.tipo_evento) searchParams.append('tipo_evento', params.tipo_evento);
    if (params?.fecha_inicio) searchParams.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) searchParams.append('fecha_fin', params.fecha_fin);
    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const path = queryString ? `/logs?${queryString}` : '/logs';
    
    const data = await apiClient.get<any[]>(path);

    // Map backend model to frontend model
    return data.map((log: any): LogEntry => ({
      id: String(log.id_log),
      fechaHora: log.timestamp_evento,
      evento: log.tipo_evento,
      usuario: log.id_usuario || 'SISTEMA',
      estado: (log.resultado?.toUpperCase() === 'SUCCESS' || log.resultado?.toUpperCase() === 'EXITO') ? 'EXITO' 
            : (log.resultado?.toUpperCase() === 'WARNING' || log.resultado?.toUpperCase() === 'ADVERTENCIA') ? 'ADVERTENCIA' 
            : 'FALLO',
      detail: {
        ...log,
        timestamp: log.timestamp_evento,
        event_type: log.tipo_evento,
        actor: log.id_usuario,
        status: log.resultado,
      }
    }));
  },

  // Usuarios
  async getUsuarios(): Promise<UsuarioResponse[]> {
    return apiClient.get<UsuarioResponse[]>('/usuarios');
  },

  async createUsuario(data: UsuarioCreate): Promise<UsuarioResponse> {
    return apiClient.post<UsuarioResponse>('/usuarios', data);
  },

  async toggleEstadoUsuario(idUsuario: string, isActive: boolean): Promise<UsuarioResponse> {
    return apiClient.patch<UsuarioResponse>(`/usuarios/${idUsuario}/estado?is_active=${isActive}`);
  }
};
