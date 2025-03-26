# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, crud

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@app.post("/login")
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    return crud.authenticate_user(db, user)

@app.get("/products")
def get_products(
        skip: int = Query(0, alias="page", ge=0),
        limit: int = Query(25, alias="size", ge=1, le=100),
        order: str = Query("id", alias="sort"),
        name: str = Query(None, alias="name"),
        category: int = Query(None, alias="category"),
        db: Session = Depends(get_db)
    ):
    data = crud.get_products(db, skip=skip, limit=limit, order=order, category=category, name=name)
    return {
        "total": data["count"],
        "page": skip,
        "size": limit,
        "data": data["data"]
    }

@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)

@app.post("/checkout")
def checkout(cart: schemas.Cart, db: Session = Depends(get_db)):
    return crud.create_order(db, cart)