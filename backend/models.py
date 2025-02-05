from sqlalchemy import Column, Integer, String, Date
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    middle_name = Column(String(100))
    birth_date = Column(Date)
    nationality = Column(String(50))
    citizenship = Column(String(50))
    address = Column(String(255))
    passport_id = Column(String(20), unique=True, nullable=False)
    photo = Column(String(255), nullable=True)  # Faqat bitta rasm
