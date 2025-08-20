from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .db.database import Base

class Proyecto(Base):
    __tablename__ = "proyectos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    descripcion = Column(String, nullable=True)

    gastos = relationship("Gasto", back_populates="proyecto")

class Gasto(Base):
    __tablename__ = "gastos"

    id = Column(Integer, primary_key=True, index=True)
    descripcion = Column(String, index=True)
    monto = Column(Float, nullable=False)
    fecha = Column(DateTime, default=func.now())
    categoria = Column(String, nullable=True)

    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    proyecto = relationship("Proyecto", back_populates="gastos")
