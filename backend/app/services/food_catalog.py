"""
Small built-in food catalog used by the rule-based meal planner.

IMPORTANT: values are APPROXIMATE per-serving estimates written by hand for demo
purposes. They are NOT from a verified nutrition database. Phase 2 replaces this
with USDA FoodData Central / OpenFoodFacts data.

Tuple: (name, serving, kcal, protein_g, carbs_g, fat_g, strictest_diet)
strictest_diet = the least restrictive diet that can eat it:
  vegan < vegetarian < eggetarian < non_vegetarian
"""

Food = tuple[str, str, float, float, float, float, str]

# Which catalog tags each dietary preference may eat.
DIET_ALLOWS: dict[str, set[str]] = {
    "vegan": {"vegan"},
    "vegetarian": {"vegan", "vegetarian"},
    "eggetarian": {"vegan", "vegetarian", "eggetarian"},
    "non_vegetarian": {"vegan", "vegetarian", "eggetarian", "non_vegetarian"},
}

BREAKFAST_MAIN: list[Food] = [
    ("Oatmeal with banana", "1 bowl (250 g)", 300, 9, 54, 6, "vegan"),
    ("Poha with peanuts", "1 plate (200 g)", 270, 6, 45, 8, "vegan"),
    ("Vegetable upma", "1 bowl (200 g)", 230, 6, 38, 6, "vegan"),
    ("Moong dal chilla", "2 pieces", 220, 14, 28, 5, "vegan"),
    ("Idli with sambar", "3 idlis + 1 small bowl", 250, 9, 48, 2, "vegan"),
    ("Peanut butter toast", "2 slices", 250, 10, 30, 11, "vegan"),
    ("Paneer bhurji", "1 small bowl (100 g)", 260, 16, 5, 19, "vegetarian"),
    ("Masala omelette", "2-egg omelette", 190, 13, 3, 14, "eggetarian"),
    ("Chicken sandwich", "1 sandwich", 320, 25, 30, 10, "non_vegetarian"),
]
BREAKFAST_SIDE: list[Food] = [
    ("Mixed fruit bowl", "1 cup", 90, 1, 22, 0, "vegan"),
    ("Banana", "1 medium", 105, 1, 27, 0, "vegan"),
    ("Whole wheat toast", "2 slices", 160, 6, 28, 2, "vegan"),
    ("Plain Greek yogurt", "170 g", 100, 17, 6, 1, "vegetarian"),
    ("Boiled eggs", "2 large", 156, 13, 1, 11, "eggetarian"),
]

LUNCH_DINNER_CARB: list[Food] = [
    ("Steamed rice", "1 cup cooked (150 g)", 200, 4, 44, 0, "vegan"),
    ("Chapati", "2 medium", 210, 7, 42, 3, "vegan"),
    ("Quinoa salad", "1 bowl", 220, 8, 34, 6, "vegan"),
]
LUNCH_DINNER_PROTEIN: list[Food] = [
    ("Dal tadka", "1 bowl (200 g)", 180, 9, 24, 5, "vegan"),
    ("Rajma curry", "1 bowl (200 g)", 210, 11, 32, 4, "vegan"),
    ("Chickpea masala", "1 bowl (200 g)", 240, 11, 34, 7, "vegan"),
    ("Tofu stir-fry", "1 bowl (180 g)", 180, 14, 8, 11, "vegan"),
    ("Paneer curry", "1 bowl (150 g)", 300, 16, 9, 22, "vegetarian"),
    ("Paneer tikka", "100 g", 230, 15, 6, 16, "vegetarian"),
    ("Egg curry", "2 eggs + gravy", 230, 14, 8, 16, "eggetarian"),
    ("Grilled chicken breast", "100 g", 165, 31, 0, 4, "non_vegetarian"),
    ("Chicken curry", "1 bowl (200 g)", 250, 24, 7, 14, "non_vegetarian"),
    ("Fish curry", "1 bowl (200 g)", 220, 22, 6, 12, "non_vegetarian"),
]
LUNCH_DINNER_VEG: list[Food] = [
    ("Mixed vegetable curry", "1 bowl (150 g)", 120, 3, 14, 6, "vegan"),
    ("Stir-fried vegetables", "1 bowl (150 g)", 110, 3, 12, 6, "vegan"),
    ("Cucumber-tomato salad", "1 bowl", 45, 2, 9, 0, "vegan"),
    ("Curd (raita)", "1 small bowl (100 g)", 60, 3, 5, 3, "vegetarian"),
]

SNACKS: list[Food] = [
    ("Roasted chana", "30 g", 110, 6, 18, 2, "vegan"),
    ("Almonds", "28 g (small handful)", 165, 6, 6, 14, "vegan"),
    ("Apple", "1 medium", 95, 0, 25, 0, "vegan"),
    ("Sprouts salad", "1 bowl", 120, 8, 20, 1, "vegan"),
    ("Roasted makhana", "1 cup", 100, 3, 20, 1, "vegan"),
    ("Buttermilk", "1 glass (250 ml)", 60, 3, 5, 3, "vegetarian"),
    ("Greek yogurt with berries", "150 g", 120, 12, 14, 2, "vegetarian"),
    ("Boiled egg", "1 large", 78, 6, 1, 5, "eggetarian"),
]

# meal_type -> list of "slots"; one food is drawn from each slot's list.
MEAL_TEMPLATES: dict[str, list[list[Food]]] = {
    "breakfast": [BREAKFAST_MAIN, BREAKFAST_SIDE],
    "lunch": [LUNCH_DINNER_CARB, LUNCH_DINNER_PROTEIN, LUNCH_DINNER_VEG],
    "snack": [SNACKS],
    "dinner": [LUNCH_DINNER_CARB, LUNCH_DINNER_PROTEIN, LUNCH_DINNER_VEG],
}
