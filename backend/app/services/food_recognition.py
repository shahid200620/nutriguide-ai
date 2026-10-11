"""
FUTURE (Phase 3) - Food recognition interface. NO MODEL IS IMPLEMENTED YET.

Planned pipeline:
  image -> OpenCV preprocessing -> YOLO detection -> food class + confidence
        -> nutrition database lookup -> serving estimate -> nutrition estimate

The planned endpoint POST /api/food-recognition/predict is intentionally NOT
registered. When a model is trained and evaluated, implement `FoodRecognizer`,
register it in a router, and document the dataset and measured metrics.
"""
from dataclasses import dataclass
from typing import Protocol


@dataclass
class Detection:
    food_class: str
    confidence: float
    bbox_xyxy: tuple[float, float, float, float]


class FoodRecognizer(Protocol):
    def predict(self, image_bytes: bytes) -> list[Detection]:
        ...
