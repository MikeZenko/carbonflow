"""Vector-based producer/consumer matching engine."""

from __future__ import annotations

import hashlib
import math
import re
from typing import Any

MATCH_WEIGHTS = {
    "vector_similarity": 0.35,
    "capacity_compatibility": 0.25,
    "distance_penalty": 0.20,
    "quality_match": 0.15,
    "transport_compatibility": 0.05,
}

DISTANCE_DECAY_KM = 249.0
PRODUCER_VECTOR_DIM = 32
CONSUMER_VECTOR_DIM = 28


def _tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", (text or "").lower())


def _hash_features(tokens: list[str], dim: int) -> list[float]:
    vector = [0.0] * dim
    if not tokens:
        return vector
    for token in tokens:
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        for i in range(dim):
            vector[i] += (digest[i % len(digest)] / 255.0) - 0.5
    norm = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [value / norm for value in vector]


def encode_producer(producer: dict[str, Any]) -> list[float]:
    tokens = _tokenize(producer.get("name", ""))
    tokens += _tokenize(producer.get("industry_type", ""))
    tokens += _tokenize(" ".join(producer.get("transportation_methods", [])))
    tokens += _tokenize(producer.get("additional_info", ""))
    tokens.append(f"supply_{producer.get('co2_supply_tonnes_per_week', 0)}")
    tokens.append(f"purity_{producer.get('co2_purity', 0)}")
    return _hash_features(tokens, PRODUCER_VECTOR_DIM)


def encode_consumer(consumer: dict[str, Any]) -> list[float]:
    tokens = _tokenize(consumer.get("name", ""))
    tokens += _tokenize(consumer.get("industry", ""))
    tokens.append(f"demand_{consumer.get('co2_demand_tonnes_per_week', 0)}")
    return _hash_features(tokens, CONSUMER_VECTOR_DIM)


def cosine_similarity(left: list[float], right: list[float]) -> float:
    shared = min(len(left), len(right))
    if shared == 0:
        return 0.0
    dot = sum(left[i] * right[i] for i in range(shared))
    left_norm = math.sqrt(sum(left[i] * left[i] for i in range(shared))) or 1.0
    right_norm = math.sqrt(sum(right[i] * right[i] for i in range(shared))) or 1.0
    return max(0.0, min(1.0, dot / (left_norm * right_norm)))


def _distance_score(distance_km: float) -> float:
    return round(math.exp(-distance_km / DISTANCE_DECAY_KM), 3)


def _capacity_fit(demand: float, supply: float) -> float:
    if supply <= 0:
        return 0.0
    ratio = demand / supply
    if ratio >= 0.4:
        return 1.0
    return round(max(ratio, 0.4), 3)


def _quality_match(producer: dict[str, Any], consumer: dict[str, Any]) -> float:
    purity = producer.get("co2_purity", 90)
    industry = (consumer.get("industry") or "").lower()
    if "beverage" in industry or "food" in industry:
        return 1.0 if purity >= 98 else round(purity / 100, 3)
    if "concrete" in industry or "cement" in industry:
        return 1.0 if purity >= 90 else round(purity / 100, 3)
    return round(min(purity / 95, 1.0), 3)


def _transport_compatibility(producer: dict[str, Any]) -> float:
    methods = producer.get("transportation_methods") or []
    if not methods:
        return 0.333
    return round(min(len(methods) / 3.0, 1.0), 3)


def score_match(
    producer: dict[str, Any],
    consumer: dict[str, Any],
    distance_km: float,
    producer_vector: list[float] | None = None,
    consumer_vector: list[float] | None = None,
) -> dict[str, float]:
    producer_vector = producer_vector or encode_producer(producer)
    consumer_vector = consumer_vector or encode_consumer(consumer)

    demand = float(consumer.get("co2_demand_tonnes_per_week", 0))
    supply = float(producer.get("co2_supply_tonnes_per_week", 0))

    capacity_fit = _capacity_fit(demand, supply)
    scores = {
        "vector_similarity": round(cosine_similarity(producer_vector, consumer_vector), 3),
        "capacity_fit": capacity_fit,
        "distance_score": _distance_score(distance_km),
        "quality_match": _quality_match(producer, consumer),
        "transport_compatibility": _transport_compatibility(producer),
    }
    match_score = (
        MATCH_WEIGHTS["vector_similarity"] * scores["vector_similarity"]
        + MATCH_WEIGHTS["capacity_compatibility"] * capacity_fit
        + MATCH_WEIGHTS["distance_penalty"] * scores["distance_score"]
        + MATCH_WEIGHTS["quality_match"] * scores["quality_match"]
        + MATCH_WEIGHTS["transport_compatibility"] * scores["transport_compatibility"]
    )
    scores["match_score"] = round(match_score, 3)
    return scores


def build_matches(
    producer: dict[str, Any],
    consumers: list[dict[str, Any]],
    distance_fn,
) -> list[dict[str, Any]]:
    producer_vector = encode_producer(producer)
    producer_loc = producer["location"]
    matches: list[dict[str, Any]] = []

    for consumer in consumers:
        consumer_loc = consumer["location"]
        distance_km = round(
            distance_fn(
                producer_loc["lat"],
                producer_loc["lon"],
                consumer_loc["lat"],
                consumer_loc["lon"],
            ),
            2,
        )
        scores = score_match(
            producer,
            consumer,
            distance_km,
            producer_vector=producer_vector,
            consumer_vector=encode_consumer(consumer),
        )
        if scores["capacity_fit"] <= 0:
            continue

        match = consumer.copy()
        match["distance_km"] = distance_km
        match.update(scores)
        matches.append(match)

    matches.sort(key=lambda item: item["match_score"], reverse=True)
    for index, match in enumerate(matches, start=1):
        match["rank"] = index
    return matches


def matching_stats(producers: list[dict], consumers: list[dict], distance_fn) -> dict[str, Any]:
    total_matches = 0
    for producer in producers:
        total_matches += len(build_matches(producer, consumers, distance_fn))

    avg_matches = round(total_matches / len(producers), 1) if producers else 0.0

    return {
        "total_producers": len(producers),
        "total_consumers": len(consumers),
        "avg_matches_per_producer": avg_matches,
        "vector_engine_stats": {
            "producer_vectors": len(producers),
            "consumer_vectors": len(consumers),
            "vector_dimensions": {
                "producer": PRODUCER_VECTOR_DIM,
                "consumer": CONSUMER_VECTOR_DIM,
            },
        },
        "weights": MATCH_WEIGHTS,
    }
