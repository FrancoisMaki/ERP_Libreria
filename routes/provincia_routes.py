from flask import Blueprint, jsonify, request
from models.db import get_connection
from utils.auth import login_required_api

provincia_bp = Blueprint('provincia', __name__)

@provincia_bp.route('/provincias/', methods=['GET'])
@login_required_api
def api_provincias():
    page = int(request.args.get('pagina', 1))
    per_page = int(request.args.get('por_pagina', 10))
    nombre = request.args.get('nombre', '').strip()
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
        if paisid:
            filtro.append("paisid = %s")
            params.append(paisid)
        where_clause = f"WHERE {' AND '.join(filtro)}" if filtro else ""

        cursor.execute(f"SELECT COUNT(*) as total FROM provincia {where_clause}", params)
        total = cursor.fetchone()['total']

        params.extend([per_page, offset])
        cursor.execute(f"""
            SELECT provinciaid, nombre, paisid, codigo_iso
            FROM provincia
            {where_clause}
            ORDER BY provinciaid
            LIMIT %s OFFSET %s
        """, params)
        provincias = cursor.fetchall()

        total_paginas = (total + per_page - 1) // per_page

        return jsonify({
            "total": total,
            "pagina": page,
            "por_pagina": per_page,
            "total_paginas": total_paginas,
            "provincias": provincias
        })
    except Exception as e:
        print(f"❌ Error en la consulta: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()

@provincia_bp.route('/provincias/', methods=['POST'])
@login_required_api
def agregar_provincia():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    provinciaid = data.get("provinciaid")
    nombre = data.get("nombre")
    paisid = data.get("paisid")
    codigo_iso = data.get("codigo_iso")

    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO provincia (provinciaid, nombre, paisid, codigo_iso)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (provinciaid, nombre, paisid, codigo_iso))
        conn.commit()
        return jsonify({"mensaje": "Provincia agregada correctamente"}), 201
    except Exception as e:
        print(f"❌ Error al insertar provincia: {e}")
        return jsonify({"error": "Error al guardar provincia"}), 500
    finally:
        cursor.close()
        conn.close()

@provincia_bp.route('/provincias/', methods=['PUT'])
@login_required_api
def actualizar_provincia():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    provinciaid = data.get("provinciaid")
    paisid = data.get("paisid")
    nombre = data.get("nombre")
    codigo_iso = data.get("codigo_iso")

    if not provinciaid or not paisid:
        return jsonify({"error": "ID de provincia y país requeridos"}), 400

    try:
        cursor = conn.cursor()
        sql = """
            UPDATE provincia
            SET nombre = %s,
                codigo_iso = %s
            WHERE provinciaid = %s AND paisid = %s
        """
        cursor.execute(sql, (nombre, codigo_iso, provinciaid, paisid))
        conn.commit()
        return jsonify({"mensaje": "Provincia actualizada correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al actualizar provincia: {e}")
        return jsonify({"error": "Error al actualizar provincia"}), 500
    finally:
        cursor.close()
        conn.close()

@provincia_bp.route('/provincias/buscar', methods=['GET'])
@login_required_api
def buscar_provincia():
    nombre = request.args.get('nombre', '').strip()
    paisid = request.args.get('paisid', '').strip()
    if not nombre or not paisid:
        return jsonify({"error": "Debe proporcionar nombre y país"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT provinciaid, nombre, paisid, codigo_iso
            FROM provincia
            WHERE UPPER(nombre) LIKE CONCAT(UPPER(%s), '%%')
            AND paisid = %s
            LIMIT 1
        """, (nombre, paisid))
        provincia = cursor.fetchone()
        if not provincia:
            return jsonify({"error": "Provincia no encontrada"}), 404
        return jsonify(provincia)
    except Exception as e:
        print(f"❌ Error en búsqueda: {e}")
        return jsonify({"error": "Error en la búsqueda"}), 500
    finally:
        cursor.close()
        conn.close()

@provincia_bp.route('/provincias/<paisid>/<provinciaid>', methods=['DELETE'])
@login_required_api
def eliminar_provincia(paisid, provinciaid):
    if not paisid or not provinciaid:
        return jsonify({"error": "ID de provincia y país requeridos"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT provinciaid FROM provincia WHERE provinciaid = %s AND paisid = %s", (provinciaid, paisid))
        if not cursor.fetchone():
            return jsonify({"error": "Provincia no encontrada"}), 404

        cursor.execute("DELETE FROM provincia WHERE provinciaid = %s AND paisid = %s", (provinciaid, paisid))
        conn.commit()
        return jsonify({"mensaje": "Provincia eliminada correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al eliminar provincia: {e}")
        return jsonify({"error": "Error al eliminar provincia"}), 500
    finally:
        cursor.close()
        conn.close()