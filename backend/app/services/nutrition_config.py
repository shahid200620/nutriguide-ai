"""
Central configuration for every nutrition / wellness constant.
Nothing in the frontend or routers should hard-code these numbers.
Keys are the string values of the enums in app.core.enums.
"""

# TDEE = BMR x activity multiplier
ACTIVITY_MULTIPLIERS: dict[str, float] = {
    "sedentary": 1.2,
    "lightly_active": 1.375,
    "moderately_active": 1.55,
    "very_active": 1.725,
    "extremely_active": 1.9,
}

# kcal added to / removed from TDEE per goal.
# Fat loss: 300-500 kcal deficit (400 = midpoint). Muscle gain: 200-300 surplus (250 = midpoint).
GOAL_CALORIE_ADJUSTMENTS: dict[str, int] = {
    "fat_loss": -400,
    "maintenance": 0,
    "muscle_gain": 250,
    "general_health": 0,
}

# Safety floor so a deficit never produces an unreasonably low target (general-wellness guard).
MIN_CALORIES: dict[str, int] = {"male": 1500, "female": 1200}

# BMI categories: (exclusive upper bound, label). Order matters.
BMI_CATEGORIES: list[tuple[float, str]] = [
    (18.5, "Underweight"),
    (25.0, "Normal"),
    (30.0, "Overweight"),
    (float("inf"), "Obesity"),
]

# Macro strategy
PROTEIN_G_PER_KG: dict[str, float] = {
    "fat_loss": 1.8,
    "muscle_gain": 1.8,
    "maintenance": 1.4,
    "general_health": 1.2,
}
FAT_CALORIE_SHARE = 0.25          # 25% of calories from fat
KCAL_PER_G = {"protein": 4, "carbs": 4, "fat": 9}

# Hydration estimate: ml of water per kg of body weight, clamped to a sane range.
HYDRATION_ML_PER_KG = 35
HYDRATION_MIN_ML = 1500
HYDRATION_MAX_ML = 4500
HYDRATION_ROUND_TO_ML = 50

DISCLAIMER = (
    "Nutrition targets are estimates for general wellness and should not replace "
    "professional medical or dietary advice."
)
