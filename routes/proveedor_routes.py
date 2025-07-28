from flask import Blueprint, jsonify, request
from models.db import get_connection
from utils.auth import login_required_api

proveedor_bp = Blueprint('proveedor', __name__)

@proveedor_bp.route('/proveedores/', methods=['GET'])
@login_required_api
def api_proveedores():
    page = int(request.args.get('pagina', 1))
    per_page = int(request.args.get('por_pagina', 10))
    nombre = request.args.get('nombre', '').strip()
    poblacionid = request.args.get('poblacionid', '').strip()
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
        if poblacionid:
            filtro.append("poblacionid = %s")
            params.append(poblacionid)
        where_clause = f"WHERE {' AND '.join(filtro)}" if filtro else ""

        cursor.execute(f"SELECT COUNT(*) as total FROM proveedor {where_clause}", params)
        total = cursor.fetchone()['total']

        params.extend([per_page, offset])
        cursor.execute(f"""
            SELECT id_proveedor, nombre, cif, direccion, poblacionid, email, telefono
            FROM proveedor
            {where_clause}
            ORDER BY id_proveedor DESC
            LIMIT %s OFFSET %s
        """, params)
        proveedores = cursor.fetchall()

        total_paginas = (total + per_page - 1) // per_page

        return jsonify({
            "total": total,
            "pagina": page,
            "por_pagina": per_page,
            "total_paginas": total_paginas,
            "proveedores": proveedores
        })
    except Exception as e:
        print(f"❌ Error en la consulta: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()

@proveedor_bp.route('/proveedores/', methods=['POST'])
@login_required_api
def agregar_proveedor():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    nombre = data.get("nombre")
    cif = data.get("cif")
    direccion = data.get("direccion")
    poblacionid = data.get("poblacionid")
    email = data.get("email")
    telefono = data.get("telefono")

    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO proveedor (nombre, cif, direccion, poblacionid, email, telefono)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (nombre, cif, direccion, poblacionid, email, telefono))
        conn.commit()
        return jsonify({"mensaje": "Proveedor agregado correctamente"}), 201
    except Exception as e:
        print(f"❌ Error al insertar proveedor: {e}")
        return jsonify({"error": "Error al guardar proveedor"}), 500
    finally:
        cursor.close()
        conn.close()

@proveedor_bp.route('/proveedores/', methods=['PUT'])
@login_required_api
def actualizar_proveedor():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    id_proveedor = data.get("id_proveedor")
    nombre = data.get("nombre")
    cif = data.get("cif")
    direccion = data.get("direccion")
    poblacionid = data.get("poblacionid")
    email = data.get("email")
    telefono = data.get("telefono")

    if not id_proveedor:
        return jsonify({"error": "ID de proveedor requerido para actualizar"}), 400

    try:
        cursor = conn.cursor()
        sql = """
            UPDATE proveedor
            SET nombre = %s,
                cif = %s,
                direccion = %s,
                poblacionid = %s,
                email = %s,
                telefono = %s
            WHERE id_proveedor = %s
        """
        cursor.execute(sql, (nombre, cif, direccion, poblacionid, email, telefono, id_proveedor))
        conn.commit()
        return jsonify({"mensaje": "Proveedor actualizado correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al actualizar proveedor: {e}")
        return jsonify({"error": "Error al actualizar proveedor"}), 500
    finally:
        cursor.close()
        conn.close()

@proveedor_bp.route('/proveedores/buscar', methods=['GET'])
@login_required_api
def buscar_proveedor():
    nombre = request.args.get('nombre', '').strip()
    if not nombre:
        return jsonify({"error": "Debe proporcionar un nombre"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_proveedor, nombre, cif, direccion, poblacionid, email, telefono
            FROM proveedor
            WHERE UPPER(nombre) LIKE CONCAT(UPPER(%s), '%%')
            LIMIT 1
        """, (nombre,))
        proveedor = cursor.fetchone()
        if not proveedor:
            return jsonify({"error": "Proveedor no encontrado"}), 404
        return jsonify(proveedor)
    except Exception as e:
        print(f"❌ Error en búsqueda: {e}")
        return jsonify({"error": "Error en la búsqueda"}), 500
    finally:
        cursor.close()
        conn.close()

@proveedor_bp.route('/proveedores/<int:id_proveedor>', methods=['DELETE'])
@login_required_api
def eliminar_proveedor(id_proveedor):
    if not id_proveedor:
        return jsonify({"error": "ID de proveedor requerido para eliminar"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id_proveedor FROM proveedor WHERE id_proveedor = %s", (id_proveedor,))
        if not cursor.fetchone():
            return jsonify({"error": "Proveedor no encontrado"}), 404

        cursor.execute("DELETE FROM proveedor WHERE id_proveedor = %s", (id_proveedor,))
        conn.commit()
        return jsonify({"mensaje": "Proveedor eliminado correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al eliminar proveedor: {e}")
        return jsonify({"error": "Error al eliminar proveedor"}), 500
    finally:
        cursor.close()
        conn.close()