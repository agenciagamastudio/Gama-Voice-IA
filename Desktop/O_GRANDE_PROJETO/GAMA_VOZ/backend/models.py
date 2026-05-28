"""
SQLAlchemy Models for GAMA Voz
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'gama_voz.db')


class LicenseKeyModel:
    """Model for license key management"""

    @staticmethod
    def init_db():
        """Initialize license_keys table"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS license_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT UNIQUE NOT NULL,
                license_key TEXT NOT NULL,
                status TEXT DEFAULT 'invalid',
                tier TEXT DEFAULT 'free',
                expiry_date TEXT,
                last_validated_at TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        conn.commit()
        conn.close()

    @staticmethod
    def create_or_update(user_email: str, license_key: str, status: str, tier: str, expiry_date: str = None) -> bool:
        """Create or update license key record"""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()

            cursor.execute('''
                INSERT INTO license_keys (user_email, license_key, status, tier, expiry_date, last_validated_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_email) DO UPDATE SET
                    license_key = excluded.license_key,
                    status = excluded.status,
                    tier = excluded.tier,
                    expiry_date = excluded.expiry_date,
                    last_validated_at = excluded.last_validated_at,
                    updated_at = excluded.updated_at
            ''', (user_email, license_key, status, tier, expiry_date, datetime.utcnow().isoformat(), datetime.utcnow().isoformat()))

            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error updating license: {e}")
            return False

    @staticmethod
    def get_by_user(user_email: str) -> dict:
        """Get license key for user"""
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            cursor.execute('SELECT * FROM license_keys WHERE user_email = ?', (user_email,))
            row = cursor.fetchone()
            conn.close()

            if not row:
                return None

            return {
                'id': row['id'],
                'user_email': row['user_email'],
                'license_key': row['license_key'],
                'status': row['status'],
                'tier': row['tier'],
                'expiry_date': row['expiry_date'],
                'last_validated_at': row['last_validated_at'],
                'created_at': row['created_at'],
                'updated_at': row['updated_at']
            }
        except Exception as e:
            print(f"Error fetching license: {e}")
            return None

    @staticmethod
    def is_cached_valid(user_email: str) -> bool:
        """Check if cached license is still valid (within 30-day grace period)"""
        try:
            license_record = LicenseKeyModel.get_by_user(user_email)

            if not license_record:
                return False

            # If status is not 'active', it's invalid
            if license_record['status'] != 'active':
                return False

            # Check if within 30-day grace period from last validation
            last_validated = datetime.fromisoformat(license_record['last_validated_at'])
            now = datetime.utcnow()
            grace_period = (now - last_validated).days <= 30

            return grace_period
        except Exception:
            return False

    @staticmethod
    def is_offline_valid(user_email: str, max_offline_days: int = 30) -> bool:
        """Check if offline grace period is still valid"""
        try:
            license_record = LicenseKeyModel.get_by_user(user_email)

            if not license_record:
                return False

            # Check if last_validated_at is within max_offline_days
            last_validated = datetime.fromisoformat(license_record['last_validated_at'])
            now = datetime.utcnow()
            days_offline = (now - last_validated).days

            return days_offline <= max_offline_days
        except Exception:
            return False
