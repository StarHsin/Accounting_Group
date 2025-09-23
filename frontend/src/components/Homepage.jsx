// frontend/components/Homepage.jsx
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowRight, TextAlignJustify } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Bottom_functionality_bar from "./tools/Bottom_functionality_bar";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";

export default function Homepage() {
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setUser(currentUser);

    const fetchGroups = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/groups/?uid=${currentUser.uid}`
        );
        const data = await res.json();
        if (res.ok) setGroups(data);
        else console.error("Fetch groups failed:", data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 font-sans text-zinc-100">
      {/* 頂部導覽列 */}
      <header className="flex items-center justify-between p-4 bg-zinc-800 shadow-sm">
        <TextAlignJustify className="text-zinc-100" />
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-zinc-100">
            {new Date().toLocaleDateString()}
          </span>
        </div>
        <Avatar>
          <AvatarImage src={user?.photoURL} alt="me" />
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
      </header>

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
