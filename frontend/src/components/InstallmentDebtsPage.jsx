// frontend/components/InstallmentDebtsPage.jsx
"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import TopToolsBar from "./tools/TopToolsBar";
import BottomFunctionalityBar from "./tools/Bottom_functionality_bar";

export default function InstallmentDebtsPage() {
  const [debts, setDebts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstallments = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/debts/installments/${user.uid}`
        );
        const data = await res.json();
        setDebts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInstallments();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 text-zinc-100 font-sans">
      <TopToolsBar />
      <main className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-zinc-100 mt-4 mb-3">
          我的分期債務
        </h2>
        {debts.length === 0 ? (
          <p className="text-gray-400">目前沒有分期債務</p>
        ) : (
          <div className="space-y-3">
            {debts.map((d, i) => (
              <div
                key={i}
                className="p-4 bg-zinc-800 rounded-lg shadow-md flex flex-col space-y-1"
              >
                <span className="text-white font-medium">
                  收款人：{d.receiver?.displayName || "未知"}
                </span>
                <span className="text-gray-300">
                  金額：{d.amount}　
                  {d.installment ? `期數：${d.current}/${d.installment}` : ""}
                </span>
                {d.note && (
                  <span className="text-gray-400">備註：{d.note}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomFunctionalityBar />
    </div>
  );
}
