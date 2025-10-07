// frontend/components/DueDebtsPage.jsx
"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import TopToolsBar from "./tools/TopToolsBar";
import BottomFunctionalityBar from "./tools/Bottom_functionality_bar";

export default function DueDebtsPage() {
  const [debts, setDebts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDueDebts = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/debts/due/${user.uid}`
        );
        const data = await res.json();
        setDebts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDueDebts();
  }, []);

  // 🔹 新增：格式化日期的函式
  const formatDate = (dateValue) => {
    if (!dateValue) return "未設定";

    try {
      // Firestore Timestamp 格式
      if (dateValue._seconds) {
        const d = new Date(dateValue._seconds * 1000);
        return d.toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      }

      // ISO 字串格式
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return "未設定";

      return d.toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "未設定";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 text-zinc-100 font-sans">
      <TopToolsBar />
      <main className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-zinc-100 mt-4 mb-3">
          即將到期的債務
        </h2>
        {debts.length === 0 ? (
          <p className="text-gray-400">目前沒有即將到期的債務</p>
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
                <span className="text-gray-300">金額：{d.amount}</span>

                {/* 🔹 修改這裡 */}
                <span className="text-gray-400">
                  到期日：{formatDate(d.due_date)}
                </span>

                {d.note && (
                  <span className="text-gray-500">備註：{d.note}</span>
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
