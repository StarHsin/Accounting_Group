// frontend/components/tools/TopToolsBar.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom"; // 新增 useLocation

export default function TopToolsBar({ title }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // 取得當前路由

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleBack = () => {
    navigate("/Homepage"); // 導向 Homepage
  };

  // 判斷是否在 Homepage，若是就不顯示箭頭
  const showBackArrow = location.pathname !== "/Homepage";

  return (
    <header className="flex items-center justify-between p-4 bg-zinc-800 shadow-sm">
      {showBackArrow ? (
        <ArrowLeft
          className="text-zinc-100 cursor-pointer"
          onClick={handleBack}
        />
      ) : (
        <div className="w-6" /> // 保留空間讓標題置中
      )}

      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold text-zinc-100">
          {title || new Date().toLocaleDateString()}
        </span>
      </div>

      <Avatar>
        <AvatarImage src={user?.photoURL} alt={user?.displayName || "me"} />
        <AvatarFallback>{user?.displayName?.[0] || "ME"}</AvatarFallback>
      </Avatar>
    </header>
  );
}
