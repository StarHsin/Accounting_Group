//frontend/components/DebtList.jsx
import React from "react";

export default function DebtList({ debts }) {
  return (
    <ul>
      {debts.map((d) => (
        <li key={d.id}>
          {d.payer} → {d.receiver} : {d.amount} 元
        </li>
      ))}
    </ul>
  );
}
