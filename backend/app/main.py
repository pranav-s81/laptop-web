import os
import uuid
import shutil
from fastapi import FastAPI, Depends, Form, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional

from .database import engine, Base, get_db
from . import crud, schemas, models

# Automatically create tables in local PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Laptop Search API")

# Configure CORS
# Allow frontend origins for local development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure the uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount uploads directory to serve uploaded images statically
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/api/laptops", response_model=List[schemas.LaptopResponse])
def search_laptops(query: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Search laptops by a query string.
    """
    try:
        return crud.get_laptops(db, query=query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")

@app.post("/api/laptops", response_model=schemas.LaptopResponse)
def add_laptop(
    model: str = Form(...),
    brand: Optional[str] = Form("Generic"),
    price: Optional[float] = Form(0.0),
    processor: Optional[str] = Form(None),
    ram: Optional[int] = Form(None),
    storage: Optional[str] = Form(None),
    gpu: Optional[str] = Form(None),
    screen_size: Optional[str] = Form(None),
    os_name: Optional[str] = Form(None, alias="os"),
    spec_range: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Create a new laptop entry and optionally upload a photo.
    """
    # Fallbacks for optional fields
    final_brand = brand.strip() if (brand and brand.strip()) else "Generic"
    final_price = price if price is not None else 0.0
    print(f"DEBUG: add_laptop called. model='{model}', brand='{brand}', price={price}")
    if image:
        print(f"DEBUG: image filename='{image.filename}', content_type='{image.content_type}'")
    else:
        print("DEBUG: image is None")
        
    image_url = None
    if image and image.filename:
        # Check by content type and extension for maximum compatibility
        content_type = image.content_type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/x-icon", "image/heic", "image/heif", "image/avif"]
        allowed_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".jfif", ".ico", ".heic", ".heif", ".avif"]
        
        ext = os.path.splitext(image.filename)[1].lower()
        
        # If extension is missing but we have content type, try to map it
        if not ext and content_type:
            if content_type == "image/jpeg":
                ext = ".jpg"
            elif content_type == "image/png":
                ext = ".png"
            elif content_type == "image/webp":
                ext = ".webp"
            elif content_type == "image/gif":
                ext = ".gif"
            elif content_type == "image/heic":
                ext = ".heic"
            elif content_type == "image/avif":
                ext = ".avif"
                
        # Validate either extension or content-type
        is_valid_type = content_type in allowed_types
        is_valid_ext = ext in allowed_extensions
        
        if not (is_valid_type or is_valid_ext):
            print(f"DEBUG: Invalid image. content_type='{content_type}', ext='{ext}'")
            raise HTTPException(
                status_code=400, 
                detail="Invalid image format. Please upload a valid image file (JPG, PNG, WEBP, GIF, etc.)."
            )
        
        # If we still don't have an extension, default to .jpg
        if not ext:
            ext = ".jpg"
            
        # Generate unique filename to avoid duplicates
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        try:
            # Save the file to disk
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            # Store the relative image path
            image_url = f"/uploads/{filename}"
        except Exception as e:
            print(f"DEBUG: Exception saving image: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")
 
    try:
        # Save to database
        db_laptop = crud.create_laptop(
            db=db,
            brand=final_brand,
            model=model,
            price=final_price,
            processor=processor,
            ram=ram,
            storage=storage,
            gpu=gpu,
            screen_size=screen_size,
            os=os_name,
            spec_range=spec_range,
            description=description,
            image_url=image_url
        )
        return db_laptop
    except Exception as e:
        # If DB insertion fails, delete the uploaded image file if created
        if image_url and os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail=f"Database insertion error: {str(e)}")
