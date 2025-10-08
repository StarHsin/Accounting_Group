// frontend/components/InstallmentDebtsPage.jsx
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";
import TopToolsBar from "./tools/TopToolsBar";
import BottomFunctionalityBar from "./tools/Bottom_functionality_bar";
import { Loader2 } from "lucide-react";

export default function InstallmentDebtsPage() {
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
      const fetchInstallments = async () => {
        try {
          setLoading(true);
          setError(null);

          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/debts/installments/${
              user.uid
            }`,
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
          console.error("Error fetching installment debts:", err);
          setError("無法載入分期債務，請稍後再試");
        } finally {
          setLoading(false);
        }
      };

      fetchInstallments();
    });

    // 如果 auth 還沒準備好，顯示 loading
    return () => unsubscribe();
  }, [navigate]);

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
          我的分期債務
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
            <p className="text-gray-400">目前沒有分期債務</p>
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
                <span className="text-gray-300">
                  金額：NT$ {d.amount}
                  {d.installment && (
                    <span className="ml-2 text-sm text-gray-400">
                      期數：{d.current}/{d.installment}
                    </span>
                  )}
                </span>
                {d.note && (
                  <span className="text-gray-400">備註：{d.note}</span>
                )}

                {/* 進度條 */}
                {d.installment && (
                  <div className="mt-2">
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(d.current / d.installment) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
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
