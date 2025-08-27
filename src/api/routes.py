"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from psycopg2 import IntegrityError
from api.models import db, User, BlockedTokenList, Course, Module, Lesson, LearningObjective, Requirement
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, get_jwt
from datetime import datetime
from slugify import slugify

app = Flask(__name__)
bcrypt = Bcrypt(app)

api = Blueprint('api', __name__)

# Allow CORS requests to this API
#CORS(api, resources={
#    r"/api/*": {
#        "origins": ["http://localhost:3000"],
#        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#        "allow_headers": ["Content-Type", "Authorization"]
#    }
#})

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
    
    if user.is_blocked:
        return jsonify({"msg": "Your account has been blocked. Please contact administrator"}), 403

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

@api.route('/courses', methods=['POST'])
@jwt_required()
def create_course():
    try:
        print("=== INICIANDO CREACIÓN DE CURSO ===")
        
        # Verificar que el usuario es un profesor o admin
        claims = get_jwt()
        user_id = get_jwt_identity()
        print(f"User ID from JWT: {user_id}")
        print(f"JWT Claims: {claims}")
        
        user = User.query.get(user_id)
        if not user:
            print("ERROR: Usuario no encontrado")
            return jsonify({"msg": "Usuario no encontrado"}), 404
            
        if user.role not in ['admin', 'teacher']:
            print(f"ERROR: Usuario no tiene permisos. Rol: {user.role}")
            return jsonify({"msg": "Solo administradores y profesores pueden crear cursos"}), 403
        
        # Obtener datos del curso
        data = request.get_json()
        print(f"Datos recibidos: {data}")
        
        if not data:
            print("ERROR: No se recibieron datos JSON")
            return jsonify({"msg": "Datos JSON requeridos"}), 400
        
        # Validaciones básicas
        required_fields = ['title', 'description', 'price']
        for field in required_fields:
            if not data.get(field):
                print(f"ERROR: Campo requerido faltante: {field}")
                return jsonify({"msg": f"El campo {field} es requerido"}), 400
        
        print("✅ Campos requeridos validados")
        
        # Crear slug a partir del título
        from slugify import slugify
        slug = slugify(data['title'])
        print(f"Slug generado: {slug}")
        
        # Verificar si el slug ya existe
        existing_course = Course.query.filter_by(slug=slug).first()
        if existing_course:
            print(f"Slug ya existe, agregando timestamp: {slug}")
            # Agregar timestamp al slug si ya existe
            import time
            slug = f"{slug}-{int(time.time())}"
            print(f"Nuevo slug: {slug}")
        
        # Crear el curso
        print("Creando objeto Course...")
        new_course = Course(
            title=data['title'],
            slug=slug,
            description=data['description'],
            short_description=data.get('short_description', ''),
            alt_text=data.get('alt_text', ''),
            price=float(data['price']),
            discount_price=float(data.get('discount_price', 0)) if data.get('discount_price') else None,
            level=data.get('level', 'BEGINNER'),
            language=data.get('language', 'Spanish'),
            certificate_available=data.get('certificate_available', True),
            teacher_id=user_id if user.role == 'teacher' else data.get('teacher_id', user_id),
            is_published=data.get('is_published', False)
        )
        
        print(f"Objeto Course creado: {new_course}")
        print(f"Level value: {new_course.level}")
        print(f"Level type: {type(new_course.level)}")
        
        db.session.add(new_course)
        print("Objeto añadido a la sesión")
        
        db.session.commit()
        print("✅ Commit exitoso del curso principal")
        
        # Agregar objetivos de aprendizaje si se proporcionan
        if 'what_you_learn' in data and isinstance(data['what_you_learn'], list):
            print(f"Procesando objetivos de aprendizaje: {data['what_you_learn']}")
            for i, objective in enumerate(data['what_you_learn']):
                if objective and objective.strip():
                    learning_obj = LearningObjective(
                        objective=objective.strip(),
                        course_id=new_course.id
                    )
                    db.session.add(learning_obj)
                    print(f"Añadido objetivo {i}: {objective.strip()}")
        
        # Agregar requisitos si se proporcionan
        if 'requirements' in data and isinstance(data['requirements'], list):
            print(f"Procesando requisitos: {data['requirements']}")
            for i, requirement in enumerate(data['requirements']):
                if requirement and requirement.strip():
                    req = Requirement(
                        requirement=requirement.strip(),
                        course_id=new_course.id
                    )
                    db.session.add(req)
                    print(f"Añadido requisito {i}: {requirement.strip()}")
        
        db.session.commit()
        print("✅ Commit final exitoso")
        
        return jsonify({
            "msg": "Curso creado exitosamente",
            "course": new_course.serialize()
        }), 201
        
    except ValueError as e:
        db.session.rollback()
        print(f"❌ ValueError: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"msg": "Error en formato de datos", "error": str(e)}), 400
        
    except IntegrityError as e:
        db.session.rollback()
        print(f"❌ IntegrityError: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"msg": "Error de integridad de datos", "error": str(e)}), 400
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Exception general: {str(e)}")
        import traceback
        print(f"Traceback completo: {traceback.format_exc()}")
        return jsonify({"msg": "Error al crear el curso", "error": str(e)}), 500

# Obtener todos los cursos (incluyendo no publicados) - Solo para admin    
@api.route('/admin/courses', methods=['GET'])
@jwt_required()
def get_all_courses():
    try:
        # Verificar que es admin
        claims = get_jwt()
        user_id = get_jwt_identity()
        
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({"msg": "No autorizado"}), 403
        
        courses = Course.query.all()  # ← Todos los cursos
        return jsonify([course.serialize() for course in courses]), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener cursos", "error": str(e)}), 500
    
    # Obtener todos los cursos
@api.route('/courses', methods=['GET'])
def get_courses():
    try:
        courses = Course.query.filter_by(is_published=True).all()
        return jsonify([course.serialize() for course in courses]), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener cursos", "error": str(e)}), 500

# Obtener un curso específico
@api.route('/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    try:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"msg": "Curso no encontrado"}), 404
        
        return jsonify(course.serialize()), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener el curso", "error": str(e)}), 500

# Actualizar un curso
@api.route('/courses/<int:course_id>', methods=['PUT'])
@jwt_required()
def update_course(course_id):
    try:
        claims = get_jwt()
        user_id = get_jwt_identity()
        
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"msg": "Curso no encontrado"}), 404
        
        # Verificar permisos (solo el profesor dueño o admin puede editar)
        if claims.get('role') != 'admin' and str(course.teacher_id) != user_id:
            return jsonify({"msg": "No tienes permisos para editar este curso"}), 403
        
        data = request.get_json()
        
        # Actualizar campos permitidos
        updatable_fields = [
            'title', 'description', 'short_description', 'image_url', 
            'alt_text', 'price', 'discount_price', 'level', 'language',
            'certificate_available', 'is_published'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(course, field, data[field])
        
        # Actualizar slug si cambió el título
        if 'title' in data:
            from slugify import slugify
            course.slug = slugify(data['title'])
        
        course.last_updated = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "msg": "Curso actualizado exitosamente",
            "course": course.serialize()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar el curso", "error": str(e)}), 500

# Eliminar un curso
@api.route('/courses/<int:course_id>', methods=['DELETE'])
@jwt_required()
def delete_course(course_id):
    try:
        claims = get_jwt()
        user_id = get_jwt_identity()
        
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"msg": "Curso no encontrado"}), 404
        
        # Verificar permisos (solo el profesor dueño o admin puede eliminar)
        if claims.get('role') != 'admin' and str(course.teacher_id) != user_id:
            return jsonify({"msg": "No tienes permisos para eliminar este curso"}), 403
        
        db.session.delete(course)
        db.session.commit()
        
        return jsonify({"msg": "Curso eliminado exitosamente"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar el curso", "error": str(e)}), 500