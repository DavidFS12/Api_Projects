from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.db.database import engine, SessionLocal
from app.db.deps import get_db
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from datetime import datetime, timedelta
from auth import authenticate_user, create_access_token, get_password_hash, get_current_user
import time
from sqlalchemy.exc import OperationalError
from sqlalchemy import func

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Control de Gastos")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

for i in range(5):
    try:
        conn = engine.connect()
        conn.close()
        print("✅ Conectado a la base de datos")
        break
    except OperationalError:
        print("⏳ Base de datos no lista, reintentando...")
        time.sleep(3)
else:
    raise Exception("❌ No se pudo conectar a la base de datos después de varios intentos")

#------------------- USUARIOS --------------------------
@app.post("/register/", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = "Email ya esta registrado",
        )
    
    hashed_pw = get_password_hash(user.password)
    db_user = models.User(name=user.name, email=user.email, hashed_password=hashed_pw)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login/")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o cotraseña incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me/")
def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    return {"Email":current_user.email}

@app.get("/user/", response_model=list[schemas.User])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

#------------------- PROYECTOS --------------------------
@app.post("/proyectos/", response_model=schemas.Proyecto)
def crear_proyecto(proyecto: schemas.ProyectoCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_proyecto = models.Proyecto(**proyecto.dict(), owner_id=current_user.id)
    db.add(db_proyecto)
    db.commit()
    db.refresh(db_proyecto)
    return db_proyecto

@app.get("/proyectos/", response_model=list[schemas.Proyecto])
def listar_proyectos(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Proyecto).filter(models.Proyecto.owner_id == current_user.id).all()

@app.get("/proyectos/{proyecto_id}", response_model=schemas.Proyecto)
def obtener_proyecto(proyecto_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id, models.Proyecto.owner_id == current_user.id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado o no autorizado")
    return proyecto

@app.put("/proyectos/{proyecto_id}", response_model=schemas.Proyecto)
def actualizar_proyecto(proyecto_id: int, datos_update: schemas.ProyectoUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id, models.Proyecto.owner_id == current_user.id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado o no autorizado en actualizar")
    
    update_data = datos_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(proyecto, key, value)

    db.commit()
    db.refresh(proyecto)
    return proyecto

@app.delete("/proyectos/{proyectos_id}", response_model=schemas.Proyecto)
def eliminar_proyecto(proyecto_id:int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id, models.Proyecto.owner_id == current_user.id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado o no autorizado en eliminar")
    db.delete(proyecto)
    db.commit()
    
    return {"message": "Proyecto eliminado correctamente", "proyecto": proyecto}

#-----------------------------------------------------

#------------------- GASTOS --------------------------
@app.post("/proyectos/{proyecto_id}/gastos", response_model=schemas.Gasto)
def crear_gasto(proyecto_id:int, gasto: schemas.GastoCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id, models.Proyecto.owner_id == current_user.id).first()
    if not proyecto:
        raise HTTPException(status_code=403, detail="No se encontro el proyecto en crear gasto")
    db_gasto = models.Gasto(
        nombre=gasto.nombre,
        cantidad=gasto.cantidad,
        p_unitario=gasto.p_unitario,
        p_total=gasto.p_unitario * gasto.cantidad,
        categoria=gasto.categoria,
        descripcion=gasto.descripcion,
        proyecto_id=proyecto_id
    )
    db.add(db_gasto)
    db.commit()
    db.refresh(db_gasto)
    return db_gasto

@app.get("/gastos/", response_model=list[schemas.Gasto])
def listar_gastos(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Gasto).join(models.Proyecto).filter(models.Proyecto.owner_id == current_user.id).all()

@app.get("/gastos/{gasto_id}", response_model = schemas.Gasto)
def obtener_gastos(gasto_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    gasto = db.query(models.Gasto).join(models.Proyecto).filter(models.Gasto.id == gasto_id, models.Proyecto.owner_id == current_user.id).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    return gasto

@app.put("/gastos/{gasto_id}", response_model=schemas.Gasto)
def actualizar_gasto(gasto_id: int, gasto_update: schemas.GastoUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_gasto = db.query(models.Gasto).join(models.Proyecto).filter(models.Gasto.id == gasto_id, models.Proyecto.owner_id == current_user.id).first()
    if not db_gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado o no autorizado en actualizar")
    
    update_data = gasto_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_gasto, key, value)

    if "cantidad" in update_data or "p_unitario" in update_data:
        db_gasto.p_total = (db_gasto.cantidad or 0) * (db_gasto.p_unitario or 0)

    db.commit()
    db.refresh(db_gasto)
    return db_gasto

@app.delete("/gastos/{gasto_id}", response_model=schemas.Gasto)
def eliminar_gasto(gasto_id:int, db:Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_gasto = db.query(models.Gasto).join(models.Proyecto).filter(models.Gasto.id == gasto_id, models.Proyecto.owner_id == current_user.id).first()
    if not db_gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado o no autorizado en eliminar")
    db.delete(db_gasto)
    db.commit()
    
    return {"message": "Gasto eliminado correctamente", "gasto": db_gasto}

#------------------- Proyecto + gastos --------------------------
@app.get("/proyectos/{proyecto_id}/gastos", response_model=list[schemas.Gasto])
def gastos_del_proyecto(proyecto_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id, models.Proyecto.owner_id == current_user.id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    return proyecto.gasto

#-------------------- REPORTE DE PROYECTO + GASTO ---------------
@app.get("/proyectos/{proyecto_id}/resumen")
def resumen_proyecto(proyecto_id:int, db:Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id, models.Proyecto.owner_id == current_user.id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado o no autorizado en resumen")
    
    total_gastos = db.query(func.sum(models.Gasto.p_total)).filter(models.Gasto.proyecto_id == proyecto_id).scalar() or 0
    gastos_por_categoria = db.query(models.Gasto.categoria, func.sum(models.Gasto.p_total)).filter(models.Gasto.proyecto_id == proyecto_id).group_by(models.Gasto.categoria).all()
    categoria_dic = {categoria: total for categoria, total in gastos_por_categoria}
    numero_gastos = db.query(models.Gasto).filter(models.Gasto.proyecto_id == proyecto_id).count()

    return {
        "proyecto": proyecto,
        "total_gastos": total_gastos,
        "gastos_por_categoria": categoria_dic,
        "numero_gastos": numero_gastos
    }

@app.get("/reportes/general")
def reporte_general(db:Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.owner_id == current_user.id).all()
    if not proyecto:
        raise HTTPException(status_code=404, detail="No se encontraron proyectos para el usuario actual")
    
    reportes = []
    gasto_total_general = 0

    for p in proyecto:
        total_gastos = db.query(func.sum(models.Gasto.p_total)).filter(models.Gasto.proyecto_id == p.id).scalar() or 0
        gastos_por_categoria = db.query(models.Gasto.categoria, func.sum(models.Gasto.p_total)).filter(models.Gasto.proyecto_id == p.id).group_by(models.Gasto.categoria).all()
        categoria_dic = {categoria: total for categoria, total in gastos_por_categoria}
        numero_gastos = db.query(models.Gasto).filter(models.Gasto.proyecto_id == p.id).count()

        reportes.append({
            "proyecto": p,
            "gasto_total": total_gastos,
            "numero_gastos": numero_gastos,
            "por_categoria": categoria_dic
        })

        gasto_total_general += total_gastos
    
    return {
        "usuario": current_user.name,
        "gasto_total_general": gasto_total_general,
        "detalle_proyecto": reportes
    }

