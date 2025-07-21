from flask import Blueprint, render_template

cliente_bp = Blueprint('cliente', __name__, template_folder='../templates')

@cliente_bp.route('/paises')
def mostrar_paises():
    return render_template('cliente/paises.html')
