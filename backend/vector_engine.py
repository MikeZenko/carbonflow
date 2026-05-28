import numpy as np
import json
import pickle
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class VectorEngine:
    def __init__(self):
        # Use environment variable for vector directory or default
        vector_dir_path = os.getenv('VECTOR_CACHE_DIR', './vectors')
        self.vector_dir = Path(vector_dir_path)
        self.vector_dir.mkdir(exist_ok=True)
        
        # Industry mappings
        self.producer_industries = {
            'Cement Manufacturing': 0,
            'Ethanol Production': 1,
            'Petrochemical': 2,
            'Power Generation': 3,
            'Chemical': 4,
            'Steel': 5,
            'Manufacturing': 6,
            'Other': 7
        }
        
        self.consumer_industries = {
            'Concrete Curing': 0,
            'Vertical Farming': 1,
            'Biofuel Synthesis': 2,
            'Beverage Carbonation': 3,
            'Chemical Synthesis': 4,
            'Food Processing': 5,
            'Manufacturing': 6,
            'Other': 7
        }
        
        # Transportation methods
        self.transport_methods = {
            'Truck': 0,
            'Rail': 1,
            'Pipeline': 2,
            'Ship': 3,
            'Tank Truck': 4,
            'Other': 5
        }
        
        # Geographic regions (simplified US regions)
        self.regions = {
            'West': 0,
            'East': 1,
            'South': 2,
            'Central': 3
        }
        
        # Vector dimensions
        self.PRODUCER_VECTOR_SIZE = 32
        self.CONSUMER_VECTOR_SIZE = 28
        
        # Cache for vectors
        self.producer_vectors = {}
        self.consumer_vectors = {}
        
        # Load existing vectors if available
        self.load_vectors()
    
    def get_geographic_region(self, lat: float, lon: float) -> int:
        """Determine US region based on coordinates"""
        if lon < -100:  # West
            return self.regions['West']
        elif lon > -80:  # East
            return self.regions['East']
        elif lat < 35:  # South
            return self.regions['South']
        else:  # Central
            return self.regions['Central']
    
    def normalize_capacity(self, capacity: float, is_producer: bool = True) -> int:
        """Normalize capacity to tier (0-3)"""
        if is_producer:
            # Producer capacity tiers (tonnes per week)
            if capacity < 200:
                return 0  # Small
            elif capacity < 500:
                return 1  # Medium
            elif capacity < 1000:
                return 2  # Large
            else:
                return 3  # Extra Large
        else:
            # Consumer demand tiers (tonnes per week)
            if capacity < 100:
                return 0  # Small
            elif capacity < 300:
                return 1  # Medium
            elif capacity < 600:
                return 2  # Large
            else:
                return 3  # Extra Large
    
    def normalize_purity(self, purity: float) -> float:
        """Normalize CO2 purity to 0-1 scale"""
        return max(0, min(1, purity / 100.0))
    
    def generate_producer_vector(self, producer_data: Dict) -> np.ndarray:
        """Generate vector representation for producer"""
        vector = np.zeros(self.PRODUCER_VECTOR_SIZE)
        idx = 0
        
        # 1. Capacity tier (4 dimensions - one-hot)
        capacity_tier = self.normalize_capacity(
            producer_data.get('co2_supply_tonnes_per_week', 0), 
            is_producer=True
        )
        vector[capacity_tier] = 1.0
        idx += 4
        
        # 2. Industry type (8 dimensions - one-hot)
        industry = producer_data.get('industry_type', 'Other')
        industry_idx = self.producer_industries.get(industry, 7)
        vector[idx + industry_idx] = 1.0
        idx += 8
        
        # 3. CO2 purity (1 dimension - normalized)
        purity = self.normalize_purity(producer_data.get('co2_purity', 90))
        vector[idx] = purity
        idx += 1
        
        # 4. Geographic region (4 dimensions - one-hot)
        location = producer_data.get('location', {})
        if location:
            region = self.get_geographic_region(location.get('lat', 0), location.get('lon', 0))
            vector[idx + region] = 1.0
        idx += 4
        
        # 5. Transportation methods (6 dimensions - multi-hot)
        transport_methods = producer_data.get('transportation_methods', [])
        for method in transport_methods:
            method_idx = self.transport_methods.get(method, 5)
            vector[idx + method_idx] = 1.0
        idx += 6
        
        # 6. Supply consistency (1 dimension - derived metric)
        annual_capacity = producer_data.get('co2_output_tonnes_per_year', 0)
        weekly_capacity = producer_data.get('co2_supply_tonnes_per_week', 0)
        if weekly_capacity > 0:
            consistency = min(1.0, annual_capacity / (weekly_capacity * 52))
            vector[idx] = consistency
        idx += 1
        
        # 7. Location embedding (8 dimensions - geographic features)
        if location:
            lat = location.get('lat', 0)
            lon = location.get('lon', 0)
            
            # Encode geographic features
            vector[idx] = (lat + 90) / 180.0  # Normalized latitude
            vector[idx + 1] = (lon + 180) / 360.0  # Normalized longitude
            vector[idx + 2] = np.sin(np.radians(lat))  # Sine of latitude
            vector[idx + 3] = np.cos(np.radians(lat))  # Cosine of latitude
            vector[idx + 4] = np.sin(np.radians(lon))  # Sine of longitude
            vector[idx + 5] = np.cos(np.radians(lon))  # Cosine of longitude
            
            # Distance from major industrial centers
            vector[idx + 6] = self._distance_to_major_center(lat, lon, 'industrial')
            vector[idx + 7] = self._distance_to_major_center(lat, lon, 'transport')
        
        return vector
    
    def generate_consumer_vector(self, consumer_data: Dict) -> np.ndarray:
        """Generate vector representation for consumer"""
        vector = np.zeros(self.CONSUMER_VECTOR_SIZE)
        idx = 0
        
        # 1. Demand tier (4 dimensions - one-hot)
        demand_tier = self.normalize_capacity(
            consumer_data.get('co2_demand_tonnes_per_week', 0), 
            is_producer=False
        )
        vector[demand_tier] = 1.0
        idx += 4
        
        # 2. Industry type (8 dimensions - one-hot)
        industry = consumer_data.get('industry', 'Other')
        industry_idx = self.consumer_industries.get(industry, 7)
        vector[idx + industry_idx] = 1.0
        idx += 8
        
        # 3. Geographic region (4 dimensions - one-hot)
        location = consumer_data.get('location', {})
        if location:
            region = self.get_geographic_region(location.get('lat', 0), location.get('lon', 0))
            vector[idx + region] = 1.0
        idx += 4
        
        # 4. Quality requirements (4 dimensions - inferred from industry)
        quality_req = self._infer_quality_requirements(industry)
        vector[idx:idx + 4] = quality_req
        idx += 4
        
        # 5. Location embedding (8 dimensions - geographic features)
        if location:
            lat = location.get('lat', 0)
            lon = location.get('lon', 0)
            
            # Encode geographic features
            vector[idx] = (lat + 90) / 180.0  # Normalized latitude
            vector[idx + 1] = (lon + 180) / 360.0  # Normalized longitude
            vector[idx + 2] = np.sin(np.radians(lat))  # Sine of latitude
            vector[idx + 3] = np.cos(np.radians(lat))  # Cosine of latitude
            vector[idx + 4] = np.sin(np.radians(lon))  # Sine of longitude
            vector[idx + 5] = np.cos(np.radians(lon))  # Cosine of longitude
            
            # Distance from major industrial centers
            vector[idx + 6] = self._distance_to_major_center(lat, lon, 'industrial')
            vector[idx + 7] = self._distance_to_major_center(lat, lon, 'transport')
        
        return vector
    
    def _infer_quality_requirements(self, industry: str) -> np.ndarray:
        """Infer quality requirements based on industry"""
        # [food_grade, industrial, premium, standard]
        quality_map = {
            'Beverage Carbonation': [1.0, 0.0, 1.0, 0.0],  # Food grade, premium
            'Food Processing': [1.0, 0.0, 1.0, 0.0],       # Food grade, premium
            'Chemical Synthesis': [0.0, 1.0, 1.0, 0.0],    # Industrial, premium
            'Concrete Curing': [0.0, 1.0, 0.0, 1.0],       # Industrial, standard
            'Vertical Farming': [0.0, 1.0, 0.5, 0.5],      # Industrial, mixed
            'Biofuel Synthesis': [0.0, 1.0, 0.0, 1.0],     # Industrial, standard
            'Manufacturing': [0.0, 1.0, 0.0, 1.0],         # Industrial, standard
        }
        return np.array(quality_map.get(industry, [0.0, 1.0, 0.0, 1.0]))
    
    def _distance_to_major_center(self, lat: float, lon: float, center_type: str) -> float:
        """Calculate normalized distance to major industrial/transport centers"""
        # Major centers coordinates (simplified)
        centers = {
            'industrial': [
                (34.0522, -118.2437),  # Los Angeles
                (41.8781, -87.6298),   # Chicago
                (29.7604, -95.3698),   # Houston
                (40.7128, -74.0060),   # New York
            ],
            'transport': [
                (33.7490, -84.3880),   # Atlanta
                (39.7392, -104.9903),  # Denver
                (47.6062, -122.3321),  # Seattle
                (25.7617, -80.1918),   # Miami
            ]
        }
        
        min_distance = float('inf')
        for center_lat, center_lon in centers[center_type]:
            # Simple distance calculation
            distance = np.sqrt((lat - center_lat)**2 + (lon - center_lon)**2)
            min_distance = min(min_distance, distance)
        
        # Normalize to 0-1 (assuming max distance of ~50 degrees)
        return min(1.0, min_distance / 50.0)
    
    def update_producer_vectors(self, producers: List[Dict]):
        """Update all producer vectors"""
        logger.info(f"Updating vectors for {len(producers)} producers")
        self.producer_vectors = {}
        
        for producer in producers:
            producer_id = producer.get('id')
            if producer_id:
                try:
                    vector = self.generate_producer_vector(producer)
                    self.producer_vectors[producer_id] = vector
                except Exception as e:
                    logger.error(f"Error generating vector for producer {producer_id}: {e}")
        
        self.save_vectors()
        logger.info(f"Successfully updated {len(self.producer_vectors)} producer vectors")
    
    def update_consumer_vectors(self, consumers: List[Dict]):
        """Update all consumer vectors"""
        logger.info(f"Updating vectors for {len(consumers)} consumers")
        self.consumer_vectors = {}
        
        for consumer in consumers:
            consumer_id = consumer.get('id')
            if consumer_id:
                try:
                    vector = self.generate_consumer_vector(consumer)
                    self.consumer_vectors[consumer_id] = vector
                except Exception as e:
                    logger.error(f"Error generating vector for consumer {consumer_id}: {e}")
        
        self.save_vectors()
        logger.info(f"Successfully updated {len(self.consumer_vectors)} consumer vectors")
    
    def save_vectors(self):
        """Save vectors to disk"""
        try:
            # Save producer vectors
            with open(self.vector_dir / "producer_vectors.pkl", 'wb') as f:
                pickle.dump(self.producer_vectors, f)
            
            # Save consumer vectors
            with open(self.vector_dir / "consumer_vectors.pkl", 'wb') as f:
                pickle.dump(self.consumer_vectors, f)
            
            logger.info("Vectors saved successfully")
        except Exception as e:
            logger.error(f"Error saving vectors: {e}")
    
    def load_vectors(self):
        """Load vectors from disk"""
        try:
            # Load producer vectors
            if (self.vector_dir / "producer_vectors.pkl").exists():
                with open(self.vector_dir / "producer_vectors.pkl", 'rb') as f:
                    self.producer_vectors = pickle.load(f)
            
            # Load consumer vectors
            if (self.vector_dir / "consumer_vectors.pkl").exists():
                with open(self.vector_dir / "consumer_vectors.pkl", 'rb') as f:
                    self.consumer_vectors = pickle.load(f)
            
            logger.info(f"Loaded {len(self.producer_vectors)} producer vectors and {len(self.consumer_vectors)} consumer vectors")
        except Exception as e:
            logger.error(f"Error loading vectors: {e}")
            self.producer_vectors = {}
            self.consumer_vectors = {}
    
    def get_vector_similarity(self, producer_id: str, consumer_id: str) -> float:
        """Calculate cosine similarity between producer and consumer vectors"""
        if producer_id not in self.producer_vectors or consumer_id not in self.consumer_vectors:
            return 0.0
        
        producer_vector = self.producer_vectors[producer_id]
        consumer_vector = self.consumer_vectors[consumer_id]
        
        # Pad vectors to same length for comparison
        max_len = max(len(producer_vector), len(consumer_vector))
        prod_padded = np.pad(producer_vector, (0, max_len - len(producer_vector)))
        cons_padded = np.pad(consumer_vector, (0, max_len - len(consumer_vector)))
        
        # Calculate cosine similarity
        dot_product = np.dot(prod_padded, cons_padded)
        norm_prod = np.linalg.norm(prod_padded)
        norm_cons = np.linalg.norm(cons_padded)
        
        if norm_prod == 0 or norm_cons == 0:
            return 0.0
        
        similarity = dot_product / (norm_prod * norm_cons)
        return max(0.0, similarity)  # Ensure non-negative
    
    def rebuild_all_vectors(self):
        """Rebuild all vectors from database"""
        try:
            from db import load_db
            db = load_db()
            self.update_producer_vectors(db.get('producers', []))
            self.update_consumer_vectors(db.get('consumers', []))
            logger.info("All vectors rebuilt successfully")
        except Exception as e:
            logger.error(f"Error rebuilding vectors: {e}")
    
    def get_vector_stats(self) -> Dict:
        """Get statistics about current vectors"""
        return {
            'producer_vectors': len(self.producer_vectors),
            'consumer_vectors': len(self.consumer_vectors),
            'vector_dimensions': {
                'producer': self.PRODUCER_VECTOR_SIZE,
                'consumer': self.CONSUMER_VECTOR_SIZE
            }
        } 