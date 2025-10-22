"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from sqlalchemy import extract, func
from psycopg2 import IntegrityError
from api.models import CourseLevel, db, User, BlockedTokenList, Course, Module, Lesson, LearningObjective, Requirement, Enrollment, CourseChatMessage, PrivateChatMessage, CourseSchedule
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, get_jwt
from datetime import datetime
from slugify import slugify
import calendar
import stripe

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

@api.route('/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    claims = get_jwt()
    if claims.get('role') != "admin":
        return jsonify({"msg": "Acceso no autorizado"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    body = request.get_json()

    # Campos editables
    user.first_name = body.get("first_name", user.first_name)
    user.last_name = body.get("last_name", user.last_name)
    user.email = body.get("email", user.email)
    user.role = body.get("role", user.role)
    user.country = body.get("country", user.country)
    user.id_number = body.get("id_number", user.id_number)
    user.bio = body.get("bio", user.bio)
    user.is_active = body.get("is_active", user.is_active)
    user.is_admin = body.get("is_admin", user.is_admin)

    db.session.commit()

    return jsonify({"msg": "Usuario actualizado correctamente", "user": user.serialize()}), 200

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

""""""""""""
"""""""Courses and Content Management"""""""""""""
""""""""""""
@api.route('/courses', methods=['POST'])
@jwt_required()
def create_course():
    """
    Endpoint para crear un nuevo curso con módulos y lecciones.
    Solo disponible para administradores y profesores.
    """
    try:
        print("=== CREATE COURSE ENDPOINT CALLED ===")

        # Verificar autenticación
        claims = get_jwt()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or user.role not in ['admin', 'teacher']:
            return jsonify({"msg": "Only administrators and teachers can create courses"}), 403

        # Obtener datos del curso
        data = request.get_json()
        print(f"📩 Datos recibidos: {data}")

        if not data:
            return jsonify({"msg": "Required JSON data"}), 400

        # Validaciones básicas
        required_fields = ['title', 'description', 'price']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"msg": f"The {field} is required"}), 400

        # Crear slug a partir del título
        slug = slugify(data['title'])

        # Verificar si el slug ya existe
        existing_course = Course.query.filter_by(slug=slug).first()
        if existing_course:
            import time
            slug = f"{slug}-{int(time.time())}"

        # ✅ Asignar correctamente el teacher_id
        if user.role == "teacher":
            teacher_id = user.id
        elif user.role == "admin":
            teacher_id = data.get("teacher_id")
            print(f"📩 Teacher ID recibido desde frontend: {teacher_id}")
            if not teacher_id:
                return jsonify({"msg": "Teacher ID is required when admin creates a course"}), 400
        else:
            teacher_id = None

        # Crear el curso
        new_course = Course(
            title=data['title'],
            slug=slug,
            description=data['description'],
            short_description=data.get('short_description', ''),
            duration=data.get('duration', ''),
            price=float(data['price']),
            discount_price=float(data.get('discount_price', 0)) if data.get('discount_price') else None,
            level=data.get('level', 'BEGINNER'),
            language=data.get('language', 'Spanish'),
            teacher_id=teacher_id,  # ✅ Asignado correctamente
            is_published=data.get('is_published', False),
            published_at=datetime.utcnow() if data.get('is_published') else None,
            has_live_classes=True,
            has_recorded_videos=True,
        )

        db.session.add(new_course)
        db.session.flush() 

        if "schedules" in data and isinstance(data["schedules"], list):
            for sched in data["schedules"]:
                try:
                    days = sched.get("days", [])
                    start_time = datetime.strptime(sched["start_time"], '%H:%M').time()
                    end_time = datetime.strptime(sched["end_time"], '%H:%M').time()
                    timezone = sched.get("timezone", "GMT-5")
                    group_name = sched.get("group_name", None)

                    # ✅ Guarda todos los días juntos en un solo registro
                    new_schedule = CourseSchedule(
                        course_id=new_course.id,
                        day_of_week=",".join(days),  # 👈 cambio clave aquí
                        start_time=start_time,
                        end_time=end_time,
                        timezone=timezone,
                        group_name=group_name
                    )
                    db.session.add(new_schedule)

                except Exception as e:
                    print(f"⚠️ Error al procesar horario: {e}")

        # Agregar objetivos de aprendizaje
        if 'what_you_learn' in data and isinstance(data['what_you_learn'], list):
            for objective in data['what_you_learn']:
                if objective and objective.strip():
                    learning_obj = LearningObjective(
                        objective=objective.strip(),
                        course_id=new_course.id
                    )
                    db.session.add(learning_obj)

        # Agregar requisitos
        if 'requirements' in data and isinstance(data['requirements'], list):
            for requirement in data['requirements']:
                if requirement and requirement.strip():
                    req = Requirement(
                        requirement=requirement.strip(),
                        course_id=new_course.id
                    )
                    db.session.add(req)

        # Agregar módulos y lecciones
        if 'modules' in data and isinstance(data['modules'], list):
            for module_index, module_data in enumerate(data['modules']):
                if not module_data.get('title'):
                    continue

                new_module = Module(
                    title=module_data['title'],
                    description=module_data.get('description', ''),
                    order=module_data.get('order', module_index + 1),
                    course_id=new_course.id
                )
                db.session.add(new_module)
                db.session.flush()  # Para obtener el ID del módulo

                if 'lessons' in module_data and isinstance(module_data['lessons'], list):
                    for lesson_index, lesson_data in enumerate(module_data['lessons']):
                        if not lesson_data.get('title'):
                            continue

                        new_lesson = Lesson(
                            title=lesson_data['title'],
                            description=lesson_data.get('description', ''),
                            content=lesson_data.get('content', ''),
                            video_url=lesson_data.get('video_url', ''),
                            order=lesson_data.get('order', lesson_index + 1),
                            module_id=new_module.id
                        )
                        db.session.add(new_lesson)

        db.session.commit()

        return jsonify({
            "msg": "Course created successfully",
            "course": new_course.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error al crear el curso: {str(e)}")
        return jsonify({"msg": "Error creating course", "error": str(e)}), 500

    

@api.route('/courses/<int:course_id>/modules', methods=['POST'])
@jwt_required()
def add_module(course_id):
    """
    Endpoint para agregar un módulo a un curso existente.
    """
    try:
        claims = get_jwt()
        user_id = get_jwt_identity()
        
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"msg": "Curso no encontrado"}), 404
        
        # Verificar permisos
        if claims.get('role') != 'admin' and str(course.teacher_id) != user_id:
            return jsonify({"msg": "No tienes permisos para modificar este curso"}), 403
        
        data = request.get_json()
        if not data.get('title'):
            return jsonify({"msg": "El título del módulo es requerido"}), 400
        
        # Determinar el orden
        last_module = Module.query.filter_by(course_id=course_id).order_by(Module.order.desc()).first()
        new_order = last_module.order + 1 if last_module else 1
        
        new_module = Module(
            title=data['title'],
            description=data.get('description', ''),
            order=data.get('order', new_order),
            course_id=course_id
        )
        
        db.session.add(new_module)
        db.session.commit()
        
        return jsonify({
            "msg": "Módulo agregado exitosamente",
            "module": new_module.serialize()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al agregar módulo", "error": str(e)}), 500

@api.route('/modules/<int:module_id>/lessons', methods=['POST'])
@jwt_required()
def add_lesson(module_id):
    """
    Endpoint para agregar una lección a un módulo existente.
    """
    try:
        module = Module.query.get(module_id)
        if not module:
            return jsonify({"msg": "Módulo no encontrado"}), 404
        
        claims = get_jwt()
        user_id = get_jwt_identity()
        
        # Verificar permisos
        if claims.get('role') != 'admin' and str(module.course.teacher_id) != user_id:
            return jsonify({"msg": "No tienes permisos para modificar este curso"}), 403
        
        data = request.get_json()
        if not data.get('title'):
            return jsonify({"msg": "El título de la lección es requerido"}), 400
        
        # Determinar el orden
        last_lesson = Lesson.query.filter_by(module_id=module_id).order_by(Lesson.order.desc()).first()
        new_order = last_lesson.order + 1 if last_lesson else 1
        
        new_lesson = Lesson(
            title=data['title'],
            description=data.get('description', ''),
            content=data.get('content', ''),
            video_url=data.get('video_url', ''),
            order=data.get('order', new_order), 
            module_id=module_id
        )
        
        db.session.add(new_lesson)
        db.session.commit()
        
        return jsonify({
            "msg": "Lección agregada exitosamente",
            "lesson": new_lesson.serialize()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al agregar lección", "error": str(e)}), 500
    
@api.route('/admin/teachers', methods=['GET'])
@jwt_required()
def get_teachers():
    """
    Endpoint para obtener todos los profesores (solo administradores).
    """
    print("=== GET TEACHERS ENDPOINT CALLED ===")
    
    # Verificar que es admin
    claims = get_jwt()
    if claims.get('role') != 'admin':
        print("Unauthorized access attempt to teachers endpoint")
        return jsonify({"msg": "No autorizado"}), 403
    
    # Obtener todos los usuarios con rol de profesor
    teachers = User.query.filter_by(role='teacher').all()
    
    # Serializar solo los datos necesarios
    teachers_data = [{
        'id': teacher.id,
        'first_name': teacher.first_name,
        'last_name': teacher.last_name,
        'email': teacher.email,
        'bio': teacher.bio
    } for teacher in teachers]
    
    print(f"Returning {len(teachers_data)} teachers")
    return jsonify(teachers_data), 200

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
        
        # DEBUG: Imprimir antes de cargar cursos
        print("DEBUG: Before querying courses")
        
        # Cargar cursos con relaciones básicas
        courses = Course.query.options(
            db.joinedload(Course.modules).joinedload(Module.lessons),
            db.joinedload(Course.what_you_learn),
            db.joinedload(Course.requirements)
        ).all()
        
        print(f"DEBUG: Found {len(courses)} courses")
        
        # DEBUG: Verificar cada curso y sus relaciones
        serialized_courses = []
        for i, course in enumerate(courses):
            print(f"DEBUG: Course {i+1}: {course.title} (ID: {course.id})")
            print(f"DEBUG: - Modules count: {len(course.modules)}")
            print(f"DEBUG: - What you learn count: {len(course.what_you_learn)}")
            print(f"DEBUG: - Requirements count: {len(course.requirements)}")
            
            # Verificar módulos individualmente
            for j, module in enumerate(course.modules):
                print(f"DEBUG:   Module {j+1}: {module.title} (Order: {module.order})")
                print(f"DEBUG:   - Lessons count: {len(module.lessons)}")
                
                for k, lesson in enumerate(module.lessons):
                    print(f"DEBUG:     Lesson {k+1}: {lesson.title} (Order: {lesson.order})")
            
            # Serializar el curso
            course_data = course.serialize()
            serialized_courses.append(course_data)
            
            # DEBUG: Verificar datos serializados
            print(f"DEBUG: Serialized course modules: {len(course_data.get('modules', []))}")
        
        print(f"DEBUG: Returning {len(serialized_courses)} serialized courses")
        return jsonify(serialized_courses), 200
        
    except Exception as e:
        print(f"ERROR getting courses: {str(e)}")
        import traceback
        traceback.print_exc()
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
    
@api.route('/admin/courses/<int:course_id>', methods=['PUT'])
@jwt_required()
def update_course(course_id):
    """
    📝 Actualiza toda la información del curso: 
    - Datos básicos
    - Objetivos
    - Requisitos
    - Módulos y lecciones
    - Horarios (schedules)
    """
    try:
        claims = get_jwt()
        user_id = get_jwt_identity()

        # Solo admin o el profesor dueño puede editar
        user = User.query.get(user_id)
        if not user or (user.role not in ["admin", "teacher"]):
            return jsonify({"msg": "Unauthorized"}), 403

        course = Course.query.get(course_id)
        if not course:
            return jsonify({"msg": "Course not found"}), 404

        data = request.get_json()
        print("📥 Datos recibidos en update_course:", data)
        if not data:
            return jsonify({"msg": "Required JSON data"}), 400

        # =======================
        # 📌 Información básica
        # =======================
        course.title = data.get("title", course.title)
        course.description = data.get("description", course.description)
        course.short_description = data.get("short_description", course.short_description)
        course.duration = data.get("duration", course.duration)
        course.price = float(data.get("price", course.price))
        course.discount_price = float(data["discount_price"]) if data.get("discount_price") else course.discount_price
        course.level = CourseLevel[data["level"]] if data.get("level") else course.level
        course.language = data.get("language", course.language)
        course.access_duration = data.get("access_duration", course.access_duration)

        if "teacher_id" in data and data["teacher_id"]:
            course.teacher_id = data["teacher_id"]

        if "is_published" in data:
            new_status = data["is_published"]
            if new_status and not course.is_published:
                course.published_at = datetime.utcnow()
            if not new_status and course.is_published:
                course.published_at = None
            course.is_published = new_status

        # =======================
        # 🧠 Objetivos de aprendizaje
        # =======================
        if "what_you_learn" in data and isinstance(data["what_you_learn"], list):
            LearningObjective.query.filter_by(course_id=course.id).delete()
            for obj in data["what_you_learn"]:
                if obj.strip():
                    db.session.add(LearningObjective(objective=obj.strip(), course_id=course.id))

        # =======================
        # 📋 Requisitos
        # =======================
        if "requirements" in data and isinstance(data["requirements"], list):
            Requirement.query.filter_by(course_id=course.id).delete()
            for req in data["requirements"]:
                if req.strip():
                    db.session.add(Requirement(requirement=req.strip(), course_id=course.id))

        # =======================
        # 📚 Módulos y lecciones
        # =======================
        if "modules" in data and isinstance(data["modules"], list):
            for module in course.modules:
                db.session.delete(module)
            db.session.flush()

            for module_index, module_data in enumerate(data["modules"]):
                new_module = Module(
                    title=module_data.get("title", f"Módulo {module_index+1}"),
                    description=module_data.get("description", ""),
                    order=module_data.get("order", module_index+1),
                    course_id=course.id
                )
                db.session.add(new_module)
                db.session.flush()

                for lesson_index, lesson_data in enumerate(module_data.get("lessons", [])):
                    new_lesson = Lesson(
                        title=lesson_data.get("title", f"Lección {lesson_index+1}"),
                        description=lesson_data.get("description", ""),
                        content=lesson_data.get("content", ""),
                        video_url=lesson_data.get("video_url", ""),
                        order=lesson_data.get("order", lesson_index+1),
                        module_id=new_module.id
                    )
                    db.session.add(new_lesson)

        # =======================
        # ⏰ Horarios (schedules)
        # =======================
        if "schedules" in data and isinstance(data["schedules"], list):
            # ✅ Obtenemos los horarios existentes para este curso
            existing_schedules = {s.id: s for s in course.schedules}

            # ✅ Guardamos IDs recibidos para detectar cuáles borrar (si es necesario)
            received_ids = set()

            for sched_data in data["schedules"]:
                sched_id = sched_data.get("id")
                day_of_week = sched_data.get("day_of_week")
                start = sched_data.get("start_time")
                end = sched_data.get("end_time")
                timezone = sched_data.get("timezone", "GMT-5")
                group_name = sched_data.get("group_name", "")

                if not day_of_week or not start or not end:
                    print(f"⏭ Saltando horario incompleto: {sched_data}")
                    continue

                start_time = datetime.strptime(start, "%H:%M").time()
                end_time = datetime.strptime(end, "%H:%M").time()

                if sched_id and sched_id in existing_schedules:
                    # 🛠️ Actualizar horario existente
                    sched_obj = existing_schedules[sched_id]
                    sched_obj.day_of_week = day_of_week
                    sched_obj.start_time = start_time
                    sched_obj.end_time = end_time
                    sched_obj.timezone = timezone
                    sched_obj.group_name = group_name
                    received_ids.add(sched_id)
                else:
                    # ➕ Crear nuevo horario
                    new_schedule = CourseSchedule(
                        course_id=course.id,
                        day_of_week=day_of_week,
                        start_time=start_time,
                        end_time=end_time,
                        timezone=timezone,
                        group_name=group_name
                    )
                    db.session.add(new_schedule)

            # 🧹 Si quisieras borrar horarios sin estudiantes (opcional)
            for sched_id, sched_obj in existing_schedules.items():
                if sched_id not in received_ids:
                    # Verificamos si hay estudiantes inscritos
                    if not sched_obj.students or len(sched_obj.students) == 0:
                        db.session.delete(sched_obj)
                    else:
                        print(f"⚠️ No se eliminó horario {sched_id} porque tiene estudiantes inscritos.")

        else:
            print("⚠️ No se recibieron horarios — se mantienen los existentes.")

        # =======================
        # 💾 Guardar cambios
        # =======================
        db.session.commit()
        return jsonify({"msg": "Course updated successfully", "course": course.serialize()}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating course {course_id}: {str(e)}")
        return jsonify({"msg": "Error updating course", "error": str(e)}), 500

    

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

@api.route('/stats/users-per-month', methods=['GET'])
def users_per_month():
    try:
        results = (
            db.session.query(
                extract('year', User.created_at).label('year'),
                extract('month', User.created_at).label('month'),
                func.count(User.id).label('count')
            )
            .group_by('year', 'month')
            .order_by('year', 'month')
            .all()
        )

        stats = [
            {
                "year": int(r.year),
                "month": int(r.month),
                "month_name": calendar.month_name[int(r.month)],  # 👈 aquí
                "count": r.count
            }
            for r in results
        ]

        return jsonify({"stats": stats}), 200

    except Exception as e:
        print("Error en users_per_month:", str(e))
        return jsonify({"msg": "Error obteniendo estadísticas", "error": str(e)}), 500

@api.route('/courses/slug/<string:slug>', methods=['GET'])
def get_course_by_slug(slug):
    """
    Endpoint público para obtener un curso específico por slug.
    No requiere autenticación.
    """
    print(f"=== GET COURSE BY SLUG {slug} ENDPOINT CALLED ===")
    try:
        course = Course.query.filter_by(slug=slug, is_published=True).first()
        if not course:
            print(f"Course not found with slug: {slug}")
            return jsonify({"msg": "Curso no encontrado"}), 404

        print(f"Returning course: {course.title}")
        return jsonify(course.serialize()), 200
    except Exception as e:
        print(f"Error getting course by slug {slug}: {str(e)}")
        return jsonify({"msg": "Error al obtener el curso", "error": str(e)}), 500
    
@api.route('/enroll/<int:course_id>', methods=['POST'])
@jwt_required()
def enroll_course(course_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    course = Course.query.get(course_id)
    data = request.get_json()
    schedule_id = data.get("schedule_id")

    if not course:
        return jsonify({"msg": "Course not found"}), 404

    if not course.is_published:
        return jsonify({"msg": "Course is not published"}), 400

    # Evitar inscripción duplicada
    existing = Enrollment.query.filter_by(student_id=user.id, course_id=course.id).first()
    if existing:
        return jsonify({"msg": "Already enrolled"}), 400

    # 🆕 Validar que el horario exista para este curso
    if schedule_id:
        schedule = CourseSchedule.query.filter_by(id=schedule_id, course_id=course_id).first()
        if not schedule:
            return jsonify({"msg": "Invalid schedule"}), 400
    else:
        schedule = None

    enrollment = Enrollment(
        student_id=user.id,
        course_id=course.id,
        schedule_id=schedule_id if schedule else None
    )

    db.session.add(enrollment)
    db.session.commit()

    return jsonify({
        "msg": "Enrolled successfully",
        "enrollment": enrollment.serialize()
    }), 201

@api.route('/my-enrollments', methods=['GET'])
@jwt_required()
def get_my_enrollments():
    """
    Devuelve los cursos en los que el usuario actual está inscrito,
    incluyendo la información completa del curso y su progreso.
    """
    try:
        user_id = get_jwt_identity()
        enrollments = Enrollment.query.filter_by(student_id=user_id).all()

        result = []
        for e in enrollments:
            course_data = e.course.serialize() if e.course else None
            result.append({
                **e.serialize(),
                "course": course_data
            })

        return jsonify(result), 200
    except Exception as err:
        print(f"Error en get_my_enrollments: {err}")
        return jsonify({"msg": "Error loading enrollments", "error": str(err)}), 500


@api.route('/enrollments', methods=['GET'])
@jwt_required()
def get_all_enrollments():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user.is_admin:
        return jsonify({"msg": "Unauthorized"}), 403

    enrollments = Enrollment.query.all()
    return jsonify([e.serialize() for e in enrollments]), 200

# ============================
# 🗨️ CHAT DEL CURSO
# ============================

@api.route('/course/<int:course_id>/chat', methods=['GET'])
@jwt_required()
def get_course_chat(course_id):
    """
    Obtiene mensajes de chat por curso y opcionalmente por grupo (schedule_id).
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"msg": "Course not found"}), 404

    # Verificar si pertenece al curso
    is_teacher = course.teacher_id == user.id
    is_student = Enrollment.query.filter_by(student_id=user.id, course_id=course_id).first()
    if not is_teacher and not is_student:
        return jsonify({"msg": "Unauthorized: not enrolled"}), 403

    # 👇 Nuevo: Filtrar por grupo si se pasa schedule_id en la URL
    schedule_id = request.args.get("schedule_id", type=int)
    query = CourseChatMessage.query.filter_by(course_id=course_id)

    if schedule_id:
        if is_student and is_student.schedule_id != schedule_id:
            return jsonify({"msg": "Unauthorized: you are not in this group"}), 403

        query = query.filter_by(schedule_id=schedule_id)

    messages = query.order_by(CourseChatMessage.timestamp.asc()).all()
    return jsonify([m.serialize() for m in messages]), 200



@api.route('/course/<int:course_id>/chat', methods=['POST'])
@jwt_required()
def post_course_chat(course_id):
    """
    Envía un nuevo mensaje al chat de un curso o grupo.
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get("content"):
        return jsonify({"msg": "Message content required"}), 400

    user = User.query.get(user_id)
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"msg": "Course not found"}), 404

    # Verificar si pertenece al curso
    is_teacher = course.teacher_id == user.id
    is_student = Enrollment.query.filter_by(student_id=user.id, course_id=course_id).first()
    if not is_teacher and not is_student:
        return jsonify({"msg": "Unauthorized"}), 403

    # 👇 Nuevo: si viene un schedule_id lo guardamos
    schedule_id = data.get("schedule_id")

    if schedule_id:
        if is_student and is_student.schedule_id != schedule_id:
            return jsonify({"msg": "Unauthorized: cannot send to this group"}), 403

    new_message = CourseChatMessage(
        course_id=course_id,
        user_id=user_id,
        content=data["content"],
        schedule_id=schedule_id
    )
    db.session.add(new_message)
    db.session.commit()

    return jsonify(new_message.serialize()), 201


@api.route('/chat/<int:student_id>', methods=['GET'])
@jwt_required()
def get_private_chat(student_id):
    """
    Obtiene todos los mensajes entre el profesor actual y un estudiante.
    """

    teacher_id = get_jwt_identity()
    user = User.query.get(teacher_id)

    if user.role not in ["teacher", "admin", "student"]:
        return jsonify({"msg": "No autorizado"}), 403

    messages = PrivateChatMessage.query.filter(
        ((PrivateChatMessage.sender_id == teacher_id) & (PrivateChatMessage.receiver_id == student_id)) |
        ((PrivateChatMessage.sender_id == student_id) & (PrivateChatMessage.receiver_id == teacher_id))
    ).order_by(PrivateChatMessage.timestamp.asc()).all()

    return jsonify([m.serialize() for m in messages]), 200

@api.route('/chat/<int:student_id>', methods=['POST'])
@jwt_required()
def send_private_message(student_id):
    """
    Envía un mensaje privado entre profesor y estudiante.
    """

    sender_id = get_jwt_identity()
    data = request.get_json()
    content = data.get("content")

    if not content:
        return jsonify({"msg": "El mensaje no puede estar vacío"}), 400

    new_msg = PrivateChatMessage(
        sender_id=sender_id,
        receiver_id=student_id,
        content=content
    )
    db.session.add(new_msg)
    db.session.commit()

    return jsonify(new_msg.serialize()), 201


@api.route('/teacher/courses', methods=['GET'])
@jwt_required()
def get_teacher_courses():
    """Devuelve todos los cursos creados por un profesor junto con
    el total de estudiantes inscritos en cada uno."""
    try:
        teacher_id = get_jwt_identity()
        user = User.query.get(teacher_id)

        if not user or user.role != "teacher":
            return jsonify({"msg": "Unauthorized"}), 403

        
        courses = Course.query.filter_by(teacher_id=teacher_id).all()

        result = []
        for course in courses:
            total_students = Enrollment.query.filter_by(course_id=course.id).count()
            course_data = course.serialize()
            course_data["total_students"] = total_students
            result.append(course_data)

        return jsonify(result), 200

    except Exception as e:
        print("Error in get_teacher_courses:", str(e))
        return jsonify({"msg": "Error fetching teacher courses", "error": str(e)}), 500

@api.route('/teacher/students', methods=['GET'])
@jwt_required()
def get_teacher_students():
    """
    Devuelve todos los estudiantes inscritos en los cursos de un profesor.
    Incluye información del estudiante, curso, progreso y fecha de inscripción.
    """
    try:
        teacher_id = get_jwt_identity()
        user = User.query.get(teacher_id)

        if not user or user.role != "teacher":
            return jsonify({"msg": "Unauthorized"}), 403

        # Buscar cursos del profesor
        courses = Course.query.filter_by(teacher_id=teacher_id).all()
        course_ids = [c.id for c in courses]

        if not course_ids:
            return jsonify([]), 200

        # Buscar inscripciones de esos cursos
        enrollments = (
            db.session.query(Enrollment, User, Course)
            .join(User, Enrollment.student_id == User.id)
            .join(Course, Enrollment.course_id == Course.id)
            .filter(Enrollment.course_id.in_(course_ids))
            .all()
        )

        result = []
        for enrollment, student, course in enrollments:
            result.append({
                "id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email,
                "country": student.country, 
                "course_title": course.title,
                "progress": getattr(enrollment, "progress", 0),
                "last_login": student.last_login.strftime("%Y-%m-%d %H:%M:%S")
                if student.last_login else None,   
                "enrolled_at": enrollment.enrolled_at.strftime("%Y-%m-%d")
                if enrollment.enrolled_at else None,
            })

        return jsonify(result), 200

    except Exception as e:
        print("Error in get_teacher_students:", str(e))
        return jsonify({"msg": "Error fetching students", "error": str(e)}), 500


@api.route('/teacher/course/<int:course_id>/students', methods=['GET'])
@jwt_required()
def get_students_by_course(course_id):
    """
    Devuelve los estudiantes inscritos en un curso específico del profesor
    e incluye información del grupo/horario si existe.
    """
    try:
        teacher_id = get_jwt_identity()
        user = User.query.get(teacher_id)

        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404

        # Permitir tanto teachers como admins
        if user.role not in ["teacher", "admin"]:
            return jsonify({"msg": "No autorizado"}), 403

        course = Course.query.get(course_id)
        if not course:
            return jsonify({"msg": "Curso no encontrado"}), 404

        # Si es teacher, verificar que sea el dueño del curso
        if user.role == "teacher" and course.teacher_id != user.id:
            return jsonify({"msg": "No tienes acceso a este curso"}), 403

        # 👇 Hacemos JOIN también con CourseSchedule
        enrollments = (
            db.session.query(Enrollment, User, CourseSchedule)
            .join(User, Enrollment.student_id == User.id)
            .outerjoin(CourseSchedule, Enrollment.schedule_id == CourseSchedule.id)
            .filter(Enrollment.course_id == course_id)
            .all()
        )

        result = []
        for enrollment, student, schedule in enrollments:
            result.append({
                "id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email,
                "country": student.country,
                "last_login": student.last_login.strftime("%Y-%m-%d %H:%M:%S")
                if student.last_login else None,
                "progress": getattr(enrollment, "progress", 0),
                "enrolled_at": enrollment.enrolled_at.strftime("%Y-%m-%d")
                if enrollment.enrolled_at else None,
                "schedule_id": schedule.id if schedule else None,
                "schedule": {
                    "id": schedule.id if schedule else None,
                    "group_name": schedule.group_name if schedule else None,
                    "day_of_week": schedule.day_of_week if schedule else None,
                    "start_time": schedule.start_time.strftime("%H:%M") if schedule else None,
                    "end_time": schedule.end_time.strftime("%H:%M") if schedule else None
                } if schedule else None

            })

        print(f"📊 Encontrados {len(result)} estudiantes para el curso {course_id}")
        return jsonify(result), 200

    except Exception as e:
        print("Error in get_students_by_course:", str(e))
        return jsonify({"msg": "Error fetching students", "error": str(e)}), 500
