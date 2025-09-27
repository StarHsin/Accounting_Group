// frontend/components/Homepage.jsx
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowRight, TextAlignJustify } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Bottom_functionality_bar from "./tools/Bottom_functionality_bar";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import TopToolsBar from "./tools/TopToolsBar";

export default function Homepage() {
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
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
      {/* 頂部導覽列 */}
      <TopToolsBar />

      {/* 主要內容 */}
      <main className="flex-1 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-zinc-100 mt-4 mb-2">我的群組</h2>
        <div className="space-y-4">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="p-4 bg-zinc-800 rounded-lg shadow-md flex items-center justify-between cursor-pointer"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <div className="flex items-center space-x-4">
                {/* 成員頭像 */}
                <div className="flex -space-x-2">
                  {group.members?.map((m, idx) => (
                    <Avatar key={idx}>
                      <AvatarImage src={m.photoUrl} alt={m.displayName} />
                      <AvatarFallback>{m.displayName[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div>
                  <h3 className="text-md font-semibold text-zinc-100">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-400">群組碼: {group.code}</p>
                </div>
              </div>
              <ArrowRight className="text-gray-400" />
            </Card>
          ))}
        </div>
      </main>

      <Bottom_functionality_bar setGroups={setGroups} />
    </div>
  );
}
