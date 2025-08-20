from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app import models, schemas
from app.db.database import engine
from app.db.deps import get_db
from passlib.context import CryptContext

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Control de Gastos")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.post("/user/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(name=user.name, email=user.email, hashed_password=hash_password(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def hash_password(password:str):
    return pwd_context.hash(password)

@app.get("/user/", response_model=list[schemas.User])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.post("/proyectos/", response_model=schemas.Proyecto)
def crear_proyecto(proyecto: schemas.ProyectoCreate, db: Session = Depends(get_db)):
    db_proyecto = models.Proyecto(**proyecto.dict())
    db.add(db_proyecto)
    db.commit()
    db.refresh(db_proyecto)
    return db_proyecto

@app.get("/proyectos/", response_model=list[schemas.Proyecto])
def listar_proyectos(db: Session = Depends(get_db)):
    return db.query(models.Proyecto).all()

@app.post("/gastos/{proyecto_id}", response_model=schemas.Gasto)
def crear_gasto(proyecto_id: int, gasto: schemas.GastoCreate, db: Session = Depends(get_db)):
    db_gasto = models.Gasto(**gasto.dict(), proyecto_id=proyecto_id)
    db.add(db_gasto)
    db.commit()
    db.refresh(db_gasto)
    return db_gasto

@app.get("/gastos/{proyecto_id}", response_model=list[schemas.Gasto])
def listar_gastos(proyecto_id: int, db: Session = Depends(get_db)):
    return db.query(models.Gasto).filter(models.Gasto.proyecto_id == proyecto_id).all()
