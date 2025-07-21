from flask import Flask
from routes.cliente_routes import cliente_bp
from routes.pais_routes import pais_bp

app = Flask(__name__)

# Registrar Blueprints
app.register_blueprint(cliente_bp, url_prefix='/cliente')
app.register_blueprint(pais_bp, url_prefix='/cliente')  # mismo prefijo para mantener API en mismo espacio

if __name__ == "__main__":
    app.run(debug=True)
