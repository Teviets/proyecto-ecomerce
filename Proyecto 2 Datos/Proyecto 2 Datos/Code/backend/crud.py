from sqlalchemy.orm import Session
import models, schemas
import uuid
from bson import ObjectId
from sqlalchemy.exc import IntegrityError

def create_user(db: Session, user: schemas.UserCreate):
    # Verifica si el usuario ya existe
    existing_user = db.query(models.User).filter(models.User.username == user.email).first()
    
    if existing_user:
        return {"error": "El usuario ya existe"}
    
    # Crea el nuevo usuario
    db_user = models.User(username=user.email, password=user.password)

    try:
        db.add(db_user)
        print(f"User to be added: {db_user}")
        db.commit()
        print(f"User added: {db_user}")
        db.refresh(db_user)
        print(f"User refreshed: {db_user}")
        return db_user
    except IntegrityError:
        db.rollback()
        print("IntegrityError: El usuario ya existe")
        return {"error": "Error de integridad. El usuario ya existe."}
    except Exception as e:
        db.rollback()
        print(f"Error al agregar el usuario: {e}")
        return {"error": str(e)}


def authenticate_user(db: Session, mongo_db, user: schemas.UserLogin):
    response = db.query(models.User).filter(
        models.User.username == user.username, 
        models.User.password == user.password
    ).first()

    if not response:
        return {"error": "Invalid username or password"}

    order = mongo_db["Cart"].find_one({"user_id": response.id})
    print(order)

    # Si existe una orden, convertir el _id de ObjectId a string
    if order and "_id" in order:
        order["_id"] = str(order["_id"])

    finalResponse = {
        "user": response,
        "order": order  # Ahora el _id es serializable
    }
    return finalResponse



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
    skip: int = 0,  # Número de página (0-based)
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
        cart = mongo_db["Cart"].find_one({"order": order_id, "user_id": user_id})
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

