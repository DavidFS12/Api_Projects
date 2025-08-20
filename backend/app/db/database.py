from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
import time
from sqlalchemy.exc import OperationalError

load_dotenv()

DB_USER = os.getenv("POSTGRES_USER")
DB_PASS = os.getenv("POSTGRES_PASSWORD")
DB_NAME = os.getenv("POSTGRES_DB")
DB_HOST = os.getenv("POSTGRES_SERVER", "db")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

for i in range(10):  # intenta 10 veces
    try:
        engine = create_engine(DATABASE_URL)
        conn = engine.connect()
        conn.close()
        print("✅ Conectado a la base de datos")
        break
    except OperationalError:
        print("⏳ Base de datos no lista, reintentando...")
        time.sleep(3)
else:
    raise Exception("❌ No se pudo conectar a la base de datos después de varios intentos")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
