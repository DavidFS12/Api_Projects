from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class GastoBase(BaseModel):
    descripcion: str
    monto: float
    categoria: Optional[str] = None

class GastoCreate(GastoBase):
    pass

class Gasto(GastoBase):
    id: int
    fecha: datetime

    class Config:
        orm_mode = True


class ProyectoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class ProyectoCreate(ProyectoBase):
    pass

class Proyecto(ProyectoBase):
    id: int
    gastos: List[Gasto] = []

    class Config:
        orm_mode = True
