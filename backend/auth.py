import bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps
from typing import Optional

from flask import request, jsonify, current_app

from db import load_db, transaction


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def generate_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=7),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def verify_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing"}), 401

        if token.startswith("Bearer "):
            token = token[7:]

        payload = verify_token(token)
        if not payload:
            return jsonify({"message": "Token is invalid or expired"}), 401

        request.current_user = payload
        return f(*args, **kwargs)

    return decorated


def find_user_by_email(email: str) -> Optional[dict]:
    db = load_db()
    return next((u for u in db.get("users", []) if u["email"] == email), None)


_DEFAULT_PREFERENCES = {
    "notifications": {
        "email": True,
        "push": True,
        "matches": True,
        "reports": True,
        "marketing": False,
    },
    "theme": "dark",
    "language": "en",
    "dashboard_layout": "default",
    "email_frequency": "daily",
}

_DEFAULT_GOALS = {
    "carbon_reduction_target": 0,
    "target_date": "",
    "current_progress": 0,
    "milestones": [],
    "tracking_method": "manual",
}


def _strip_password(user: dict) -> dict:
    safe = user.copy()
    safe.pop("password", None)
    return safe


def create_user(email: str, password: str, name: str, role: str = "user") -> Optional[dict]:
    with transaction() as db:
        users = db.setdefault("users", [])
        if any(u["email"] == email for u in users):
            return None
        user_id = f"user_{len(users) + 1}"
        new_user = {
            "id": user_id,
            "email": email,
            "password": hash_password(password),
            "name": name,
            "role": role,
            "created_at": datetime.utcnow().isoformat(),
            "profile": {
                "bio": "",
                "company": "",
                "phone": "",
                "location": "",
                "website": "",
                "linkedin": "",
            },
            "preferences": dict(_DEFAULT_PREFERENCES),
            "sustainability_goals": dict(_DEFAULT_GOALS),
        }
        users.append(new_user)
        return _strip_password(new_user)


def update_user_profile(email: str, profile_data: dict) -> Optional[dict]:
    with transaction() as db:
        for user in db.get("users", []):
            if user["email"] != email:
                continue
            user.setdefault("profile", {}).update(profile_data)
            if "name" in profile_data:
                user["name"] = profile_data["name"]
            return _strip_password(user)
    return None


def get_user_preferences(email: str) -> Optional[dict]:
    user = find_user_by_email(email)
    if not user:
        return None
    return user.get("preferences", dict(_DEFAULT_PREFERENCES))


def update_user_preferences(email: str, preferences_data: dict) -> Optional[dict]:
    with transaction() as db:
        for user in db.get("users", []):
            if user["email"] != email:
                continue
            user.setdefault("preferences", dict(_DEFAULT_PREFERENCES)).update(preferences_data)
            return user["preferences"]
    return None


def get_user_sustainability_goals(email: str) -> Optional[dict]:
    user = find_user_by_email(email)
    if not user:
        return None
    return user.get("sustainability_goals", dict(_DEFAULT_GOALS))


def update_user_sustainability_goals(email: str, goals_data: dict) -> Optional[dict]:
    with transaction() as db:
        for user in db.get("users", []):
            if user["email"] != email:
                continue
            user.setdefault("sustainability_goals", dict(_DEFAULT_GOALS)).update(goals_data)
            return user["sustainability_goals"]
    return None
