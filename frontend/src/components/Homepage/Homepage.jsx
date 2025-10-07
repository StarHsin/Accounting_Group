// frontend/components/Homepage/Homepage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebase";
import { Loader2 } from "lucide-react";

import TopToolsBar from "../tools/TopToolsBar";
import Bottom_functionality_bar from "../tools/Bottom_functionality_bar";
import GroupList from "./GroupList";

export default function Homepage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/groups/?uid=${currentUser.uid}`,
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
        setGroups(data);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError("無法載入群組資料，請檢查網路連線");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 font-sans text-zinc-100">
      <TopToolsBar />

      <main className="flex-1 p-4 overflow-y-auto pb-20">
        <h2 className="text-lg font-bold text-zinc-100 mt-4 mb-2">我的群組</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            <p className="text-gray-400 mt-3">載入中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              重新載入
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-zinc-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">您還沒有加入任何群組</p>
            <p className="text-sm text-gray-500 mt-2">
              點擊下方「+」按鈕建立或加入群組
            </p>
          </div>
        ) : (
          <GroupList
            groups={groups}
            onNavigate={(id) => navigate(`/groups/${id}`)}
          />
        )}
      </main>

      <Bottom_functionality_bar setGroups={setGroups} />
    </div>
  );
}
