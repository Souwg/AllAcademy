from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum

db = SQLAlchemy()

# Tabla de asociación para la relación muchos-a-muchos entre cursos y estudiantes
student_course_association = db.Table('student_course',
    db.Column('student_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('course.id'), primary_key=True),
    db.Column('enrolled_at', db.DateTime, default=datetime.utcnow),
    db.Column('progress', db.Integer, default=0),  # Porcentaje de completitud
    db.Column('completed', db.Boolean, default=False),
    db.Column('completed_at', db.DateTime, nullable=True)
)

# Tabla de asociación para la relación muchos-a-muchos entre cursos y wishlist
wishlist_association = db.Table('wishlist',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('course.id'), primary_key=True),
    db.Column('added_at', db.DateTime, default=datetime.utcnow)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)  
    first_name = db.Column(db.String(50), nullable=False)  
    last_name = db.Column(db.String(50), nullable=False) 
    image_url = db.Column(db.String(250), nullable=True)
    country = db.Column(db.String(2), nullable=False)
    id_number = db.Column(db.String(20), nullable=False)
    is_active = db.Column(db.Boolean(), default=True, nullable=False)
    is_admin = db.Column(db.Boolean(), default=False)
    role = db.Column(db.String(20), default='student', nullable=False) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    is_blocked = db.Column(db.Boolean(), default=False)
    block_reason = db.Column(db.String(255))
    block_count = db.Column(db.Integer, default=0)
    
    # Relaciones
    courses_teaching = db.relationship('Course', backref='teacher', lazy=True)
    live_classes = db.relationship("LiveClass", back_populates="teacher")
    enrolled_courses = db.relationship('Course', secondary=student_course_association, 
                                      backref=db.backref('students', lazy='dynamic'))
    wishlist = db.relationship('Course', secondary=wishlist_association, 
                              backref=db.backref('wished_by', lazy='dynamic'))
    
    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "image": self.image_url,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "country": self.country,
            "id_number": self.id_number,
            "is_active": self.is_active,  
            "is_admin": self.is_admin,
            "role": self.role,
            "is_blocked": self.is_blocked,
            "block_reason": self.block_reason,
            "block_count": self.block_count,
            "created_at": self.created_at.isoformat(),
            "last_login": self.last_login.isoformat() if self.last_login else None
        }

class CourseLevel(enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
class LiveClass(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    scheduled_at = db.Column(db.DateTime, nullable=False)  # fecha y hora
    duration = db.Column(db.Integer)  # en minutos
    meeting_url = db.Column(db.String(500), nullable=False)
    recording_url = db.Column(db.String(500))  # si queda grabada

    # relationships
    course = db.relationship("Course", back_populates="live_classes")
    teacher = db.relationship("User", back_populates="live_classes")

    def __repr__(self):
        return f'<LiveClass {self.id} for Course {self.course_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "teacher_id": self.teacher_id,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "duration": self.duration,
            "meeting_url": self.meeting_url,
            "recording_url": self.recording_url,
            # opcional si quieres mostrar también
            "course_title": self.course.title if self.course else None,
            "teacher_email": self.teacher.email if self.teacher else None
        }

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    short_description = db.Column(db.String(300))  
    alt_text = db.Column(db.String(200))
    price = db.Column(db.Float, nullable=False)
    discount_price = db.Column(db.Float)
    level = db.Column(db.Enum(CourseLevel), default=CourseLevel.BEGINNER)
    language = db.Column(db.String(50), default="English")
    certificate_available = db.Column(db.Boolean, default=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_published = db.Column(db.Boolean, default=False)
    published_at = db.Column(db.DateTime, nullable=True)
    
    # Claves foráneas
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relaciones
    modules = db.relationship('Module', backref='course', lazy=True, cascade="all, delete-orphan")
    live_classes = db.relationship("LiveClass", back_populates="course", cascade="all, delete-orphan")
    reviews = db.relationship('Review', backref='course', lazy=True, cascade="all, delete-orphan")
    what_you_learn = db.relationship('LearningObjective', backref='course', lazy=True, cascade="all, delete-orphan")
    requirements = db.relationship('Requirement', backref='course', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Course {self.title}>'
    
    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "description": self.description,
            "short_description": self.short_description,    
            "alt": self.alt_text,
            "price": self.price,
            "discountPrice": self.discount_price,
            "level": self.level.value,
            "language": self.language,
            "certificate": self.certificate_available,
            "lastUpdated": self.last_updated.strftime("%B %Y"),
            "instructor": self.teacher.first_name + " " + self.teacher.last_name,
            "lessons": sum(len(module.lessons) for module in self.modules),
            "whatYouLearn": [obj.objective for obj in self.what_you_learn],
            "requirements": [req.requirement for req in self.requirements],
            "curriculum": [module.serialize() for module in self.modules]
        }

class Module(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    order = db.Column(db.Integer, nullable=False)
    
    # Claves foráneas
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    
    # Relaciones
    lessons = db.relationship('Lesson', backref='module', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Module {self.title}>'
    
    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "order": self.order,
            "lessons": [lesson.serialize() for lesson in self.lessons]
        }


class Lesson(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    content = db.Column(db.Text)  # Puede ser texto, HTML, o referencia a video
    video_url = db.Column(db.String(500))
    duration = db.Column(db.Integer)  # Duración en minutos
    order = db.Column(db.Integer, nullable=False)
    is_preview = db.Column(db.Boolean, default=False)
    
    # Claves foráneas
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'), nullable=False)
    
    def __repr__(self):
        return f'<Lesson {self.title}>'
    
    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "content": self.content,
            "video_url": self.video_url,
            "duration": self.duration,
            "order": self.order,
            "is_preview": self.is_preview
        }

class LearningObjective(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    objective = db.Column(db.String(300), nullable=False)
    
    # Claves foráneas
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    
    def __repr__(self):
        return f'<LearningObjective {self.objective[:50]}...>'

class Requirement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    requirement = db.Column(db.String(300), nullable=False)
    
    # Claves foráneas
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    
    def __repr__(self):
        return f'<Requirement {self.requirement[:50]}...>'

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Claves foráneas
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    
    def __repr__(self):
        return f'<Review {self.rating} by {self.user_id}>'

class BlockedTokenList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(50), unique=True, nullable=False)