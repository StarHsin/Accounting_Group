# backend/groups.py
import random
import string
import time
from flask import Blueprint, request, jsonify
from .config import db
from firebase_admin import auth
from functools import lru_cache


bp = Blueprint("groups", __name__)


def generate_group_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


@lru_cache(maxsize=1000)
def get_user_cached(uid):
    """快取 Firebase user 資料"""
    try:
        user = auth.get_user(uid)
        return {
            "uid": uid,
            "displayName": user.display_name or "",
            "photoUrl": user.photo_url or ""
        }
    except Exception as e:
        print(f"[WARN] 無法取得 Firebase 使用者 {uid}: {e}")
        return None


@bp.route("/", methods=["POST"])
def create_group():
    data = request.json
    name = data.get("name")
    members = data.get("members", [])

    if not name or not members:
        return jsonify({"error": "Missing group name or members"}), 400

    group_code = generate_group_code()
    group_ref = db.collection("groups").document()

    # 寫入 Firestore
    group_ref.set({
        "name": name,
        "members": members,  # 已含 displayName / photoUrl
        "code": group_code,
        "createdAt": time.time(),
    })

    return jsonify({
        "id": group_ref.id,
        "name": name,
        "members": members,
        "code": group_code,
    })


@bp.route("/join", methods=["POST"])
def join_group():
    data = request.json
    code = data.get("code")
    member = data.get("member")

    if not code or not member:
        return jsonify({"error": "Missing code or member"}), 400

    groups = db.collection("groups").where("code", "==", code).stream()
    for doc in groups:
        group_ref = db.collection("groups").document(doc.id)
        group_data = doc.to_dict()
        members = group_data.get("members", [])

        # 避免重複加入
        if not any(m["uid"] == member["uid"] for m in members):
            members.append(member)
            group_ref.update({"members": members})

        return jsonify({"id": doc.id, **group_data, "members": members})

    return jsonify({"error": "Group not found"}), 404


@bp.route("/", methods=["GET"])
def list_groups():
    uid = request.args.get("uid")
    if not uid:
        return jsonify({"error": "uid is required"}), 400

    groups = []
    docs = db.collection("groups").stream()

    for doc in docs:
        g = doc.to_dict()
        g["id"] = doc.id

        # 過濾屬於此使用者的群組
        if not any(m.get("uid") == uid for m in g.get("members", [])):
            continue

        members = []
        for m in g.get("members", []):
            # 如果 member 已有顯示資料，直接用（方法 1）
            if m.get("displayName") and m.get("photoUrl"):
                members.append(m)
            else:
                # 否則查 Firebase（方法 2 快取）
                user_info = get_user_cached(m["uid"])
                if user_info:
                    members.append(user_info)
                else:
                    members.append({
                        "uid": m["uid"],
                        "displayName": "未知使用者",
                        "photoUrl": ""
                    })

        g["members"] = members
        groups.append(g)

    return jsonify(groups)


@bp.route("/<group_id>", methods=["GET"])
def get_group(group_id):
    doc = db.collection("groups").document(group_id).get()
    if not doc.exists:
        return jsonify({"error": "Group not found"}), 404

    data = doc.to_dict()
    data["id"] = doc.id

    # 確保成員資料完整
    members = []
    for m in data.get("members", []):
        if m.get("displayName") and m.get("photoUrl"):
            members.append(m)
        else:
            cached = get_user_cached(m["uid"])
            members.append(
                cached or {"uid": m["uid"], "displayName": "未知使用者", "photoUrl": ""})
    data["members"] = members

    return jsonify(data)


@bp.route("/full/<group_id>", methods=["GET"])
def get_full_group(group_id):
    try:
        group_doc = db.collection("groups").document(group_id).get()
        if not group_doc.exists:
            return jsonify({"error": "Group not found"}), 404

        group_data = group_doc.to_dict()
        group_data["id"] = group_id

        # 補齊成員資訊
        members = []
        for m in group_data.get("members", []):
            if m.get("displayName") and m.get("photoUrl"):
                members.append(m)
            else:
                members.append(get_user_cached(m["uid"]))
        group_data["members"] = members

        # 同時取得債務資料
        debts_ref = db.collection("groups").document(
            group_id).collection("debts")
        debts = []
        for doc in debts_ref.stream():
            d = doc.to_dict()
            d["id"] = doc.id
            debts.append(d)

        group_data["debts"] = debts

        return jsonify(group_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
