import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
  response = client.get("/")
  assert response.status_code == 200

def test_create_proyecto():
  payload = {
    "nombre": "Proyecto Test",
    "location": "Ciudad Test",
    "agua": 100,
    "luz": 200,
    "descripcion": "Proyecto de Evaluacion de gastos",
  }
  response = client.post("/proyectos/", json = payload)
  assert response.status_code in (200, 201, 401)

def test_create_gasto_invalido():
  payload = {
    "nombre":"Gasto test",
    "cantidad": -50,
    "p_unitario" : 100,
    "categoria" : "Materiales",
    "descripcion" : "Gasto de prueba",
  }
  response = client.post("/proyectos/2/gastos/", json = payload)
  assert response.status_code == 422