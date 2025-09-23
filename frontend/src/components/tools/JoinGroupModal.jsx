// frontend/components/tools/JoinGroupModal.jsx
import { useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";

export default function JoinGroupModal({ setOpen, setGroups }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/groups/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            member: {
              uid: user.uid,
              displayName: user.displayName,
              photoUrl: user.photoURL,
            },
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // 成功加入群組，更新列表
        setGroups((prev) => [...prev, data]);
        setOpen(false);
      } else {
        setError(data.error || "加入群組失敗");
      }
    } catch (err) {
      console.error(err);
      setError("網路錯誤，請稍後再試");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 p-6 rounded-xl shadow-lg w-80 text-zinc-100">
        <h2 className="text-lg font-bold mb-4">加入群組</h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="輸入群組碼"
          className="border p-2 w-full mb-2"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 border border-zinc-600 rounded"
          >
            取消
          </button>
          <button
            onClick={handleJoin}
            className="px-4 py-2 bg-zinc-700 text-zinc-100 rounded"
          >
            加入
          </button>
        </div>
      </div>
    </div>
  );
}
