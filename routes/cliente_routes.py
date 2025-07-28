from flask import Blueprint, render_template
from utils.auth import login_required

cliente_bp = Blueprint('cliente', __name__, template_folder='../templates')

@cliente_bp.route('/paises')
@login_required
def mostrar_paises():
    return render_template('cliente/paises.html', css_file='css/mantenimientos.css')
