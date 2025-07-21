import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

# Cargar variables del .env
load_dotenv()

def get_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            port=int(os.getenv("DB_PORT", 21316))
        )
        if conn.is_connected():
            print("✅ Conexión exitosa a la base de datos.")
            return conn
    except Error as e:
        print(f"❌ Error al conectar a la base de datos: {e}")
        return None
