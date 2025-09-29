# backend/debts.py
from flask import Blueprint, request, jsonify
from .config import db

bp = Blueprint("debts", __name__)


@bp.route("/", methods=["POST"])
def add_debt():
    data = request.json
    group_id = data.get("group_id")
    debt_ref = db.collection("groups").document(
        group_id).collection("debts").document()

    debt_data = {
        "payer": data.get("payer", []),
        "receiver": data.get("receiver"),
        "amount": data.get("amount"),
        "note": data.get("note"),
        "installment": data.get("installment"),
        "current": data.get("current"),
        "paid": False,  # 🔹新增欄位：是否已付
        "createdAt": SERVER_TIMESTAMP,
    }

    debt_ref.set(debt_data)
    saved_doc = debt_ref.get()
    saved_data = saved_doc.to_dict()
    saved_data["id"] = debt_ref.id

    return jsonify(saved_data), 201


@bp.route("/<group_id>", methods=["GET"])
def list_debts(group_id):
    debts = []
    for doc in db.collection("groups").document(group_id).collection("debts").stream():
        d = doc.to_dict()
        d["id"] = doc.id
        debts.append(d)
    return jsonify(debts)


# 🔹更新某筆債務
@bp.route("/<group_id>/<debt_id>", methods=["PUT"])
def update_debt(group_id, debt_id):
    data = request.json
    debt_ref = db.collection("groups").document(
        group_id).collection("debts").document(debt_id)

    if not debt_ref.get().exists:
        return jsonify({"error": "Debt not found"}), 404

    # 更新資料（只更新傳進來的欄位）
    debt_ref.update(data)
    updated_doc = debt_ref.get().to_dict()
    updated_doc["id"] = debt_id
    return jsonify(updated_doc)


# 🔹刪除某筆債務
@bp.route("/<group_id>/<debt_id>", methods=["DELETE"])
def delete_debt(group_id, debt_id):
    debt_ref = db.collection("groups").document(
        group_id).collection("debts").document(debt_id)

    if not debt_ref.get().exists:
        return jsonify({"error": "Debt not found"}), 404

    debt_ref.delete()
    return jsonify({"success": True, "id": debt_id})
