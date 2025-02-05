from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

def create_user(db: Session, user_data: UserCreate, photo_path: str = None):
    """ Yangi foydalanuvchini yaratish """

    # ✅ Foydalanuvchini qo‘shishdan oldin passport_id borligini tekshiramiz
    existing_user = db.query(User).filter(User.passport_id == user_data.passport_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail=f"❌ Error: {user_data.passport_id} passport ID allaqachon mavjud!")

    try:
        # ✅ Foydalanuvchini yaratamiz
        new_user = User(
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            middle_name=user_data.middle_name,
            birth_date=user_data.birth_date,
            nationality=user_data.nationality,
            citizenship=user_data.citizenship,
            address=user_data.address,
            passport_id=user_data.passport_id,
            photo=photo_path  # ✅ photo_path to'g'ri qo‘shildi
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=500, detail="❌ Error: Ma'lumotlar bazasida xatolik yuz berdi!")

def get_users(db: Session):
    """ Barcha foydalanuvchilarni olish """
    return db.query(User).all()

def search_users(db: Session, query: str):
    """ Foydalanuvchini ism, familiya yoki millat bo‘yicha qidirish """
    return db.query(User).filter(
        (User.first_name.ilike(f"%{query}%")) |
        (User.last_name.ilike(f"%{query}%")) |
        (User.nationality.ilike(f"%{query}%"))
    ).all()
