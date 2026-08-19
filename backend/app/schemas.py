from pydantic import BaseModel, ConfigDict
from typing import Optional

class LaptopBase(BaseModel):
    model: str
    brand: Optional[str] = "Generic"
    processor: Optional[str] = None
    ram: Optional[int] = None
    storage: Optional[str] = None
    gpu: Optional[str] = None
    screen_size: Optional[str] = None
    os: Optional[str] = None
    spec_range: Optional[str] = None
    price: Optional[float] = 0.0
    description: Optional[str] = None

class LaptopCreate(LaptopBase):
    pass

class LaptopResponse(LaptopBase):
    id: int
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
