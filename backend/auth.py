# backend/auth.py
import requests
from flask import Blueprint, request, jsonify, redirect
from firebase_admin import auth
import firebase_admin

from .config import LINE_CLIENT_ID, LINE_CLIENT_SECRET, LINE_REDIRECT_URI

bp = Blueprint("auth", __name__)


@bp.route("/login")
def login():
    url = (
        f"https://access.line.me/oauth2/v2.1/authorize?"
        f"response_type=code&client_id={LINE_CLIENT_ID}"
        f"&redirect_uri={LINE_REDIRECT_URI}&state=12345"
        f"&scope=openid%20profile"
    )
    return redirect(url)


@bp.route("/callback", methods=["POST"])
def callback():
    data = request.json
    code = data.get("code")
    if not code:
        return jsonify({"error": "No code provided"}), 400

    # 1. code 換 token
    token_url = "https://api.line.me/oauth2/v2.1/token"
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": LINE_REDIRECT_URI,
        "client_id": LINE_CLIENT_ID,
        "client_secret": LINE_CLIENT_SECRET,
    }
    r = requests.post(token_url, data=payload, headers={
                      "Content-Type": "application/x-www-form-urlencoded"})
    token_data = r.json()
    id_token = token_data.get("id_token")
    if not id_token:
        return jsonify({"error": "Failed to get ID token", "details": token_data}), 400

    # 2. 驗證 id_token
    verify_url = "https://api.line.me/oauth2/v2.1/verify"
    vr = requests.post(verify_url, data={
                       "id_token": id_token, "client_id": LINE_CLIENT_ID})
    user_info = vr.json()

    if "sub" not in user_info:
        return jsonify({"error": "Invalid LINE token", "details": user_info}), 401

    line_uid = user_info["sub"]
    display_name = user_info.get("name")
    picture = user_info.get("picture")

    # 3. 建立或取得 Firebase user
    try:
        user = auth.get_user(line_uid)
        auth.update_user(
            line_uid,
            display_name=display_name,
            photo_url=picture
        )
    except firebase_admin._auth_utils.UserNotFoundError:
        user = auth.create_user(
            uid=line_uid, display_name=display_name, photo_url=picture)

    # 4. 產生 Firebase custom token
    custom_token = auth.create_custom_token(user.uid)

    return jsonify({"firebase_token": custom_token.decode("utf-8")})


@bp.route("/me", methods=["GET"])
def get_me():
    # 前端應該帶 Firebase token
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"error": "No token"}), 401
    try:
        decoded = auth.verify_id_token(token)
        user = auth.get_user(decoded["uid"])
        return jsonify({
            "uid": user.uid,
            "display_name": user.display_name,
            "photo_url": user.photo_url
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 401
