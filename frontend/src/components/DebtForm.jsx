//frontend/components/DebtForm.jsx
import React, { useState } from "react";

export default function DebtForm({ groupId, onAdded }) {
  const [payer, setPayer] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/debts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_id: groupId, payer, receiver, amount }),
    });
    const data = await res.json();
    onAdded(data);
    setPayer("");
    setReceiver("");
    setAmount("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        value={payer}
        onChange={(e) => setPayer(e.target.value)}
        placeholder="付款人"
      />
      <input
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
        placeholder="收款人"
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="金額"
      />
      <button type="submit">新增</button>
    </form>
  );
}
