# backend/main.py
from flask import Flask
from flask_cors import CORS

# 從同 package 匯入
from backend.auth import bp as auth_bp
from backend.groups import bp as groups_bp
from backend.debts import bp as debts_bp

app = Flask(__name__)
CORS(app, origins=["https://accounting-group.vercel.app"])

# 註冊藍圖
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(groups_bp, url_prefix="/api/groups")
app.register_blueprint(debts_bp, url_prefix="/api/debts")

if __name__ == "__main__":
    app.run(debug=False, port=5000)
