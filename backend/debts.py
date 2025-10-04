# backend/debts.py
from flask import Blueprint, request, jsonify
from .config import db
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

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

# 🔹群組債務統計（搬移前端運算邏輯到後端）


@bp.route("/stats/<group_id>", methods=["GET"])
def debt_stats(group_id):
    try:
        # 讀取該群組的債務資料
        debts_ref = db.collection("groups").document(
            group_id).collection("debts")
        debts = [doc.to_dict() for doc in debts_ref.stream()]

        unpaid = [d for d in debts if not d.get("paid", False)]
        debt_by_member = {}
        receive_by_member = {}

        for d in unpaid:
            amount = float(d.get("amount", 0) or 0)
            receiver = d.get("receiver")
            if receiver and "uid" in receiver:
                receive_by_member[receiver["uid"]] = receive_by_member.get(
                    receiver["uid"], 0) + amount

            payer_list = d.get("payer", [])
            if isinstance(payer_list, list) and len(payer_list) > 0:
                share = amount / len(payer_list)
                for p in payer_list:
                    if "uid" in p:
                        debt_by_member[p["uid"]] = debt_by_member.get(
                            p["uid"], 0) + share

        total_debt = sum(debt_by_member.values())
        total_receive = sum(receive_by_member.values())

        biggest_debtor_id = max(
            debt_by_member, key=debt_by_member.get, default=None)
        biggest_creditor_id = max(
            receive_by_member, key=receive_by_member.get, default=None)

        return jsonify({
            "totalDebt": total_debt,
            "totalReceive": total_receive,
            "debtByMember": debt_by_member,
            "receiveByMember": receive_by_member,
            "biggestDebtorId": biggest_debtor_id,
            "biggestCreditorId": biggest_creditor_id
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
