// frontend/components/GroupView.jsx
import React, { useEffect, useState } from "react";
import DebtForm from "./DebtForm";
import DebtList from "./DebtList";

export default function GroupView({ groupId }) {
  const [debts, setDebts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/debts/${groupId}`)
      .then((res) => res.json())
      .then(setDebts);
  }, [groupId]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">債務紀錄</h2>
      <DebtForm groupId={groupId} onAdded={(d) => setDebts([...debts, d])} />
      <DebtList debts={debts} />
    </div>
  );
}
