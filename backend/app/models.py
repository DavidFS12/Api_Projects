from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .db.database import Base


#------------------- USUARIOS --------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="usuario")

    proyectos = relationship("Proyecto", back_populates="owner", cascade = "all, delete")


#------------------- PROYECTOS --------------------------
class Proyecto(Base):
    __tablename__ = "proyectos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    location = Column(String)
    agua = Column(Integer, nullable=False)
    luz = Column(Integer, nullable=False)
    descripcion = Column(String, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner= relationship("User", back_populates="proyectos")
    gastos = relationship("Gasto", back_populates="proyecto", cascade="all, delete-orphan")


#------------------- GASTOS --------------------------
class Gasto(Base):
    __tablename__ = "gastos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    cantidad = Column(Float, nullable=False)
    p_unitario = Column(Float, nullable=False)
    p_total = Column(Float, nullable=False)
    fecha = Column(DateTime, default=func.now())
    categoria = Column(String, nullable=True)
    descripcion = Column(String, index=True)

    proyecto_id = Column(Integer, ForeignKey("proyectos.id"), nullable=False)
    proyecto = relationship("Proyecto", back_populates="gastos")
