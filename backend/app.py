# backend/app.py - Enhanced with Authentication

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import uuid
import os
from math import radians, sin, cos, sqrt, atan2
import openai
import requests
from geopy.geocoders import Nominatim
from dotenv import load_dotenv
from auth import (
    create_user, find_user_by_email, check_password, 
    generate_token, token_required
)

# Load environment variables
load_dotenv()

# --- Azure OpenAI Configuration ---
client = openai.AzureOpenAI(
    azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT', "https://VAF-OPEN-AI.openai.azure.com/"),
    api_key=os.getenv('AZURE_OPENAI_API_KEY', "d6e3e6f6647346e187a10345841af98f"),
    api_version="2024-03-01-preview"
)
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME', "VAF_OPEN_AI")

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')

# --- Helper Functions ---
def load_db():
    with open('database.json', 'r') as f: return json.load(f)
def save_db(db):
    with open('database.json', 'w') as f: json.dump(db, f, indent=2)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    lat1_rad, lon1_rad, lat2_rad, lon2_rad = map(radians, [lat1, lon1, lat2, lon2])
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = R * c
    return distance

# --- API Endpoints ---
# --- Authentication Endpoints ---
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        if not email or not password or not name:
            return jsonify({'message': 'Email, password, and name are required'}), 400
        
        # Check if user already exists
        if find_user_by_email(email):
            return jsonify({'message': 'User already exists'}), 409
        
        # Create new user
        user = create_user(email, password, name)
        if not user:
            return jsonify({'message': 'Failed to create user'}), 500
        
        # Generate token
        token = generate_token(user['id'], user['email'])
        
        return jsonify({
            'message': 'User created successfully', 
            'user': user,
            'token': token
        }), 201
    
    except Exception as e:
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        # Find user
        user = find_user_by_email(email)
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Check password
        if not check_password(password, user['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate token
        token = generate_token(user['id'], user['email'])
        
        # Return user without password
        user_data = user.copy()
        del user_data['password']
        
        return jsonify({
            'message': 'Login successful',
            'user': user_data,
            'token': token
        }), 200
    
    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile():
    try:
        user = find_user_by_email(request.current_user['email'])
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Return user without password
        user_data = user.copy()
        del user_data['password']
        
        return jsonify({'user': user_data}), 200
    
    except Exception as e:
        return jsonify({'message': 'Failed to get profile', 'error': str(e)}), 500

@app.route('/')
def index(): return "CarbonCapture API is running!"

@app.route('/api/geocode', methods=['POST'])
def geocode_address():
    data = request.get_json(); address = data.get('address')
    if not address: return jsonify({"error": "Address is required"}), 400
    try:
        geolocator = Nominatim(user_agent="carbon_marketplace_hackathon"); location = geolocator.geocode(address)
        if location: return jsonify({"lat": location.latitude, "lon": location.longitude})
        else: return jsonify({"error": "Could not find coordinates for the address."}), 404
    except Exception as e: print(f"Geocoding error: {e}"); return jsonify({"error": "Geocoding service failed."}), 500

@app.route('/api/producers', methods=['GET'])
def get_all_producers():
    db = load_db(); return jsonify(db['producers'])

@app.route('/api/producers', methods=['POST'])
def add_producer():
    data = request.get_json(); db = load_db()
    new_producer = {"id": f"prod_{uuid.uuid4()}", "name": data['name'], "location": data['location'], "co2_supply_tonnes_per_week": data['co2_supply_tonnes_per_week']}
    db['producers'].append(new_producer); save_db(db)
    return jsonify({"message": "Producer added successfully", "producer": new_producer}), 201

@app.route('/api/consumers', methods=['POST'])
def add_consumer():
    data = request.get_json(); db = load_db()
    new_consumer = {"id": f"cons_{uuid.uuid4()}", "name": data['name'], "industry": data['industry'], "location": data['location'], "co2_demand_tonnes_per_week": data['co2_demand_tonnes_per_week']}
    db['consumers'].append(new_consumer); save_db(db)
    return jsonify({"message": "Consumer added successfully", "consumer": new_consumer}), 201

@app.route('/api/matches', methods=['GET'])
def get_matches():
    producer_id = request.args.get('producer_id')
    if not producer_id: return jsonify({"error": "producer_id parameter is required"}), 400
    db = load_db(); producer = next((p for p in db['producers'] if p['id'] == producer_id), None)
    if not producer: return jsonify({"error": "Producer not found"}), 404
    producer_loc = producer['location']; matches = []
    for consumer in db['consumers']:
        consumer_loc = consumer['location']; distance = haversine(producer_loc['lat'], producer_loc['lon'], consumer_loc['lat'], consumer_loc['lon'])
        if consumer['co2_demand_tonnes_per_week'] <= producer['co2_supply_tonnes_per_week']:
            match_data = consumer.copy(); match_data['distance_km'] = round(distance, 2); matches.append(match_data)
    sorted_matches = sorted(matches, key=lambda x: x['distance_km']); return jsonify(sorted_matches)

# --- AI Analysis Endpoint (New, More Reliable Strategy) ---
@app.route('/api/analyze-matches', methods=['POST'])
def analyze_matches():
    data = request.get_json()
    producer = data.get('producer')
    matches = data.get('matches')
    if not producer or not matches:
        return jsonify({"error": "Producer and matches data are required"}), 400

    analyzed_matches = []
    # We now loop through each match and make a small, separate AI call for each one.
    for i, match in enumerate(matches):
        try:
            # This is a much simpler prompt for the AI to handle
            prompt_content = f"""
            You are a sustainability business analyst. Given the following CO2 Producer and a potential Consumer, provide a brief analysis.

            Producer:
            - Name: "{producer['name']}"
            - Weekly CO2 Supply: {producer['co2_supply_tonnes_per_week']} tonnes

            Consumer:
            - Name: "{match['name']}"
            - Industry: "{match['industry']}"
            - Weekly CO2 Demand: {match['co2_demand_tonnes_per_week']} tonnes
            - Distance: {match['distance_km']} km

            Your response must be a single, valid JSON object with two keys: "justification" and "strategic_considerations".
            - "justification": A concise paragraph explaining why this is or is not a good partnership.
            - "strategic_considerations": An array of 2 short bullet-point style strings highlighting key decision factors.
            """
            response = client.chat.completions.create(
                model=AZURE_OPENAI_DEPLOYMENT_NAME,
                messages=[
                    {"role": "system", "content": "You are an expert analyst providing data in a strict JSON format."},
                    {"role": "user", "content": prompt_content}
                ],
                temperature=0.5,
                max_tokens=500
            )
            analysis_text = response.choices[0].message.content
            if not analysis_text: raise Exception("AI returned empty content")
            
            analysis_json = json.loads(analysis_text)
            
            # Add the analysis and rank to the match object
            match['analysis'] = {
                "rank": i + 1,
                "justification": analysis_json.get("justification", "N/A"),
                "strategic_considerations": analysis_json.get("strategic_considerations", [])
            }
        except Exception as e:
            # If a single AI call fails, we still add the match with a fallback message
            print(f"AI call failed for match {match['name']}: {e}")
            match['analysis'] = {
                "rank": i + 1,
                "justification": "AI analysis for this specific opportunity is currently unavailable.",
                "strategic_considerations": []
            }
        
        analyzed_matches.append(match)

    final_report = {
        "overall_summary": f"Found {len(analyzed_matches)} potential partners for {producer['name']}, sorted by distance. Each has been analyzed for strategic fit.",
        "ranked_matches": analyzed_matches
    }

    return jsonify(final_report)

@app.route('/api/impact-model', methods=['POST'])
def impact_model():
    data = request.get_json(); producer = data.get('producer'); consumer = data.get('consumer')
    if not producer or not consumer: return jsonify({"error": "Producer and consumer data are required"}), 400
    try:
        carbon_credit_price_per_tonne = 25.00; industrial_co2_price_per_tonne = 75.00; weeks_per_year = 52
        estimated_delivery_emissions_per_100km = 0.05
        tonnes_per_week = min(producer['co2_supply_tonnes_per_week'], consumer['co2_demand_tonnes_per_week'])
        tonnes_per_year = tonnes_per_week * weeks_per_year
        annual_revenue_for_producer = tonnes_per_year * carbon_credit_price_per_tonne
        annual_savings_for_consumer = tonnes_per_year * industrial_co2_price_per_tonne
        estimated_delivery_emissions = (consumer['distance_km'] / 100) * estimated_delivery_emissions_per_100km * weeks_per_year
        net_co2_sequestered = tonnes_per_year - estimated_delivery_emissions
        return jsonify({
            "producer_name": producer['name'], "consumer_name": consumer['name'], "annual_tonnage": round(tonnes_per_year, 2),
            "financials": {"producer_annual_revenue": round(annual_revenue_for_producer, 2), "consumer_annual_savings": round(annual_savings_for_consumer, 2), "carbon_credit_value": round(annual_revenue_for_producer, 2)},
            "environmental": {"co2_diverted": round(tonnes_per_year, 2), "estimated_logistics_emissions": round(estimated_delivery_emissions, 2), "net_co2_impact": round(net_co2_sequestered, 2)}
        })
    except Exception as e:
        print(f"An error occurred in impact-model: {e}")
        return jsonify({"error": "Failed to calculate impact model."}), 500

# --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)