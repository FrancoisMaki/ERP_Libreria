from flask import Blueprint, request, jsonify
from models.db import get_connection
from datetime import date

compra_bp = Blueprint('compra', __name__)

@compra_bp.route('/compras/', methods=['GET'])
def listar_compras():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT c.id_cabcompra, c.fecha, c.total, c.moneda,
               p.nombre as proveedor
        FROM cabcompra c
        JOIN proveedor p ON c.id_proveedor = p.id_proveedor
        ORDER BY c.fecha DESC, c.id_cabcompra DESC
        LIMIT 100
    """)
    compras = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"compras": compras})

@compra_bp.route('/compras/', methods=['POST'])
def crear_compra():
    data = request.get_json()
    id_proveedor = data.get("id_proveedor")
    fecha = data.get("fecha", date.today().isoformat())
    id_almacen = data.get("id_almacen")
    moneda = data.get("moneda", "EUR")
    lineas = data.get("lineas", [])

    if not id_proveedor or not id_almacen or not lineas:
        return jsonify({"error": "Datos incompletos"}), 400

    conn = get_connection()
    try:
        cursor = conn.cursor()
        # 1. Crear la cabecera de compra
        cursor.execute("""
            INSERT INTO cabcompra (id_proveedor, fecha, total, moneda)
            VALUES (%s, %s, 0, %s)
        """, (id_proveedor, fecha, moneda))
        id_cabcompra = cursor.lastrowid

        total = 0

        for idx, l in enumerate(lineas):
            isbn = l.get('isbn')
            titulo = l.get('titulo')
            precio_unitario = l.get('precio_unitario')
            cantidad = l.get('cantidad')
            estado = l.get('estado', 'nuevo')
            fecha_publicacion = l.get('fecha_publicacion') or None
            imagen_url = l.get('imagen_url') or None

            # Validación estricta de cada línea
            if not isbn or not titulo or precio_unitario is None or cantidad is None:
                return jsonify({"error": f"Datos incompletos en la línea {idx + 1}"}), 400

            try:
                precio_unitario = float(precio_unitario)
                cantidad = int(cantidad)
            except ValueError:
                return jsonify({"error": f"Cantidad o precio inválido en la línea {idx + 1}"}), 400

            # 2. Verifica si el producto existe
            cursor.execute("SELECT COUNT(*) FROM producto WHERE isbn=%s", (isbn,))
            existe = cursor.fetchone()[0]

            if not existe:
                cursor.execute("""
                    INSERT INTO producto (isbn, titulo, precio, stock, fecha_publicacion, estado, imagen_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (isbn, titulo, precio_unitario, cantidad, fecha_publicacion, estado, imagen_url))
            else:
                cursor.execute("""
                    UPDATE producto
                    SET stock = stock + %s, precio = %s
                    WHERE isbn = %s
                """, (cantidad, precio_unitario, isbn))

            # 3. Inserta la línea de compra
            cursor.execute("""
                INSERT INTO lincompra (id_cabcompra, id_producto, cantidad, precio_unitario)
                VALUES (%s, %s, %s, %s)
            """, (id_cabcompra, isbn, cantidad, precio_unitario))

            # 4. Movimiento de stock
            cursor.execute("""
                INSERT INTO movimiento_stock (id_producto, id_almacen, cantidad, tipo, fecha)
                VALUES (%s, %s, %s, 'entrada', %s)
            """, (isbn, id_almacen, cantidad, fecha))

            total += cantidad * precio_unitario

        # 5. Actualiza el total de la compra
        cursor.execute("UPDATE cabcompra SET total=%s WHERE id_cabcompra=%s", (total, id_cabcompra))
        conn.commit()
        return jsonify({"mensaje": "Compra registrada", "id_cabcompra": id_cabcompra}), 201

    except Exception as e:
        conn.rollback()
        print(f"❌ Error al registrar compra: {e}")
        return jsonify({"error": "Error al registrar compra"}), 500
    finally:
        cursor.close()
        conn.close()

@compra_bp.route('/compras/<int:id_cabcompra>', methods=['GET'])
def detalle_compra(id_cabcompra):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    # Cabecera
    cursor.execute("""
        SELECT c.id_cabcompra, c.fecha, c.total, c.moneda,
               p.nombre as proveedor, p.cif, p.email, p.telefono
        FROM cabcompra c
        JOIN proveedor p ON c.id_proveedor = p.id_proveedor
        WHERE c.id_cabcompra = %s
    """, (id_cabcompra,))
    cabecera = cursor.fetchone()
    if not cabecera:
        cursor.close()
        conn.close()
        return jsonify({"error": "Compra no encontrada"}), 404
    # Líneas de compra
    cursor.execute("""
        SELECT l.id_lincompra, l.id_producto as isbn, pr.titulo, l.cantidad, l.precio_unitario
        FROM lincompra l
        JOIN producto pr ON l.id_producto = pr.isbn
        WHERE l.id_cabcompra = %s
    """, (id_cabcompra,))
    lineas = cursor.fetchall()
    # Pagos de compra
    cursor.execute("""
        SELECT id_pagocompra, fecha_pago, cantidad, metodo_pago
        FROM pagocompra
        WHERE id_cabcompra = %s
        ORDER BY fecha_pago ASC, id_pagocompra ASC
    """, (id_cabcompra,))
    pagos = cursor.fetchall()
    cursor.close()
    conn.close()
    cabecera["lineas"] = lineas
    cabecera["pagos"] = pagos
    pagado = sum(p['cantidad'] for p in pagos) if pagos else 0
    pendiente = float(cabecera['total'] or 0) - pagado
    cabecera["pendiente"] = round(pendiente, 2)
    return jsonify(cabecera)

@compra_bp.route('/compras/<int:id_cabcompra>/pagos', methods=['GET'])
def listar_pagos_compra(id_cabcompra):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id_pagocompra, fecha_pago, cantidad, metodo_pago
        FROM pagocompra
        WHERE id_cabcompra = %s
        ORDER BY fecha_pago ASC, id_pagocompra ASC
    """, (id_cabcompra,))
    pagos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({'pagos': pagos})

@compra_bp.route('/compras/<int:id_cabcompra>/pagos', methods=['POST'])
def crear_pago_compra(id_cabcompra):
    data = request.get_json()
    cantidad = data.get("cantidad")
    fecha_pago = data.get("fecha_pago", date.today().isoformat())
    metodo_pago = data.get("metodo_pago", "Transferencia")
    if not cantidad:
        return jsonify({"error": "Falta cantidad"}), 400
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO pagocompra (id_cabcompra, fecha_pago, cantidad, metodo_pago)
        VALUES (%s, %s, %s, %s)
    """, (id_cabcompra, fecha_pago, cantidad, metodo_pago))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensaje": "Pago registrado"}), 201