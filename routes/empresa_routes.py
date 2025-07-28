from flask import Blueprint, jsonify, request
from models.db import get_connection
from utils.auth import login_required_api

empresa_bp = Blueprint('empresa', __name__)

@empresa_bp.route('/empresas/', methods=['GET'])
@login_required_api
def api_empresas():
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
            filtro = "WHERE UPPER(empresa.nombre) LIKE CONCAT(UPPER(%s), '%')"
            params.append(nombre)
        cursor.execute(f"SELECT COUNT(*) as total FROM empresa {filtro}", params)
        total = cursor.fetchone()['total']
        params.extend([per_page, offset])
        cursor.execute(f"""
            SELECT id_empresa, nombre, cif, direccion, poblacionid, moneda, iva_general
            FROM empresa
            {filtro}
            LIMIT %s OFFSET %s
        """, params)
        empresas = cursor.fetchall()
        total_paginas = (total + per_page - 1) // per_page
        return jsonify({
            "total": total,
            "pagina": page,
            "por_pagina": per_page,
            "total_paginas": total_paginas,
            "empresas": empresas
        })
    except Exception as e:
        print(f"❌ Error en la consulta: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()

@empresa_bp.route('/empresas/', methods=['POST'])
@login_required_api
def agregar_empresa():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    data = request.get_json()
    nombre = data.get("nombre")
    cif = data.get("cif")
    direccion = data.get("direccion")
    poblacionid = data.get("poblacionid")
    moneda = data.get("moneda")
    iva_general = data.get("iva_general")
    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO empresa (nombre, cif, direccion, poblacionid, moneda, iva_general)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (nombre, cif, direccion, poblacionid, moneda, iva_general))
        conn.commit()
        return jsonify({"mensaje": "Empresa agregada correctamente"}), 201
    except Exception as e:
        print(f"❌ Error al insertar empresa: {e}")
        return jsonify({"error": "Error al guardar empresa"}), 500
    finally:
        cursor.close()
        conn.close()

@empresa_bp.route('/empresas/', methods=['PUT'])
@login_required_api
def actualizar_empresa():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    data = request.get_json()
    id_empresa = data.get("id_empresa")
    nombre = data.get("nombre")
    cif = data.get("cif")
    direccion = data.get("direccion")
    poblacionid = data.get("poblacionid")
    moneda = data.get("moneda")
    iva_general = data.get("iva_general")
    if not id_empresa:
        return jsonify({"error": "ID de empresa requerido para actualizar"}), 400
    try:
        cursor = conn.cursor()
        sql = """
            UPDATE empresa
            SET nombre = %s,
                cif = %s,
                direccion = %s,
                poblacionid = %s,
                moneda = %s,
                iva_general = %s
            WHERE id_empresa = %s
        """
        cursor.execute(sql, (nombre, cif, direccion, poblacionid, moneda, iva_general, id_empresa))
        conn.commit()
        return jsonify({"mensaje": "Empresa actualizada correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al actualizar empresa: {e}")
        return jsonify({"error": "Error al actualizar empresa"}), 500
    finally:
        cursor.close()
        conn.close()

@empresa_bp.route('/empresas/buscar', methods=['GET'])
@login_required_api
def buscar_empresa():
    nombre = request.args.get('nombre', '').strip()
    if not nombre:
        return jsonify({"error": "Debe proporcionar un nombre"}), 400
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_empresa, nombre, cif, direccion, poblacionid, moneda, iva_general
            FROM empresa
            WHERE UPPER(nombre) LIKE CONCAT(UPPER(%s), '%')
            LIMIT 1
        """, (nombre,))
        empresa = cursor.fetchone()
        if not empresa:
            return jsonify({"error": "Empresa no encontrada"}), 404
        return jsonify(empresa)
    except Exception as e:
        print(f"❌ Error en búsqueda: {e}")
        return jsonify({"error": "Error en la búsqueda"}), 500
    finally:
        cursor.close()
        conn.close()

@empresa_bp.route('/empresas/<int:id_empresa>', methods=['DELETE'])
@login_required_api
def eliminar_empresa(id_empresa):
    if not id_empresa:
        return jsonify({"error": "ID de empresa requerido para eliminar"}), 400
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id_empresa FROM empresa WHERE id_empresa = %s", (id_empresa,))
        if not cursor.fetchone():
            return jsonify({"error": "Empresa no encontrada"}), 404
        cursor.execute("DELETE FROM empresa WHERE id_empresa = %s", (id_empresa,))
        conn.commit()
        return jsonify({"mensaje": "Empresa eliminada correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al eliminar empresa: {e}")
        return jsonify({"error": "Error al eliminar empresa"}), 500
    finally:
        cursor.close()
        conn.close()