# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pymongo import MongoClient

SQLALCHEMY_DATABASE_URL = "postgresql://user:password@db/online_store"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


MONGODB_DATABASE_URL = "mongodb+srv://root:root@ecommerce-cluster.qrasntt.mongodb.net/"


client = MongoClient(MONGODB_DATABASE_URL)
mongo_db = client["Ecommerce"]
