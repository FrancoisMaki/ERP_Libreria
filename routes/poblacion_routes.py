from flask import Blueprint, jsonify, request
from models.db import get_connection
from utils.auth import login_required_api

poblacion_bp = Blueprint('poblacion', __name__)

@poblacion_bp.route('/poblaciones/', methods=['GET'])
@login_required_api
def api_poblaciones():
    page = int(request.args.get('pagina', 1))
    per_page = int(request.args.get('por_pagina', 10))
    nombre = request.args.get('nombre', '').strip()
    provinciaid = request.args.get('provinciaid', '').strip()
    paisid = request.args.get('paisid', '').strip()
    offset = (page - 1) * per_page

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        params = []
        filtro = []
        if nombre:
            filtro.append("UPPER(nombre) LIKE CONCAT(UPPER(%s), '%%')")
            params.append(nombre)
        if provinciaid:
            filtro.append("provinciaid = %s")
            params.append(provinciaid)
        if paisid:
            filtro.append("paisid = %s")
            params.append(paisid)
        where_clause = f"WHERE {' AND '.join(filtro)}" if filtro else ""

        cursor.execute(f"SELECT COUNT(*) as total FROM poblacion {where_clause}", params)
        total = cursor.fetchone()['total']

        params.extend([per_page, offset])
        cursor.execute(f"""
            SELECT poblacionid, nombre, provinciaid, paisid
            FROM poblacion
            {where_clause}
            ORDER BY nombre
            LIMIT %s OFFSET %s
        """, params)
        poblaciones = cursor.fetchall()

        total_paginas = (total + per_page - 1) // per_page

        return jsonify({
            "total": total,
            "pagina": page,
            "por_pagina": per_page,
            "total_paginas": total_paginas,
            "poblaciones": poblaciones
        })
    except Exception as e:
        print(f"❌ Error en la consulta: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()

@poblacion_bp.route('/poblaciones/', methods=['POST'])
@login_required_api
def agregar_poblacion():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    nombre = data.get("nombre")
    provinciaid = data.get("provinciaid")
    paisid = data.get("paisid")

    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO poblacion (nombre, provinciaid, paisid)
            VALUES (%s, %s, %s)
        """
        cursor.execute(sql, (nombre, provinciaid, paisid))
        conn.commit()
        return jsonify({"mensaje": "Población agregada correctamente"}), 201
    except Exception as e:
        print(f"❌ Error al insertar población: {e}")
        return jsonify({"error": "Error al guardar población"}), 500
    finally:
        cursor.close()
        conn.close()

@poblacion_bp.route('/poblaciones/', methods=['PUT'])
@login_required_api
def actualizar_poblacion():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    poblacionid = data.get("poblacionid")
    nombre = data.get("nombre")
    provinciaid = data.get("provinciaid")
    paisid = data.get("paisid")

    if not poblacionid:
        return jsonify({"error": "ID de población requerido para actualizar"}), 400

    try:
        cursor = conn.cursor()
        sql = """
            UPDATE poblacion
            SET nombre = %s,
                provinciaid = %s,
                paisid = %s
            WHERE poblacionid = %s
        """
        cursor.execute(sql, (nombre, provinciaid, paisid, poblacionid))
        conn.commit()
        return jsonify({"mensaje": "Población actualizada correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al actualizar población: {e}")
        return jsonify({"error": "Error al actualizar población"}), 500
    finally:
        cursor.close()
        conn.close()

@poblacion_bp.route('/poblaciones/buscar', methods=['GET'])
@login_required_api
def buscar_poblacion():
    nombre = request.args.get('nombre', '').strip()
    provinciaid = request.args.get('provinciaid', '').strip()
    paisid = request.args.get('paisid', '').strip()
    if not nombre or not provinciaid or not paisid:
        return jsonify({"error": "Debe proporcionar nombre, provincia y país"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT poblacionid, nombre, provinciaid, paisid
            FROM poblacion
            WHERE UPPER(nombre) LIKE CONCAT(UPPER(%s), '%%')
            AND provinciaid = %s
            AND paisid = %s
            LIMIT 1
        """, (nombre, provinciaid, paisid))
        poblacion = cursor.fetchone()
        if not poblacion:
            return jsonify({"error": "Población no encontrada"}), 404
        return jsonify(poblacion)
    except Exception as e:
        print(f"❌ Error en búsqueda: {e}")
        return jsonify({"error": "Error en la búsqueda"}), 500
    finally:
        cursor.close()
        conn.close()

@poblacion_bp.route('/poblaciones/<int:poblacionid>', methods=['DELETE'])
@login_required_api
def eliminar_poblacion(poblacionid):
    if not poblacionid:
        return jsonify({"error": "ID de población requerido para eliminar"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT poblacionid FROM poblacion WHERE poblacionid = %s", (poblacionid,))
        if not cursor.fetchone():
            return jsonify({"error": "Población no encontrada"}), 404

        cursor.execute("DELETE FROM poblacion WHERE poblacionid = %s", (poblacionid,))
        conn.commit()
        return jsonify({"mensaje": "Población eliminada correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al eliminar población: {e}")
        return jsonify({"error": "Error al eliminar población"}), 500
    finally:
        cursor.close()
        conn.close()    