"""
MongoDB connection and database management
"""
from pymongo import MongoClient
from pymongo.database import Database
from config import settings
from typing import Optional


class MongoDB:
    """MongoDB connection manager"""
    client: Optional[MongoClient] = None
    db: Optional[Database] = None

    @classmethod
    def connect(cls):
        """Connect to MongoDB"""
        try:
            cls.client = MongoClient(settings.MONGODB_URL)
            cls.db = cls.client[settings.MONGODB_DB_NAME]
            # Test connection
            cls.client.server_info()
            print(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            raise

    @classmethod
    def close(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            print("👋 MongoDB connection closed")

    @classmethod
    def get_database(cls) -> Database:
        """Get database instance"""
        if cls.db is None:
            cls.connect()
        return cls.db

    @classmethod
    def get_collection(cls, collection_name: str):
        """Get collection by name"""
        db = cls.get_database()
        return db[collection_name]


def get_mongodb() -> Database:
    """Dependency for getting MongoDB database"""
    return MongoDB.get_database()


# Initialize collections
def init_mongodb():
    """Initialize MongoDB collections and indexes"""
    try:
        db = MongoDB.get_database()
        
        # Create documents collection
        documents_collection = db["documents"]
        
        # Create indexes
        documents_collection.create_index("user_id")
        documents_collection.create_index("uploaded_at")
        documents_collection.create_index([("user_id", 1), ("uploaded_at", -1)])
        
        print("✅ MongoDB collections initialized")
    except Exception as e:
        print(f"❌ Failed to initialize MongoDB: {e}")
        raise

