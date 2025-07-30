from flask import Blueprint, request, jsonify
from models.db import get_connection
from datetime import date

almacen_bp = Blueprint('almacen', __name__)

@almacen_bp.route('/almacen/', methods=['GET'])
def listar_almacenes():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT a.id_almacen, a.nombre, a.direccion, p.nombre AS poblacion
        FROM almacen a
        LEFT JOIN poblacion p ON a.poblacionid = p.poblacionid
        ORDER BY a.nombre
    """)
    almacenes = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"almacenes": almacenes})

@almacen_bp.route('/almacen/', methods=['POST'])
def crear_almacen():
    data = request.get_json()
    nombre = data.get("nombre")
    direccion = data.get("direccion")
    poblacionid = data.get("poblacionid")
    if not nombre:
        return jsonify({"error": "Nombre es obligatorio"}), 400
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO almacen (nombre, direccion, poblacionid)
        VALUES (%s, %s, %s)
    """, (nombre, direccion, poblacionid))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensaje": "Almacén creado"}), 201

@almacen_bp.route('/almacen/<int:id_almacen>', methods=['PUT'])
def editar_almacen(id_almacen):
    data = request.get_json()
    nombre = data.get("nombre")
    direccion = data.get("direccion")
    poblacionid = data.get("poblacionid")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE almacen
        SET nombre=%s, direccion=%s, poblacionid=%s
        WHERE id_almacen=%s
    """, (nombre, direccion, poblacionid, id_almacen))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensaje": "Almacén actualizado"})

@almacen_bp.route('/almacen/<int:id_almacen>', methods=['DELETE'])
def eliminar_almacen(id_almacen):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM almacen WHERE id_almacen=%s", (id_almacen,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensaje": "Almacén eliminado"})

@almacen_bp.route('/almacen/movimientos', methods=['GET'])
def listar_movimientos_stock():
    id_almacen = request.args.get("id_almacen")
    id_producto = request.args.get("id_producto")
    fecha_desde = request.args.get("fecha_desde")
    fecha_hasta = request.args.get("fecha_hasta")
    condiciones = []
    parametros = []

    if id_almacen:
        condiciones.append("m.id_almacen=%s")
        parametros.append(id_almacen)
    if id_producto:
        condiciones.append("m.id_producto=%s")
        parametros.append(id_producto)
    if fecha_desde:
        condiciones.append("m.fecha >= %s")
        parametros.append(fecha_desde)
    if fecha_hasta:
        condiciones.append("m.fecha <= %s")
        parametros.append(fecha_hasta)

    where = " AND ".join(condiciones)
    if where:
        where = "WHERE " + where

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(f"""
        SELECT m.id_movimiento, m.fecha, m.tipo, m.cantidad, 
               a.nombre AS almacen, p.titulo AS producto, m.id_producto
        FROM movimiento_stock m
        JOIN almacen a ON m.id_almacen = a.id_almacen
        JOIN producto p ON m.id_producto = p.isbn
        {where}
        ORDER BY m.fecha DESC, m.id_movimiento DESC
        LIMIT 100
    """, tuple(parametros))
    movimientos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"movimientos": movimientos})

@almacen_bp.route('/almacen/movimientos', methods=['POST'])
def crear_movimiento_stock():
    data = request.get_json()
    id_producto = data.get("id_producto")
    id_almacen = data.get("id_almacen")
    cantidad = data.get("cantidad")
    tipo = data.get("tipo")
    fecha = data.get("fecha", date.today().isoformat())
    if not id_producto or not id_almacen or not cantidad or not tipo:
        return jsonify({"error": "Faltan datos"}), 400
    if tipo not in ("entrada", "salida"):
        return jsonify({"error": "Tipo inválido"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    signo = 1 if tipo == 'entrada' else -1
    cursor.execute("UPDATE producto SET stock = stock + (%s * %s) WHERE isbn = %s", (signo, cantidad, id_producto))
    cursor.execute("""
        INSERT INTO movimiento_stock (id_producto, id_almacen, cantidad, tipo, fecha)
        VALUES (%s, %s, %s, %s, %s)
    """, (id_producto, id_almacen, cantidad, tipo, fecha))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensaje": "Movimiento registrado"}), 201

@almacen_bp.route('/almacen/stock', methods=['GET'])
def stock_por_almacen():
    id_almacen = request.args.get("id_almacen")
    condiciones = []
    parametros = []
    if id_almacen:
        condiciones.append("m.id_almacen=%s")
        parametros.append(id_almacen)
    where = " AND ".join(condiciones)
    if where:
        where = "WHERE " + where

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(f"""
        SELECT m.id_producto, p.titulo, a.nombre AS almacen,
               SUM(CASE WHEN m.tipo='entrada' THEN m.cantidad ELSE -m.cantidad END) AS stock
        FROM movimiento_stock m
        JOIN producto p ON m.id_producto = p.isbn
        JOIN almacen a ON m.id_almacen = a.id_almacen
        {where}
        GROUP BY m.id_producto, a.id_almacen
        ORDER BY a.nombre, p.titulo
    """, tuple(parametros))
    stock = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"stock": stock})