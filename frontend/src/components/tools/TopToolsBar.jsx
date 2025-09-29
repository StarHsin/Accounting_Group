// frontend/components/tools/TopToolsBar.jsx
import React, { useState, useEffect } from "react";
import { TextAlignJustify } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../firebase";

export default function TopToolsBar({ title }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className="flex items-center justify-between p-4 bg-zinc-800 shadow-sm">
      <TextAlignJustify className="text-zinc-100" />

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
