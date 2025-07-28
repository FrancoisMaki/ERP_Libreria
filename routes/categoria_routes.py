from flask import Blueprint, jsonify, request
from models.db import get_connection
from utils.auth import login_required_api

categoria_bp = Blueprint('categoria', __name__)

@categoria_bp.route('/categorias/', methods=['GET'])
@login_required_api
def api_categorias():
    page = int(request.args.get('pagina', 1))
    per_page = int(request.args.get('por_pagina', 10))
    nombre = request.args.get('nombre', '').strip()
    offset = (page - 1) * per_page
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        params = []
        filtro = ""
        if nombre:
            filtro = "WHERE UPPER(categoria.nombre) LIKE CONCAT(UPPER(%s), '%')"
            params.append(nombre)
        cursor.execute(f"SELECT COUNT(*) as total FROM categoria {filtro}", params)
        total = cursor.fetchone()['total']
        params.extend([per_page, offset])
        cursor.execute(f"""
            SELECT id_categoria, nombre
            FROM categoria
            {filtro}
            LIMIT %s OFFSET %s
        """, params)
        categorias = cursor.fetchall()
        total_paginas = (total + per_page - 1) // per_page
        return jsonify({
            "total": total,
            "pagina": page,
            "por_pagina": per_page,
            "total_paginas": total_paginas,
            "categorias": categorias
        })
    except Exception as e:
        print(f"❌ Error en la consulta: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()

@categoria_bp.route('/categorias/', methods=['POST'])
@login_required_api
def agregar_categoria():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    data = request.get_json()
    nombre = data.get("nombre")
    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO categoria (nombre)
            VALUES (%s)
        """
        cursor.execute(sql, (nombre,))
        conn.commit()
        return jsonify({"mensaje": "Categoría agregada correctamente"}), 201
    except Exception as e:
        print(f"❌ Error al insertar categoría: {e}")
        return jsonify({"error": "Error al guardar categoría"}), 500
    finally:
        cursor.close()
        conn.close()

@categoria_bp.route('/categorias/', methods=['PUT'])
@login_required_api
def actualizar_categoria():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    data = request.get_json()
    id_categoria = data.get("id_categoria")
    nombre = data.get("nombre")
    if not id_categoria:
        return jsonify({"error": "ID de categoría requerido para actualizar"}), 400
    try:
        cursor = conn.cursor()
        sql = """
            UPDATE categoria
            SET nombre = %s
            WHERE id_categoria = %s
        """
        cursor.execute(sql, (nombre, id_categoria))
        conn.commit()
        return jsonify({"mensaje": "Categoría actualizada correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al actualizar categoría: {e}")
        return jsonify({"error": "Error al actualizar categoría"}), 500
    finally:
        cursor.close()
        conn.close()

@categoria_bp.route('/categorias/buscar', methods=['GET'])
@login_required_api
def buscar_categoria():
    nombre = request.args.get('nombre', '').strip()
    if not nombre:
        return jsonify({"error": "Debe proporcionar un nombre"}), 400
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_categoria, nombre
            FROM categoria
            WHERE UPPER(nombre) LIKE CONCAT(UPPER(%s), '%')
            LIMIT 1
        """, (nombre,))
        categoria = cursor.fetchone()
        if not categoria:
            return jsonify({"error": "Categoría no encontrada"}), 404
        return jsonify(categoria)
    except Exception as e:
        print(f"❌ Error en búsqueda: {e}")
        return jsonify({"error": "Error en la búsqueda"}), 500
    finally:
        cursor.close()
        conn.close()

@categoria_bp.route('/categorias/<int:id_categoria>', methods=['DELETE'])
@login_required_api
def eliminar_categoria(id_categoria):
    if not id_categoria:
        return jsonify({"error": "ID de categoría requerido para eliminar"}), 400
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id_categoria FROM categoria WHERE id_categoria = %s", (id_categoria,))
        if not cursor.fetchone():
            return jsonify({"error": "Categoría no encontrada"}), 404
        cursor.execute("DELETE FROM categoria WHERE id_categoria = %s", (id_categoria,))
        conn.commit()
        return jsonify({"mensaje": "Categoría eliminada correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al eliminar categoría: {e}")
        return jsonify({"error": "Error al eliminar categoría"}), 500
    finally:
        cursor.close()
        conn.close()