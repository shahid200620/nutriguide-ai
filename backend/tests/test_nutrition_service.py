import pytest

from app.services import nutrition as n


def test_bmi_known_example():
    assert n.calculate_bmi(70, 175) == pytest.approx(22.9, abs=0.05)  # 70 / 1.75^2 = 22.857


@pytest.mark.parametrize("bmi,label", [(17.0, "Underweight"), (18.5, "Normal"), (24.9, "Normal"), (25.0, "Overweight"), (29.9, "Overweight"), (30.0, "Obesity")])
def test_bmi_category(bmi, label):
    assert n.bmi_category(bmi) == label


def test_bmr_male():
    # 10*70 + 6.25*175 - 5*25 + 5 = 1673.75
    assert n.calculate_bmr(70, 175, 25, "male") == pytest.approx(1673.75, abs=0.1)


def test_bmr_female():
    # 10*60 + 6.25*165 - 5*30 - 161 = 1320.25
    assert n.calculate_bmr(60, 165, 30, "female") == pytest.approx(1320.25, abs=0.1)


@pytest.mark.parametrize("level,factor", [("sedentary", 1.2), ("lightly_active", 1.375), ("moderately_active", 1.55), ("very_active", 1.725), ("extremely_active", 1.9)])
def test_tdee_multipliers(level, factor):
    assert n.calculate_tdee(2000, level) == pytest.approx(2000 * factor, abs=0.1)


@pytest.mark.parametrize("goal,expected", [("fat_loss", 2100), ("maintenance", 2500), ("muscle_gain", 2750), ("general_health", 2500)])
def test_calorie_target_by_goal(goal, expected):
    assert n.calculate_calorie_target(2500, goal, "male") == expected


def test_calorie_floor_applies():
    assert n.calculate_calorie_target(1400, "fat_loss", "female") == 1200
    assert n.calculate_calorie_target(1600, "fat_loss", "male") == 1500


def test_macros_add_up_to_calories():
    m = n.calculate_macros(70, 2000, "maintenance")
    assert m.protein_g == 98            # 70 * 1.4
    assert m.fat_g == 56                # 2000 * 0.25 / 9
    total = m.protein_g * 4 + m.carbs_g * 4 + m.fat_g * 9
    assert abs(total - 2000) <= 4


def test_hydration_target_and_clamps():
    assert n.calculate_hydration_target_ml(70) == 2450   # 70 * 35
    assert n.calculate_hydration_target_ml(30) == 1500   # min clamp
    assert n.calculate_hydration_target_ml(200) == 4500  # max clamp


def test_calculate_all_end_to_end():
    r = n.calculate_all(age=25, gender="male", height_cm=175, weight_kg=70, activity_level="sedentary", fitness_goal="maintenance")
    assert r.bmi_category == "Normal"
    assert r.tdee == pytest.approx(2008.6, abs=0.2)
    assert r.daily_calorie_target == 2009
