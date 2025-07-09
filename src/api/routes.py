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
        # Se busca el usuario en la base de datos y se verifica que exista
        user = User.query.filter_by(email=body["email"]).first()
        if user is None:
            return jsonify({"msg":"Email not found"}), 401
        # Se comparar la contraseña proporcionada por el usuario con un hash de contraseña almacenado previamente
        valid_password = bcrypt.check_password_hash(user.password, body["password"])
        if not valid_password:
            return jsonify({"msg": "Incorrect password"}), 401
        # Se crea y se retorna el token de la sesión
        token = create_access_token(identity=str(user.id), additional_claims={"is_admin": user.is_admin})
        return jsonify({"msg": "Login exitoso", "token": token, "Id": user.id, "user": user.serialize(), "is_admin": user.is_admin })


@api.route('/logout', methods=["POST"])
@jwt_required()
def user_logout():
    token_data = get_jwt()
    token_blocked = BlockedTokenList(jti=token_data["jti"])
    db.session.add(token_blocked)
    db.session.commit()
    return jsonify({"msg":"Sesión cerrada"}), 200
