Django Project
Overview
This is a Django-based backend project.
Prerequisites
Before running the project, make sure you have:
Python 3.x installed
Git installed
pip (Python package manager)
Installation
1. Clone the repository
git clone <repository-url> cd <project-folder> 
2. Create a virtual environment
Windows
python -m venv venv 
Linux / macOS
python3 -m venv venv 
3. Activate the virtual environment
Windows
venv\Scripts\activate 
Linux / macOS
source venv/bin/activate 
4. Install project dependencies
pip install -r requirements.txt 
Database Setup
Apply database migrations:
python manage.py migrate 
Run the Development Server
Start the Django development server:
python manage.py runserver 
The application will be available at:
http://127.0.0.1:8000/ 
Notes
The virtual environment (venv) is not included in the repository.
All required Python packages are listed in requirements.txt.
If you add new dependencies, update the requirements file using:
pip freeze > requirements.txt
