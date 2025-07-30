from flask import Blueprint, render_template

compras_views = Blueprint('compras_views', __name__)

@compras_views.route('/compras')
def compras_listado():
    return render_template('cliente/listado_compras.html')

@compras_views.route('/compras/<int:id_cabcompra>')
def compra_detalle(id_cabcompra):
    return render_template('cliente/detalle_compra.html')