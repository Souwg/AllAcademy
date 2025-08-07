"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, BlockedTokenList
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, get_jwt

app = Flask(__name__)
bcrypt = Bcrypt(app)

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

{
    "email": "random1@gmail.com",
    "password": "StrongPass"
}

@api.route('/signup', methods=['POST'])
def register_user():
    body = request.get_json()
    
    # Validación de campos obligatorios
    required_fields = ['email', 'password', 'confirm_password', 'first_name', 'last_name', 'country', 'id_number']
    for field in required_fields:
        if not body.get(field):
            return jsonify({'msg': f'El campo {field} es requerido'}), 400

    # Validación de contraseña
    if body['password'] != body['confirm_password']:
        return jsonify({'msg': 'Las contraseñas no coinciden'}), 400

    # Validación de términos
    if not body.get('accept_terms'):
        return jsonify({'msg': 'Debes aceptar los términos y condiciones'}), 400

    # Verificar si el usuario ya existe
    if User.query.filter_by(email=body['email']).first():
        return jsonify({"msg": "El email ya está registrado"}), 409
    
    if User.query.filter_by(country=body['country'], id_number=body['id_number']).first():
        return jsonify({"msg": "Esta identificación ya está registrada para el país seleccionado"}), 409

    # Crear usuario
    hashed_password = bcrypt.generate_password_hash(body['password']).decode('utf-8')
    new_user = User(
        email=body['email'],
        password=hashed_password,
        first_name=body['first_name'],
        last_name=body['last_name'],
        country=body['country'],
        id_number=body['id_number'],
        is_admin=False,
        is_active=True
    )
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "msg": "Usuario registrado exitosamente",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name
        }
    }), 201
    
@api.route('/login', methods=['POST'])
def user_login():
    body = request.get_json()
    if body["email"] is None:
        return jsonify({"msg":"Debe especificar un correo electrónico"}), 400
    
    user = User.query.filter_by(email=body["email"]).first()
    if user is None:
        return jsonify({"msg":"Email not found"}), 401
    
    valid_password = bcrypt.check_password_hash(user.password, body["password"])
    if not valid_password:
        return jsonify({"msg": "Incorrect password"}), 401
    
    token = create_access_token(
        identity=str(user.id), 
        additional_claims={
            "is_admin": user.is_admin,
            "role": user.role
        }
    )
    
    return jsonify({
        "msg": "Login exitoso", 
        "token": token, 
        "user": user.serialize(),
        "role": user.role
    })


@api.route('/logout', methods=["POST"])
@jwt_required()
def user_logout():
    token_data = get_jwt()
    token_blocked = BlockedTokenList(jti=token_data["jti"])
    db.session.add(token_blocked)
    db.session.commit()
    return jsonify({"msg":"Sesión cerrada"}), 200


@api.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    # Obtener información del token
    claims = get_jwt()
    current_user_id = get_jwt_identity()
    
    print(f"Usuario haciendo la solicitud: {current_user_id}")  # Debug
    print(f"Claims del token: {claims}")  # Debug
    
    current_user = User.query.get(current_user_id)
    
    if not current_user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    if not current_user.is_admin:
        return jsonify({"msg": "Acceso no autorizado: Se requieren privilegios de administrador"}), 403
    
    # Obtener todos los usuarios (excepto contraseñas)
    users = User.query.with_entities(
        User.id,
        User.email,
        User.first_name,
        User.last_name,
        User.country,
        User.id_number,
        User.is_admin,
        User.role,
        User.created_at
    ).all()
    
    users_serialized = [{
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "country": user.country,
        "id_number": user.id_number,
        "is_admin": user.is_admin,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None
    } for user in users]
    
    return jsonify(users_serialized), 200