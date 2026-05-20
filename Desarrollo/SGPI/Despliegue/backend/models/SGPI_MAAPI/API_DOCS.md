# SGPI — API de Autenticación
### Sistema de Gestión de Proyectos de Investigación (VRIP)

---

## 📦 Contenido del paquete

```
sgpi-auth-api/
├── server.js                          ← Servidor Express (entrada principal)
├── package.json                       ← Dependencias del proyecto
├── .env.example                       ← Plantilla de variables de entorno
├── API_DOCS.md                        ← Este archivo
├── api/
│   ├── auth/
│   │   └── auth.routes.js             ← Endpoints de autenticación
│   └── middleware/
│       └── auth.middleware.js         ← Middleware de validación de token
└── supabase/
    ├── client.js                      ← Cliente Supabase (anon)
    ├── admin.js                       ← Cliente Supabase (service_role)
    └── migrations/
        └── 001_triggers.sql          ← Triggers de BD (ya aplicados)
```

---

## ⚙️ Configuración inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` como `.env` y rellena los valores:

```bash
cp .env.example .env
```

```env
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_ANON_KEY=eyJ...    # Settings → API → anon public
SUPABASE_SERVICE_KEY=eyJ... # Settings → API → service_role secret
DATABASE_URL=postgresql://postgres.TU-REF:[PASSWORD]@aws-X.pooler.supabase.com:6543/postgres
```

### 3. Iniciar el servidor

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

El servidor arranca en `http://localhost:3000`

---

## 🔐 Arquitectura de Autenticación

```
Cliente (Frontend / Postman)
        │
        ▼
  Express Server (server.js)
        │
        ├── POST /api/auth/register ──→ supabase.auth.signUp()
        │                                       │
        │                               [TRIGGER en BD]
        │                               on_auth_user_created
        │                                       │
        │                               INSERT en public.usuario
        │                               (rol_sistema = 'Docente')
        │
        ├── POST /api/auth/login ────→ supabase.auth.signInWithPassword()
        │                                       │
        │                               Devuelve access_token (JWT)
        │
        └── GET  /api/auth/me ──────→ requireAuth middleware
                                              │
                                    supabase.auth.getUser(token)
                                              │
                                    supabaseAdmin → public.usuario
                                              │
                                    Devuelve perfil + rol_sistema
```

---

## 📡 Endpoints

### `POST /api/auth/register`

Registra un nuevo usuario en Supabase Auth.  
El trigger `on_auth_user_created` lo inserta automáticamente en `public.usuario` con rol `'Docente'`.

**Body (JSON):**
```json
{
  "email": "docente@unmsm.edu.pe",
  "password": "MiPassword123!"
}
```

**Respuestas:**

| Código | Descripción |
|--------|-------------|
| `201`  | Usuario registrado exitosamente |
| `400`  | Campos faltantes o contraseña muy corta |
| `409`  | El correo ya está registrado |

**Respuesta exitosa (`201`):**
```json
{
  "success": true,
  "message": "Registro exitoso. Revisa tu correo electrónico para confirmar tu cuenta.",
  "usuario": {
    "id": "uuid-del-usuario",
    "email": "docente@unmsm.edu.pe"
  }
}
```

---

### `POST /api/auth/login`

Inicia sesión y devuelve los tokens de sesión.

**Body (JSON):**
```json
{
  "email": "docente@unmsm.edu.pe",
  "password": "MiPassword123!"
}
```

**Respuestas:**

| Código | Descripción |
|--------|-------------|
| `200`  | Login exitoso — devuelve tokens |
| `400`  | Campos faltantes |
| `401`  | Credenciales incorrectas |

**Respuesta exitosa (`200`):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso.",
  "auth": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "v1.MhLb5...",
    "expires_in": 3600,
    "token_type": "Bearer"
  },
  "usuario": {
    "id": "uuid-del-usuario",
    "email": "docente@unmsm.edu.pe"
  }
}
```

> ⚠️ **Guarda el `access_token`** — lo necesitas para llamar a `/api/auth/me`.

---

### `GET /api/auth/me`

Devuelve el perfil completo del usuario autenticado.  
Requiere el `access_token` obtenido del login.

**Header requerido:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Respuestas:**

| Código | Descripción |
|--------|-------------|
| `200`  | Perfil retornado exitosamente |
| `401`  | Token ausente, inválido o expirado |
| `500`  | Error al consultar la tabla `usuario` |

**Respuesta exitosa (`200`):**
```json
{
  "success": true,
  "usuario": {
    "id": "uuid-del-usuario",
    "email": "docente@unmsm.edu.pe",
    "perfil": {
      "id_usuario": "uuid-del-usuario",
      "correo_institucional": "docente@unmsm.edu.pe",
      "rol_sistema": "Docente",
      "created_at": "2026-05-20T22:07:12Z",
      "investigador": {
        "dni": "12345678",
        "nombres": "Juan",
        "apellidos": "Pérez García",
        "facultad_dependencia": "Ingeniería de Sistemas e Informática",
        "grado_academico_max": "Doctor",
        "codigo_renacyt": "P0012345"
      }
    }
  }
}
```

---

## 🔒 Middleware: `requireAuth`

El middleware [`auth.middleware.js`](./api/middleware/auth.middleware.js) protege rutas que requieren autenticación.

**Cómo usarlo en nuevas rutas:**

```js
import { requireAuth } from '../middleware/auth.middleware.js'

// Ruta protegida — solo usuarios con token válido
router.get('/datos-sensibles', requireAuth, (req, res) => {
  console.log(req.user)   // { id, email, ... } del usuario autenticado
  console.log(req.token)  // JWT validado
  res.json({ data: '...' })
})
```

---

## 🗄️ Trigger de Base de Datos

El archivo [`supabase/migrations/001_triggers.sql`](./supabase/migrations/001_triggers.sql) contiene los 4 grupos de triggers aplicados en la BD:

| Trigger | Evento | Efecto |
|---------|--------|--------|
| `on_auth_user_created` | INSERT en `auth.users` | Crea fila en `public.usuario` con rol `'Docente'` |
| `trg_*_updated_at` (×4) | UPDATE en tablas principales | Auto-actualiza el campo `updated_at` |
| `trg_calcular_deuda_pi` | UPDATE en `entregable` | Marca `tiene_deuda_pi = TRUE` al Responsable si hay entregable Vencido |
| `trg_cierre_automatico_proyecto` | UPDATE en `entregable` | Cambia proyecto a `'Culminado'` si todos los entregables están Aprobados |

---

## 🧪 Prueba rápida con PowerShell

```powershell
# 1. Registrar usuario
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"test@unmsm.edu.pe","password":"Test1234!"}'

# 2. Login y guardar token
$resp = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"test@unmsm.edu.pe","password":"Test1234!"}'
$token = $resp.auth.access_token

# 3. Obtener perfil
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" `
  -Headers @{ Authorization = "Bearer $token" }
```

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | ≥ 18 | Runtime |
| Express | ^4.x | Servidor HTTP |
| @supabase/supabase-js | ^2.49.x | Cliente Supabase Auth + DB |
| dotenv | ^16.x | Variables de entorno |
| cors | ^2.x | Cross-Origin Resource Sharing |

---

## 👩‍💻 Autores

- **DBA:** Ange — Diseño de triggers y esquema PostgreSQL  
- **Backend:** JP-SAC Team — API REST con Supabase Auth
