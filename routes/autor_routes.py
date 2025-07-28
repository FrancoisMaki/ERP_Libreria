from flask import Blueprint, jsonify, request
from models.db import get_connection
from utils.auth import login_required_api

autor_bp = Blueprint('autor', __name__)

@autor_bp.route('/autores/', methods=['GET'])
@login_required_api
def api_autores():
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
            filtro = "WHERE UPPER(autor.nombre) LIKE CONCAT(UPPER(%s), '%')"
            params.append(nombre)
        cursor.execute(f"SELECT COUNT(*) as total FROM autor {filtro}", params)
        total = cursor.fetchone()['total']
        params.extend([per_page, offset])
        cursor.execute(f"""
            SELECT id_autor, nombre
            FROM autor
            {filtro}
            LIMIT %s OFFSET %s
        """, params)
        autores = cursor.fetchall()
        total_paginas = (total + per_page - 1) // per_page
        return jsonify({
            "total": total,
            "pagina": page,
            "por_pagina": per_page,
            "total_paginas": total_paginas,
            "autores": autores
        })
    except Exception as e:
        print(f"❌ Error en la consulta: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()

@autor_bp.route('/autores/', methods=['POST'])
@login_required_api
def agregar_autor():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    data = request.get_json()
    nombre = data.get("nombre")
    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO autor (nombre)
            VALUES (%s)
        """
        cursor.execute(sql, (nombre,))
        conn.commit()
        return jsonify({"mensaje": "Autor agregado correctamente"}), 201
    except Exception as e:
        print(f"❌ Error al insertar autor: {e}")
        return jsonify({"error": "Error al guardar autor"}), 500
    finally:
        cursor.close()
        conn.close()

@autor_bp.route('/autores/', methods=['PUT'])
@login_required_api
def actualizar_autor():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    data = request.get_json()
    id_autor = data.get("id_autor")
    nombre = data.get("nombre")
    if not id_autor:
        return jsonify({"error": "ID de autor requerido para actualizar"}), 400
    try:
        cursor = conn.cursor()
        sql = """
            UPDATE autor
            SET nombre = %s
            WHERE id_autor = %s
        """
        cursor.execute(sql, (nombre, id_autor))
        conn.commit()
        return jsonify({"mensaje": "Autor actualizado correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al actualizar autor: {e}")
        return jsonify({"error": "Error al actualizar autor"}), 500
    finally:
        cursor.close()
        conn.close()

@autor_bp.route('/autores/buscar', methods=['GET'])
@login_required_api
def buscar_autor():
    nombre = request.args.get('nombre', '').strip()
    if not nombre:
        return jsonify({"error": "Debe proporcionar un nombre"}), 400
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_autor, nombre
            FROM autor
            WHERE UPPER(nombre) LIKE CONCAT(UPPER(%s), '%')
            LIMIT 1
        """, (nombre,))
        autor = cursor.fetchone()
        if not autor:
            return jsonify({"error": "Autor no encontrado"}), 404
        return jsonify(autor)
    except Exception as e:
        print(f"❌ Error en búsqueda: {e}")
        return jsonify({"error": "Error en la búsqueda"}), 500
    finally:
        cursor.close()
        conn.close()

@autor_bp.route('/autores/<int:id_autor>', methods=['DELETE'])
@login_required_api
def eliminar_autor(id_autor):
    if not id_autor:
        return jsonify({"error": "ID de autor requerido para eliminar"}), 400
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id_autor FROM autor WHERE id_autor = %s", (id_autor,))
        if not cursor.fetchone():
            return jsonify({"error": "Autor no encontrado"}), 404
        cursor.execute("DELETE FROM autor WHERE id_autor = %s", (id_autor,))
        conn.commit()
        return jsonify({"mensaje": "Autor eliminado correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al eliminar autor: {e}")
        return jsonify({"error": "Error al eliminar autor"}), 500
    finally:
        cursor.close()
        conn.close()