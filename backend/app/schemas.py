from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

#------------------- AUTENTICACION --------------------------
class Token(BaseModel):
    access_token: str
    token_type:str

class TokenData(BaseModel):
    email: str | None = None

    #------------------- GASTOS --------------------------
class GastoBase(BaseModel):
    nombre: str
    cantidad: float
    p_unitario: float
    categoria: Optional[str] = None
    descripcion: Optional[str] = None

class GastoCreate(GastoBase):
    pass

class GastoUpdate(GastoBase):
    nombre: Optional[str] = None
    cantidad: Optional[float] = None
    p_unitario: Optional[float] = None
    categoria: Optional[str] = None
    descripcion: Optional[str] = None

class Gasto(GastoBase):
    id: int
    p_total: float
    fecha: datetime
    proyecto_id: int

    class Config:
        orm_mode = True

#------------------- PROYECTOS --------------------------
class ProyectoBase(BaseModel):
    nombre: str
    location: Optional[str] = None
    agua: int
    luz: int
    descripcion: Optional[str] = None

class ProyectoCreate(ProyectoBase):
    pass

class ProyectoUpdate(ProyectoBase):
    nombre: Optional[str] = None
    location: Optional[str] = None
    agua: Optional[int] = None
    luz: Optional[int] = None
    descripcion: Optional[str] = None

class Proyecto(ProyectoBase):
    id: int
    owner_id: int
    gastos: List[Gasto] = []

    class Config:
        orm_mode = True

#------------------- USUARIOS --------------------------
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    proyectos: List[Proyecto] = []

    class Config:
        orm_mode = True