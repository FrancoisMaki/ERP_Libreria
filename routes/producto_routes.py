from flask import Blueprint, jsonify, request
from models.db import get_connection
from utils.auth import login_required_api

producto_bp = Blueprint('producto', __name__)

@producto_bp.route('/productos/', methods=['GET'])
@login_required_api
def listar_productos():
    page = int(request.args.get('pagina', 1))
    per_page = int(request.args.get('por_pagina', 1000))
    offset = (page - 1) * per_page

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT isbn, titulo, precio, stock, fecha_publicacion, estado, imagen_url FROM producto LIMIT %s OFFSET %s", (per_page, offset))
        productos = cursor.fetchall()
        return jsonify({"productos": productos})
    except Exception as e:
        print(f"❌ Error al consultar productos: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close() 

@producto_bp.route('/productos/buscar', methods=['GET'])
def buscar_productos():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({"productos": []})
    conn = get_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT isbn, titulo, precio, stock, fecha_publicacion, estado, imagen_url
            FROM producto
            WHERE isbn LIKE %s OR titulo LIKE %s
            LIMIT 10
        """, (f"%{q}%", f"%{q}%"))
        productos = cursor.fetchall()
        return jsonify({"productos": productos})
    finally:
        cursor.close()
        conn.close()