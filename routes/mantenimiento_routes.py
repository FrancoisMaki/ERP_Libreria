from flask import Blueprint, render_template
from utils.auth import login_required

mantenimiento_bp = Blueprint('mantenimiento', __name__, template_folder='../templates')

@mantenimiento_bp.route('/paises')
@login_required
def mostrar_paises():
    return render_template('cliente/paises.html', css_file='css/mantenimientos.css')
