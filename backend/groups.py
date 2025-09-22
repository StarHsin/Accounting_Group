# backend/groups.py
from flask import Blueprint, request, jsonify
from .config import db

bp = Blueprint("groups", __name__)


@bp.route("/", methods=["POST"])
def create_group():
    data = request.json
    name = data.get("name")
    members = data.get("members", [])
    group_ref = db.collection("groups").document()
    group_ref.set({"name": name, "members": members})
    return jsonify({"id": group_ref.id, "name": name, "members": members})


@bp.route("/", methods=["GET"])
def list_groups():
    groups = []
    for doc in db.collection("groups").stream():
        g = doc.to_dict()
        g["id"] = doc.id
        groups.append(g)
    return jsonify(groups)
