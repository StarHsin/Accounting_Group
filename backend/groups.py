# backend/groups.py
import random
import string
from flask import Blueprint, request, jsonify
from .config import db
from firebase_admin import auth

bp = Blueprint("groups", __name__)


def generate_group_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


@bp.route("/", methods=["POST"])
def create_group():
    data = request.json
    name = data.get("name")
    members = data.get("members", [])

    group_code = generate_group_code()
    group_ref = db.collection("groups").document()
    group_ref.set({
        "name": name,
        "members": members,  # 存成 {uid, displayName, photoUrl}
        "code": group_code
    })

    return jsonify({
        "id": group_ref.id,
        "name": name,
        "members": members,
        "code": group_code
    })


@bp.route("/join", methods=["POST"])
def join_group():
    data = request.json
    code = data.get("code")
    member = data.get("member")  # {uid, displayName, photoUrl}

    groups = db.collection("groups").where("code", "==", code).stream()
    for doc in groups:
        group_ref = db.collection("groups").document(doc.id)
        group_data = doc.to_dict()
        members = group_data.get("members", [])
        if not any(m["uid"] == member["uid"] for m in members):
            members.append(member)
            group_ref.update({"members": members})
        return jsonify({"id": doc.id, **group_data, "members": members})

    return jsonify({"error": "Group not found"}), 404


@bp.route("/", methods=["GET"])
def list_groups():
    uid = request.args.get("uid")  # 從 query string 拿 uid
    if not uid:
        return jsonify({"error": "uid is required"}), 400

    groups = []
    for doc in db.collection("groups").stream():
        g = doc.to_dict()
        g["id"] = doc.id
        # 過濾，只顯示自己有加入的群組
        if any(member["uid"] == uid for member in g.get("members", [])):
            members = g.get("members", [])
            for member in members:
                try:
                    fb_user = auth.get_user(member["uid"])
                    member["displayName"] = fb_user.display_name
                    member["photoUrl"] = fb_user.photo_url
                except:
                    pass
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

    # 🔹 在這裡更新成員資料
    members = data.get("members", [])
    for member in members:
        try:
            fb_user = auth.get_user(member["uid"])
            member["displayName"] = fb_user.display_name
            member["photoUrl"] = fb_user.photo_url
        except:
            pass
    data["members"] = members

    return jsonify(data)
