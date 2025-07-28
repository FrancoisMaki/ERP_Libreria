from flask import Blueprint, render_template, request, redirect, url_for, session
from werkzeug.security import check_password_hash
from models.db import get_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        nombre_usuario = request.form['nombre_usuario']
        contraseña = request.form['contraseña']
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuario WHERE nombre_usuario = %s AND activo = TRUE", (nombre_usuario,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        if user and check_password_hash(user['contraseña_hash'], contraseña):
            session['usuario_id'] = user['id_usuario']
            session['nombre_usuario'] = user['nombre_usuario']
            session['rol'] = user['rol']
            session['nombre'] = user['nombre_usuario']
            return redirect(url_for('cliente.mostrar_paises'))
        else:
            error = "Usuario o contraseña incorrectos"
    return render_template('login.html', error=error)

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return redirect(url_for('auth.login'))