from flask import Blueprint, jsonify, request
from models.db import get_connection
from utils.auth import login_required_api

cliente_bp = Blueprint('cliente', __name__)

@cliente_bp.route('/clientes/', methods=['GET'])
@login_required_api
def api_clientes():
    page = int(request.args.get('pagina', 1))
    per_page = int(request.args.get('por_pagina', 10))
    nombre = request.args.get('nombre', '').strip()
    nif = request.args.get('nif', '').strip()
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
        if nif:
            filtro.append("UPPER(nif) LIKE CONCAT(UPPER(%s), '%%')")
            params.append(nif)
        if poblacionid:
            filtro.append("poblacionid = %s")
            params.append(poblacionid)
        where_clause = f"WHERE {' AND '.join(filtro)}" if filtro else ""

        cursor.execute(f"SELECT COUNT(*) as total FROM cliente {where_clause}", params)
        total = cursor.fetchone()['total']

        params.extend([per_page, offset])
        cursor.execute(f"""
            SELECT id_cliente, nombre, nif, direccion, poblacionid, email, telefono
            FROM cliente
            {where_clause}
            ORDER BY id_cliente DESC
            LIMIT %s OFFSET %s
        """, params)
        clientes = cursor.fetchall()

        total_paginas = (total + per_page - 1) // per_page

        return jsonify({
            "total": total,
            "pagina": page,
            "por_pagina": per_page,
            "total_paginas": total_paginas,
            "clientes": clientes
        })
    except Exception as e:
        print(f"❌ Error en la consulta: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()

@cliente_bp.route('/clientes/', methods=['POST'])
@login_required_api
def agregar_cliente():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    nombre = data.get("nombre")
    nif = data.get("nif")
    direccion = data.get("direccion")
    poblacionid = data.get("poblacionid")
    email = data.get("email")
    telefono = data.get("telefono")

    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO cliente (nombre, nif, direccion, poblacionid, email, telefono)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (nombre, nif, direccion, poblacionid, email, telefono))
        conn.commit()
        return jsonify({"mensaje": "Cliente agregado correctamente"}), 201
    except Exception as e:
        print(f"❌ Error al insertar cliente: {e}")
        return jsonify({"error": "Error al guardar cliente"}), 500
    finally:
        cursor.close()
        conn.close()

@cliente_bp.route('/clientes/', methods=['PUT'])
@login_required_api
def actualizar_cliente():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    id_cliente = data.get("id_cliente")
    nombre = data.get("nombre")
    nif = data.get("nif")
    direccion = data.get("direccion")
    poblacionid = data.get("poblacionid")
    email = data.get("email")
    telefono = data.get("telefono")

    if not id_cliente:
        return jsonify({"error": "ID de cliente requerido para actualizar"}), 400

    try:
        cursor = conn.cursor()
        sql = """
            UPDATE cliente
            SET nombre = %s,
                nif = %s,
                direccion = %s,
                poblacionid = %s,
                email = %s,
                telefono = %s
            WHERE id_cliente = %s
        """
        cursor.execute(sql, (nombre, nif, direccion, poblacionid, email, telefono, id_cliente))
        conn.commit()
        return jsonify({"mensaje": "Cliente actualizado correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al actualizar cliente: {e}")
        return jsonify({"error": "Error al actualizar cliente"}), 500
    finally:
        cursor.close()
        conn.close()

@cliente_bp.route('/clientes/buscar', methods=['GET'])
@login_required_api
def buscar_cliente():
    nif = request.args.get('nif', '').strip()
    if not nif:
        return jsonify({"error": "Debe proporcionar un NIF"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_cliente, nombre, nif, direccion, poblacionid, email, telefono
            FROM cliente
            WHERE UPPER(nif) = UPPER(%s)
            LIMIT 1
        """, (nif,))
        cliente = cursor.fetchone()
        if not cliente:
            return jsonify({"error": "Cliente no encontrado"}), 404
        return jsonify(cliente)
    except Exception as e:
        print(f"❌ Error en búsqueda: {e}")
        return jsonify({"error": "Error en la búsqueda"}), 500
    finally:
        cursor.close()
        conn.close()

@cliente_bp.route('/clientes/<int:id_cliente>', methods=['DELETE'])
@login_required_api
def eliminar_cliente(id_cliente):
    if not id_cliente:
        return jsonify({"error": "ID de cliente requerido para eliminar"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id_cliente FROM cliente WHERE id_cliente = %s", (id_cliente,))
        if not cursor.fetchone():
            return jsonify({"error": "Cliente no encontrado"}), 404

        cursor.execute("DELETE FROM cliente WHERE id_cliente = %s", (id_cliente,))
        conn.commit()
        return jsonify({"mensaje": "Cliente eliminado correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al eliminar cliente: {e}")
        return jsonify({"error": "Error al eliminar cliente"}), 500
    finally:
        cursor.close()
        conn.close()