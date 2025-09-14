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
    """
    Endpoint para registro de nuevos usuarios.
    Valida campos obligatorios, contraseñas coincidentes y términos aceptados.
    Crea un nuevo usuario en la base de datos.
    """
    print("=== REGISTER USER ENDPOINT CALLED ===")
    print(f"Request method: {request.method}")
    print(f"Request content type: {request.content_type}")
    
    body = request.get_json()
    print(f"Request body: {body}")
    
    # Validación de campos obligatorios
    required_fields = ['email', 'password', 'confirm_password', 'first_name', 'last_name', 'country', 'id_number']
    for field in required_fields:
        if not body.get(field):
            print(f"Missing required field: {field}")
            return jsonify({'msg': f'El campo {field} es requerido'}), 400

    # Validación de contraseña
    if body['password'] != body['confirm_password']:
        print("Passwords don't match")
        return jsonify({'msg': 'Las contraseñas no coinciden'}), 400

    # Validación de términos
    if not body.get('accept_terms'):
        print("Terms not accepted")
        return jsonify({'msg': 'Debes aceptar los términos y condiciones'}), 400

    # Verificar si el usuario ya existe
    if User.query.filter_by(email=body['email']).first():
        print("Email already registered")
        return jsonify({"msg": "El email ya está registrado"}), 409
    
    if User.query.filter_by(country=body['country'], id_number=body['id_number']).first():
        print("ID already registered for this country")
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
    
    print(f"User created successfully: {new_user.email}")

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
    """
    Endpoint para autenticación de usuarios.
    Verifica credenciales y genera un token JWT si son válidas.
    """
    print("=== LOGIN ENDPOINT CALLED ===")
    print(f"Request method: {request.method}")
    
    body = request.get_json()
    print(f"Login attempt for email: {body.get('email', 'No email provided')}")
    
    if body["email"] is None:
        print("Email not provided")
        return jsonify({"msg":"Debe especificar un correo electrónico"}), 400
    
    user = User.query.filter_by(email=body["email"]).first()
    if user is None:
        print(f"Email not found: {body['email']}")
        return jsonify({"msg":"Email not found"}), 401
    
    if user.is_blocked:
        print(f"Blocked user attempted login: {body['email']}")
        return jsonify({"msg": "Your account has been blocked. Please contact administrator"}), 403

    valid_password = bcrypt.check_password_hash(user.password, body["password"])
    if not valid_password:
        print(f"Invalid password for user: {body['email']}")
        return jsonify({"msg": "Incorrect password"}), 401
    
    # Actualizar el último inicio de sesión
    user.last_login = datetime.utcnow()
    db.session.commit()
    print(f"Last login updated for user: {body['email']}")
    
    token = create_access_token(
        identity=str(user.id), 
        additional_claims={
            "is_admin": (user.role == "admin"),
            "role": user.role
        }
    )
    
    print(f"Login successful for user: {body['email']}")
    
    return jsonify({
        "msg": "Login exitoso", 
        "token": token, 
        "user": user.serialize(),
        "role": user.role
    })


@api.route('/logout', methods=["POST"])
@jwt_required()
def user_logout():
    """
    Endpoint para cerrar sesión.
    Invalida el token JWT actual agregándolo a la lista de tokens bloqueados.
    """
    print("=== LOGOUT ENDPOINT CALLED ===")
    current_user = get_jwt_identity()
    print(f"User logging out: {current_user}")
    
    token_data = get_jwt()
    token_blocked = BlockedTokenList(jti=token_data["jti"])
    db.session.add(token_blocked)
    db.session.commit()
    
    print(f"Token invalidated for user: {current_user}")
    return jsonify({"msg":"Sesión cerrada"}), 200


@api.route('/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """
    Endpoint para obtener todos los usuarios (solo administradores).
    Devuelve una lista de todos los usuarios en el sistema.
    """
    print("=== GET ALL USERS ENDPOINT CALLED ===")
    claims = get_jwt()
    current_user = get_jwt_identity()
    print(f"Request by user: {current_user}")
    print(f"User role: {claims.get('role')}")
    
    if claims.get('role') != "admin":
        print("Unauthorized access attempt to admin endpoint")
        return jsonify({"msg": "Acceso no autorizado: Se requieren privilegios de administrador"}), 403
    
    # Usa el método serialize() que ya definiste en el modelo para consistencia
    users = User.query.all()
    print(f"Returning {len(users)} users")
    
    return jsonify([user.serialize() for user in users]), 200

@api.route('/admin/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def update_user_role(user_id):
    """
    Endpoint para actualizar el rol de un usuario (solo administradores).
    Permite cambiar el rol de cualquier usuario excepto el propio.
    """
    print("=== UPDATE USER ROLE ENDPOINT CALLED ===")
    claims = get_jwt()
    current_user = get_jwt_identity()
    print(f"Request by user: {current_user} to update role for user: {user_id}")
    
    if claims.get('role') != "admin":
        print("Unauthorized access attempt to admin endpoint")
        return jsonify({"msg": "Acceso no autorizado: Se requieren privilegios de administrador"}), 403
    
    body = request.get_json()
    print(f"New role requested: {body.get('role')}")
    
    if not body.get('role'):
        print("Role not provided in request")
        return jsonify({"msg": "El campo 'role' es requerido"}), 400
    
    valid_roles = ['admin', 'teacher', 'student', 'user']
    if body['role'] not in valid_roles:
        print(f"Invalid role requested: {body['role']}")
        return jsonify({"msg": f"Rol no válido. Roles permitidos: {', '.join(valid_roles)}"}), 400
    
    user = User.query.get(user_id)
    if not user:
        print(f"User not found: {user_id}")
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    # No permitir que un admin se quite sus propios privilegios
    if str(user.id) == current_user and body['role'] != 'admin':
        print("Admin attempted to remove their own admin privileges")
        return jsonify({"msg": "No puedes quitarte tus propios privilegios de administrador"}), 400
    
    print(f"Updating user {user_id} role from {user.role} to {body['role']}")
    user.role = body['role']
    db.session.commit()
    
    print(f"Role updated successfully for user: {user_id}")
    return jsonify({"msg": "Rol actualizado exitosamente", "user": user.serialize()}), 200

@api.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """
    Endpoint para eliminar un usuario (solo administradores).
    No permite eliminar otros administradores o a sí mismo.
    """
    print("=== DELETE USER ENDPOINT CALLED ===")
    claims = get_jwt()
    current_user = get_jwt_identity()
    print(f"Request by user: {current_user} to delete user: {user_id}")
    
    if claims.get('role') != "admin":
        print("Unauthorized access attempt to admin endpoint")
        return jsonify({"msg": "Acceso no autorizado: Se requieren privilegios de administrador"}), 403
    
    user = User.query.get(user_id)
    if not user:
        print(f"User not found: {user_id}")
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    # No permitir eliminar otros administradores
    if user.role == 'admin':
        print("Attempt to delete another admin user")
        return jsonify({"msg": "No puedes eliminar a otro administrador"}), 400
    
    # No permitir auto-eliminación
    if str(user.id) == current_user:
        print("Attempt to delete self")
        return jsonify({"msg": "No puedes eliminarte a ti mismo"}), 400
    
    print(f"Deleting user: {user_id} ({user.email})")
    db.session.delete(user)
    db.session.commit()
    
    print(f"User deleted successfully: {user_id}")
    return jsonify({"msg": "Usuario eliminado exitosamente"}), 200

@api.route('/admin/users/<int:user_id>/block', methods=['POST'])
@jwt_required()
def block_user(user_id):
    """
    Endpoint para bloquear un usuario (solo administradores).
    Permite bloquear usuarios y especificar una razón.
    """
    print("=== BLOCK USER ENDPOINT CALLED ===")
    try:
        # Verificar autenticación y permisos
        claims = get_jwt()
        current_user = get_jwt_identity()
        print(f"Request by user: {current_user} to block user: {user_id}")
        
        if claims.get('role') != "admin":
            print("Unauthorized access attempt to admin endpoint")
            return jsonify({"msg": "No autorizado"}), 403

        # Obtener datos
        data = request.get_json()
        print(f"Block reason: {data.get('reason', 'No reason provided')}")
        
        if not data or 'reason' not in data:
            print("No reason provided for block")
            return jsonify({"msg": "Razón de bloqueo requerida"}), 400

        # Buscar usuario
        user = User.query.get(user_id)
        if not user:
            print(f"User not found: {user_id}")
            return jsonify({"msg": "Usuario no encontrado"}), 404

        # Aplicar bloqueo
        print(f"Blocking user: {user_id} ({user.email})")
        user.is_blocked = True
        user.block_reason = data['reason']
        user.block_count += 1
        db.session.commit()

        print(f"User blocked successfully: {user_id}")
        return jsonify({
            "msg": "Usuario bloqueado con éxito",
            "user": user.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error blocking user: {str(e)}")
        return jsonify({"msg": "Error al bloquear usuario", "error": str(e)}), 500

@api.route('/admin/users/<int:user_id>/unblock', methods=['POST'])
@jwt_required()
def unblock_user(user_id):
    """
    Endpoint para desbloquear un usuario (solo administradores).
    Permite desbloquear usuarios previamente bloqueados.
    """
    print("=== UNBLOCK USER ENDPOINT CALLED ===")
    claims = get_jwt()
    current_user = get_jwt_identity()
    print(f"Request by user: {current_user} to unblock user: {user_id}")
    
    if claims.get('role') != "admin":
        print("Unauthorized access attempt to admin endpoint")
        return jsonify({"msg": "Acceso no autorizado: Se requieren privilegios de administrador"}), 403
    
    user = User.query.get(user_id)
    if not user:
        print(f"User not found: {user_id}")
        return jsonify({"msg": "Usuario no encontrado"}), 404
    
    print(f"Unblocking user: {user_id} ({user.email})")
    user.is_blocked = False
    user.block_reason = None
    user.blocked_until = None
    
    db.session.commit()
    
    print(f"User unblocked successfully: {user_id}")
    return jsonify({
        "msg": "Usuario desbloqueado exitosamente",
        "user": user.serialize()
    }), 200

@api.route('/courses', methods=['POST'])
@jwt_required()
def create_course():
    """
    Endpoint para crear un nuevo curso.
    Solo disponible para administradores y profesores.
    Incluye validaciones y creación de slug único.
    """
    try:
        print("=== CREATE COURSE ENDPOINT CALLED ===")
        
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
    """
    Endpoint para obtener todos los cursos, incluyendo no publicados (solo administradores).
    """
    print("=== GET ALL COURSES (ADMIN) ENDPOINT CALLED ===")
    try:
        # Verificar que es admin
        claims = get_jwt()
        user_id = get_jwt_identity()
        print(f"Request by user: {user_id}")
        
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            print("Unauthorized access attempt to admin endpoint")
            return jsonify({"msg": "No autorizado"}), 403
        
        courses = Course.query.all()  # ← Todos los cursos
        print(f"Returning {len(courses)} courses")
        return jsonify([course.serialize() for course in courses]), 200
    except Exception as e:
        print(f"Error getting courses: {str(e)}")
        return jsonify({"msg": "Error al obtener cursos", "error": str(e)}), 500
    
    # Obtener todos los cursos
@api.route('/courses', methods=['GET'])
def get_courses():
    """
    Endpoint público para obtener todos los cursos publicados.
    No requiere autenticación.
    """
    print("=== GET COURSES (PUBLIC) ENDPOINT CALLED ===")
    try:
        courses = Course.query.filter_by(is_published=True).all()
        print(f"Returning {len(courses)} published courses")
        return jsonify([course.serialize() for course in courses]), 200
    except Exception as e:
        print(f"Error getting published courses: {str(e)}")
        return jsonify({"msg": "Error al obtener cursos", "error": str(e)}), 500

# Obtener un curso específico
@api.route('/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    """
    Endpoint público para obtener un curso específico por ID.
    No requiere autenticación.
    """
    print(f"=== GET COURSE {course_id} ENDPOINT CALLED ===")
    try:
        course = Course.query.get(course_id)
        if not course:
            print(f"Course not found: {course_id}")
            return jsonify({"msg": "Curso no encontrado"}), 404
        
        print(f"Returning course: {course.title}")
        return jsonify(course.serialize()), 200
    except Exception as e:
        print(f"Error getting course {course_id}: {str(e)}")
        return jsonify({"msg": "Error al obtener el curso", "error": str(e)}), 500

# Actualizar un curso
@api.route('/courses/<int:course_id>', methods=['PUT'])
@jwt_required()
def update_course(course_id):
    """
    Endpoint para actualizar un curso existente.
    Solo disponible para el profesor dueño del curso o administradores.
    """
    print(f"=== UPDATE COURSE {course_id} ENDPOINT CALLED ===")
    try:
        claims = get_jwt()
        user_id = get_jwt_identity()
        print(f"Request by user: {user_id} to update course: {course_id}")
        
        course = Course.query.get(course_id)
        if not course:
            print(f"Course not found: {course_id}")
            return jsonify({"msg": "Curso no encontrado"}), 404
        
        # Verificar permisos (solo el profesor dueño o admin puede editar)
        if claims.get('role') != 'admin' and str(course.teacher_id) != user_id:
            print("Unauthorized attempt to update course")
            return jsonify({"msg": "No tienes permisos para editar este curso"}), 403
        
        data = request.get_json()
        print(f"Update data: {data}")
        
        # Actualizar campos permitidos
        updatable_fields = [
            'title', 'description', 'short_description', 
            'alt_text', 'price', 'discount_price', 'level', 'language',
            'certificate_available', 'is_published'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(course, field, data[field])
                print(f"Updated field {field}: {data[field]}")
        
        # Actualizar slug si cambió el título
        if 'title' in data:
            from slugify import slugify
            course.slug = slugify(data['title'])
            print(f"Updated slug: {course.slug}")
        
        course.last_updated = datetime.utcnow()
        db.session.commit()
        
        print(f"Course updated successfully: {course_id}")
        return jsonify({
            "msg": "Curso actualizado exitosamente",
            "course": course.serialize()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating course {course_id}: {str(e)}")
        return jsonify({"msg": "Error al actualizar el curso", "error": str(e)}), 500

# Eliminar un curso
@api.route('/courses/<int:course_id>', methods=['DELETE'])
@jwt_required()
def delete_course(course_id):
    """
    Endpoint para eliminar un curso.
    Solo disponible para el profesor dueño del curso o administradores.
    """
    print(f"=== DELETE COURSE {course_id} ENDPOINT CALLED ===")
    try:
        claims = get_jwt()
        user_id = get_jwt_identity()
        print(f"Request by user: {user_id} to delete course: {course_id}")
        
        course = Course.query.get(course_id)
        if not course:
            print(f"Course not found: {course_id}")
            return jsonify({"msg": "Curso no encontrado"}), 404
        
        # Verificar permisos (solo el profesor dueño o admin puede eliminar)
        if claims.get('role') != 'admin' and str(course.teacher_id) != user_id:
            print("Unauthorized attempt to delete course")
            return jsonify({"msg": "No tienes permisos para eliminar este curso"}), 403
        
        print(f"Deleting course: {course_id} ({course.title})")
        db.session.delete(course)
        db.session.commit()
        
        print(f"Course deleted successfully: {course_id}")
        return jsonify({"msg": "Curso eliminado exitosamente"}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting course {course_id}: {str(e)}")
        return jsonify({"msg": "Error al eliminar el curso", "error": str(e)}), 500