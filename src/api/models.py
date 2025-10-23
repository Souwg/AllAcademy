from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum

db = SQLAlchemy()

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
    bio = db.Column(db.Text, nullable=True)
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
    enrollments = db.relationship(
    "Enrollment", back_populates="student", cascade="all, delete-orphan"
)


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
            "bio": self.bio,
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
    scheduled_at = db.Column(db.DateTime, nullable=False)  
    meeting_url = db.Column(db.String(500), nullable=False)
    recording_url = db.Column(db.String(500))  
    schedule_id = db.Column(db.Integer, db.ForeignKey('course_schedule.id'), nullable=True)  # 🆕
    title = db.Column(db.String(200), nullable=True)  # 🆕 título visible de la clase

    course = db.relationship("Course", back_populates="live_classes")
    teacher = db.relationship("User", back_populates="live_classes")
    schedule = db.relationship("CourseSchedule")  # Relación al grupo

    def serialize(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "teacher_id": self.teacher_id,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "meeting_url": self.meeting_url,
            "recording_url": self.recording_url,
            "title": self.title,
            "group_name": self.schedule.group_name if self.schedule else None,
            "course_title": self.course.title if self.course else None,
            "teacher_email": self.teacher.email if self.teacher else None
        }
class Recording(db.Model):
    __tablename__ = "recordings"
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("course.id"), nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey("course_schedule.id"), nullable=True)  # grupo opcional
    teacher_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    recording_url = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    course = db.relationship("Course", backref="recordings")
    schedule = db.relationship("CourseSchedule", backref="recordings")

    def serialize(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "schedule_id": self.schedule_id,
            "teacher_id": self.teacher_id,
            "title": self.title,
            "recording_url": self.recording_url,
            "created_at": self.created_at.isoformat(),
            "lessons": [link.lesson.serialize() for link in self.linked_lessons]  
        }
    
class RecordingLesson(db.Model):
    __tablename__ = "recording_lessons"
    id = db.Column(db.Integer, primary_key=True)
    recording_id = db.Column(db.Integer, db.ForeignKey("recordings.id"), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lesson.id"), nullable=False)

    recording = db.relationship("Recording", backref=db.backref("linked_lessons", cascade="all, delete-orphan"))
    lesson = db.relationship("Lesson", backref="linked_recordings")

    def serialize(self):
        return {
            "id": self.id,
            "recording_id": self.recording_id,
            "lesson_id": self.lesson_id,
            "lesson_title": self.lesson.title if self.lesson else None
        }

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    duration = db.Column(db.String(100))
    short_description = db.Column(db.String(300))  
    price = db.Column(db.Float, nullable=False)
    discount_price = db.Column(db.Float)
    level = db.Column(db.Enum(CourseLevel), default=CourseLevel.BEGINNER)
    language = db.Column(db.String(50), default="English")
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_published = db.Column(db.Boolean, default=False)
    published_at = db.Column(db.DateTime, nullable=True)
    access_duration= db.Column(db.String(50), default="Lifetime")
    has_live_classes = db.Column(db.Boolean, default=False)
    has_recorded_videos = db.Column(db.Boolean, default=False)
    
  
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    modules = db.relationship('Module', backref='course', lazy=True, cascade="all, delete-orphan")
    live_classes = db.relationship("LiveClass", back_populates="course", cascade="all, delete-orphan")
    what_you_learn = db.relationship('LearningObjective', backref='course', lazy=True, cascade="all, delete-orphan")
    requirements = db.relationship('Requirement', backref='course', lazy=True, cascade="all, delete-orphan")
    enrollments = db.relationship(
    "Enrollment", back_populates="course", cascade="all, delete-orphan"
)

    
    def __repr__(self):
        return f'<Course {self.title}>'
    
    def serialize(self):
        schedules_data = [sched.serialize() for sched in self.schedules] if self.schedules else []
        modules_ordered = sorted(self.modules, key=lambda x: x.order) if self.modules else []
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "description": self.description,
            "short_description": self.short_description,    
            "price": self.price,
            "discount_price": self.discount_price,
            "duration": self.duration,
            "level": self.level.value,
            "language": self.language,
            "lastUpdated": self.last_updated.strftime("%B %Y"),
            "access_duration": self.access_duration,
            "teacher_id": self.teacher_id,
            "schedules": schedules_data,
            "instructor": self.teacher.first_name + " " + self.teacher.last_name,
            "instructorBio": self.teacher.bio if self.teacher else "",
            "lessons": sum(len(module.lessons) for module in self.modules),
            "what_you_learn": [obj.objective for obj in self.what_you_learn],
            "requirements": [req.requirement for req in self.requirements],
            "modules": [module.serialize() for module in modules_ordered],
            "recordedVideos": self.has_recorded_videos,
            "is_published": self.is_published,
            "published_at": self.published_at.isoformat() if self.published_at else None
        
        }
    
class CourseSchedule(db.Model):
    __tablename__ = "course_schedule"
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    day_of_week = db.Column(db.String(50), nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    timezone = db.Column(db.String(50), default="GMT-5")
    group_name = db.Column(db.String(100), nullable=True)  # Ej: "Grupo A", "Grupo B"

    course = db.relationship("Course", backref=db.backref("schedules", cascade="all, delete-orphan"))

    def serialize(self):
        from .models import Enrollment  

        total_students = Enrollment.query.filter_by(schedule_id=self.id).count()
        return {
            "id": self.id,
            "day_of_week": self.day_of_week,
            "start_time": self.start_time.strftime("%H:%M"),
            "end_time": self.end_time.strftime("%H:%M"),
            "timezone": self.timezone,
            "group_name": self.group_name,
            "total_students": total_students
        }


class Module(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    order = db.Column(db.Integer, nullable=False)
    

    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    

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
    content = db.Column(db.Text)
    video_url = db.Column(db.String(500))
    order = db.Column(db.Integer, nullable=False)
    
 
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'), nullable=False)
    
    def __repr__(self):
        return f'<Lesson {self.title}>'
    
    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "video_url": self.video_url,
            "order": self.order,
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

class BlockedTokenList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(50), unique=True, nullable=False)

class Enrollment(db.Model):
    __tablename__ = "student_course"

    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), primary_key=True)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    progress = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)

    
    schedule_id = db.Column(db.Integer, db.ForeignKey('course_schedule.id'), nullable=True)

    
    student = db.relationship("User", back_populates="enrollments")
    course = db.relationship("Course", back_populates="enrollments")
    schedule = db.relationship("CourseSchedule")  

    def __repr__(self):
        return f"<Enrollment User {self.student_id} in Course {self.course_id} - Schedule {self.schedule_id}>"

    def serialize(self):
        return {
            "student_id": self.student_id,
            "course_id": self.course_id,
            "enrolled_at": self.enrolled_at.isoformat(),
            "progress": self.progress,
            "completed": self.completed,
            "schedule": self.schedule.serialize() if self.schedule else None
        }

    
class CourseChatMessage(db.Model):
    __tablename__ = "course_chat_messages"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    schedule_id = db.Column(db.Integer, db.ForeignKey('course_schedule.id'), nullable=True)

    # Relaciones
    user = db.relationship("User", backref="chat_messages", lazy=True)
    course = db.relationship("Course", backref="chat_messages", lazy=True)
    schedule = db.relationship("CourseSchedule") 

    def serialize(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "user_id": self.user_id,
            "user_name": f"{self.user.first_name} {self.user.last_name}" if self.user else "Unknown",
            "user_role": self.user.role if self.user else "unknown",
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "schedule_id": self.schedule_id
            
        }
    
class PrivateChatMessage(db.Model):
    __tablename__ = "private_chat_messages"   # 👈 nombre claro y consistente

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relaciones opcionales
    sender = db.relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    receiver = db.relationship("User", foreign_keys=[receiver_id], backref="received_messages")

    def serialize(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "sender_name": f"{self.sender.first_name} {self.sender.last_name}" if self.sender else "Unknown",
            "receiver_name": f"{self.receiver.first_name} {self.receiver.last_name}" if self.receiver else "Unknown",
            "content": self.content,
            "timestamp": self.timestamp.isoformat()
        }
