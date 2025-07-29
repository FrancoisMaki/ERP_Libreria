from flask import Flask, render_template
from routes.mantenimiento_routes import mantenimiento_bp
from routes.pais_routes import pais_bp
from routes.provincia_routes import provincia_bp
from routes.poblacion_routes import poblacion_bp
from routes.codigo_postal_routes import codigo_postal_bp
from routes.cliente_routes import cliente_bp
from routes.empresa_routes import empresa_bp
from routes.proveedor_routes import proveedor_bp
from routes.categoria_routes import categoria_bp   
from routes.autor_routes import autor_bp 
from routes.moneda_routes import moneda_bp
from routes.factura_routes import factura_bp
from routes.producto_routes import producto_bp
from routes.auth_routes import auth_bp
from utils.auth import login_required
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY")

# Registrar Blueprints de API
app.register_blueprint(mantenimiento_bp, url_prefix='/cliente')   # (¿debería ser '/api/mantenimiento'?)
app.register_blueprint(pais_bp, url_prefix='/api') 
app.register_blueprint(provincia_bp, url_prefix='/api') 
app.register_blueprint(poblacion_bp, url_prefix='/api')
app.register_blueprint(codigo_postal_bp, url_prefix='/api')
app.register_blueprint(cliente_bp, url_prefix='/api')
app.register_blueprint(empresa_bp, url_prefix='/api')
app.register_blueprint(proveedor_bp, url_prefix='/api')
app.register_blueprint(categoria_bp, url_prefix='/api')
app.register_blueprint(autor_bp, url_prefix='/api')
app.register_blueprint(moneda_bp, url_prefix='/api')
app.register_blueprint(factura_bp, url_prefix='/api')
app.register_blueprint(producto_bp, url_prefix='/api')

app.register_blueprint(auth_bp)

# Rutas de vistas principales
@app.route('/')
@login_required
def index():
    return render_template('index.html', css_file='css/index.css')

@app.route('/paises')
def paises():
    return render_template('cliente/paises.html', css_file='css/mantenimientos.css')

@app.route('/provincias')
def provincias():
    return render_template('cliente/provincias.html', css_file='css/mantenimientos.css')  

@app.route('/poblaciones')
def poblaciones():
    return render_template('cliente/poblaciones.html', css_file='css/mantenimientos.css')

@app.route('/codigos_postales')
def codigos_postales():
    return render_template('cliente/codigos_postales.html', css_file='css/mantenimientos.css')

@app.route('/clientes')
def clientes():
    return render_template('cliente/clientes.html', css_file='css/mantenimientos.css')

@app.route('/empresas')
def empresas():
    return render_template('cliente/empresas.html', css_file='css/mantenimientos.css')

@app.route('/proveedores')
def proveedores():
    return render_template('cliente/proveedores.html', css_file='css/mantenimientos.css')

@app.route('/categorias')
def categorias():
    return render_template('cliente/categorias.html', css_file='css/mantenimientos.css')

@app.route('/autores')
def autores():
    return render_template('cliente/autores.html', css_file='css/mantenimientos.css')

@app.route('/monedas')
def monedas():
    return render_template('cliente/monedas.html', css_file='css/mantenimientos.css')

@app.route('/facturas')
def facturas():
    return render_template('cliente/facturas.html', css_file='css/factura.css')

@app.route('/factura_detalle/<int:id_cabfac>')
def factura_detalle(id_cabfac):
    return render_template('cliente/factura_detalle.html', id_cabfac=id_cabfac, css_file='css/factura.css')

if __name__ == "__main__":
    app.run(debug=True)