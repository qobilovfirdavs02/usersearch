from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
import os

# Muqarrar bo'lgan DATABASE_URL - bu muhit o'zgaruvchisi orqali olingan
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/persons")

# Ma'lumotlar bazasiga ulanish uchun engine yaratish
engine = create_engine(DATABASE_URL, echo=True)  # echo=True - SQL so'rovlarini konsolga chiqarish

# Sessiya yaratish
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Model asosini yaratish
Base = declarative_base()

# Yana bir yordamchi funksiya - sessiya ochish va yopish
def get_db():
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        print("❌ Xatolik:", e)
        db.rollback()  # Agar xato yuz bersa, sessiyani qaytaring
    finally:
        db.close()  # Sessiyani yopish

