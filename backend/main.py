from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from sqlalchemy.exc import OperationalError
from sqlalchemy import func
from app import models, schemas
from app.db.database import engine, SessionLocal
from app.db.deps import get_db
from openpyxl import Workbook
from jose import jwt
from datetime import datetime, timedelta
from auth import authenticate_user, create_access_token, get_password_hash, get_current_user
import pandas as pd
from typing import Optional
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
import time


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Control de Gastos")
@app.on_event("startup")
def startup_event():
    seed_admin()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
def listar_proyectos(nombre: Optional[str]=None, fecha_inicio:Optional[date]=None, fecha_fin:Optional[date]=None, min_gasto:Optional[float]=None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.Proyecto)
    if current_user.role != "admin":
        query = query.filter(models.Proyecto.owner_id == current_user.id)

    if nombre:
        query = query.filter(models.Proyecto.nombre.ilike(f"%{nombre}%"))
    if fecha_inicio and fecha_fin:
        query = query.filter(models.Proyecto.fecha_inicio.between(fecha_inicio, fecha_fin))
    proyecto = query.all()
    if min_gasto:
        proyecto = [p for p in proyecto if sum(g.p_total for g in p.gasto) >= min_gasto]

    return proyecto

@app.get("/proyectos/{proyecto_id}", response_model=schemas.Proyecto)
def obtener_proyecto(proyecto_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id, models.Proyecto.owner_id == current_user.id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado o no autorizado")
    return proyecto

@app.put("/proyectos/{proyecto_id}", response_model=schemas.Proyecto)
def actualizar_proyecto(proyecto_id: int, datos_update: schemas.ProyectoUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id)
    if current_user.role != "admin":
        proyecto = proyecto.filter(models.Proyecto.owner_id == current_user.id)
    db_proyecto = proyecto.first()
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado o no autorizado en actualizar")
    
    update_data = datos_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_proyecto, key, value)

    db.commit()
    db.refresh(db_proyecto)
    return db_proyecto

@app.delete("/proyectos/{proyectos_id}", response_model=schemas.Proyecto)
def eliminar_proyecto(proyecto_id:int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id)
    if current_user.role != "admin":
        proyecto = proyecto.filter(models.Proyecto.owner_id == current_user.id)
    proyecto = proyecto.first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado o no autorizado en eliminar")
    db.delete(proyecto)
    db.commit()
    
    return {"message": "Proyecto eliminado correctamente", "proyecto": proyecto}

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
def listar_gastos(categoria: Optional[str]=None, fecha_inicio: Optional[date]=None, fecha_fin: Optional[date]=None, min_total: Optional[float]=None, max_total: Optional[float]=None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.Gasto).join(models.Proyecto).filter(models.Proyecto.owner_id == current_user.id).all()
        
    if categoria:
        query = query.filter(models.Gasto.catedoria == categoria)
    if fecha_inicio and fecha_fin:
        query = query.filter(models.Gasto.fecha.between(fecha_inicio, fecha_fin))
    if min_total:
        query = query.filter(models.Gasto.p_total >= min_total)
    if max_total:
        query = query.filter(models.Gasto.p_total <= max_total)

    if current_user.role == "admin":
        return db.query(models.Gasto).all()
    else:
        return 
    return query.all()

@app.get("/gastos/{gasto_id}", response_model = schemas.Gasto)
def obtener_gastos(gasto_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    gasto = db.query(models.Gasto).join(models.Proyecto).filter(models.Gasto.id == gasto_id, models.Proyecto.owner_id == current_user.id).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    return gasto

@app.put("/gastos/{gasto_id}", response_model=schemas.Gasto)
def actualizar_gasto(gasto_id: int, gasto_update: schemas.GastoUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_gasto = db.query(models.Gasto).join(models.Proyecto).filter(models.Gasto.id == gasto_id)
    if current_user.role != "admin":
        db_gasto = db_gasto.filter(models.Proyecto.owner_id == current_user.id)

    query = db_gasto.first()
    if not query:
        raise HTTPException(status_code=404, detail="Gasto no encontrado o no autorizado en actualizar")
    
    update_data = gasto_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(query, key, value)

    if "cantidad" in update_data or "p_unitario" in update_data:
        query.p_total = (query.cantidad or 0) * (query.p_unitario or 0)

    db.commit()
    db.refresh(query)
    return query

@app.delete("/gastos/{gasto_id}", response_model=schemas.Gasto)
def eliminar_gasto(gasto_id:int, db:Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_gasto = db.query(models.Gasto).join(models.Proyecto).filter(models.Gasto.id == gasto_id)
    if current_user.role != "admin":
        db_gasto = db_gasto.filter(models.Proyecto.owner_id == current_user.id)
    gasto = db_gasto.first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado o no autorizado en eliminar")
    db.delete(gasto)
    db.commit()
    
    return {"message": "Gasto eliminado correctamente", "gasto": gasto}

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

@app.get("/reportes/excel")
def exportar_excel(db:Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.owner_id == current_user.id).all()

    data=[]
    for proyecto in proyecto:
        for gasto in proyecto.gastos:
            data.append({
                "Proyecto": proyecto.nombre,
                "Gasto": gasto.nombre,
                "Cantidad": gasto.cantidad,
                "Precio Unitario": gasto.p_unitario,
                "Precio Total": gasto.p_total,
                "Categoria": gasto.categoria,
                "Fecha": gasto.fecha,
                "Descripcion": gasto.descripcion,
            })
    
    df=pd.DataFrame(data)
    filename = "reporte_gastos.xlsx"
    df.to_excel(filename, index=False)

    return FileResponse(filename, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename=filename)

@app.get("reportes/pdf")
def exportar_pdf(db:Session=Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.owner_id == current_user.id).all()

    filename = "reporte_gastos.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Reporte de Gastos por Proyecto", styles["Title"]))
    elements.append(Spacer(1, 12))

    for proyecto in proyecto:
        elements.append(Paragraph(f"Proyecto: {proyecto.nombre}", styles["Heading2"]))
        data = [["categoria", "Gasto", "Cantidad", "Precio Unitario", "Precio Total", "Descripcion", "Fecha"]]

        for gasto in proyecto.gastos:
            data.append([
                gasto.categoria,
                gasto.nombre,
                gasto.cantidad,
                gasto.p_unitario,
                gasto.p_total,
                gasto.descripcion or "",
                gasto.fecha.strftime("%Y-%m-%d")
            ])
        
        t = Table(data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        elements.append(t)
        elements.append(Spacer(1, 12))
    
    doc.build(elements)
    return FileResponse(filename, media_type='application/pdf', filename=filename)

def require_role(required_role: str):
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role !=  required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permiso denegado: se requiere rol {required_role}"
            )
        return current_user
    return role_checker

@app.get("/admin/usuarios", dependencies=[Depends(require_role("admin"))])
def listar_usuarios(db:Session = Depends(get_db)):
    return db.query(models.User).all()

@app.delete("/admin/proyectos/{proyecto_id}", dependencies=[Depends(require_role("admin"))])
def eliminar_proyecto_admin(proyecto_id: int, db: Session = Depends(get_db)):
    proyecto = db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    db.delete(proyecto)
    db.commit()
    return {"ok": True, "msg": "Proyecto eliminado por admin"}

def seed_admin():
    db: Session = SessionLocal()

    admin_email = "admin@system.com"
    admin_password = "admin123"

    admin = db.query(models.User).filter(models.User.email == admin_email).first()
    if not admin:
        new_admin = models.User(
            name="admin",
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            role="admin"
        )
        db.add(new_admin)
        db.commit()
        print(f"Usuario admin creado con email {admin_email}/{admin_password}")
    else:
        print("El usuario admin ya existe")

    db.close()
