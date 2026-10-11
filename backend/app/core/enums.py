"""Allowed values for profile fields. Add new options here (e.g. new diets)."""
from enum import Enum


class Gender(str, Enum):
    male = "male"
    female = "female"


class ActivityLevel(str, Enum):
    sedentary = "sedentary"
    lightly_active = "lightly_active"
    moderately_active = "moderately_active"
    very_active = "very_active"
    extremely_active = "extremely_active"


class DietaryPreference(str, Enum):
    vegetarian = "vegetarian"
    non_vegetarian = "non_vegetarian"
    vegan = "vegan"
    eggetarian = "eggetarian"


class FitnessGoal(str, Enum):
    fat_loss = "fat_loss"
    muscle_gain = "muscle_gain"
    maintenance = "maintenance"
    general_health = "general_health"


class MealType(str, Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    snack = "snack"
    dinner = "dinner"
