import os
from flask_admin import Admin
from .models import db, User, BlockedTokenList, Course, Module, Lesson, LearningObjective, Requirement, Enrollment, CourseChatMessage, PrivateChatMessage, CourseSchedule, Recording, RecordingLesson,Purchase, Assignment, AssignmentSubmission
from flask_admin.contrib.sqla import ModelView

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='Allcademy Course Online')

    
    # Add your models here
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(BlockedTokenList, db.session))
    admin.add_view(ModelView(Course, db.session))
    admin.add_view(ModelView(CourseSchedule, db.session)),
    admin.add_view(ModelView(Recording, db.session)),
    admin.add_view(ModelView(RecordingLesson, db.session)),
    admin.add_view(ModelView(Module, db.session))
    admin.add_view(ModelView(Lesson, db.session))
    admin.add_view(ModelView(LearningObjective, db.session))
    admin.add_view(ModelView(Requirement, db.session))
    admin.add_view(ModelView(Enrollment, db.session))
    admin.add_view(ModelView(Purchase, db.session))
    admin.add_view(ModelView(Assignment, db.session))
    admin.add_view(ModelView(AssignmentSubmission, db.session))
    admin.add_view(ModelView(CourseChatMessage, db.session))
    admin.add_view(ModelView(PrivateChatMessage, db.session))

    # You can duplicate that line to add new models
    # admin.add_view(ModelView(YourModelName, db.session))