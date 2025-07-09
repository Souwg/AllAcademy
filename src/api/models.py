from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)  # Longitud para hash bcrypt
    first_name = db.Column(db.String(50), nullable=False)  # Nombre del formulario
    last_name = db.Column(db.String(50), nullable=False)   # Apellido del formulario
    country = db.Column(db.String(2), nullable=False)
    id_number = db.Column(db.String(20), nullable=False)
    is_active = db.Column(db.Boolean(), default=True, nullable=False)
    is_admin = db.Column(db.Boolean(), default=False)
    role= db.Column(db.String(20), default='student', nullable=False) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "country": self.country,
            "id_number": self.id_number,
            "is_admin": self.is_admin,
            "role": self.role,
            "created_at": self.created_at.isoformat(),
        }

class BlockedTokenList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(50), unique=True, nullable=False)