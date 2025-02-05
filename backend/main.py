from fastapi import FastAPI, UploadFile, File, Depends, Form, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from models import User
from datetime import date
import shutil, os, uuid
import crud, models, schemas
from database import SessionLocal, engine
from PIL import Image

app = FastAPI()

# CORS middleware - frontend va backend bog‘lanishi uchun
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Xavfsizlik uchun frontend domeningizni yozing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload katalogini statik fayllar sifatida qo‘shish
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Agar uploads katalogi mavjud bo‘lmasa, yaratish

# Har bir so‘rov uchun yangi database sessiya yaratish
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/users/search", response_model=list[schemas.UserResponse])
def search_users(query: str = Query(...), db: Session = Depends(get_db)):
    """ Foydalanuvchilarni qidirish """
    return crud.search_users(db, query)


@app.post("/users/", response_model=schemas.UserResponse)
async def create_user(
    first_name: str = Form(...),
    last_name: str = Form(...),
    middle_name: str = Form(...),
    birth_date: str = Form(...),
    nationality: str = Form(...),
    citizenship: str = Form(...),
    address: str = Form(...),
    passport_id: str = Form(...),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """ Yangi foydalanuvchi yaratish va rasm yuklash """

    birth_date = date.fromisoformat(birth_date)  # Tug‘ilgan sanani `date` formatiga o‘tkazish
    photo_filename = None

    if photo:
        file_ext = photo.filename.split(".")[-1]  # Fayl kengaytmasini olish
        photo_filename = f"{uuid.uuid4()}.{file_ext}"  # Unikal nom yaratish
        file_path = os.path.join(UPLOAD_DIR, photo_filename)

        # 📌 FAYLNI SAQLASH
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

        # 📌 SURATNI 4:3 FORMATGA O‘ZGARTIRISH
        img = Image.open(file_path)
        width, height = img.size
        new_width = width
        new_height = int(width * 3 / 4)  # 4:3 nisbati bo‘yicha balandlikni hisoblash

        if new_height > height:
            new_height = height
            new_width = int(height * 4 / 3)  # Agar balandlik kam bo‘lsa, kenglikni moslash

        # 📌 Suratni crop qilish (markazlash)
        left = (width - new_width) / 2
        top = (height - new_height) / 2
        right = (width + new_width) / 2
        bottom = (height + new_height) / 2

        img = img.crop((left, top, right, bottom))
        img.save(file_path)  # O‘zgartirilgan rasmani saqlash

    user_data = schemas.UserCreate(
        first_name=first_name,
        last_name=last_name,
        middle_name=middle_name,
        birth_date=birth_date,
        nationality=nationality,
        citizenship=citizenship,
        address=address,
        passport_id=passport_id,
        photo=photo_filename
    )

    # ⬇⬇⬇ **MUHIM**: `photo_filename` ni `photo_path` sifatida jo‘natamiz!
    new_user = crud.create_user(db=db, user_data=user_data, photo_path=photo_filename)

    return new_user


@app.get("/users/", response_model=list[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    """ Barcha foydalanuvchilar ro‘yxatini olish """
    return crud.get_users(db)


@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """ Foydalanuvchi ID bo‘yicha ma’lumot olish """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi!")
    return user

@app.put("/users/{user_id}", response_model=schemas.UserResponse)
async def update_user(
    user_id: int,
    first_name: str = Form(...),
    last_name: str = Form(...),
    middle_name: str = Form(...),
    birth_date: str = Form(...),
    nationality: str = Form(...),
    citizenship: str = Form(...),
    address: str = Form(...),
    passport_id: str = Form(...),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """ Foydalanuvchini yangilash """

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi!")

    # Yangi ma’lumotlarni foydalanuvchiga o‘rnatamiz
    user.first_name = first_name
    user.last_name = last_name
    user.middle_name = middle_name
    user.birth_date = birth_date
    user.nationality = nationality
    user.citizenship = citizenship
    user.address = address
    user.passport_id = passport_id

    if photo:
        file_ext = photo.filename.split(".")[-1]
        photo_filename = f"{user_id}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, photo_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

        user.photo = file_path  # Yangilangan rasm yo‘li

    db.commit()
    db.refresh(user)
    return user


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


# Foydalanuvchini o‘chirish
@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    db.delete(user)
    db.commit()
    return {"message": "Foydalanuvchi o‘chirildi"}
