import psycopg2
from psycopg2 import pool
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize a connection pool from environment variables
connection_pool = psycopg2.pool.SimpleConnectionPool(
    1, 20,
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    database=os.getenv("DB_NAME")
)

def get_db_connection():
    try:
        conn = connection_pool.getconn()
        if conn:
            return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise

def close_db_connection(conn):
    if conn:
        connection_pool.putconn(conn)

# FastAPI dependency to yield a connection
async def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        close_db_connection(conn)