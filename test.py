# import os
# from dotenv import load_dotenv
# import mysql.connector
# from mysql.connector import Error

# # Cargar las variables del archivo .env
# load_dotenv()

# # Obtener los valores de conexión
# DB_HOST = os.getenv("DB_HOST")
# DB_PORT = int(os.getenv("DB_PORT", 21316))
# DB_USER = os.getenv("DB_USER")
# DB_PASSWORD = os.getenv("DB_PASSWORD")
# DB_NAME = os.getenv("DB_NAME")

# try:
#     # Intentar conectar a la base de datos
#     connection = mysql.connector.connect(
#         host=DB_HOST,
#         port=DB_PORT,
#         user=DB_USER,
#         password=DB_PASSWORD,
#         database=DB_NAME
#     )

#     if connection.is_connected():
#         print("✅ Conexión exitosa a la base de datos.")
#         stmt = connection.cursor()
#         stmt.execute("select * from pais;")
#         current_database = stmt.fetchall()
#         print("Base de datos actual:", current_database)
#         connection.close()

# except Error as e:
#     print("❌ Error al conectar a la base de datos:")
#     print(e)


from werkzeug.security import generate_password_hash
print(generate_password_hash('admin123'))