// frontend/components/DueDebtsPage.jsx
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import TopToolsBar from "./tools/TopToolsBar";
import BottomFunctionalityBar from "./tools/Bottom_functionality_bar";
import { Loader2 } from "lucide-react";

export default function DueDebtsPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authReady, setAuthReady] = useState(false); // 新增：追蹤 auth 準備狀態
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthReady(true); // auth 已準備好

      if (!user) {
        // 未登入，導向登入頁
        navigate("/", { replace: true });
        return;
      }

      // 已登入，載入資料
      const fetchDueDebts = async () => {
        try {
          setLoading(true);
          setError(null);

          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/debts/due/${user.uid}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const data = await res.json();
          setDebts(data);
        } catch (err) {
          console.error("Error fetching due debts:", err);
          setError("無法載入債務資料，請稍後再試");
        } finally {
          setLoading(false);
        }
      };

      fetchDueDebts();
    });

    // 如果 auth 還沒準備好，顯示 loading
    return () => unsubscribe();
  }, [navigate]);

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

  // 如果 auth 還沒準備好，顯示全域 loading
  if (!authReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        <p className="text-gray-400 mt-3">初始化中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 text-zinc-100 font-sans">
      <TopToolsBar />

      <main className="flex-1 p-4 overflow-y-auto pb-20">
        <h2 className="text-lg font-bold text-zinc-100 mt-4 mb-3">
          即將到期的債務
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            <p className="text-gray-400 mt-3">載入中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        ) : debts.length === 0 ? (
          <div className="bg-zinc-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">目前沒有即將到期的債務</p>
          </div>
        ) : (
          <div className="space-y-3">
            {debts.map((d, i) => (
              <div
                key={i}
                className="p-4 bg-zinc-800 rounded-lg shadow-md flex flex-col space-y-1 hover:bg-zinc-750 transition-colors"
              >
                <span className="text-white font-medium">
                  收款人：{d.receiver?.displayName || "未知"}
                </span>
                <span className="text-gray-300">金額：NT$ {d.amount}</span>
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
