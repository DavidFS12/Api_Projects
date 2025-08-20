from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app import models, schemas
from app.db.database import engine
from app.db.deps import get_db
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from datetime import datetime, timedelta

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Control de Gastos")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

@app.post("/user/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(name=user.name, email=user.email, hashed_password=hash_password(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def hash_password(password:str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password:str, hashed_password:str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data:dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

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
