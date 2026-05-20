// supabase/index.js
// Punto de entrada central — exporta todos los módulos del SGPI
// Importa desde aquí en lugar de importar módulos individuales

// ── Cliente base ──────────────────────────────────────────────
export { supabase } from './client.js'

// ── Helpers genéricos ─────────────────────────────────────────
export {
  getAll,
  getById,
  getWhere,
  insert,
  updateById,
  deleteById,
  testConnection,
} from './db.js'

// ── Investigador ──────────────────────────────────────────────
export {
  getAllInvestigadores,
  getInvestigadorByDni,
  buscarPorApellido,
  getInvestigadoresRenacyt,
  getInvestigadoresConDeuda,
  getInvestigadorConProyectos,
  getInvestigadorConHistorial,
  getInvestigadorConTesis,
  insertInvestigador,
  updateInvestigador,
  setDeudaInvestigador,
  deleteInvestigador,
} from './investigador.js'

// ── Proyecto ──────────────────────────────────────────────────
export {
  getAllProyectos,
  getProyectoByCodigo,
  getProyectosByEstado,
  getProyectosByAnio,
  buscarProyectosPorTitulo,
  getProyectoConInvestigadores,
  getProyectoConEstudiantes,
  getProyectoConEntregables,
  getProyectoCompleto,
  insertProyecto,
  updateProyecto,
  cambiarEstadoProyecto,
  deleteProyecto,
  asignarInvestigador,
  desasignarInvestigador,
} from './proyecto.js'

// ── Historial de Puntajes (RAIS) ──────────────────────────────
export {
  getHistorialByDni,
  getHistorialByDniYAnio,
  getRankingByAnio,
  insertHistorial,
  updateHistorial,
  deleteHistorial,
} from './historial.js'

// ── Tesis (Cybertesis) ────────────────────────────────────────
export {
  getAllTesis,
  getTesisByUrl,
  getTesisByAsesor,
  getTesisByAnio,
  getTesisByNivelGrado,
  buscarTesisPorTitulo,
  insertTesis,
  updateTesis,
  deleteTesis,
} from './tesis.js'

// ── Entregables (Monitoreo) ───────────────────────────────────
export {
  getEntregablesByProyecto,
  getEntregablesByEstado,
  getEntregablesProximos,
  insertEntregable,
  updateEntregable,
  marcarEntregado,
  deleteEntregable,
} from './entregable.js'

// ── Usuario y Auth ────────────────────────────────────────────
export {
  getAllUsuarios,
  getUsuarioByCorreo,
  getUsuariosByRol,
  insertUsuario,
  updateUsuario,
  deleteUsuario,
  login,
  logout,
  getUsuarioActual,
} from './usuario.js'
