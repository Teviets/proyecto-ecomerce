from sqlalchemy.orm import Session
import models, schemas
import uuid
from bson import ObjectId

# CRUD functions for User
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

from bson import ObjectId

def authenticate_user(db: Session, mongo_db, user: schemas.UserLogin):
    response = db.query(models.User).filter(models.User.username == user.username, models.User.password == user.password).first()
    order = mongo_db["Cart"].find_one({"user_id": response.id})
    
    # Si existe una orden, convertir el _id de ObjectId a string
    if order and "_id" in order:
        order["_id"] = str(order["_id"])

    finalResponse = {
        "user": response,
        "order_id": order  # Ahora el _id es serializable
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
    skip: int = 0, 
    limit: int = 25, 
    order: str = "id", 
    name: str = None,
    category: int = None
):
    query = db.query(models.Product)
    
    if name:
        query = query.filter(models.Product.name.ilike(f"%{name}%"))

    # Filtrar por categoría si se proporciona
    if category:
        query = query.filter(models.Product.category_id == category)
    
    # Ordenar según el parámetro 'order'
    if order == "name":
        query = query.order_by(models.Product.name)
    elif order == "-name":
        query = query.order_by(models.Product.name.desc())
    elif order == "price":
        query = query.order_by(models.Product.price)
    elif order == "-price":
        query = query.order_by(models.Product.price.desc())
    else:
        query = query.order_by(models.Product.id)  # Orden por ID por defecto

    # Aplicar paginación
    products = query.offset(skip * limit).limit(limit).all()

    # count = query.count()
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

        # Convertir el objeto ProductToCart en diccionario
        product_dict = product_id.model_dump()  # O usa .dict() en Pydantic v1

        # Buscar si ya existe un carrito activo para este usuario y orden
        cart = mongo_db["Cart"].find_one({"order": order_id, "user_id": user_id})

        if cart:
            print("Cart already exists, updating...")
            mongo_db["Cart"].update_one(
                {"order": order_id, "user_id": user_id},
                {"$addToSet": {"products": product_dict}}  # Evita duplicados
            )
        else:
            print("Creating new cart...")
            mongo_db["Cart"].insert_one({
                "order": order_id,
                "user_id": user_id,
                "products": [product_dict]  # Lista con diccionarios en lugar de objetos Pydantic
            })

        print("Product added to cart successfully")

        return {"order_id": order_id, "user_id": user_id, "added_product": product_dict}
    
    except Exception as e:
        print(f"Error adding to cart: {e}")
        return {"error": str(e)}

    
def get_full_cart(mongo_db, db: Session, order_id: str):
    try:
        print(f"Buscando carrito para order_id: {order_id}")
        cart = mongo_db.Cart.find_one({"order": order_id})

        if not cart:
            return {"error": "Cart not found"}

        print(f"Carrito encontrado: {cart}")

        # Convertir `_id` de MongoDB a string
        cart["_id"] = str(cart["_id"])

        sum = 0
        for product in cart["products"]:
            sum += product["price"] * product["quantity"]
            product["summary"] = product["price"] * product["quantity"]
        cart["total"] = sum
        print(f"Total del carrito: {cart}")
        return cart

    except Exception as e:
        print(f"Error retrieving cart: {e}")
        return {"error": str(e)}
