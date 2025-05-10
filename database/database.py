from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
import os
import sys

# Ensure the parent directory is in sys.path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import config
except ImportError:
    raise ImportError("Could not import 'config.py'. Ensure it exists and contains SQLALCHEMY_DATABASE_URI.")

# Initialize SQLAlchemy
db = SQLAlchemy()

# Create the engine
if not hasattr(config, "SQLALCHEMY_DATABASE_URI"):
    raise ValueError("SQLALCHEMY_DATABASE_URI is missing in config.py")

engine = create_engine(config.SQLALCHEMY_DATABASE_URI)

# Set up the session
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Define the base model
Base = db.Model  # Use Flask-SQLAlchemy's Model

def init_db():
    """Initialize the database and create tables."""
    from database import models  # Import models inside function to avoid circular imports
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully.")
