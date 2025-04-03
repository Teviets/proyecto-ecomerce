# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base, mongo_db
from contextlib import contextmanager
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

def get_mongo():
    return mongo_db


@app.post("/register")
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@app.post("/login")
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db), mongo_db = Depends(get_mongo) ):
    return crud.authenticate_user(db, mongo_db,user)

@app.get("/products")
def get_products(
        page: int = Query(0, ge=0),  # Número de página (0-based)
        limit: int = Query(25, ge=1, le=100),
        order: str = Query("id"),
        name: str = Query(None),
        category: int = Query(None),
        db: Session = Depends(get_db)
    ):
    data = crud.get_products(db, skip=page, limit=limit, order=order, category=category, name=name)
    return {
        "total": data["count"],
        "page": page,
        "size": limit,
        "data": data["data"]
    }

@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)

@app.post("/checkout")
def checkout(cart: schemas.Cart, db: Session = Depends(get_db)):
    return crud.create_order(db, cart)

@app.post("/Cart")
def add_to_cart(
    cart_item: schemas.CartItem,
    mongo_db = Depends(get_mongo) 
):
    try:

        order_id = str(cart_item.order_id) if cart_item.order_id else None
        return crud.add_to_cart(mongo_db, cart_item.product_id, cart_item.user_id, order_id)
    except Exception as e:
        print(f"Error adding to cart: {e}")
        return {"error": str(e)}
    

@app.get("/Cart")
def get_full_cart(
    order_id: str,
    mongo_db = Depends(get_mongo),
    db: Session = Depends(get_db)
):
    try:
        return crud.get_full_cart(mongo_db, db, order_id)
    except Exception as e:
        print(f"Error getting cart: {e}")
        return {"error": str(e)}
    
@app.delete("/ItemCart")
def delete_item_cart(
    product_id: str = Query(..., description="ID del producto a eliminar"),
    order_id: str = Query(..., description="ID de la orden"),
    mongo_db = Depends(get_mongo)
):
    try:
        # Conversión y validación
        try:
            product_id_int = int(product_id)
        except ValueError:
            raise HTTPException(status_code=422, detail="El product_id debe ser un número válido")

        # Llamada a CRUD
        result = crud.delete_cart_item(mongo_db, order_id, product_id_int)
        
        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("message", "Producto no encontrado"))
            
        return {
            "success": True,
            "message": "Producto eliminado correctamente",
            "deleted_count": result.get("deleted_count", 1)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@app.delete("/Cart")
def delete_cart(
    order_id: str = Query(..., description="ID de la orden"),
    mongo_db = Depends(get_mongo)
):
    try:
        return crud.delete_cart(mongo_db, order_id)
    except Exception as e:
        print(f"Error deleting cart: {e}")
        return {"error": str(e)}
    
