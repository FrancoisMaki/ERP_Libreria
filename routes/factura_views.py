from flask import Blueprint, render_template

factura_views_bp = Blueprint('factura_views', __name__)

@factura_views_bp.route('/facturas/<int:id_cabfac>')
def detalle_factura_vista(id_cabfac):
    return render_template('cliente/factura_detalle.html')