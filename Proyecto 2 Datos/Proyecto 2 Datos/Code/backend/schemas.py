from pydantic import BaseModel
from typing import List, Optional
from pydantic import BaseModel, UUID4
from typing import Optional


# User schema
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

# Product schema
class ProductBase(BaseModel):
    name: str
    price: float
    category_id: int

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True

class ProductCategoryBase(BaseModel):
    name: str

class ProductCategoryCreate(ProductCategoryBase):
    pass

class ProductCategoryResponse(ProductCategoryBase):
    id: int

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class CartItem(BaseModel):
    product_id: int
    quantity: int

class Cart(BaseModel):
    items: List[CartItem] = []

class ProductToCart(BaseModel):
    id: int
    name: str
    price: float
    category_id: int
    image_url: str
    quantity: int

class CartItem(BaseModel):
    product_id: ProductToCart
    user_id: int
    order_id: Optional[UUID4] = None  # Order_id es opcional


