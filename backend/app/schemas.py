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
    p_total: float
    categoria: Optional[str] = None
    proyecto_id:int
    descripcion: Optional[str] = None

class GastoCreate(GastoBase):
    pass

class Gasto(GastoBase):
    id: int
    fecha: datetime

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