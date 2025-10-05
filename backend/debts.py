from flask import Blueprint, request, jsonify
from .config import db
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
import logging

bp = Blueprint("debts", __name__)


@bp.route("/", methods=["POST"])
def add_debt():
    data = request.json
    group_id = data.get("group_id")
    debt_ref = db.collection("groups").document(
        group_id).collection("debts").document()

    # 為每個付款人加上 paid: False（預設）
    payer_list = data.get("payer", [])
    for p in payer_list:
        if "paid" not in p:
            p["paid"] = False

    debt_data = {
        "payer": payer_list,
        "receiver": data.get("receiver"),
        "amount": data.get("amount"),
        "note": data.get("note"),
        "installment": data.get("installment"),
        "current": data.get("current"),
        "paid": False,
        "createdAt": SERVER_TIMESTAMP,
        "payments": [],
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


@bp.route("/<group_id>/<debt_id>", methods=["PUT"])
def update_debt(group_id, debt_id):
    data = request.json
    debt_ref = db.collection("groups").document(
        group_id).collection("debts").document(debt_id)

    if not debt_ref.get().exists:
        return jsonify({"error": "Debt not found"}), 404

    debt_doc = debt_ref.get().to_dict()
    updated = False

    if "markAllPaid" in data:
        for p in debt_doc.get("payer", []):
            p["paid"] = True
        debt_doc["paid"] = True
        updated = True
    elif "markPayerPaid" in data:
        payer_uid = data["markPayerPaid"]
        all_paid = True
        for p in debt_doc.get("payer", []):
            if p["uid"] == payer_uid:
                p["paid"] = True
            if not p.get("paid", False):
                all_paid = False
        if all_paid:
            debt_doc["paid"] = True
        updated = True
    else:
        debt_ref.update(data)
        updated_doc = debt_ref.get().to_dict()
        updated_doc["id"] = debt_id
        return jsonify(updated_doc)

    if updated:
        debt_ref.set(debt_doc)
        debt_doc["id"] = debt_id
        return jsonify(debt_doc)

    return jsonify({"error": "No valid update data"}), 400


@bp.route("/<group_id>/<debt_id>", methods=["DELETE"])
def delete_debt(group_id, debt_id):
    debt_ref = db.collection("groups").document(
        group_id).collection("debts").document(debt_id)
    if not debt_ref.get().exists:
        return jsonify({"error": "Debt not found"}), 404

    debt_ref.delete()
    return jsonify({"success": True, "id": debt_id})


# 🔹群組債務統計（修正版）
@bp.route("/stats/<group_id>", methods=["GET"])
def debt_stats(group_id):
    try:
        debts_ref = db.collection("groups").document(
            group_id).collection("debts")
        debts = []
        for doc in debts_ref.stream():
            d = doc.to_dict()
            # 轉為數值
            if "amount" in d and d["amount"] is not None:
                try:
                    d["amount"] = float(d["amount"])
                except Exception:
                    d["amount"] = 0.0
            # 確保 payer 有 paid 欄位
            if "payer" in d:
                for p in d["payer"]:
                    if "paid" not in p:
                        p["paid"] = False
            debts.append(d)

        debt_by_member = {}
        receive_by_member = {}
        payments_by_member = {}

        total_debt = 0.0
        total_receive = 0.0

        for d in debts:
            payer_list = d.get("payer", [])
            receiver = d.get("receiver")
            amount = float(d.get("amount") or 0)
            if not receiver or "uid" not in receiver:
                # 若無收款人則跳過
                continue
            receiver_uid = receiver["uid"]

            # 轉整數並保護 current/installment
            installment = int(d.get("installment") or 0)
            current = int(d.get("current") or 0)
            if installment > 0 and current > installment:
                current = installment

            for p in payer_list:
                uid = p.get("uid")
                if not uid:
                    continue

                # ============ 分期 (installment > 0) ============
                if installment > 0:
                    # 每位付款人，剩餘期數的總額 = amount * (installment - current)
                    remaining_amount = amount * max(0, (installment - current))

                    # 已付款的金額：直接用 current 計算（修復：移除依賴 p["paid"]，假設 current 即已付期數）
                    # 變更：不再 if p.get("paid", False)
                    paid_amount = amount * current

                    # 還款次數：直接用 current（修復：移除依賴 p["paid"]）
                    paid_count = current  # 變更：不再 if p.get("paid", False)

                # ============ 非分期（一次付清） ============
                else:
                    remaining_amount = amount if not p.get(
                        "paid", False) else 0.0
                    paid_amount = amount if p.get("paid", False) else 0.0
                    paid_count = 1 if p.get("paid", False) else 0

                # 累加未付（個人欠款） -> totalDebt
                if remaining_amount > 0:
                    debt_by_member[uid] = debt_by_member.get(
                        uid, 0) + remaining_amount
                    receive_by_member[receiver_uid] = receive_by_member.get(
                        receiver_uid, 0) + remaining_amount
                    total_debt += remaining_amount

                # 累加已付 -> totalReceive（注意：只有真正已付的才算）
                if paid_amount > 0:
                    total_receive += paid_amount

                # 累加還款次數
                payments_by_member[uid] = payments_by_member.get(
                    uid, 0) + paid_count

        # 取最大值的 member id
        biggest_debtor_id = max(
            debt_by_member, key=debt_by_member.get, default=None) if debt_by_member else None
        biggest_creditor_id = max(
            receive_by_member, key=receive_by_member.get, default=None) if receive_by_member else None
        biggest_payer_id = max(payments_by_member, key=payments_by_member.get,
                               default=None) if payments_by_member else None

        # 回傳（為了整潔把小數轉成整數若是整數值）
        def maybe_int(v):
            return int(v) if isinstance(v, float) and v.is_integer() else v

        # 也把每位 member 的數值轉成可讀型態（float 或 int）
        debt_by_member = {k: maybe_int(v) for k, v in debt_by_member.items()}
        receive_by_member = {k: maybe_int(v)
                             for k, v in receive_by_member.items()}
        payments_by_member = {k: int(v) for k, v in payments_by_member.items()}

        return jsonify({
            "totalDebt": maybe_int(total_debt),
            "totalReceive": maybe_int(total_receive),
            "debtByMember": debt_by_member,
            "receiveByMember": receive_by_member,
            "paymentsByMember": payments_by_member,
            "biggestDebtorId": biggest_debtor_id,
            "biggestCreditorId": biggest_creditor_id,
            "biggestPayerId": biggest_payer_id
        })

    except Exception as e:
        logging.error(f"Error in debt_stats for group {group_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500
