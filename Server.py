import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. SETUP DATABASE WITH A PASSWORD COLUMN
def init_db():
    conn = sqlite3.connect("chat_of_87.db")
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

# --- DATA MODELS ---
class UserAuth(BaseModel):
    username: str
    password: str

class IncomingMessage(BaseModel):
    username: str
    content: str

# --- AUTH ENDPOINT: AUTO-REGISTER OR LOGIN ---
@app.post("/auth")
def auth_user(user: UserAuth):
    conn = sqlite3.connect("chat_of_87.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT password FROM users WHERE username = ?", (user.username,))
    existing_user = cursor.fetchone()
    
    if existing_user:
        # Username exists -> Check if password matches
        conn.close()
        if existing_user[0] == user.password:
            return {"status": "LOGIN_SUCCESS", "username": user.username}
        else:
            raise HTTPException(status_code=401, detail="INCORRECT PASSWORD.")
    else:
        # Username doesn't exist -> Create account automatically!
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (user.username, user.password)
        )
        conn.commit()
        conn.close()
        return {"status": "REGISTERED", "username": user.username}

@app.post("/send_message")
def send_message(message: IncomingMessage):
    conn = sqlite3.connect("chat_of_87.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (username, content) VALUES (?, ?)",
        (message.username, message.content)
    )
    conn.commit()
    conn.close()
    return {"status": "SUCCESS"}
