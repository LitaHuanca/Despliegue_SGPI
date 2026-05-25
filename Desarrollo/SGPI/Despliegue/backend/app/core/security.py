from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not settings.JWT_SECRET:
        # If no secret is set, allow all for dev purposes (mock auth)
        return {"sub": "dev-user", "email": "dev@unmsm.edu.pe", "app_metadata": {"rol_sistema": "Administrador"}}

    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(payload: dict = Depends(verify_token)):
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    # Optional: fetch user from DB to verify if active, etc.
    return payload

def check_role(allowed_roles: list[str]):
    """
    Dependencia genérica para proteger endpoints según una lista de roles permitidos.
    """
    def role_checker(payload: dict = Depends(get_current_user)):
        app_metadata = payload.get("app_metadata", {})
        rol = app_metadata.get("rol_sistema")
        if rol not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permisos insuficientes. Se requiere uno de: {allowed_roles}"
            )
        return payload
    return role_checker

# Dependencias preconfiguradas
require_admin = check_role(["Administrador"])
require_staff = check_role(["Administrador", "Secretaria", "Jefe"])
