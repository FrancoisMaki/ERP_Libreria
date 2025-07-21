from flask import Blueprint, jsonify, request
from models.db import get_connection

pais_bp = Blueprint('pais', __name__)

@pais_bp.route('/api/paises/', methods=['GET'])
def api_paises():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    offset = (page - 1) * per_page

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) as total FROM pais")
        total = cursor.fetchone()['total']

        cursor.execute("""
            SELECT paisid, nombre, codigo_numerico, prefijo_telefono
            FROM pais 
            LIMIT %s OFFSET %s
        """, (per_page, offset))
        paises = cursor.fetchall()

        return jsonify({
            "total": total,
            "page": page,
            "per_page": per_page,
            "paises": paises
        })
    except Exception as e:
        print(f"❌ Error en la consulta: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()


@pais_bp.route('/api/paises/', methods=['POST'])
def agregar_pais():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    paisid = data.get("paisid")
    nombre = data.get("nombre")
    codigo_numerico = data.get("codigo_numerico")
    prefijo_telefono = data.get("prefijo_telefono")

    try:
        cursor = conn.cursor()
        sql = """
            INSERT INTO pais (paisid, nombre, codigo_numerico, prefijo_telefono)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (paisid, nombre, codigo_numerico, prefijo_telefono))
        conn.commit()
        return jsonify({"mensaje": "País agregado correctamente"}), 201
    except Exception as e:
        print(f"❌ Error al insertar país: {e}")
        return jsonify({"error": "Error al guardar país"}), 500
    finally:
        cursor.close()
        conn.close()

@pais_bp.route('/api/paises/', methods=['PUT'])
def actualizar_pais():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    paisid = data.get("paisid")
    nombre = data.get("nombre")
    codigo_numerico = data.get("codigo_numerico")
    prefijo_telefono = data.get("prefijo_telefono")

    if not paisid:
        return jsonify({"error": "ID de país requerido para actualizar"}), 400

    try:
        cursor = conn.cursor()
        sql = """
            UPDATE pais
            SET nombre = %s,
                codigo_numerico = %s,
                prefijo_telefono = %s
            WHERE paisid = %s
        """
        cursor.execute(sql, (nombre, codigo_numerico, prefijo_telefono, paisid))
        conn.commit()
        return jsonify({"mensaje": "País actualizado correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al actualizar país: {e}")
        return jsonify({"error": "Error al actualizar país"}), 500
    finally:
        cursor.close()
        conn.close()

@pais_bp.route('/api/paises/buscar', methods=['GET'])
def buscar_pais():
    nombre = request.args.get('nombre', '').strip()
    if not nombre:
        return jsonify({"error": "Debe proporcionar un nombre"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        # Usamos UPPER para buscar sin importar mayúsculas/minúsculas
        cursor.execute("""
            SELECT paisid, nombre, codigo_numerico, prefijo_telefono
            FROM pais
            WHERE UPPER(nombre) LIKE CONCAT('%', UPPER(%s), '%')
            LIMIT 1
        """, (nombre,))
        pais = cursor.fetchone()
        if not pais:
            return jsonify({"error": "País no encontrado"}), 404
        return jsonify(pais)
    except Exception as e:
        print(f"❌ Error en búsqueda: {e}")
        return jsonify({"error": "Error en la búsqueda"}), 500
    finally:
        cursor.close()
        conn.close()

@pais_bp.route('/api/paises/<paisid>', methods=['DELETE'])
def eliminar_pais(paisid):
    if not paisid:
        return jsonify({"error": "ID de país requerido para eliminar"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor()
        # Primero verifica si existe el país
        cursor.execute("SELECT paisid FROM pais WHERE paisid = %s", (paisid,))
        if not cursor.fetchone():
            return jsonify({"error": "País no encontrado"}), 404

        # Elimina el país
        cursor.execute("DELETE FROM pais WHERE paisid = %s", (paisid,))
        conn.commit()
        return jsonify({"mensaje": "País eliminado correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al eliminar país: {e}")
        return jsonify({"error": "Error al eliminar país"}), 500
    finally:
        cursor.close()
        conn.close()