import os
import uuid
import hashlib
import datetime
import logging
from logging.handlers import RotatingFileHandler
from functools import wraps

from flask import Flask, render_template, request, redirect, url_for, flash, session, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.utils import secure_filename


# Initialize Flask app
app = Flask(__name__)

# Load configuration from config.py
app.config.from_pyfile('config.py')

# Additional configurations
app.config.update(
    UPLOAD_FOLDER=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads'),
    MAX_CONTENT_LENGTH=16 * 1024 * 1024,
    ALLOWED_EXTENSIONS={'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'}
)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Logging setup
if not os.path.exists('logs'):
    os.mkdir('logs')
file_handler = RotatingFileHandler('logs/examelite.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('ExamElite startup')

# Database setup
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# MODELS
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    universities_id = db.Column(db.Integer, db.ForeignKey('universities.id'))
    join_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    materials = db.relationship('StudyMaterial', backref='author', lazy=True)
    # renamed relationship to match template usage: user.university
    university = db.relationship('Universities', backref='users')

class Universities(db.Model):
    __tablename__ = 'universities'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200))
    courses = db.relationship('Course', backref='universities', lazy=True)

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(20))
    universities_id = db.Column(db.Integer, db.ForeignKey('universities.id'))
    popularity = db.Column(db.Integer, default=0)
    materials = db.relationship('StudyMaterial', backref='course', lazy=True)

class StudyMaterial(db.Model):
    __tablename__ = 'study_materials'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    file_path = db.Column(db.String(500), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'))
    material_type = db.Column(db.String(50), nullable=False) # Added missing field
    rating = db.Column(db.Float, default=0)
    download_count = db.Column(db.Integer, default=0)
    view_count = db.Column(db.Integer, default=0)

# MODELS - Quiz and Question
class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    quiz_code = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Quiz {self.title}>"

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    answer = db.Column(db.String(255))  # Correct answer
    options = db.Column(db.Text, nullable=True) # Column to store MCQ options
    question_type = db.Column(db.String(50), nullable=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)

    def __repr__(self):
        return f"<Question {self.text}>"

# HELPERS
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def get_current_user():
    if 'user_id' in session:
        return User.query.get(session['user_id'])
    return None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# ROUTES
@app.route('/')
def index():
    user = get_current_user() # Get user if logged in, otherwise None

    # Fetch 5 most recently uploaded PDF materials
    try:
        # Assuming StudyMaterial model is imported and db session is available
        # Need to import desc from sqlalchemy if not already done
        from sqlalchemy import desc

        recent_pdfs = db.session.query(StudyMaterial).filter(
            StudyMaterial.file_path.ilike('%.pdf') # Ensure it's a PDF (case-insensitive)
        ).order_by(
            desc(StudyMaterial.upload_date) # Order by newest first
        ).limit(5).all() # Get the latest 5
    except Exception as e:
        app.logger.error(f"Error fetching recent PDFs: {e}")
        recent_pdfs = [] # Default to empty list on error

    # Render index template, passing user and recent_pdfs
    # This route is now accessible to logged-out users as well
    return render_template('index.html', user=user, recent_materials=recent_pdfs)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            flash('Please enter both email and password.', 'danger')
            return render_template('login.html')

        user = User.query.filter_by(email=email).first()
        if user and user.password == hashlib.sha256(password.encode()).hexdigest():
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Welcome back!', 'success')
            return redirect(url_for('dashboard'))

        flash('Invalid email or password.', 'danger')

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        # match the <select name="university"> in register.html
        universities_id = request.form.get('university')

        if not all([username, email, password, confirm_password, universities_id]):
            flash('All fields are required.', 'danger')
        elif password != confirm_password:
            flash('Passwords do not match.', 'danger')
        elif User.query.filter_by(email=email).first():
            flash('Email already registered.', 'danger')
        else:
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
            new_user = User(
                username=username,
                email=email,
                password=hashed_password,
                universities_id=universities_id
            )
            db.session.add(new_user)
            db.session.commit()
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('login'))

    universities = Universities.query.all()
    return render_template('register.html', universities=universities)

@app.route('/dashboard')
@login_required
def dashboard():
    user = get_current_user()
    user_materials = StudyMaterial.query.filter_by(user_id=user.id).order_by(StudyMaterial.upload_date.desc()).all()
    recommended_materials = StudyMaterial.query.filter(
        StudyMaterial.user_id != user.id,
        StudyMaterial.course_id.in_(
            [c.id for c in Course.query.filter_by(universities_id=user.universities_id)]
        )
    ).order_by(StudyMaterial.rating.desc()).limit(6).all()
    quizzes = Quiz.query.all() # Fetch all quizzes

    return render_template('dashboard.html',
                           user=user,
                           materials=user_materials,
                           recommended=recommended_materials,
                           quizzes=quizzes) # Pass quizzes to the template

@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        course_id = request.form.get('course')
        material_type = request.form.get('material_type') # Get material type
        file = request.files.get('file')

        if not all([title, description, course_id, file]):
            flash('All fields are required.', 'danger')
        elif not file or not allowed_file(file.filename):
            flash('Invalid file type.', 'danger')
        else:
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))

            material = StudyMaterial(
                title=title,
                description=description,
                file_path=unique_filename,
                user_id=session['user_id'],
                course_id=course_id,
                material_type=material_type # Add material type here
            )
            db.session.add(material)
            db.session.commit()

            flash('Material uploaded successfully!', 'success')
            return redirect(url_for('dashboard'))

    courses = Course.query.all()
    return render_template('upload.html', courses=courses)

@app.route('/material/<int:material_id>')
@login_required
def view_material(material_id):
    material = StudyMaterial.query.get_or_404(material_id)
    material.view_count += 1
    db.session.commit()
    return render_template('material_details.html', material=material)

@app.route('/download/<int:material_id>')
@login_required
def download_material(material_id):
    material = StudyMaterial.query.get_or_404(material_id)
    material.download_count += 1
    db.session.commit()
    return send_file(
        os.path.join(app.config['UPLOAD_FOLDER'], material.file_path),
        as_attachment=True,
        download_name=material.title + os.path.splitext(material.file_path)[1]
    )

@app.route('/search')
@login_required
def search():
    query = request.args.get('q', '')
    filter_by = request.args.get('filter', 'all')

    if query:
        base_query = StudyMaterial.query
        if filter_by == 'course':
            base_query = base_query.join(Course).filter(Course.name.ilike(f'%{query}%'))
        elif filter_by == 'universities':
            base_query = base_query.join(Course).join(Universities).filter(
                Universities.name.ilike(f'%{query}%')
            )
        else:
            base_query = base_query.filter(
                db.or_(
                    StudyMaterial.title.ilike(f'%{query}%'),
                    StudyMaterial.description.ilike(f'%{query}%'),
                    Course.name.ilike(f'%{query}%')
                )
            )
        materials = base_query.order_by(StudyMaterial.rating.desc()).all()
    else:
        materials = []

    return render_template('search.html', materials=materials, query=query, filter_by=filter_by)

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('login'))

@app.route('/profile')
@login_required
def profile():
    user = get_current_user()
    return render_template('profile.html', user=user)

@app.route('/create-quiz', methods=['GET', 'POST'])
@login_required
def create_quiz():
    if request.method == 'POST':
        title = request.form.get('quiz_title')
        course_id = request.form.get('course')

        new_quiz = Quiz(title=title, course_id=course_id)
        db.session.add(new_quiz)
        db.session.flush()

        question_count = int(request.form.get('question_count', 0))
        for i in range(1, question_count + 1):
            question_text = request.form.get(f'question_{i}')
            question_type = request.form.get(f'question_{i}_type') # Assuming you add a hidden input for type
            answer = request.form.get(f'answer_{i}')
            options = None

            if question_type == 'mcq':
                # Collect MCQ options
                option_list = []
                for j in range(1, 5): # Assuming max 4 options
                    option_text = request.form.get(f'question_{i}_option_{j}')
                    if option_text:
                        option_list.append(option_text)
                options = ';;'.join(option_list) # Store options as a delimited string
                # For MCQ, the answer is the selected option's letter (A, B, C, D) - ensure this matches frontend

            if question_text and answer:
                options_str = ';;'.join([request.form.get(f'question_{i}_option_{j}') for j in range(1, 5) if request.form.get(f'question_{i}_option_{j}')]) if question_type == 'mcq' else None
                question = Question(text=question_text, question_type=question_type, answer=answer, quiz_id=new_quiz.id)
                question.options = options_str
                db.session.add(question)
        db.session.commit()

        flash(f'Quiz created successfully! Quiz Code: {new_quiz.quiz_code}', 'success')
        return redirect(url_for('dashboard'))

    courses = Course.query.all()
    return render_template('quiz.html', courses=courses)


@app.route('/take_quiz/<int:quiz_id>', methods=['GET', 'POST'])
@login_required
def take_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    questions = quiz.questions

    if request.method == 'POST':
        answers = {}
        for question in questions:
            user_answer = request.form.get(f'answer_{question.id}')
            answers[question.id] = user_answer

        score = 0
        for question_id, user_answer in answers.items():
            question = Question.query.get(question_id)
            if question:
                if question.question_type == 'mcq':
                    if question.answer.lower() == user_answer.lower(): # Case-insensitive comparison
                        score += 1
                elif question.question_type == 'fill_blank':
                    if question.answer.lower() == user_answer.lower(): # Case-insensitive comparison
                        score += 1
                else:
                    if question.answer.lower() == user_answer.lower(): # Case-insensitive comparison
                        score += 1

        flash(f'Quiz submitted! Your score: {score} / {len(questions)}', 'success')
        return redirect(url_for('dashboard'))

    return render_template('quiz_interface.html', quiz=quiz, questions=questions, enumerate=enumerate)

@app.route('/enter_quiz_code', methods=['GET', 'POST'])
@login_required
def enter_quiz_code():
    if request.method == 'POST':
        quiz_code = request.form.get('quiz_code')
        quiz = Quiz.query.filter_by(quiz_code=quiz_code).first()

        if quiz:
            return redirect(url_for('take_quiz', quiz_id=quiz.id))
        else:
            flash('Invalid quiz code.', 'error')
            return render_template('enter_quiz_code.html') # Create an HTML file for this

    return render_template('enter_quiz_code.html')

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f'Server Error: {error}')
    return render_template('errors/500.html'), 500

@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404

def init_db():
    with app.app_context():
        # Temporarily drop the questions table to recreate it with the new column
        # BE CAREFUL: This will delete all existing quiz questions!
        try:
            Question.__table__.drop(db.engine)
            print("Dropped questions table.")
        except Exception as e:
            print(f"Error dropping questions table: {e}")

        db.create_all()
        print("Created all tables.")

        if not Universities.query.first():
            default_universities = Universities(name="Default Universities", location="Default Location")
            db.session.add(default_universities)
            db.session.commit()
            print("Added default university.")

if __name__ == '__main__':
    init_db()
    app.config['DEBUG'] = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(debug=True, use_reloader=True)