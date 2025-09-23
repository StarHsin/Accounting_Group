// frontend/components/tools/CreateGroupModal.jsx
import { useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";

export default function CreateGroupModal({ setOpen, setGroups }) {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        members: [
          {
            uid: user.uid,
            displayName: user.displayName,
            photoUrl: user.photoURL,
          },
        ],
      }),
    });

    const data = await res.json();
    setGroups((prev) => [...prev, data]);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-zinc-800 p-6 rounded-xl shadow-lg w-80 text-zinc-100">
        <h2 className="text-lg font-bold mb-4">建立群組</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="輸入群組名稱"
          className="border p-2 w-full mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setOpen(false)}
            className=" px-4 py-2 border border-zinc-600 rounded"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-zinc-700 text-zinc-100 rounded"
          >
            建立
          </button>
        </div>
      </div>
    </div>
  );
}
