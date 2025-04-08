from sqlalchemy.orm import Session
import models, schemas
import uuid
from bson import ObjectId
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException
from passlib.context import CryptContext
from bson import ObjectId

SECRET_KEY="ecommerceSECRETKEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60*24*30  

def convert_object_ids(doc):
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, dict):
            doc[key] = convert_object_ids(value)
    return doc

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expires_delta = expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": datetime.utcnow() + expires_delta})
    encode_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encode_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return False
        # Verifica expiración explícitamente
        if datetime.utcnow() > datetime.fromtimestamp(payload["exp"]):
            return False
        return schemas.TokenData(username=username)
    except jwt.PyJWTError:
        return False
    
def update_expiration(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return False
        # Actualiza la expiración
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload["exp"] = datetime.utcnow() + expires_delta
        new_token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return new_token
    except jwt.PyJWTError:
        return False
    
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, mongo, user: schemas.UserCreate):
    # 1. Verificar si el usuario ya existe en MongoDB
    existing_user_mongo = mongo["Users"].find_one({"username": user.email})
    if existing_user_mongo:
        raise HTTPException(status_code=400, detail="El usuario ya existe en MongoDB")

    # 2. Crear hash de la contraseña
    hashed_password = pwd_context.hash(user.password)

    try:
        # 3. Crear usuario en PostgreSQL
        db_user = models.User(username=user.email, password=hashed_password)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # 4. Crear usuario en MongoDB
        mongo["Users"].insert_one({
            "username": user.email,
            "password": hashed_password,
            "user_id": db_user.id,
            "created_at": datetime.utcnow(),
            "last_login": None,
            "access_token": None,
            "user_id": db_user.id  # Referencia al ID de PostgreSQL
        })

        return {
            "id": db_user.id,
            "username": db_user.username,
            "message": "Usuario creado exitosamente"
        }

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="El usuario ya existe en PostgreSQL")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear el usuario: {str(e)}")


def authenticate_user(db: Session, mongo_db, user: schemas.UserLogin):
    db_user_mongo = mongo_db["Users"].find_one({"username": user.username})
    
    if not db_user_mongo:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    if not pwd_context.verify(user.password, db_user_mongo["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    access_token = create_access_token(data={"sub": user.username})
    updated_user = mongo_db["Users"].find_one_and_update(
        {"username": user.username},
        {"$set": {
            "last_login": datetime.utcnow(),
            "access_token": access_token
        }},
        return_document=True
    )
    print(f"Updated user: {updated_user}")

    order = mongo_db["Cart"].find_one(
        {"user_id": db_user_mongo["user_id"]},
        {"_id": 0, "order": 1}
    )
    print(f"Order found: {order}")

    final_response = {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user_mongo["user_id"],
            "username": db_user_mongo["username"],
        },
        "order_id": order if order else None
    }

    return final_response



def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

# CRUD functions for Product
def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(
    db: Session, 
    skip: int = 0, 
    limit: int = 25, 
    order: str = "id", 
    name: str = None,
    category: int = None
):
    query = db.query(models.Product)
    
    if name:
        query = query.filter(models.Product.name.ilike(f"%{name}%"))

    if category:
        query = query.filter(models.Product.category_id == category)
    
    order_column = {
        "name": models.Product.name,
        "-name": models.Product.name.desc(),
        "price": models.Product.price,
        "-price": models.Product.price.desc(),
    }.get(order, models.Product.id)

    products = query.order_by(order_column).offset(skip * limit).limit(limit).all()

    count = query.count()
    return {"data": products, "count": count}

# CRUD functions for Category
def create_category(db: Session, category: schemas.ProductCategoryCreate):
    db_category = models.ProductCategory(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_categories(db: Session):
    return db.query(models.ProductCategory).all()

def add_to_cart(mongo_db, product_id: schemas.ProductToCart, user_id: int, order_id: str = None):
    try:
        order_id = order_id or str(uuid.uuid4())
        print(f"Order ID: {order_id}")

        # Convertir el objeto ProductToCart en diccionario
        product_dict = product_id.model_dump()  # O usa .dict() en Pydantic v1
        print(f"Product dict: {product_dict}")

        # Buscar si ya existe un carrito activo para este usuario y orden
        cart = mongo_db["Cart"].find_one({"order": order_id})
        print(f"Cart found: {cart}")

        if cart:
            
            mongo_db["Cart"].update_one(
                {"order": order_id, "user_id": user_id},
                {"$addToSet": {"products": product_dict}}  # Evita duplicados
            )
        else:
            mongo_db["Cart"].insert_one({
                "order": order_id,
                "user_id": user_id,
                "products": [product_dict]  # Lista con diccionarios en lugar de objetos Pydantic
            })

        return {"order_id": order_id, "user_id": user_id, "added_product": product_dict}
    
    except Exception as e:
        print(f"Error adding to cart: {e}")
        return {"error": str(e)}

    
def get_full_cart(mongo_db, db: Session, order_id: str):
    try:
        cart = mongo_db.Cart.find_one({"order": order_id})

        if not cart:
            return {"error": "Cart not found"}


        # Convertir `_id` de MongoDB a string
        cart["_id"] = str(cart["_id"])

        sum = 0
        for product in cart["products"]:
            sum += product["price"] * product["quantity"]
            product["summary"] = product["price"] * product["quantity"]
        cart["total"] = sum
        return cart

    except Exception as e:
        print(f"Error retrieving cart: {e}")
        return {"error": str(e)}
    
def delete_cart_item(mongo_db, order_id: str, product_id: int):
    try:
        result = mongo_db["Cart"].update_one(
            {"order": order_id},
            {"$pull": {"products": {"id": product_id}}}
        )
        if result.modified_count > 0:
            # Recalcular el total del carrito aquí si es necesario
            return {"status": "success", "message": "Product removed from cart"}
        return {"status": "error", "message": "Product not found in cart"}
    except Exception as e:
        raise e
    
def delete_cart(mongo_db, order_id: str):
    try:
        result = mongo_db["Cart"].update_one(
            {"order": order_id},
            {"$set": {"products": []}}  # Corregido el operador de actualización
        )
        return {
            "status": "success" if result.modified_count > 0 else "error",
            "message": "Carrito vaciado" if result.modified_count > 0 else "No se modificó el carrito",
            "modified_count": result.modified_count
        }
    except Exception as e:
        raise e

