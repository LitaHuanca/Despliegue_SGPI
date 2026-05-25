from fastapi import APIRouter

from sgpi_capirestc.api.v1.endpoints import investigators
from sgpi_capirestc.api.v1.endpoints import groups
from sgpi_capirestc.api.v1.endpoints import projects
from sgpi_capirestc.api.v1.endpoints import calls
from sgpi_capirestc.api.v1.endpoints import users
from sgpi_capirestc.api.v1.endpoints import publications
from sgpi_capirestc.api.v1.endpoints import theses
from sgpi_capirestc.api.v1.endpoints import search

api_router = APIRouter()

api_router.include_router(investigators.router, prefix="/investigators", tags=["investigators"])
api_router.include_router(groups.router, prefix="/groups", tags=["groups"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(calls.router, prefix="/calls", tags=["calls"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(publications.router, prefix="/publications", tags=["publications"])
api_router.include_router(theses.router, prefix="/theses", tags=["theses"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
