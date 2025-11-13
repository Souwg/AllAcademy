"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
import traceback
import requests
from flask import Flask, json, request, jsonify, url_for, Blueprint
from sqlalchemy import extract, func
from psycopg2 import IntegrityError
from api.models import CourseLevel, db, User, BlockedTokenList, Course, Module, Lesson, LearningObjective, Requirement, Enrollment, CourseChatMessage, PrivateChatMessage, CourseSchedule, Recording, RecordingLesson, Purchase   
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, get_jwt
from datetime import datetime
from slugify import slugify
import calendar
import stripe
import cloudinary.uploader

app = Flask(__name__)
bcrypt = Bcrypt(app)

api = Blueprint('api', __name__)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
print("🔑 Stripe key loaded (first 10 chars):", stripe.api_key[:10] if stripe.api_key else "❌ No key loaded")
print("🔒 Webhook secret loaded:", (os.getenv("STRIPE_WEBHOOK_SECRET") or "❌")[:10])
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = os.getenv("PAYPAL_SECRET")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com")

# ============================
# PAYPAL HELPER
# ============================
def get_paypal_access_token():
    """Obtener un access token de PayPal (Client Credentials)."""
    r = requests.post(
        f"{PAYPAL_API_BASE}/v1/oauth2/token",
        headers={"Accept": "application/json"},
        data={"grant_type": "client_credentials"},
        auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET)
    )
    r.raise_for_status()
    return r.json()["access_token"]

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
   📌 Endpoint to register new users.
    Validates required fields, checks password match and terms acceptance,
    and creates a new user in the database.
    """
    print("=== REGISTER USER ENDPOINT CALLED ===")
    print(f"Request method: {request.method}")
    print(f"Request content type: {request.content_type}")
    
    body = request.get_json()
    print(f"Request body: {body}")
    
    
    required_fields = ['email', 'password', 'confirm_password', 'first_name', 'last_name', 'country', 'id_number']
    for field in required_fields:
        if not body.get(field):
            print(f"Missing required field: {field}")
            return jsonify({'msg': f'El campo {field} es requerido'}), 400

    
    if body['password'] != body['confirm_password']:
        print("Passwords don't match")
        return jsonify({'msg': 'Las contraseñas no coinciden'}), 400

    
    if not body.get('accept_terms'):
        print("Terms not accepted")
        return jsonify({'msg': 'Debes aceptar los términos y condiciones'}), 400

    
    if User.query.filter_by(email=body['email']).first():
        print("Email already registered")
        return jsonify({"msg": "El email ya está registrado"}), 409
    
    if User.query.filter_by(country=body['country'], id_number=body['id_number']).first():
        print("ID already registered for this country")
        return jsonify({"msg": "Esta identificación ya está registrada para el país seleccionado"}), 409

    
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
    📌 Endpoint to authenticate users.
    Checks credentials and generates a JWT token if valid.
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
     📌 Endpoint to log out a user.
    Invalidates the current JWT token by adding it to the blocked tokens list.
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
    📌 Endpoint to retrieve all users (admin only).
    Returns a list of all users in the system.
    """
    print("=== GET ALL USERS ENDPOINT CALLED ===")
    claims = get_jwt()
    current_user = get_jwt_identity()
    print(f"Request by user: {current_user}")
    print(f"User role: {claims.get('role')}")
    
    if claims.get('role') != "admin":
        print("Unauthorized access attempt to admin endpoint")
        return jsonify({"msg": "Acceso no autorizado: Se requieren privilegios de administrador"}), 403
    
    
    users = User.query.all()
    print(f"Returning {len(users)} users")
    
    return jsonify([user.serialize() for user in users]), 200

@api.route('/admin/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def update_user_role(user_id):
    """
    📌 Endpoint to update a user's role (admin only).
    Allows changing the role of any user except their own.
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
    """
    📌 Endpoint to update user details (admin only).
    """
    claims = get_jwt()
    if claims.get('role') != "admin":
        return jsonify({"msg": "Acceso no autorizado"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    body = request.get_json()

    
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


@api.route('/user/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    try:
        if request.content_type and "multipart/form-data" in request.content_type:
            first_name = request.form.get("first_name", user.first_name)
            last_name = request.form.get("last_name", user.last_name)
            bio = request.form.get("bio", user.bio)
            country = request.form.get("country", user.country)
            id_number = request.form.get("id_number", user.id_number)
            email = request.form.get("email", user.email)

            user.first_name = first_name
            user.last_name = last_name
            user.bio = bio
            user.country = country
            user.id_number = id_number
            user.email = email

            if request.form.get("remove_image") == "true":
                user.image_url = None

            # 🖼️ Subida de imagen
            if "image" in request.files:
                file = request.files["image"]
                if file and file.filename != "":
                    upload_result = cloudinary.uploader.upload(file, folder="profile_images")
                    user.image_url = upload_result["secure_url"]
        else:
            data = request.get_json()
            user.first_name = data.get("first_name", user.first_name)
            user.last_name = data.get("last_name", user.last_name)
            user.email = data.get("email", user.email)
            user.country = data.get("country", user.country)
            user.id_number = data.get("id_number", user.id_number)
            user.bio = data.get("bio", user.bio)
            if data.get("image_url"):
                user.image_url = data["image_url"]

        db.session.commit()

        return jsonify({
            "msg": "Perfil actualizado correctamente",
            "user": user.serialize()
        }), 200

    except Exception as e:
        print("❌ Error al actualizar perfil:")
        traceback.print_exc()
        return jsonify({"msg": "Error interno", "error": str(e)}), 500



@api.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """
    📌 Endpoint to delete a user (admin only).
    Does not allow deleting other admins or oneself.
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
    
    
    if user.role == 'admin':
        print("Attempt to delete another admin user")
        return jsonify({"msg": "No puedes eliminar a otro administrador"}), 400
    
    
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
        📌 Endpoint to block a user (admin only).
    Allows blocking a user and adding a reason for the block.

    """
    print("=== BLOCK USER ENDPOINT CALLED ===")
    try:
        
        claims = get_jwt()
        current_user = get_jwt_identity()
        print(f"Request by user: {current_user} to block user: {user_id}")
        
        if claims.get('role') != "admin":
            print("Unauthorized access attempt to admin endpoint")
            return jsonify({"msg": "No autorizado"}), 403

        
        data = request.get_json()
        print(f"Block reason: {data.get('reason', 'No reason provided')}")
        
        if not data or 'reason' not in data:
            print("No reason provided for block")
            return jsonify({"msg": "Razón de bloqueo requerida"}), 400

        
        user = User.query.get(user_id)
        if not user:
            print(f"User not found: {user_id}")
            return jsonify({"msg": "Usuario no encontrado"}), 404

        
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
    📌 Endpoint to unblock a user (admin only).
    Allows unblocking previously blocked users.
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
    📌 Endpoint to create a new course with modules and lessons.
    Only administrators and teachers can use this.
    """
    try:
        print("=== CREATE COURSE ENDPOINT CALLED ===")

        
        claims = get_jwt()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or user.role not in ['admin', 'teacher']:
            return jsonify({"msg": "Only administrators and teachers can create courses"}), 403

        
        if request.content_type and "multipart/form-data" in request.content_type:
            data = request.form.to_dict()
        else:
            data = request.get_json()
        print(f"📩 Datos recibidos: {data}")

        import json
        for key in ["what_you_learn", "requirements", "modules", "schedules"]:
            if key in data and isinstance(data[key], str):
                try:
                    data[key] = json.loads(data[key])
                except json.JSONDecodeError:
                    print(f"⚠️ Error decodificando {key}: {data[key]}")
                    data[key] = []

        if not data:
            return jsonify({"msg": "Required JSON data"}), 400
        
        image_url = None
        if "image" in request.files:
            file = request.files["image"]
            if file and file.filename != "":
                upload_result = cloudinary.uploader.upload(file, folder="allacademy/courses/images")
                image_url = upload_result["secure_url"]

        
        required_fields = ['title', 'description', 'price']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"msg": f"The {field} is required"}), 400

        
        slug = slugify(data['title'])

        
        existing_course = Course.query.filter_by(slug=slug).first()
        if existing_course:
            import time
            slug = f"{slug}-{int(time.time())}"

        
        if user.role == "teacher":
            teacher_id = user.id
        elif user.role == "admin":
            teacher_id = data.get("teacher_id")
            print(f"📩 Teacher ID recibido desde frontend: {teacher_id}")
            if not teacher_id:
                return jsonify({"msg": "Teacher ID is required when admin creates a course"}), 400
        else:
            teacher_id = None

            # ⚙️ Conversión segura de strings a booleanos
        def str_to_bool(value):
            if isinstance(value, bool):
                return value
            if isinstance(value, str):
                return value.lower() in ['true', '1', 'yes', 'on']
            return False

            # 🧠 Convertir los valores que llegan como texto
        is_published = str_to_bool(data.get("is_published"))
        has_live_classes = str_to_bool(data.get("has_live_classes"))
        has_recorded_videos = str_to_bool(data.get("has_recorded_videos"))
        
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
            is_published=is_published,
            published_at=datetime.utcnow() if is_published else None, 
            has_live_classes=has_live_classes,
            has_recorded_videos=has_recorded_videos,
            image_url=image_url
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

                    
                    new_schedule = CourseSchedule(
                        course_id=new_course.id,
                        day_of_week=",".join(days), 
                        start_time=start_time,
                        end_time=end_time,
                        timezone=timezone,
                        group_name=group_name
                    )
                    db.session.add(new_schedule)

                except Exception as e:
                    print(f"⚠️ Error al procesar horario: {e}")

        
        if 'what_you_learn' in data and isinstance(data['what_you_learn'], list):
            for objective in data['what_you_learn']:
                if objective and objective.strip():
                    learning_obj = LearningObjective(
                        objective=objective.strip(),
                        course_id=new_course.id
                    )
                    db.session.add(learning_obj)

        
        if 'requirements' in data and isinstance(data['requirements'], list):
            for requirement in data['requirements']:
                if requirement and requirement.strip():
                    req = Requirement(
                        requirement=requirement.strip(),
                        course_id=new_course.id
                    )
                    db.session.add(req)

       
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
                db.session.flush() 

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
    📌 Endpoint to add a new module to an existing course.
    """
    try:
        claims = get_jwt()
        user_id = get_jwt_identity()
        
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"msg": "Curso no encontrado"}), 404
        
        
        if claims.get('role') != 'admin' and str(course.teacher_id) != user_id:
            return jsonify({"msg": "No tienes permisos para modificar este curso"}), 403
        
        data = request.get_json()
        if not data.get('title'):
            return jsonify({"msg": "El título del módulo es requerido"}), 400
        
        
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
    📌 Endpoint to add a lesson to an existing module.
    """
    try:
        module = Module.query.get(module_id)
        if not module:
            return jsonify({"msg": "Módulo no encontrado"}), 404
        
        claims = get_jwt()
        user_id = get_jwt_identity()
        
        
        if claims.get('role') != 'admin' and str(module.course.teacher_id) != user_id:
            return jsonify({"msg": "No tienes permisos para modificar este curso"}), 403
        
        data = request.get_json()
        if not data.get('title'):
            return jsonify({"msg": "El título de la lección es requerido"}), 400
        
        
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
    📌 Endpoint to get all teachers (admin only).
    """
    print("=== GET TEACHERS ENDPOINT CALLED ===")
    
    
    claims = get_jwt()
    if claims.get('role') != 'admin':
        print("Unauthorized access attempt to teachers endpoint")
        return jsonify({"msg": "No autorizado"}), 403
    
    
    teachers = User.query.filter_by(role='teacher').all()
    
    
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
    📌 Endpoint to get all courses including unpublished ones (admin only).
    """
    print("=== GET ALL COURSES (ADMIN) ENDPOINT CALLED ===")
    try:
        
        claims = get_jwt()
        user_id = get_jwt_identity()
        print(f"Request by user: {user_id}")
        
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            print("Unauthorized access attempt to admin endpoint")
            return jsonify({"msg": "No autorizado"}), 403
        
        
        print("DEBUG: Before querying courses")
        
        
        courses = Course.query.options(
            db.joinedload(Course.modules).joinedload(Module.lessons),
            db.joinedload(Course.what_you_learn),
            db.joinedload(Course.requirements)
        ).all()
        
        print(f"DEBUG: Found {len(courses)} courses")
        
        
        serialized_courses = []
        for i, course in enumerate(courses):
            print(f"DEBUG: Course {i+1}: {course.title} (ID: {course.id})")
            print(f"DEBUG: - Modules count: {len(course.modules)}")
            print(f"DEBUG: - What you learn count: {len(course.what_you_learn)}")
            print(f"DEBUG: - Requirements count: {len(course.requirements)}")
            
            
            for j, module in enumerate(course.modules):
                print(f"DEBUG:   Module {j+1}: {module.title} (Order: {module.order})")
                print(f"DEBUG:   - Lessons count: {len(module.lessons)}")
                
                for k, lesson in enumerate(module.lessons):
                    print(f"DEBUG:     Lesson {k+1}: {lesson.title} (Order: {lesson.order})")
            
            
            course_data = course.serialize()
            serialized_courses.append(course_data)
            
            
            print(f"DEBUG: Serialized course modules: {len(course_data.get('modules', []))}")
        
        print(f"DEBUG: Returning {len(serialized_courses)} serialized courses")
        return jsonify(serialized_courses), 200
        
    except Exception as e:
        print(f"ERROR getting courses: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"msg": "Error al obtener cursos", "error": str(e)}), 500
    
    
@api.route('/courses', methods=['GET'])
def get_courses():
    """
    📌 Public endpoint to get all published courses.
    No authentication required.
    """
    print("=== GET COURSES (PUBLIC) ENDPOINT CALLED ===")
    try:
        courses = Course.query.filter_by(is_published=True).all()
        print(f"Returning {len(courses)} published courses")
        return jsonify([course.serialize() for course in courses]), 200
    except Exception as e:
        print(f"Error getting published courses: {str(e)}")
        return jsonify({"msg": "Error al obtener cursos", "error": str(e)}), 500


@api.route('/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    """
    📌 Public endpoint to get a specific course by ID.
    No authentication required.
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
    📌 Endpoint to update an entire course.
    Updates basic info, objectives, requirements, modules, lessons, and schedules.
    """
    try:
        claims = get_jwt()
        user_id = get_jwt_identity()

        user = User.query.get(user_id)
        if not user or (user.role not in ["admin", "teacher"]):
            return jsonify({"msg": "Unauthorized"}), 403

        course = Course.query.get(course_id)
        if not course:
            return jsonify({"msg": "Course not found"}), 404

        # ============================
        # 🧩 Conversión segura de string a boolean
        # ============================
        def str_to_bool(value):
            if isinstance(value, bool):
                return value
            if isinstance(value, str):
                return value.lower() in ["true", "1", "yes", "on"]
            return False

        # ============================
        # 📥 Leer datos del request
        # ============================
        if request.content_type and "multipart/form-data" in request.content_type:
            data = request.form.to_dict()
        else:
            data = request.get_json()
        print("📥 Datos recibidos en update_course:", data)
        if not data:
            return jsonify({"msg": "Required JSON data"}), 400

        # ============================
        # 📸 Subir imagen si existe
        # ============================
        if "image" in request.files:
            file = request.files["image"]
            if file and file.filename != "":
                try:
                    upload_result = cloudinary.uploader.upload(file, folder="allacademy/courses/images")
                    course.image_url = upload_result["secure_url"]
                    print(f"✅ Imagen de curso subida correctamente: {course.image_url}")
                except Exception as e:
                    print(f"⚠️ Error subiendo imagen del curso: {str(e)}")

        # ============================
        # 🔧 Actualizar datos básicos
        # ============================
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

        # ============================
        # ✅ Convertir y actualizar booleanos
        # ============================
        is_published = str_to_bool(data.get("is_published"))
        has_live_classes = str_to_bool(data.get("has_live_classes"))
        has_recorded_videos = str_to_bool(data.get("has_recorded_videos"))

        # Actualizar published_at
        if "is_published" in data:
            if is_published and not course.is_published:
                course.published_at = datetime.utcnow()
            elif not is_published and course.is_published:
                course.published_at = None
            course.is_published = is_published

        course.has_live_classes = has_live_classes
        course.has_recorded_videos = has_recorded_videos

        # ============================
        # 🎯 Objetivos de aprendizaje
        # ============================
        if "what_you_learn" in data and isinstance(data["what_you_learn"], list):
            LearningObjective.query.filter_by(course_id=course.id).delete()
            for obj in data["what_you_learn"]:
                if obj.strip():
                    db.session.add(LearningObjective(objective=obj.strip(), course_id=course.id))

        # ============================
        # 📋 Requisitos
        # ============================
        if "requirements" in data and isinstance(data["requirements"], list):
            Requirement.query.filter_by(course_id=course.id).delete()
            for req in data["requirements"]:
                if req.strip():
                    db.session.add(Requirement(requirement=req.strip(), course_id=course.id))

        # ============================
        # 🧱 Módulos y lecciones
        # ============================
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

        # ============================
        # ⏰ Horarios
        # ============================
        if "schedules" in data and isinstance(data["schedules"], list):
            existing_schedules = {s.id: s for s in course.schedules}
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
                    sched_obj = existing_schedules[sched_id]
                    sched_obj.day_of_week = day_of_week
                    sched_obj.start_time = start_time
                    sched_obj.end_time = end_time
                    sched_obj.timezone = timezone
                    sched_obj.group_name = group_name
                    received_ids.add(sched_id)
                else:
                    new_schedule = CourseSchedule(
                        course_id=course.id,
                        day_of_week=day_of_week,
                        start_time=start_time,
                        end_time=end_time,
                        timezone=timezone,
                        group_name=group_name
                    )
                    db.session.add(new_schedule)

            for sched_id, sched_obj in existing_schedules.items():
                if sched_id not in received_ids:
                    if not hasattr(sched_obj, "students") or len(getattr(sched_obj, "students", [])) == 0:
                        db.session.delete(sched_obj)
                    else:
                        print(f"⚠️ No se eliminó horario {sched_id} porque tiene estudiantes inscritos.")
        else:
            print("⚠️ No se recibieron horarios — se mantienen los existentes.")

        # ============================
        # 💾 Guardar cambios
        # ============================
        db.session.commit()
        return jsonify({"msg": "Course updated successfully", "course": course.serialize()}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error updating course {course_id}: {str(e)}")
        return jsonify({"msg": "Error updating course", "error": str(e)}), 500

    


@api.route('/courses/<int:course_id>', methods=['DELETE'])
@jwt_required()
def delete_course(course_id):
    """
    📌 Endpoint to delete a course.
    Only the course teacher or admins can delete it.
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
    """
    📌 Endpoint to get user registration statistics per month.
    """

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
    
# ============================
# 📊 FINANCIAL STATS (ADMIN)
# ============================

@api.route('/admin/financial-overview', methods=['GET'])
@jwt_required()
def financial_overview():
    """
    📊 Endpoint para obtener métricas financieras básicas.
    - Total Revenue: suma de todas las compras completadas
    - Total Sales: número total de compras exitosas
    """
    try:
        claims = get_jwt()
        if claims.get('role') != "admin":
            return jsonify({"msg": "Acceso no autorizado"}), 403

        # Filtrar compras completadas o exitosas
        completed_status = ["succeeded", "completed"]
        purchases = Purchase.query.filter(Purchase.status.in_(completed_status)).all()

        total_revenue = sum(p.amount for p in purchases) / 100  # 💰 Convertir de centavos a dólares
        total_sales = len(purchases)
        total_enrollments = Enrollment.query.count()


        print(f"✅ FINANCIAL STATS -> Revenue: ${total_revenue}, Sales: {total_sales}")

        return jsonify({
            "total_revenue": round(total_revenue, 2),
            "total_sales": total_sales,
            "total_enrollments": total_enrollments
        }), 200

    except Exception as e:
        print("❌ Error en financial_overview:", str(e))
        import traceback; traceback.print_exc()
        return jsonify({"msg": "Error obteniendo estadísticas", "error": str(e)}), 500


@api.route('/courses/slug/<string:slug>', methods=['GET'])
def get_course_by_slug(slug):
    """
    📌 Public endpoint to get a specific course by its slug.
    No authentication required.
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
    
# ============================
# ENROLLMENTS
# ============================
    
@api.route('/enroll/<int:course_id>', methods=['POST'])
@jwt_required()
def enroll_course(course_id):
    """
    📌 Endpoint to enroll the authenticated user in a course.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    course = Course.query.get(course_id)
    data = request.get_json()
    schedule_id = data.get("schedule_id")

    if not course:
        return jsonify({"msg": "Course not found"}), 404

    if not course.is_published:
        return jsonify({"msg": "Course is not published"}), 400

    
    existing = Enrollment.query.filter_by(student_id=user.id, course_id=course.id).first()
    if existing:
        return jsonify({"msg": "Already enrolled"}), 400

    
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
    📌 Endpoint to get all courses in which the current user is enrolled.
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
    """
    📌 Endpoint to get all enrollments (admin only).
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user.is_admin:
        return jsonify({"msg": "Unauthorized"}), 403

    enrollments = Enrollment.query.all()
    return jsonify([e.serialize() for e in enrollments]), 200

# ============================
# COURSE CHAT
# ============================

@api.route('/course/<int:course_id>/chat', methods=['GET'])
@jwt_required()
def get_course_chat(course_id):
    """
    📌 Endpoint to get chat messages from a course (and optionally by group).
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"msg": "Course not found"}), 404

    
    is_teacher = course.teacher_id == user.id
    is_student = Enrollment.query.filter_by(student_id=user.id, course_id=course_id).first()
    if not is_teacher and not is_student:
        return jsonify({"msg": "Unauthorized: not enrolled"}), 403

    
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
    📌 Endpoint to send a new message in a course chat.
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get("content"):
        return jsonify({"msg": "Message content required"}), 400

    user = User.query.get(user_id)
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"msg": "Course not found"}), 404

    
    is_teacher = course.teacher_id == user.id
    is_student = Enrollment.query.filter_by(student_id=user.id, course_id=course_id).first()
    if not is_teacher and not is_student:
        return jsonify({"msg": "Unauthorized"}), 403

    
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
    📌 Endpoint to get all private messages between the teacher and a specific student.
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
    📌 Endpoint to send a private message between teacher and student.
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

# ============================
# TEACHER DASHBOARD
# ============================

@api.route('/teacher/courses', methods=['GET'])
@jwt_required()
def get_teacher_courses():
    """📌 Endpoint to get all courses created by a teacher, including total student count."""
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
    📌 Endpoint to get all students enrolled in a teacher’s courses.
    """
    try:
        teacher_id = get_jwt_identity()
        user = User.query.get(teacher_id)

        if not user or user.role != "teacher":
            return jsonify({"msg": "Unauthorized"}), 403

        
        courses = Course.query.filter_by(teacher_id=teacher_id).all()
        course_ids = [c.id for c in courses]

        if not course_ids:
            return jsonify([]), 200

        
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
    📌 Endpoint to get all students enrolled in a specific course of the teacher, including group/timetable information if it exists.
    """
    try:
        teacher_id = get_jwt_identity()
        user = User.query.get(teacher_id)

        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404

        
        if user.role not in ["teacher", "admin"]:
            return jsonify({"msg": "No autorizado"}), 403

        course = Course.query.get(course_id)
        if not course:
            return jsonify({"msg": "Curso no encontrado"}), 404

        
        if user.role == "teacher" and course.teacher_id != user.id:
            return jsonify({"msg": "No tienes acceso a este curso"}), 403

        
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
from api.models import Recording, RecordingLesson, Lesson
from flask_jwt_extended import jwt_required, get_jwt_identity

# ============================
# RECORDINGS
# ============================
@api.route('/recordings', methods=['POST'])
@jwt_required()
def create_recording():
    """
    📌 Endpoint to create a new class recording and link it to lessons.
    """
    try:
        data = request.get_json()
        teacher_id = get_jwt_identity()

        
        required_fields = ['course_id', 'title', 'recording_url']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"msg": f"{field} es requerido"}), 400

        
        new_recording = Recording(
            course_id=data['course_id'],
            schedule_id=data.get('schedule_id'),
            teacher_id=teacher_id,
            title=data['title'],
            recording_url=data['recording_url']
        )
        db.session.add(new_recording)
        db.session.flush()  

        
        lesson_ids = data.get('lesson_ids', [])
        if lesson_ids and isinstance(lesson_ids, list):
            for lesson_id in lesson_ids:
                if Lesson.query.get(lesson_id):
                    db.session.add(RecordingLesson(
                        recording_id=new_recording.id,
                        lesson_id=lesson_id
                    ))

        db.session.commit()
        return jsonify({
            "msg": "Grabación creada con éxito",
            "recording": new_recording.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error al crear grabación: {str(e)}")
        return jsonify({"msg": "Error al crear grabación", "error": str(e)}), 500
@api.route('/recordings/<int:course_id>', methods=['GET'])
@jwt_required()
def get_recordings(course_id):
    """
    📌 Endpoint to get all recordings for a specific course.
    Includes related lessons and modules for each recording.
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        schedule_id = request.args.get('schedule_id', type=int)

        # ✅ Hacer join para traer las lecciones y módulos asociados
        query = (
            Recording.query
            .options(
                db.joinedload(Recording.linked_lessons)
                .joinedload(RecordingLesson.lesson)
                .joinedload(Lesson.module)
            )
            .filter_by(course_id=course_id)
        )

        if schedule_id:
            query = query.filter_by(schedule_id=schedule_id)

        if user.role == "student":
            query = query.filter_by(is_published=True)

        recordings = query.order_by(Recording.created_at.desc()).all()

        return jsonify([r.serialize() for r in recordings]), 200

    except Exception as e:
        print("❌ Error al obtener grabaciones:", str(e))
        import traceback; traceback.print_exc()
        return jsonify({"msg": "Error al obtener grabaciones", "error": str(e)}), 500


@api.route('/recordings/<int:recording_id>/publish', methods=['PUT'])
@jwt_required()
def publish_recording(recording_id):
    """
    📌 Endpoint to publish or unpublish a recording (teacher or admin).
    """
    try:
        user_id = get_jwt_identity()
        recording = Recording.query.get(recording_id)
        if not recording:
            return jsonify({"msg": "Grabación no encontrada"}), 404

        user = User.query.get(user_id)
        if user.role != "admin" and recording.teacher_id != user.id:
            return jsonify({"msg": "No autorizado"}), 403

        data = request.get_json()
        recording.is_published = data.get('is_published', True)
        db.session.commit()

        return jsonify({
            "msg": "Estado de publicación actualizado",
            "recording": recording.serialize()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al publicar grabación", "error": str(e)}), 500
    
@api.route('/recordings/<int:recording_id>', methods=['PUT'])
@jwt_required()
def update_recording(recording_id):
    """
    📌 Endpoint to update a recording's title or URL.
    Only the owner teacher or admin can update it.
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        recording = Recording.query.get(recording_id)

        if not recording:
            return jsonify({"msg": "Grabación no encontrada"}), 404

        
        if user.role != "admin" and recording.teacher_id != int(user_id):
            return jsonify({"msg": "No autorizado"}), 403

        data = request.get_json()

        
        if "title" in data and data["title"]:
            recording.title = data["title"]

        if "recording_url" in data and data["recording_url"]:
            recording.recording_url = data["recording_url"]

        db.session.commit()

        return jsonify({
            "msg": "Grabación actualizada exitosamente",
            "recording": recording.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error al actualizar grabación: {str(e)}")
        return jsonify({"msg": "Error al actualizar grabación", "error": str(e)}), 500


@api.route('/recordings/<int:recording_id>', methods=['DELETE'])
@jwt_required()
def delete_recording(recording_id):
    """
    📌 Endpoint to delete a recording and its associations.
    Only the owner teacher or admin can delete it.
    """
    try:
        user_id = get_jwt_identity()
        recording = Recording.query.get(recording_id)

        if not recording:
            return jsonify({"msg": "Grabación no encontrada"}), 404

        
        user = User.query.get(user_id)
        if user.role != "admin" and recording.teacher_id != int(user_id):
            return jsonify({"msg": "No tienes permisos para eliminar esta grabación"}), 403

        db.session.delete(recording)
        db.session.commit()
        return jsonify({"msg": "Grabación eliminada exitosamente"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error al eliminar grabación: {str(e)}")
        return jsonify({"msg": "Error al eliminar grabación", "error": str(e)}), 500
    
# ============================
# PAYPAL INTEGRATION (simple)
# ============================

@api.route("/paypal/create-order", methods=["POST"])
@jwt_required()
def create_paypal_order():
    """
    Crea una orden de PayPal para un curso y devuelve el objeto de PayPal.
    FRONTEND: toma el link de aprobación (links[x].rel == 'approve') para redirigir al usuario.
    """
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    print("🛰️ DEBUG /paypal/create-order — datos recibidos:", data)

    course_id = data.get("course_id")
    schedule_id = data.get("schedule_id")  # opcional

    # 1) Validaciones básicas
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"msg": "Course not found"}), 404

    amount = float(course.discount_price or course.price)

    custom_id_value = f"{user_id}|{schedule_id or ''}"
    print(f"🧾 DEBUG custom_id que se enviará a PayPal: {custom_id_value}")

    # 2) Token de PayPal
    access_token = get_paypal_access_token()

    # 3) Construir orden (Checkout v2)
    # - reference_id: course_id para recuperarlo al capturar
    # - custom_id: guardamos user_id|schedule_id para reconstruir la inscripción
    body = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": str(course_id),
                "custom_id": f"{user_id}|{schedule_id or ''}",
                "amount": {
                    "currency_code": "USD",
                    "value": f"{amount:.2f}"
                }
            }
        ],
        "application_context": {
            "brand_name": "AllAcademy",
            "shipping_preference": "NO_SHIPPING",
            # Si usas approve link en frontend, estas urls sólo aplican si usaras el "classic redirect"
            "return_url": f"http://localhost:3000/courses/{course.slug}?paypal_success=true",
            "cancel_url": f"http://localhost:3000/courses/{course.slug}?paypal_cancel=true",
        }
    }

    r = requests.post(
        f"{PAYPAL_API_BASE}/v2/checkout/orders",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        json=body,
        timeout=30
    )

    # Retorna tal cual la respuesta de PayPal (incluye links de aprobación)
    return jsonify(r.json()), r.status_code


@api.route("/paypal/capture-order/<order_id>", methods=["POST"])
@jwt_required()
def capture_paypal_order(order_id):
    """
    Captura la orden aprobada en PayPal y, si es exitoso:
      - crea un Purchase
      - crea Enrollment si no existe (respetando schedule_id si venía en custom_id)
    """
    user_id = int(get_jwt_identity())
    access_token = get_paypal_access_token()

    r = requests.post(
        f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}/capture",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        timeout=30
    )

    if r.status_code >= 400:
        return jsonify({"msg": "Error capturing order", "error": r.text}), 400

    data = r.json()
    print("🪙 RAW PAYPAL CAPTURE RESPONSE:")
    print(json.dumps(data, indent=2))   
    try:
        # 🧾 Estructura de PayPal (orden capturada)
        pu = data["purchase_units"][0]
        course_id = int(pu["reference_id"])

        # 🧠 custom_id venía como "user_id|schedule_id"
        capture = pu["payments"]["captures"][0]
        custom_id = capture.get("custom_id") or ""
        schedule_id = None
        if "|" in custom_id:
            _, raw_sched = custom_id.split("|", 1)
            schedule_id = int(raw_sched) if raw_sched.strip() else None

        # 🪵 DEBUG PRINTS ————————
        print("========== PAYPAL CAPTURE DEBUG ==========")
        print(f"🧍 User ID: {user_id}")
        print(f"📘 Course ID: {course_id}")
        print(f"📦 custom_id recibido: '{custom_id}'")
        print(f"📅 schedule_id final parseado: {schedule_id}")
        print("==========================================")

        # Primera captura (éxito)
        capture = pu["payments"]["captures"][0]
        capture_id = capture["id"]
        status = capture["status"].lower()
        total_value = float(capture["amount"]["value"])
        currency_code = capture["amount"]["currency_code"].lower()

        # Guardar Purchase (si no existe por id de captura)
        existing = Purchase.query.filter_by(payment_intent_id=capture_id).first()
        if not existing:
            db.session.add(Purchase(
                user_id=user_id,
                course_id=course_id,
                payment_intent_id=capture_id,
                amount=int(total_value * 100),
                currency=currency_code,
                status=status
            ))

        # Crear Enrollment si no existe
        already_enrolled = Enrollment.query.filter_by(
            student_id=user_id,
            course_id=course_id
        ).first()

        if not already_enrolled:
            print(f"📝 Creando Enrollment con schedule_id = {schedule_id}")  # 🪵 DEBUG extra
            db.session.add(Enrollment(
                student_id=user_id,
                course_id=course_id,
                schedule_id=schedule_id,
                enrolled_at=datetime.utcnow()
            ))
        else:
            print("⚠️ El usuario ya estaba inscrito en el curso")

        db.session.commit()
        print("✅ Commit exitoso — Enrollment guardado")

        return jsonify({"msg": "Payment captured", "order": data}), 200

    except Exception as e:
        db.session.rollback()
        print("❌ ERROR al persistir la captura:", str(e))  # 🪵 DEBUG extra
        return jsonify({"msg": "Error persisting capture", "error": str(e), "raw": data}), 500


# ============================
# PAYPAL WEBHOOK
# ============================
# ============================
# PAYPAL WEBHOOK (mejorado)
# ============================
@api.route("/paypal/webhook", methods=["POST"])
def paypal_webhook():
    try:
        event = request.get_json()
        print("📡 PAYPAL WEBHOOK EVENTO RECIBIDO:")
        print(json.dumps(event, indent=2))

        event_type = event.get("event_type")
        resource = event.get("resource", {})

        if event_type != "PAYMENT.CAPTURE.COMPLETED":
            print(f"ℹ️ Evento ignorado: {event_type}")
            return jsonify({"msg": "Ignored event"}), 200

        # 🔹 Datos básicos
        capture_id = resource.get("id")
        amount = float(resource["amount"]["value"])
        currency = resource["amount"]["currency_code"].lower()
        custom_id = resource.get("custom_id", "")
        user_id, schedule_id = None, None

        if "|" in custom_id:
            user_part, sched_part = custom_id.split("|", 1)
            user_id = int(user_part)
            schedule_id = int(sched_part) if sched_part else None

        # 🔹 Intentamos obtener order_id del recurso
        order_id = (
            resource.get("supplementary_data", {})
            .get("related_ids", {})
            .get("order_id")
        )
        print(f"🔹 Order ID recibido: {order_id}")

        # 🔹 Intentar obtener el course_id (reference_id)
        course_id = None
        if order_id:
            access_token = get_paypal_access_token()
            r = requests.get(
                f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=30,
            )
            if r.ok:
                order_data = r.json()
                purchase_units = order_data.get("purchase_units", [])
                if purchase_units:
                    # ✅ Intento 1: reference_id directo
                    course_id = purchase_units[0].get("reference_id")
                    if course_id:
                        print(f"✅ reference_id obtenido vía API: {course_id}")
                    else:
                        # ✅ Intento 2: Fallback a custom_id dentro de captures
                        captures = (
                            purchase_units[0]
                            .get("payments", {})
                            .get("captures", [])
                        )
                        if captures:
                            custom_fallback = captures[0].get("custom_id")
                            if custom_fallback and "|" in custom_fallback:
                                print("🔄 Recuperando course_id desde custom_id fallback")
                                user_part, sched_part = custom_fallback.split("|", 1)
                                user_id = int(user_part)
                                schedule_id = int(sched_part) if sched_part else None
                                # No se puede obtener el course_id directamente, pero mantenemos la relación
            else:
                print(f"⚠️ Error al consultar la orden {order_id}: {r.status_code} {r.text}")

        # Si sigue sin aparecer el course_id
        if not course_id:
            print("⚠️ No se pudo obtener course_id desde PayPal, se ignora evento.")
            return jsonify({"msg": "No course reference"}), 200

        # 🧠 Convertimos y validamos
        try:
            course_id = int(course_id)
        except ValueError:
            print(f"⚠️ course_id inválido recibido: {course_id}")
            return jsonify({"msg": "Invalid course_id"}), 200

        print(f"✅ Pago completado por usuario {user_id}, curso ID {course_id}")

        # 🧾 Validaciones y guardado
        course = Course.query.get(course_id)
        if not course:
            print(f"⚠️ No se encontró el curso con ID {course_id}")
            return jsonify({"msg": "Course not found"}), 404

        existing = Purchase.query.filter_by(payment_intent_id=capture_id).first()
        if existing:
            print("⚠️ Captura ya registrada:", capture_id)
            return jsonify({"msg": "Already processed"}), 200

        # 💾 Guardar compra
        new_purchase = Purchase(
            user_id=user_id,
            course_id=course.id,
            payment_intent_id=capture_id,
            amount=int(amount * 100),
            currency=currency,
            status="completed",
        )
        db.session.add(new_purchase)

        # 💾 Crear inscripción si no existe
        already = Enrollment.query.filter_by(
            student_id=user_id, course_id=course.id
        ).first()
        if not already:
            db.session.add(
                Enrollment(
                    student_id=user_id,
                    course_id=course.id,
                    schedule_id=schedule_id,
                    enrolled_at=datetime.utcnow(),
                )
            )

        db.session.commit()
        print("🎉 Webhook procesado correctamente")
        return jsonify({"msg": "Processed"}), 200

    except Exception as e:
        print("❌ Error en webhook PayPal:", str(e))
        db.session.rollback()
        return jsonify({"msg": "Error processing webhook", "error": str(e)}), 500




# ============================
# STRIPE INTEGRATION
# ============================

@api.route('/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    user_id = get_jwt_identity()
    data = request.get_json()
    course_id = data.get("course_id")
    schedule_id = data.get("schedule_id")
    currency = data.get("currency", "usd")

    # 🧭 Buscar el curso en la base de datos
    course = Course.query.get(course_id)
    if not course:
        print("❌ Curso no encontrado:", course_id)
        return jsonify({"error": "Curso no encontrado"}), 404

    amount = int((course.discount_price or course.price) * 100)

    # 🖨️ Print detallado del request
    print("\n========== 💳 STRIPE PAYMENT DEBUG ==========")
    print(f"🧑 USER ID: {user_id} (tipo: {type(user_id)})")
    print(f"📘 COURSE ID: {course_id} (tipo: {type(course_id)})")
    print(f"📚 Nombre del curso: {course.title}")
    print(f"💲 Monto a cobrar: {amount} {currency}")
    print(f"🕐 Fecha y hora: {datetime.utcnow()}")
    print("=============================================\n")

    try:
        # 🪙 Crear PaymentIntent en Stripe
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            payment_method_types=["card"],
            metadata={
                "user_id": user_id,
                "course_id": course_id,
                "schedule_id": schedule_id or ""   # 👈 AÑADIDO
            }
        )

        # 🖨️ Print detallado de la respuesta de Stripe
        print("========== 📦 STRIPE RESPONSE ==========")
        print(f"🪪 ID del PaymentIntent: {intent.id}")
        print(f"🔐 Client Secret: {intent.client_secret}")
        print(f"💰 Estado: {intent.status}")
        print(f"📄 Objeto completo: {intent}")
        print("========================================\n")

        return jsonify({"clientSecret": intent.client_secret})

    except Exception as e:
        print("❌ Error creando PaymentIntent:", str(e))
        return jsonify({"error": str(e)}), 400


@api.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    print("🪙 ========== WEBHOOK RECIBIDO ==========")
    print(f"📧 Event type from header: {request.headers.get('Stripe-Event-Type', 'Not provided')}")
    print(f"🔐 Signature present: {bool(sig_header)}")
    print(f"📦 Payload length: {len(payload)} chars")
    print(f"🕐 Timestamp: {datetime.utcnow()}")

    try:
        # ✅ Verificar la firma del webhook
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
        print(f"✅ Evento verificado: {event['type']} (ID: {event['id']})")
        
    except ValueError as e:
        print(f"❌ Error de payload inválido: {e}")
        return jsonify({"error": "Invalid payload"}), 400
    except stripe.error.SignatureVerificationError as e:
        print(f"❌ Error de firma inválida: {e}")
        return jsonify({"error": "Invalid signature"}), 400
    except Exception as e:
        print(f"❌ Error inesperado en verificación: {e}")
        return jsonify({"error": "Webhook verification failed"}), 400

    # 🧭 Manejar solo el evento exitoso
    if event['type'] == 'payment_intent.succeeded':
        return handle_payment_success(event)
    else:
        print(f"ℹ️ Evento no manejado: {event['type']}")
        return jsonify({"status": "ignored"}), 200


def handle_payment_success(event):
    """Maneja el evento de pago exitoso"""
    try:
        payment_intent = event['data']['object']
        metadata = payment_intent.get('metadata', {})
        
        # ==========================
        # 📥 Extraer y validar datos
        # ==========================
        user_id = metadata.get('user_id')
        course_id = metadata.get('course_id')
        schedule_id = metadata.get('schedule_id')  # 👈 Nuevo campo

        payment_intent_id = payment_intent['id']
        amount = payment_intent['amount']
        currency = payment_intent['currency']
        status = payment_intent['status']

        print(f"🎯 Procesando pago exitoso:")
        print(f"   👤 User ID: {user_id} (tipo: {type(user_id)})")
        print(f"   📘 Course ID: {course_id} (tipo: {type(course_id)})")
        print(f"   📅 Schedule ID: {schedule_id} (tipo: {type(schedule_id)})")
        print(f"   💰 Amount: {amount} {currency}")
        print(f"   🆔 Payment Intent: {payment_intent_id}")

        # 🛑 Validar que haya metadata mínima
        if not user_id or not course_id:
            print("❌ Metadata incompleta - faltan user_id o course_id")
            return jsonify({"error": "Missing metadata"}), 400

        # 🔄 Convertir a enteros
        try:
            user_id = int(user_id)
            course_id = int(course_id)
            schedule_id = int(schedule_id) if schedule_id and schedule_id.strip() else None
        except (ValueError, TypeError) as e:
            print(f"❌ Error convirtiendo IDs: {e}")
            return jsonify({"error": "Invalid metadata types"}), 400

        # ✅ Verificar que usuario y curso existan
        user = User.query.get(user_id)
        course = Course.query.get(course_id)
        if not user:
            print(f"❌ Usuario no encontrado: {user_id}")
            return jsonify({"error": "User not found"}), 404
        if not course:
            print(f"❌ Curso no encontrado: {course_id}")
            return jsonify({"error": "Course not found"}), 404
        print(f"✅ Usuario y curso validados: {user.email} - {course.title}")

        # 📝 Verificar que el schedule pertenezca al curso
        if schedule_id:
            schedule = CourseSchedule.query.filter_by(id=schedule_id, course_id=course_id).first()
            if not schedule:
                print(f"⚠️ Schedule {schedule_id} no pertenece al curso {course_id}, se ignora.")
                schedule_id = None

        # 🧾 CREAR REGISTRO DE COMPRA (Purchase)
        existing_purchase = Purchase.query.filter_by(payment_intent_id=payment_intent_id).first()
        if existing_purchase:
            print(f"⚠️ Compra ya existe en DB: {existing_purchase.id}")
        else:
            new_purchase = Purchase(
                user_id=user_id,
                course_id=course_id,
                payment_intent_id=payment_intent_id,
                amount=amount,
                currency=currency,
                status=status
            )
            db.session.add(new_purchase)
            print("🧾 NUEVA COMPRA CREADA EN DB")

        # 📚 CREAR INSCRIPCIÓN (Enrollment)
        existing_enrollment = Enrollment.query.filter_by(
            student_id=user_id,
            course_id=course_id
        ).first()

        if existing_enrollment:
            print(f"⚠️ Inscripción ya existe en DB: {existing_enrollment.student_id} - {existing_enrollment.course_id}")
        else:
            new_enrollment = Enrollment(
                student_id=user_id,
                course_id=course_id,
                schedule_id=schedule_id,  # 👈 Se guarda el grupo si existe
                enrolled_at=datetime.utcnow()
            )
            db.session.add(new_enrollment)
            print("📝 NUEVA INSCRIPCIÓN CREADA EN DB")

        # 💾 GUARDAR EN DB
        db.session.commit()
        print("✅ COMMIT EXITOSO - Base de datos actualizada")

        # 🔍 VERIFICACIÓN POST-COMMIT
        purchase_check = Purchase.query.filter_by(payment_intent_id=payment_intent_id).first()
        enrollment_check = Enrollment.query.filter_by(
            student_id=user_id,
            course_id=course_id
        ).first()

        print("🔍 VERIFICACIÓN FINAL:")
        print(f"   Compra en DB: {'✅' if purchase_check else '❌'}")
        print(f"   Inscripción en DB: {'✅' if enrollment_check else '❌'}")

        return jsonify({"status": "success"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR CRÍTICO en handle_payment_success: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Processing failed"}), 500
    
@api.route("/upload-video", methods=["POST"])
@jwt_required()
def upload_video():
    """
    🎥 Subir un video a Cloudinary, guardar la grabación y vincular lecciones seleccionadas.
    """
    try:
        if "file" not in request.files:
            return jsonify({"msg": "No se encontró ningún archivo"}), 400

        file = request.files["file"]
        title = request.form.get("title")
        course_id = request.form.get("course_id", type=int)
        schedule_id = request.form.get("schedule_id", type=int)
        lessons = request.form.get("lessons")  # 👈 VIENE COMO STRING JSON

        if not course_id or not title:
            return jsonify({"msg": "Faltan datos: título o curso"}), 400

        teacher_id = get_jwt_identity()

        import io
        upload_result = cloudinary.uploader.upload_large(
            io.BytesIO(file.read()),
            resource_type="video",
            folder=f"allacademy/courses/{course_id}/recordings",
            chunk_size=6_000_000
        )

        # 📌 Crear grabación
        new_recording = Recording(
            course_id=course_id,
            schedule_id=schedule_id,
            teacher_id=teacher_id,
            title=title,
            recording_url=upload_result["secure_url"],
            is_published=False
        )
        db.session.add(new_recording)
        db.session.flush()  # 👈 Necesario para obtener new_recording.id

        # 📌 GUARDAR LECCIONES ASOCIADAS
        if lessons:
            lessons = json.loads(lessons)
            for lesson_id in lessons:
                db.session.add(RecordingLesson(
                    recording_id=new_recording.id,
                    lesson_id=lesson_id
                ))

        db.session.commit()

        return jsonify({
            "msg": "Video subido con éxito",
            "recording": new_recording.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        import traceback; traceback.print_exc()
        return jsonify({"msg": "Error al subir video", "error": str(e)}), 500


@api.route("/cloudinary-signature", methods=["GET"])
@jwt_required()
def get_cloudinary_signature():
    import cloudinary.utils
    import time

    # 📥 leer folder desde query param
    folder = request.args.get("folder", "allacademy/videos")
    timestamp = int(time.time())

    params_to_sign = {
        "timestamp": timestamp,
        "folder": folder
    }

    signature = cloudinary.utils.api_sign_request(
        params_to_sign,
        os.getenv("CLOUDINARY_API_SECRET")
    )

    return jsonify({
        "timestamp": timestamp,
        "signature": signature,
        "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME"),
        "api_key": os.getenv("CLOUDINARY_API_KEY"),
        "folder": folder
    }), 200