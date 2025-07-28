from flask import Blueprint, jsonify, request
from models.db import get_connection
from utils.auth import login_required_api

codigo_postal_bp = Blueprint('codigo_postal', __name__)

@codigo_postal_bp.route('/codigos_postales/', methods=['GET'])
@login_required_api
def api_codigos_postales():
    page = int(request.args.get('pagina', 1))
    per_page = int(request.args.get('por_pagina', 10))
    paisid = request.args.get('paisid', '').strip()
    prefijo = request.args.get('prefijo', '').strip()
    resto = request.args.get('resto', '').strip()
    poblacionid = request.args.get('poblacionid', '').strip()
    offset = (page - 1) * per_page

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        params = []
        filtro = []
        if paisid:
            filtro.append("paisid = %s")
            params.append(paisid)
        if prefijo:
            filtro.append("prefijo = %s")
            params.append(prefijo)
        if resto:
            filtro.append("resto LIKE %s")
            params.append(f"%{resto}%")
        if poblacionid:
            filtro.append("poblacionid = %s")
            params.append(poblacionid)
        where_clause = f"WHERE {' AND '.join(filtro)}" if filtro else ""

        cursor.execute(f"SELECT COUNT(*) as total FROM codigo_postal {where_clause}", params)
        total = cursor.fetchone()['total']

        params.extend([per_page, offset])
        cursor.execute(f"""
            SELECT id, paisid, prefijo, resto, poblacionid
            FROM codigo_postal
            {where_clause}
            ORDER BY id DESC
            LIMIT %s OFFSET %s
        """, params)
        codigos = cursor.fetchall()

        total_paginas = (total + per_page - 1) // per_page

        return jsonify({
            "total": total,
            "pagina": page,
            "por_pagina": per_page,
            "total_paginas": total_paginas,
            "codigos_postales": codigos
        })
    except Exception as e:
        print(f"❌ Error en la consulta: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()


@codigo_postal_bp.route('/codigos_postales/', methods=['POST'])
@login_required_api
def agregar_codigo_postal():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    paisid = data.get("paisid")
    prefijo = data.get("prefijo")
    resto = data.get("resto")
    poblacionid = data.get("poblacionid")

    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO codigo_postal (paisid, prefijo, resto, poblacionid)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (paisid, prefijo, resto, poblacionid))
        conn.commit()
        return jsonify({"mensaje": "Código postal agregado correctamente"}), 201
    except Exception as e:
        print(f"❌ Error al insertar código postal: {e}")
        return jsonify({"error": "Error al guardar código postal"}), 500
    finally:
        cursor.close()
        conn.close()


@codigo_postal_bp.route('/codigos_postales/', methods=['PUT'])
@login_required_api
def actualizar_codigo_postal():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    id = data.get("id")
    paisid = data.get("paisid")
    prefijo = data.get("prefijo")
    resto = data.get("resto")
    poblacionid = data.get("poblacionid")
    if not id:
        return jsonify({"error": "ID requerido para actualizar"}), 400

    try:
        cursor = conn.cursor()
        sql = """
            UPDATE codigo_postal
            SET paisid = %s,
                prefijo = %s,
                resto = %s,
                poblacionid = %s
            WHERE id = %s
        """
        cursor.execute(sql, (paisid, prefijo, resto, poblacionid, id))
        conn.commit()
        return jsonify({"mensaje": "Código postal actualizado correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al actualizar código postal: {e}")
        return jsonify({"error": "Error al actualizar código postal"}), 500
    finally:
        cursor.close()
        conn.close()


@codigo_postal_bp.route('/codigos_postales/buscar', methods=['GET'])
@login_required_api
def buscar_codigo_postal():
    paisid = request.args.get('paisid', '').strip()
    prefijo = request.args.get('prefijo', '').strip()
    resto = request.args.get('resto', '').strip()
    poblacionid = request.args.get('poblacionid', '').strip()
    if not (paisid and prefijo and resto and poblacionid):
        return jsonify({"error": "Debe proporcionar paisid, prefijo, resto y poblacionid"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, paisid, prefijo, resto, poblacionid
            FROM codigo_postal
            WHERE paisid = %s AND prefijo = %s AND resto = %s AND poblacionid = %s
            LIMIT 1
        """, (paisid, prefijo, resto, poblacionid))
        codigo = cursor.fetchone()
        if not codigo:
            return jsonify({"error": "Código postal no encontrado"}), 404
        return jsonify(codigo)
    except Exception as e:
        print(f"❌ Error en búsqueda: {e}")
        return jsonify({"error": "Error en la búsqueda"}), 500
    finally:
        cursor.close()
        conn.close()


@codigo_postal_bp.route('/codigos_postales/<int:id>', methods=['DELETE'])
@login_required_api
def eliminar_codigo_postal(id):
    if not id:
        return jsonify({"error": "ID requerido para eliminar"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM codigo_postal WHERE id = %s", (id,))
        if not cursor.fetchone():
            return jsonify({"error": "Código postal no encontrado"}), 404

        cursor.execute("DELETE FROM codigo_postal WHERE id = %s", (id,))
        conn.commit()
        return jsonify({"mensaje": "Código postal eliminado correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al eliminar código postal: {e}")
        return jsonify({"error": "Error al eliminar código postal"}), 500
    finally:
        cursor.close()
        conn.close()