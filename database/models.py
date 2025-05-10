from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database.database import Base
import datetime
from uuid import uuid4

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)  # Hashed password
    university_id = Column(Integer, ForeignKey('universities.id'))
    profile_picture = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    join_date = Column(DateTime, default=datetime.datetime.now)
    is_premium = Column(Boolean, default=False)
    
    # Relationships
    university = relationship('University', back_populates='users')
    study_materials = relationship('StudyMaterial', back_populates='user')
    bookmarks = relationship('Bookmark', back_populates='user')
    comments = relationship('Comment', back_populates='user')
    ratings = relationship('Rating', back_populates='user')
    reports = relationship('Report', back_populates='user')

    def __repr__(self):
        return f'<User {self.username}>'

class University(Base):
    __tablename__ = 'universities'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    country = Column(String(50), nullable=False)
    website = Column(String(255), nullable=True)
    
    # Relationships
    users = relationship('User', back_populates='university')
    courses = relationship('Course', back_populates='university')
    
    def __repr__(self):
        return f'<University {self.name}>'

class Course(Base):
    __tablename__ = 'courses'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)
    university_id = Column(Integer, ForeignKey('universities.id'))
    popularity = Column(Integer, default=0)  # Calculated based on material views/downloads
    
    # Relationships
    university = relationship('University', back_populates='courses')
    study_materials = relationship('StudyMaterial', back_populates='course')
    
    def __repr__(self):
        return f'<Course {self.code}: {self.name}>'

class StudyMaterial(Base):
    __tablename__ = 'study_materials'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    course_id = Column(Integer, ForeignKey('courses.id'))
    file_path = Column(String(255), nullable=False)
    material_type = Column(String(20), nullable=False)  # 'notes', 'exam', 'assignment', etc.
    upload_date = Column(DateTime, default=datetime.datetime.now)
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    
    # Relationships
    user = relationship('User', back_populates='study_materials')
    course = relationship('Course', back_populates='study_materials')
    bookmarks = relationship('Bookmark', back_populates='study_material')
    comments = relationship('Comment', back_populates='study_material')
    ratings = relationship('Rating', back_populates='study_material')
    reports = relationship('Report', back_populates='study_material')

    def __repr__(self):
        return f'<StudyMaterial {self.title}>'

### New Models ###

class Rating(Base):
    __tablename__ = 'ratings'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    study_material_id = Column(Integer, ForeignKey('study_materials.id'), nullable=False)
    rating = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.now)

    # Relationships
    user = relationship('User', back_populates='ratings')
    study_material = relationship('StudyMaterial', back_populates='ratings')

    def __repr__(self):
        return f"<Rating {self.rating} by User {self.user_id}>"

class Bookmark(Base):
    __tablename__ = 'bookmarks'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    study_material_id = Column(Integer, ForeignKey('study_materials.id'), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.now)

    # Relationships
    user = relationship('User', back_populates='bookmarks')
    study_material = relationship('StudyMaterial', back_populates='bookmarks')

    def __repr__(self):
        return f"<Bookmark User {self.user_id} - Material {self.study_material_id}>"

class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    study_material_id = Column(Integer, ForeignKey('study_materials.id'), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.now)

    # Relationships
    user = relationship('User', back_populates='comments')
    study_material = relationship('StudyMaterial', back_populates='comments')

    def __repr__(self):
        return f"<Comment by User {self.user_id}>"

class Report(Base):
    __tablename__ = 'reports'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    study_material_id = Column(Integer, ForeignKey('study_materials.id'), nullable=False)
    reason = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.now)

    # Relationships
    user = relationship('User', back_populates='reports')
    study_material = relationship('StudyMaterial', back_populates='reports')

    def __repr__(self):
        return f"<Report by User {self.user_id} - Reason: {self.reason}>"


class Quiz(Base):
    __tablename__ = 'quizzes'

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False)
    quiz_code = Column(String(36), unique=True, nullable=False, default=lambda: str(uuid4()))
    questions = relationship('Question', backref='quiz', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Quiz {self.title}>"

class Question(Base):
    __tablename__ = 'questions'

    id = Column(Integer, primary_key=True)
    text = Column(String(500), nullable=False)
    question_type = Column(String(50), nullable=False) # 'text', 'mcq', 'fill_blank'
    answer = Column(String(255))  # Correct answer (for text and fill_blank, or correct option for mcq)
    options = Column(Text, nullable=True) # Store MCQ options as a delimited string or JSON
    quiz_id = Column(Integer, ForeignKey('quizzes.id'), nullable=False)

    def __repr__(self):
        return f"<Question {self.text}>"
