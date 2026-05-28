import numpy as np
import json
import os
from typing import Dict, List, Tuple, Optional
from geopy.distance import geodesic
import logging

logger = logging.getLogger(__name__)

class AdvancedMatcher:
    def __init__(self, vector_engine):
        self.vector_engine = vector_engine
        
        # Matching weights - these determine the importance of each factor
        self.weights = {
            'vector_similarity': 0.35,    # Vector-based semantic match
            'capacity_compatibility': 0.25, # Supply/demand fit
            'distance_penalty': 0.20,     # Geographic proximity
            'quality_match': 0.15,        # CO2 purity alignment
            'transport_compatibility': 0.05  # Transportation method alignment
        }
        
        # Distance penalty parameters
        self.max_reasonable_distance = 500  # km
        self.distance_penalty_factor = 2.0
        
    def load_database(self) -> Dict:
        """Load the database via the shared lock-aware loader."""
        from db import load_db
        return load_db()
    
    def haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        try:
            point1 = (lat1, lon1)
            point2 = (lat2, lon2)
            return geodesic(point1, point2).kilometers
        except Exception as e:
            logger.error(f"Error calculating distance: {e}")
            return float('inf')
    
    def calculate_capacity_fit(self, producer_data: Dict, consumer_data: Dict) -> float:
        """Calculate how well producer supply matches consumer demand"""
        producer_supply = producer_data.get('co2_supply_tonnes_per_week', 0)
        consumer_demand = consumer_data.get('co2_demand_tonnes_per_week', 0)
        
        if producer_supply == 0 or consumer_demand == 0:
            return 0.0
        
        # Check if producer can meet demand
        if producer_supply < consumer_demand:
            return 0.0  # Cannot meet demand
        
        # Calculate efficiency score - prefer close matches
        ratio = consumer_demand / producer_supply
        
        # Optimal ratio is between 0.3 and 0.8 (30-80% capacity utilization)
        if 0.3 <= ratio <= 0.8:
            return 1.0  # Perfect range
        elif ratio > 0.8:
            return 0.8 + (1.0 - ratio) * 0.2  # Slightly penalize very high utilization
        else:
            # Penalize low utilization more severely
            return ratio / 0.3 * 0.8
    
    def calculate_distance_score(self, producer_data: Dict, consumer_data: Dict) -> float:
        """Calculate score based on distance (closer = better)"""
        producer_loc = producer_data.get('location', {})
        consumer_loc = consumer_data.get('location', {})
        
        if not producer_loc or not consumer_loc:
            return 0.0
        
        distance = self.haversine_distance(
            producer_loc.get('lat', 0),
            producer_loc.get('lon', 0),
            consumer_loc.get('lat', 0),
            consumer_loc.get('lon', 0)
        )
        
        if distance == float('inf'):
            return 0.0
        
        # Use exponential decay for distance penalty
        # Score = 1 for distance 0, drops exponentially
        score = np.exp(-distance / self.max_reasonable_distance * self.distance_penalty_factor)
        return max(0.0, min(1.0, score))
    
    def calculate_quality_match(self, producer_data: Dict, consumer_data: Dict) -> float:
        """Calculate quality compatibility score"""
        producer_purity = producer_data.get('co2_purity', 90)
        consumer_industry = consumer_data.get('industry', 'Other')
        
        # Define quality requirements by industry
        quality_requirements = {
            'Beverage Carbonation': 98,   # Food grade - very high purity
            'Food Processing': 99,        # Food grade - highest purity
            'Chemical Synthesis': 95,     # Industrial - high purity
            'Biofuel Synthesis': 90,      # Industrial - medium purity
            'Concrete Curing': 85,        # Industrial - lower purity OK
            'Vertical Farming': 88,       # Agricultural - medium purity
            'Manufacturing': 85,          # Industrial - lower purity OK
        }
        
        required_purity = quality_requirements.get(consumer_industry, 85)
        
        if producer_purity < required_purity:
            return 0.0  # Does not meet minimum requirements
        
        # Calculate bonus for exceeding requirements
        excess_purity = producer_purity - required_purity
        max_bonus = 15  # Max 15% above requirement for full bonus
        
        if excess_purity <= 0:
            return 1.0  # Meets requirements exactly
        else:
            bonus = min(1.0, excess_purity / max_bonus) * 0.2  # Up to 20% bonus
            return min(1.2, 1.0 + bonus)
    
    def calculate_transport_compatibility(self, producer_data: Dict, consumer_data: Dict) -> float:
        """Calculate transportation method compatibility"""
        producer_methods = set(producer_data.get('transportation_methods', []))
        
        if not producer_methods:
            return 0.5  # Default score if no transport info
        
        # Distance affects preferred transport methods
        producer_loc = producer_data.get('location', {})
        consumer_loc = consumer_data.get('location', {})
        
        if not producer_loc or not consumer_loc:
            return 0.5
        
        distance = self.haversine_distance(
            producer_loc.get('lat', 0),
            producer_loc.get('lon', 0),
            consumer_loc.get('lat', 0),
            consumer_loc.get('lon', 0)
        )
        
        # Preferred methods by distance
        if distance < 50:
            preferred = {'Truck', 'Pipeline'}
        elif distance < 200:
            preferred = {'Truck', 'Rail', 'Pipeline'}
        elif distance < 500:
            preferred = {'Rail', 'Pipeline', 'Ship'}
        else:
            preferred = {'Rail', 'Ship', 'Pipeline'}
        
        # Calculate overlap
        overlap = len(producer_methods.intersection(preferred))
        max_overlap = len(preferred)
        
        return overlap / max_overlap if max_overlap > 0 else 0.5
    
    def is_viable_match(self, producer_data: Dict, consumer_data: Dict) -> bool:
        """Check if a match is viable (basic compatibility)"""
        # Check capacity compatibility
        producer_supply = producer_data.get('co2_supply_tonnes_per_week', 0)
        consumer_demand = consumer_data.get('co2_demand_tonnes_per_week', 0)
        
        if producer_supply < consumer_demand:
            return False
        
        # Check quality requirements
        if self.calculate_quality_match(producer_data, consumer_data) == 0.0:
            return False
        
        # Check distance (reject if too far)
        producer_loc = producer_data.get('location', {})
        consumer_loc = consumer_data.get('location', {})
        
        if producer_loc and consumer_loc:
            distance = self.haversine_distance(
                producer_loc.get('lat', 0),
                producer_loc.get('lon', 0),
                consumer_loc.get('lat', 0),
                consumer_loc.get('lon', 0)
            )
            
            if distance > 1000:  # 1000km max distance
                return False
        
        return True
    
    def calculate_comprehensive_score(self, producer_data: Dict, consumer_data: Dict) -> Dict:
        """Calculate comprehensive match score with breakdown"""
        # Vector similarity
        vector_sim = self.vector_engine.get_vector_similarity(
            producer_data.get('id'), 
            consumer_data.get('id')
        )
        
        # Traditional factors
        capacity_score = self.calculate_capacity_fit(producer_data, consumer_data)
        distance_score = self.calculate_distance_score(producer_data, consumer_data)
        quality_score = self.calculate_quality_match(producer_data, consumer_data)
        transport_score = self.calculate_transport_compatibility(producer_data, consumer_data)
        
        # Weighted combination
        final_score = (
            vector_sim * self.weights['vector_similarity'] +
            capacity_score * self.weights['capacity_compatibility'] +
            distance_score * self.weights['distance_penalty'] +
            quality_score * self.weights['quality_match'] +
            transport_score * self.weights['transport_compatibility']
        )
        
        return {
            'overall_score': final_score,
            'vector_similarity': vector_sim,
            'capacity_fit': capacity_score,
            'distance_score': distance_score,
            'quality_match': quality_score,
            'transport_compatibility': transport_score
        }
    
    def get_ranked_matches(self, producer_id: str, limit: int = 20) -> List[Dict]:
        """Get top matches for a producer with vector-based ranking"""
        db = self.load_database()
        
        # Find producer
        producer = None
        for p in db.get('producers', []):
            if p.get('id') == producer_id:
                producer = p
                break
        
        if not producer:
            logger.error(f"Producer {producer_id} not found")
            return []
        
        matches = []
        
        # Evaluate all consumers
        for consumer in db.get('consumers', []):
            if self.is_viable_match(producer, consumer):
                try:
                    # Calculate comprehensive score
                    score_breakdown = self.calculate_comprehensive_score(producer, consumer)
                    
                    # Calculate distance for display
                    producer_loc = producer.get('location', {})
                    consumer_loc = consumer.get('location', {})
                    
                    distance_km = 0
                    if producer_loc and consumer_loc:
                        distance_km = self.haversine_distance(
                            producer_loc.get('lat', 0),
                            producer_loc.get('lon', 0),
                            consumer_loc.get('lat', 0),
                            consumer_loc.get('lon', 0)
                        )
                    
                    # Create match object
                    match_data = consumer.copy()
                    match_data.update({
                        'distance_km': round(distance_km, 2),
                        'match_score': round(score_breakdown['overall_score'], 3),
                        'vector_similarity': round(score_breakdown['vector_similarity'], 3),
                        'capacity_fit': round(score_breakdown['capacity_fit'], 3),
                        'distance_score': round(score_breakdown['distance_score'], 3),
                        'quality_match': round(score_breakdown['quality_match'], 3),
                        'transport_compatibility': round(score_breakdown['transport_compatibility'], 3)
                    })
                    
                    matches.append(match_data)
                    
                except Exception as e:
                    logger.error(f"Error calculating match for consumer {consumer.get('id', 'unknown')}: {e}")
                    continue
        
        # Sort by overall match score (descending)
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Add ranks
        for i, match in enumerate(matches[:limit]):
            match['rank'] = i + 1
        
        logger.info(f"Found {len(matches)} viable matches for producer {producer_id}")
        return matches[:limit]
    
    def get_match_explanation(self, producer_data: Dict, consumer_data: Dict) -> str:
        """Generate human-readable explanation of match quality"""
        score_breakdown = self.calculate_comprehensive_score(producer_data, consumer_data)
        
        explanations = []
        
        # Vector similarity
        vector_sim = score_breakdown['vector_similarity']
        if vector_sim > 0.7:
            explanations.append("Strong algorithmic compatibility based on business profiles")
        elif vector_sim > 0.4:
            explanations.append("Good algorithmic compatibility")
        else:
            explanations.append("Moderate algorithmic compatibility")
        
        # Capacity fit
        capacity_fit = score_breakdown['capacity_fit']
        if capacity_fit > 0.8:
            explanations.append("Excellent supply-demand capacity match")
        elif capacity_fit > 0.5:
            explanations.append("Good capacity utilization")
        else:
            explanations.append("Adequate capacity match")
        
        # Distance
        distance_score = score_breakdown['distance_score']
        if distance_score > 0.7:
            explanations.append("Close geographic proximity")
        elif distance_score > 0.4:
            explanations.append("Reasonable transportation distance")
        else:
            explanations.append("Longer distance requiring efficient logistics")
        
        # Quality
        quality_match = score_breakdown['quality_match']
        if quality_match > 0.9:
            explanations.append("CO2 purity exceeds requirements")
        elif quality_match > 0.7:
            explanations.append("CO2 quality meets industry standards")
        else:
            explanations.append("CO2 quality meets minimum requirements")
        
        return "; ".join(explanations)
    
    def update_weights(self, new_weights: Dict):
        """Update matching weights (for fine-tuning)"""
        for key, value in new_weights.items():
            if key in self.weights:
                self.weights[key] = value
        
        # Normalize weights to sum to 1
        total = sum(self.weights.values())
        for key in self.weights:
            self.weights[key] /= total
        
        logger.info(f"Updated matching weights: {self.weights}")
    
    def get_matching_stats(self) -> Dict:
        """Get statistics about matching performance"""
        db = self.load_database()
        
        total_producers = len(db.get('producers', []))
        total_consumers = len(db.get('consumers', []))
        
        if total_producers == 0:
            return {
                'total_producers': 0,
                'total_consumers': total_consumers,
                'avg_matches_per_producer': 0,
                'weights': self.weights
            }
        
        # Average viable matches per producer (cheap: viability gate only,
        # no full scoring / DB reloads). Was O(P*C) with vector lookups; now
        # O(P*C) with simple arithmetic checks.
        consumers = db.get('consumers', [])
        total_matches = 0
        for producer in db.get('producers', []):
            total_matches += sum(
                1 for c in consumers if self.is_viable_match(producer, c)
            )

        avg_matches = total_matches / total_producers if total_producers > 0 else 0
        
        return {
            'total_producers': total_producers,
            'total_consumers': total_consumers,
            'avg_matches_per_producer': round(avg_matches, 2),
            'weights': self.weights,
            'vector_engine_stats': self.vector_engine.get_vector_stats()
        } 