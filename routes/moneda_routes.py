from flask import Blueprint, jsonify, request
from models.db import get_connection
from utils.auth import login_required_api

moneda_bp = Blueprint('moneda', __name__)

@moneda_bp.route('/monedas/', methods=['GET'])
@login_required_api
def api_monedas():
    page = int(request.args.get('pagina', 1))
    per_page = int(request.args.get('por_pagina', 10))
    nombre = request.args.get('nombre', '').strip()
    codigo = request.args.get('codigo', '').strip()
    offset = (page - 1) * per_page
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        params = []
        filtro = []
        if nombre:
            filtro.append("UPPER(moneda.nombre) LIKE CONCAT(UPPER(%s), '%')")
            params.append(nombre)
        if codigo:
            filtro.append("UPPER(moneda.codigo) LIKE CONCAT(UPPER(%s), '%')")
            params.append(codigo)
        filtro_str = ("WHERE " + " AND ".join(filtro)) if filtro else ""
        cursor.execute(f"SELECT COUNT(*) as total FROM moneda {filtro_str}", params)
        total = cursor.fetchone()['total']
        params.extend([per_page, offset])
        cursor.execute(f"""
            SELECT codigo, nombre, simbolo, decimales, activo
            FROM moneda
            {filtro_str}
            LIMIT %s OFFSET %s
        """, params)
        monedas = cursor.fetchall()
        total_paginas = (total + per_page - 1) // per_page
        return jsonify({
            "total": total,
            "pagina": page,
            "por_pagina": per_page,
            "total_paginas": total_paginas,
            "monedas": monedas
        })
    except Exception as e:
        print(f"❌ Error en la consulta: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()

@moneda_bp.route('/monedas/', methods=['POST'])
@login_required_api
def agregar_moneda():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    data = request.get_json()
    codigo = data.get("codigo")
    nombre = data.get("nombre")
    simbolo = data.get("simbolo")
    decimales = data.get("decimales")
    activo = data.get("activo", True)
    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO moneda (codigo, nombre, simbolo, decimales, activo)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (codigo, nombre, simbolo, decimales, activo))
        conn.commit()
        return jsonify({"mensaje": "Moneda agregada correctamente"}), 201
    except Exception as e:
        print(f"❌ Error al insertar moneda: {e}")
        return jsonify({"error": "Error al guardar moneda"}), 500
    finally:
        cursor.close()
        conn.close()

@moneda_bp.route('/monedas/', methods=['PUT'])
@login_required_api
def actualizar_moneda():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    data = request.get_json()
    codigo = data.get("codigo")
    nombre = data.get("nombre")
    simbolo = data.get("simbolo")
    decimales = data.get("decimales")
    activo = data.get("activo", True)
    if not codigo:
        return jsonify({"error": "Código de moneda requerido para actualizar"}), 400
    try:
        cursor = conn.cursor()
        sql = """
            UPDATE moneda
            SET nombre = %s,
                simbolo = %s,
                decimales = %s,
                activo = %s
            WHERE codigo = %s
        """
        cursor.execute(sql, (nombre, simbolo, decimales, activo, codigo))
        conn.commit()
        return jsonify({"mensaje": "Moneda actualizada correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al actualizar moneda: {e}")
        return jsonify({"error": "Error al actualizar moneda"}), 500
    finally:
        cursor.close()
        conn.close()

@moneda_bp.route('/monedas/buscar', methods=['GET'])
@login_required_api
def buscar_moneda():
    codigo = request.args.get('codigo', '').strip()
    if not codigo:
        return jsonify({"error": "Debe proporcionar un código"}), 400
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT codigo, nombre, simbolo, decimales, activo
            FROM moneda
            WHERE codigo = %s
            LIMIT 1
        """, (codigo,))
        moneda = cursor.fetchone()
        if not moneda:
            return jsonify({"error": "Moneda no encontrada"}), 404
        return jsonify(moneda)
    except Exception as e:
        print(f"❌ Error en búsqueda: {e}")
        return jsonify({"error": "Error en la búsqueda"}), 500
    finally:
        cursor.close()
        conn.close()

@moneda_bp.route('/monedas/<codigo>', methods=['DELETE'])
@login_required_api
def eliminar_moneda(codigo):
    if not codigo:
        return jsonify({"error": "Código de moneda requerido para eliminar"}), 400
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT codigo FROM moneda WHERE codigo = %s", (codigo,))
        if not cursor.fetchone():
            return jsonify({"error": "Moneda no encontrada"}), 404
        cursor.execute("DELETE FROM moneda WHERE codigo = %s", (codigo,))
        conn.commit()
        return jsonify({"mensaje": "Moneda eliminada correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al eliminar moneda: {e}")
        return jsonify({"error": "Error al eliminar moneda"}), 500
    finally:
        cursor.close()
        conn.close()