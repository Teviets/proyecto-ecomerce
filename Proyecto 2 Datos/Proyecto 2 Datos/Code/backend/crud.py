from sqlalchemy.orm import Session
import models, schemas

# CRUD functions for User
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, user: schemas.UserLogin):
    return db.query(models.User).filter(models.User.username == user.username, models.User.password == user.password).first()

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