from sqlalchemy import Column, Integer, String, Float, Text
from .database import Base

class Laptop(Base):
    __tablename__ = "laptops"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, nullable=False, index=True)
    model = Column(String, nullable=False, index=True)
    processor = Column(String, nullable=True)
    ram = Column(Integer, nullable=True)  # in GB
    storage = Column(String, nullable=True)  # e.g., "512GB SSD", "1TB HDD"
    gpu = Column(String, nullable=True)
    screen_size = Column(String, nullable=True)
    os = Column(String, nullable=True)
    spec_range = Column(String, nullable=True)  # e.g., "Entry-Level", "Mid-Range", "High-End"
    price = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)  # URL/path to access the uploaded laptop photo
