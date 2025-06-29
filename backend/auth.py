import bcrypt
import jwt
import json
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app

def load_users():
    """Load users from database.json"""
    try:
        with open('database.json', 'r') as f:
            data = json.load(f)
            return data.get('users', [])
    except FileNotFoundError:
        return []

def save_users(users):
    """Save users to database.json"""
    try:
        with open('database.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {"producers": [], "consumers": []}
    
    data['users'] = users
    with open('database.json', 'w') as f:
        json.dump(data, f, indent=2)

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    """Check if password matches the hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_token(user_id, email):
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7)  # Token expires in 7 days
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            payload = verify_token(token)
            if not payload:
                return jsonify({'message': 'Token is invalid or expired'}), 401
            
            request.current_user = payload
        except Exception as e:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    return decorated

def find_user_by_email(email):
    """Find user by email"""
    users = load_users()
    return next((user for user in users if user['email'] == email), None)

def create_user(email, password, name, role='user'):
    """Create a new user"""
    users = load_users()
    
    # Check if user already exists
    if find_user_by_email(email):
        return None
    
    user_id = f"user_{len(users) + 1}"
    new_user = {
        'id': user_id,
        'email': email,
        'password': hash_password(password),
        'name': name,
        'role': role,
        'created_at': datetime.utcnow().isoformat()
    }
    
    users.append(new_user)
    save_users(users)
    
    # Return user without password
    user_data = new_user.copy()
    del user_data['password']
    return user_data 