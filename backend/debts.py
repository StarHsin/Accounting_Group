# backend/debts.py
from flask import Blueprint, request, jsonify
from .config import db

bp = Blueprint("debts", __name__)


@bp.route("/", methods=["POST"])
def add_debt():
    data = request.json
    members = data.get("members", [])
    group_id = data.get("group_id")
    debt_ref = db.collection("groups").document(
        group_id).collection("debts").document()

    # 存入 Firestore 的資料，不包含 id
    debt_data = {
        "payer": data.get("payer"),
        "receiver": data.get("receiver"),
        "amount": data.get("amount"),
        "note": data.get("note"),
        "installment": data.get("installment"),
        "current": data.get("current"),
    }

    # 寫入
    debt_ref.set(debt_data)

    # 回傳時補上 id
    return jsonify({"id": debt_ref.id, **debt_data})


@bp.route("/<group_id>", methods=["GET"])
def list_debts(group_id):
    debts = []
    for doc in db.collection("groups").document(group_id).collection("debts").stream():
        d = doc.to_dict()
        d["id"] = doc.id  # 查詢時補上 id
        debts.append(d)
    return jsonify(debts)
