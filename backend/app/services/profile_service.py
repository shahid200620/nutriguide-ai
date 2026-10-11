"""Create/update a profile and (re)compute stored nutrition targets in one transaction."""
from sqlalchemy.orm import Session

from app.models import NutritionTargets, User, UserProfile
from app.schemas.profile import ProfileIn
from app.services import nutrition


def recalculate_targets(db: Session, user: User) -> NutritionTargets:
    p = user.profile
    result = nutrition.calculate_all(
        age=p.age, gender=p.gender, height_cm=p.height_cm, weight_kg=p.weight_kg,
        activity_level=p.activity_level, fitness_goal=p.fitness_goal,
    )
    t = user.targets or NutritionTargets(user_id=user.id)
    t.bmi, t.bmr, t.tdee = result.bmi, result.bmr, result.tdee
    t.daily_calorie_target = result.daily_calorie_target
    t.protein_target = result.macros.protein_g
    t.carbs_target = result.macros.carbs_g
    t.fat_target = result.macros.fat_g
    user.targets = t
    return t


def save_profile(db: Session, user: User, data: ProfileIn) -> UserProfile:
    values = {k: (v.value if hasattr(v, "value") else v) for k, v in data.model_dump().items()}
    if user.profile is None:
        user.profile = UserProfile(user_id=user.id, **values)
    else:
        for k, v in values.items():
            setattr(user.profile, k, v)
    db.flush()
    recalculate_targets(db, user)
    db.commit()
    db.refresh(user)
    return user.profile


def targets_out_dict(t: NutritionTargets) -> dict:
    from app.services.nutrition import bmi_category
    return {
        "bmi": t.bmi, "bmi_category": bmi_category(t.bmi), "bmr": t.bmr, "tdee": t.tdee,
        "daily_calorie_target": t.daily_calorie_target, "protein_target": t.protein_target,
        "carbs_target": t.carbs_target, "fat_target": t.fat_target, "updated_at": t.updated_at,
    }
