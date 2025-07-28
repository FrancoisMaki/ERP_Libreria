from flask import Flask, render_template
from routes.cliente_routes import cliente_bp
from routes.pais_routes import pais_bp
from routes.auth_routes import auth_bp
from utils.auth import login_required
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY")

# Registrar Blueprints
app.register_blueprint(cliente_bp, url_prefix='/cliente') 
app.register_blueprint(pais_bp, url_prefix='/api') 
app.register_blueprint(auth_bp)

@app.route('/')
@login_required
def index():
    return render_template('index.html', css_file='css/index.css')

@app.route('/paises')
def paises():
    return render_template('cliente/paises.html', css_file='css/mantenimientos.css')

if __name__ == "__main__":
    app.run(debug=True)