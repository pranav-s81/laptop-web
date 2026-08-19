from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from . import models

def get_laptops(db: Session, query: Optional[str] = None):
    """
    Search laptops. If query is provided, performs case-insensitive
    searches across brand, model, processor, gpu, spec_range, and description fields.
    """
    db_query = db.query(models.Laptop)
    if query:
        search_filter = f"%{query}%"
        db_query = db_query.filter(
            or_(
                models.Laptop.brand.ilike(search_filter),
                models.Laptop.model.ilike(search_filter),
                models.Laptop.processor.ilike(search_filter),
                models.Laptop.gpu.ilike(search_filter),
                models.Laptop.spec_range.ilike(search_filter),
                models.Laptop.description.ilike(search_filter)
            )
        )
    return db_query.all()

def create_laptop(
    db: Session,
    brand: str,
    model: str,
    price: float,
    processor: Optional[str] = None,
    ram: Optional[int] = None,
    storage: Optional[str] = None,
    gpu: Optional[str] = None,
    screen_size: Optional[str] = None,
    os: Optional[str] = None,
    spec_range: Optional[str] = None,
    description: Optional[str] = None,
    image_url: Optional[str] = None
):
    """
    Inserts a new Laptop record into the database.
    """
    db_laptop = models.Laptop(
        brand=brand,
        model=model,
        price=price,
        processor=processor,
        ram=ram,
        storage=storage,
        gpu=gpu,
        screen_size=screen_size,
        os=os,
        spec_range=spec_range,
        description=description,
        image_url=image_url
    )
    db.add(db_laptop)
    db.commit()
    db.refresh(db_laptop)
    return db_laptop

def delete_laptop(db: Session, laptop_id: int):
    """
    Deletes a Laptop record from the database by ID.
    """
    db_laptop = db.query(models.Laptop).filter(models.Laptop.id == laptop_id).first()
    if db_laptop:
        db.delete(db_laptop)
        db.commit()
        return db_laptop
    return None
