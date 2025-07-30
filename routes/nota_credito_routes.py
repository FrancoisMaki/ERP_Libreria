from flask import Blueprint, jsonify, request, send_file, render_template
from models.db import get_connection
from utils.auth import login_required_api
from io import BytesIO
import pdfkit
import os

nota_credito_bp = Blueprint('nota_credito', __name__)

# Listar notas de crédito
@nota_credito_bp.route('/notas_credito/', methods=['GET'])
@login_required_api
def listar_notas_credito():
    page = int(request.args.get('pagina', 1))
    per_page = int(request.args.get('por_pagina', 10))
    offset = (page - 1) * per_page

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT nc.id_nota_credito, nc.fecha, nc.total, nc.moneda, nc.motivo, 
                   f.id_cabfac, cl.nombre as cliente_nombre, cl.nif as cliente_nif
            FROM nota_credito nc
            INNER JOIN cabfac f ON nc.id_cabfac = f.id_cabfac
            INNER JOIN cliente cl ON f.id_cliente = cl.id_cliente
            ORDER BY nc.id_nota_credito DESC
            LIMIT %s OFFSET %s
        """, (per_page, offset))
        notas = cursor.fetchall()
        return jsonify({"notas_credito": notas})
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()

# Detalle de nota de crédito
@nota_credito_bp.route('/notas_credito/<int:id_nota_credito>', methods=['GET'])
@login_required_api
def detalle_nota_credito(id_nota_credito):
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT nc.id_nota_credito, nc.fecha, nc.total, nc.moneda, nc.motivo, 
                   f.id_cabfac, cl.nombre as cliente_nombre, cl.nif as cliente_nif
            FROM nota_credito nc
            INNER JOIN cabfac f ON nc.id_cabfac = f.id_cabfac
            INNER JOIN cliente cl ON f.id_cliente = cl.id_cliente
            WHERE nc.id_nota_credito = %s
        """, (id_nota_credito,))
        cabecera = cursor.fetchone()
        if not cabecera:
            return jsonify({"error": "Nota de crédito no encontrada"}), 404

        cursor.execute("""
            SELECT l.id_lin_nota, l.id_producto, p.titulo, l.cantidad, l.precio_unitario
            FROM lin_nota_credito l
            INNER JOIN producto p ON l.id_producto = p.isbn
            WHERE l.id_nota_credito = %s
        """, (id_nota_credito,))
        lineas = cursor.fetchall()

        return jsonify({"cabecera": cabecera, "lineas": lineas})
    except Exception as e:
        print(f"❌ Error al consultar nota de crédito: {e}")
        return jsonify({"error": "Error en la consulta"}), 500
    finally:
        cursor.close()
        conn.close()

# Crear nota de crédito (inverso de factura)
@nota_credito_bp.route('/notas_credito/', methods=['POST'])
@login_required_api
def crear_nota_credito():
    data = request.get_json()
    id_cabfac = data.get("id_cabfac")
    fecha = data.get("fecha")
    motivo = data.get("motivo")
    lineas = data.get("lineas", [])

    if not id_cabfac or not fecha or not lineas:
        return jsonify({"error": "Datos incompletos"}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        cursor = conn.cursor()
        # Calcular total: todos los importes van en negativo
        total = sum([-1 * float(l['cantidad']) * float(l['precio_unitario']) for l in lineas])

        # Obtener moneda de la factura
        cursor.execute("SELECT moneda FROM cabfac WHERE id_cabfac=%s", (id_cabfac,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Factura no encontrada"}), 404
        moneda = row[0]

        # Insertar nota de crédito
        cursor.execute("""
            INSERT INTO nota_credito (id_cabfac, fecha, motivo, total, moneda)
            VALUES (%s, %s, %s, %s, %s)
        """, (id_cabfac, fecha, motivo, total, moneda))
        id_nota_credito = cursor.lastrowid

        # Insertar líneas
        for l in lineas:
            cursor.execute("""
                INSERT INTO lin_nota_credito (id_nota_credito, id_producto, cantidad, precio_unitario)
                VALUES (%s, %s, %s, %s)
            """, (id_nota_credito, l['id_producto'], l['cantidad'], l['precio_unitario']))

        conn.commit()
        return jsonify({"mensaje": "Nota de crédito creada correctamente", "id_nota_credito": id_nota_credito}), 201
    except Exception as e:
        print(f"❌ Error al crear nota de crédito: {e}")
        return jsonify({"error": "Error al crear nota de crédito"}), 500
    finally:
        cursor.close()
        conn.close()

# Descargar PDF de nota de crédito
@nota_credito_bp.route('/notas_credito/<int:id_nota_credito>/pdf', methods=['GET'])
@login_required_api
def nota_credito_pdf(id_nota_credito):
    conn = get_connection()
    if conn is None:
        return "No se pudo conectar a la base de datos", 500
    try:
        cursor = conn.cursor(dictionary=True)
        # Cabecera
        cursor.execute("""
            SELECT nc.id_nota_credito, nc.fecha, nc.total, nc.moneda, nc.motivo,
                   f.id_cabfac, cl.nombre as cliente_nombre, cl.nif, cl.direccion as cliente_direccion
            FROM nota_credito nc
            INNER JOIN cabfac f ON nc.id_cabfac = f.id_cabfac
            INNER JOIN cliente cl ON f.id_cliente = cl.id_cliente
            WHERE nc.id_nota_credito = %s
        """, (id_nota_credito,))
        cabecera = cursor.fetchone()
        if not cabecera:
            return "Nota de crédito no encontrada", 404

        # Líneas
        cursor.execute("""
            SELECT l.id_lin_nota, l.id_producto, p.titulo, l.cantidad, l.precio_unitario
            FROM lin_nota_credito l
            INNER JOIN producto p ON l.id_producto = p.isbn
            WHERE l.id_nota_credito = %s
        """, (id_nota_credito,))
        lineas = cursor.fetchall()

        html = render_template("ventas/nota_credito_pdf.html",
                               cabecera=cabecera,
                               lineas=lineas)
        
        # Configura el path de wkhtmltopdf si es necesario (especialmente en Windows)
        path_wkhtmltopdf = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
        if os.name == "nt":
            config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)
        else:
            config = None

        pdf = pdfkit.from_string(html, False, configuration=config)
        return send_file(BytesIO(pdf),
                         as_attachment=True,
                         download_name=f"nota_credito_{id_nota_credito}.pdf",
                         mimetype='application/pdf')
    except Exception as e:
        print(f"❌ Error al generar PDF: {e}")
        return "Error al generar PDF", 500
    finally:
        cursor.close()
        conn.close()