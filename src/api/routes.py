"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, BlockedTokenList
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, get_jwt
from datetime import datetime

app = Flask(__name__)
bcrypt = Bcrypt(app)

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})


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
    
        # Actualizar el último inicio de sesión
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    
    token = create_access_token(
        identity=str(user.id), 
        additional_claims={
            "is_admin": (user.role == "admin"),
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
    claims = get_jwt()
    
    if claims.get('role') != "admin":
        return jsonify({"msg": "Acceso no autorizado: Se requieren privilegios de administrador"}), 403
    
    # Usa el método serialize() que ya definiste en el modelo para consistencia
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200

@api.route('/admin/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def update_user_role(user_id):
    claims = get_jwt()
    
    if claims.get('role') != "admin":
        return jsonify({"msg": "Acceso no autorizado: Se requieren privilegios de administrador"}), 403
    
    body = request.get_json()
    if not body.get('role'):
        return jsonify({"msg": "El campo 'role' es requerido"}), 400
    
    valid_roles = ['admin', 'teacher', 'student', 'user']
    if body['role'] not in valid_roles:
        return jsonify({"msg": f"Rol no válido. Roles permitidos: {', '.join(valid_roles)}"}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    # No permitir que un admin se quite sus propios privilegios
    current_user_id = get_jwt_identity()
    if str(user.id) == current_user_id and body['role'] != 'admin':
        return jsonify({"msg": "No puedes quitarte tus propios privilegios de administrador"}), 400
    
    user.role = body['role']
    db.session.commit()
    
    return jsonify({"msg": "Rol actualizado exitosamente", "user": user.serialize()}), 200

@api.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    claims = get_jwt()
    
    if claims.get('role') != "admin":
        return jsonify({"msg": "Acceso no autorizado: Se requieren privilegios de administrador"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    # No permitir eliminar otros administradores
    if user.role == 'admin':
        return jsonify({"msg": "No puedes eliminar a otro administrador"}), 400
    
    # No permitir auto-eliminación
    current_user_id = get_jwt_identity()
    if str(user.id) == current_user_id:
        return jsonify({"msg": "No puedes eliminarte a ti mismo"}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"msg": "Usuario eliminado exitosamente"}), 200

@api.route('/admin/users/<int:user_id>/block', methods=['POST'])
@jwt_required()
def block_user(user_id):
    try:
        # Verificar autenticación y permisos
        claims = get_jwt()
        if claims.get('role') != "admin":
            return jsonify({"msg": "No autorizado"}), 403

        # Obtener datos
        data = request.get_json()
        if not data or 'reason' not in data:
            return jsonify({"msg": "Razón de bloqueo requerida"}), 400

        # Buscar usuario
        user = User.query.get(user_id)
        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404

        # Aplicar bloqueo
        user.is_blocked = True
        user.block_reason = data['reason']
        user.block_count += 1
        db.session.commit()

        return jsonify({
            "msg": "Usuario bloqueado con éxito",
            "user": user.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al bloquear usuario", "error": str(e)}), 500

@api.route('/admin/users/<int:user_id>/unblock', methods=['POST'])
@jwt_required()
def unblock_user(user_id):
    claims = get_jwt()
    
    if claims.get('role') != "admin":
        return jsonify({"msg": "Acceso no autorizado: Se requieren privilegios de administrador"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    user.is_blocked = False
    user.block_reason = None
    user.blocked_until = None
    
    db.session.commit()
    
    return jsonify({
        "msg": "Usuario desbloqueado exitosamente",
        "user": user.serialize()
    }), 200

@api.route('/admin/blocked-users', methods=['GET'])
@jwt_required()
def get_blocked_users():
    claims = get_jwt()
    
    if claims.get('role') != "admin":
        return jsonify({"msg": "Acceso no autorizado: Se requieren privilegios de administrador"}), 403
    
    blocked_users = User.query.filter(User.is_blocked == True).all()
    return jsonify([user.serialize() for user in blocked_users]), 200