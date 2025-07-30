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
from routes.nota_credito_routes import nota_credito_bp
from routes.compra_routes import compra_bp
from routes.almacen_route import almacen_bp
from routes.compras_views import compras_views

from routes.auth_routes import auth_bp
from utils.auth import login_required
from datetime import date

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
app.register_blueprint(nota_credito_bp, url_prefix='/api')
app.register_blueprint(compra_bp, url_prefix='/api')
app.register_blueprint(almacen_bp, url_prefix='/api')
app.register_blueprint(compras_views, url_prefix='/cliente')

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

@app.route('/notas_credito')
def notas_credito():
    return render_template('cliente/notas_credito.html', css_file='css/factura.css')

@app.route('/nota_credito_nueva')
def nota_credito_nueva():
    from datetime import date
    return render_template('cliente/nota_credito_nueva.html', fecha_hoy=date.today().isoformat(), css_file='css/factura.css')

@app.route('/compras/nueva')
def nueva_compra():
    from datetime import date
    return render_template('cliente/nueva_compra.html', fecha_hoy=date.today().isoformat(), css_file='css/compras.css')

@app.route('/compras')
def compras_listado():
    return render_template("cliente/listado_compras.html", css_file='css/compras.css')

@app.route('/compras/<int:id_cabcompra>')
def compra_detalle(id_cabcompra):
    return render_template('cliente/detalle_compra.html', id_cabcompra=id_cabcompra, css_file='css/compras.css')

@app.route('/almacenes')
def almacenes():
    return render_template('cliente/almacenes.html', css_file='css/mantenimientos.css')

@app.route('/productos')
def productos():
    return render_template('cliente/productos.html', css_file='css/productos.css')

@app.route('/producto_detalle/<string:isbn>')
def producto_detalle(isbn):
    return render_template('cliente/producto_detalle.html', isbn=isbn, css_file='css/productos.css')

@app.route('/producto_nuevo')
def producto_nuevo():
    return render_template('cliente/producto_nuevo.html', css_file='css/productos.css')

@app.route('/producto_editar/<string:isbn>')
def producto_editar(isbn):
    return render_template('cliente/producto_editar.html', isbn=isbn, css_file='css/productos.css')

@app.route('/almacen')
def almacen():
    return render_template('cliente/almacen.html', css_file='css/almacen.css')

if __name__ == "__main__":
    app.run(debug=True)