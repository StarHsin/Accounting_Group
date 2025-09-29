// frontend/components/Homepage/Homepage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebase";

import TopToolsBar from "../tools/TopToolsBar";
import Bottom_functionality_bar from "../tools/Bottom_functionality_bar";
import GroupList from "./GroupList";

export default function Homepage() {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/groups/?uid=${currentUser.uid}`
        );
        if (!res.ok) throw new Error("Fetch groups failed");
        const data = await res.json();
        setGroups(data);
      } catch (err) {
        console.error(err);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 font-sans text-zinc-100">
      <TopToolsBar />

      <main className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-zinc-100 mt-4 mb-2">我的群組</h2>
        <GroupList
          groups={groups}
          onNavigate={(id) => navigate(`/groups/${id}`)}
        />
      </main>

      <Bottom_functionality_bar setGroups={setGroups} />
    </div>
  );
}
