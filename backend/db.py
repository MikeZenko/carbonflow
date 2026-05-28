"""Shared JSON-backed data store with POSIX file locking.

This is a stopgap until the project migrates to a real database (see
ROADMAP.md). The lock prevents the common read-modify-write race that
corrupts the file when two requests mutate the same collection at once.
It does not survive process crashes mid-write, and it does not work on
Windows.
"""

import fcntl
import json
import logging
import os
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

logger = logging.getLogger(__name__)

_EMPTY_DB = {"users": [], "producers": [], "consumers": []}


def _db_path() -> Path:
    return Path(os.getenv("DATABASE_FILE", "database.json"))


def _ensure_keys(db: dict) -> dict:
    for key, default in _EMPTY_DB.items():
        db.setdefault(key, list(default) if isinstance(default, list) else default)
    return db


def load_db() -> dict:
    """Read-only snapshot of the database. Use `transaction()` for writes."""
    path = _db_path()
    if not path.exists():
        return {k: list(v) for k, v in _EMPTY_DB.items()}
    try:
        with open(path, "r") as f:
            fcntl.flock(f.fileno(), fcntl.LOCK_SH)
            try:
                content = f.read()
            finally:
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)
        if not content.strip():
            return {k: list(v) for k, v in _EMPTY_DB.items()}
        return _ensure_keys(json.loads(content))
    except json.JSONDecodeError:
        logger.exception("Invalid JSON in database file %s", path)
        return {k: list(v) for k, v in _EMPTY_DB.items()}


@contextmanager
def transaction() -> Iterator[dict]:
    """Acquire an exclusive lock, yield the db dict, atomically write on exit.

    Mutate the yielded dict in-place; the contents are persisted when the
    `with` block exits without an exception.
    """
    path = _db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.touch(exist_ok=True)

    with open(path, "r+") as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        try:
            content = f.read()
            db = _ensure_keys(json.loads(content)) if content.strip() else {
                k: list(v) for k, v in _EMPTY_DB.items()
            }
            yield db
            f.seek(0)
            f.truncate()
            json.dump(db, f, indent=2)
            f.flush()
            os.fsync(f.fileno())
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)
