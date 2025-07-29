from flask import Blueprint, jsonify, request, send_file, render_template
from models.db import get_connection
from utils.auth import login_required_api
from io import BytesIO
import pdfkit
import os

factura_bp = Blueprint('factura', __name__)

# Listar facturas (con filtros opcionales y búsqueda por NIF)
@factura_bp.route('/facturas/', methods=['GET'])
@login_required_api
def listar_facturas():
    page = int(request.args.get('pagina', 1))
    per_page = int(request.args.get('por_pagina', 10))
    cliente = request.args.get('cliente', '').strip()
    fecha = request.args.get('fecha', '').strip()
    moneda = request.args.get('moneda', '').strip()
    nif = request.args.get('nif', '').strip()
    offset = (page - 1) * per_page

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        params = []
        filtro = []
        join_cliente = "INNER JOIN cliente cl ON cf.id_cliente = cl.id_cliente"
        if cliente:
            filtro.append("cf.id_cliente = %s")
            params.append(cliente)
        if fecha:
            filtro.append("cf.fecha = %s")
            params.append(fecha)
        if moneda:
            filtro.append("cf.moneda = %s")
            params.append(moneda)
        if nif:
            filtro.append("cl.nif LIKE %s")
            params.append(f"%{nif}%")
        where_clause = f"WHERE {' AND '.join(filtro)}" if filtro else ""
        # Total
        cursor.execute(f"""
            SELECT COUNT(*) as total
            FROM cabfac cf
            {join_cliente}
            {where_clause}
        """, params)
        total = cursor.fetchone()['total']
        params2 = params + [per_page, offset]
        cursor.execute(f"""
            SELECT cf.id_cabfac, cf.id_cliente, cl.nombre as cliente_nombre, cl.nif as cliente_nif, cf.fecha, cf.total, cf.moneda
            FROM cabfac cf
            {join_cliente}
            {where_clause}
            ORDER BY cf.id_cabfac DESC
            LIMIT %s OFFSET %s
        """, params2)
        facturas = cursor.fetchall()
        total_paginas = (total + per_page - 1) // per_page
        return jsonify({
            "total": total,
            "pagina": page,
            "por_pagina": per_page,
            "total_paginas": total_paginas,
            "facturas": facturas
        })
    except Exception as e:
        print(f"❌ Error en la consulta: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()

# Detalle de factura (cabfac + líneas)
@factura_bp.route('/facturas/<int:id_cabfac>', methods=['GET'])
@login_required_api
def detalle_factura(id_cabfac):
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.id_cabfac, c.id_cliente, cl.nombre as cliente_nombre, c.fecha, c.total, c.moneda
            FROM cabfac c
            INNER JOIN cliente cl ON c.id_cliente = cl.id_cliente
            WHERE c.id_cabfac = %s
        """, (id_cabfac,))
        cabecera = cursor.fetchone()
        if not cabecera:
            return jsonify({"error": "Factura no encontrada"}), 404

        cursor.execute("""
            SELECT l.id_linfac, l.id_producto, p.titulo, l.cantidad, l.precio_unitario
            FROM linfac l
            INNER JOIN producto p ON l.id_producto = p.isbn
            WHERE l.id_cabfac = %s
        """, (id_cabfac,))
        lineas = cursor.fetchall()

        return jsonify({
            "cabecera": cabecera,
            "lineas": lineas
        })
    except Exception as e:
        print(f"❌ Error al consultar factura: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()

# Listar pagos de una factura
@factura_bp.route('/facturas/<int:id_cabfac>/pagos', methods=['GET'])
@login_required_api
def listar_pagos(id_cabfac):
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_pago, fecha_pago, cantidad, metodo_pago
            FROM cobropago
            WHERE id_cabfac = %s
            ORDER BY fecha_pago ASC
        """, (id_cabfac,))
        pagos = cursor.fetchall()
        return jsonify({"pagos": pagos})
    except Exception as e:
        print(f"❌ Error al listar pagos: {e}")
        return jsonify({"error": "Error al listar pagos"}), 500
    finally:
        cursor.close()
        conn.close()

# Descargar PDF de factura usando pdfkit y wkhtmltopdf
@factura_bp.route('/facturas/<int:id_cabfac>/pdf', methods=['GET'])
@login_required_api
def factura_pdf(id_cabfac):
    conn = get_connection()
    if conn is None:
        return "No se pudo conectar a la base de datos", 500
    try:
        cursor = conn.cursor(dictionary=True)
        # Cabecera
        cursor.execute("""
            SELECT c.id_cabfac, c.fecha, c.total, c.moneda,
                   cl.nombre as cliente_nombre, cl.nif, cl.direccion as cliente_direccion
            FROM cabfac c
            INNER JOIN cliente cl ON c.id_cliente = cl.id_cliente
            WHERE c.id_cabfac = %s
        """, (id_cabfac,))
        cabecera = cursor.fetchone()
        if not cabecera:
            return "Factura no encontrada", 404

        # Líneas
        cursor.execute("""
            SELECT l.id_linfac, l.id_producto, p.titulo, l.cantidad, l.precio_unitario
            FROM linfac l
            INNER JOIN producto p ON l.id_producto = p.isbn
            WHERE l.id_cabfac = %s
        """, (id_cabfac,))
        lineas = cursor.fetchall()

        # Pagos
        cursor.execute("""
            SELECT fecha_pago, cantidad, metodo_pago
            FROM cobropago
            WHERE id_cabfac = %s
            ORDER BY fecha_pago
        """, (id_cabfac,))
        pagos = cursor.fetchall()

        html = render_template("ventas/factura_pdf.html",
                               cabecera=cabecera,
                               lineas=lineas,
                               pagos=pagos)
        
        # Configura el path de wkhtmltopdf si es necesario (especialmente en Windows)
        path_wkhtmltopdf = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
        if os.name == "nt":
            config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)
        else:
            config = None

        pdf = pdfkit.from_string(html, False, configuration=config)
        return send_file(BytesIO(pdf),
                         as_attachment=True,
                         download_name=f"factura_{id_cabfac}.pdf",
                         mimetype='application/pdf')
    except Exception as e:
        print(f"❌ Error al generar PDF: {e}")
        return "Error al generar PDF", 500
    finally:
        cursor.close()
        conn.close()

@factura_bp.route('/facturas/<int:id_cabfac>/pagos', methods=['POST'])
@login_required_api
def agregar_pago(id_cabfac):
    data = request.get_json()
    cantidad = data.get("cantidad")
    metodo_pago = data.get("metodo_pago")
    fecha_pago = data.get("fecha_pago")  # Debe venir en formato 'YYYY-MM-DD'

    if not cantidad or not metodo_pago or not fecha_pago:
        return jsonify({"error": "Datos incompletos"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO cobropago (id_cabfac, cantidad, metodo_pago, fecha_pago)
            VALUES (%s, %s, %s, %s)
        """, (id_cabfac, cantidad, metodo_pago, fecha_pago))
        conn.commit()
        return jsonify({"mensaje": "Pago registrado correctamente"}), 201
    except Exception as e:
        print(f"❌ Error al registrar pago: {e}")
        return jsonify({"error": "Error al registrar pago"}), 500
    finally:
        cursor.close()
        conn.close()

# ...lo anterior igual...
# Crear factura (cabfac + linfac + pago inicial opcional)
@factura_bp.route('/facturas/', methods=['POST'])
@login_required_api
def crear_factura():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    data = request.get_json()
    id_cliente = data.get("id_cliente")
    fecha = data.get("fecha")
    moneda = data.get("moneda")
    lineas = data.get("lineas", [])  # lista de dicts: {id_producto, cantidad, precio_unitario}
    pago_inicial = data.get("pago_inicial")

    if not id_cliente or not fecha or not moneda or not lineas:
        return jsonify({"error": "Datos incompletos"}), 400

    try:
        cursor = conn.cursor()
        # Calcular total
        total = sum([float(l['cantidad']) * float(l['precio_unitario']) for l in lineas])

        # Insertar cabecera
        cursor.execute("""
            INSERT INTO cabfac (id_cliente, fecha, total, moneda)
            VALUES (%s, %s, %s, %s)
        """, (id_cliente, fecha, total, moneda))
        id_cabfac = cursor.lastrowid

        # Insertar líneas
        for l in lineas:
            cursor.execute("""
                INSERT INTO linfac (id_cabfac, id_producto, cantidad, precio_unitario)
                VALUES (%s, %s, %s, %s)
            """, (id_cabfac, l['id_producto'], l['cantidad'], l['precio_unitario']))

        # NUEVO: Registrar pago inicial si viene
        if pago_inicial:
            cantidad = pago_inicial.get("cantidad")
            metodo_pago = pago_inicial.get("metodo_pago")
            fecha_pago = pago_inicial.get("fecha_pago")
            if cantidad and metodo_pago and fecha_pago:
                cursor.execute("""
                    INSERT INTO cobropago (id_cabfac, cantidad, metodo_pago, fecha_pago)
                    VALUES (%s, %s, %s, %s)
                """, (id_cabfac, cantidad, metodo_pago, fecha_pago))

        conn.commit()
        return jsonify({"mensaje": "Factura creada correctamente", "id_cabfac": id_cabfac}), 201
    except Exception as e:
        print(f"❌ Error al crear factura: {e}")
        return jsonify({"error": "Error al crear factura"}), 500
    finally:
        cursor.close()
        conn.close()
# ...lo demás igual...