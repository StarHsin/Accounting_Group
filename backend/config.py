# backend/config.py
import os
import json
from dotenv import load_dotenv
from firebase_admin import credentials, initialize_app, firestore

# Firebase 初始化
load_dotenv()
firebase_account = os.getenv("FIREBASE_SERVICE_ACCOUNT")

if firebase_account:
    service_account_info = json.loads(firebase_account)
    cred = credentials.Certificate(service_account_info)
    print("1111")
else:
    cred = credentials.Certificate(
        "D:/Project/Accounting/backend/serviceAccountKey.json")

default_app = initialize_app(cred)
db = firestore.client()

# LINE 環境變數
LINE_CLIENT_ID = os.getenv("LINE_CLIENT_ID")
LINE_CLIENT_SECRET = os.getenv("LINE_CLIENT_SECRET")
LINE_REDIRECT_URI = os.getenv("LINE_REDIRECT_URI")
