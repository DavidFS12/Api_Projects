from fastapi import FastAPI

app = FastAPI(title="sistema control de gastos para projectos unifamiliares")

@app.get("/")
def root ():
    return {"message": "Welcome to the sistema control de gastos para projectos unifamiliares API"}
