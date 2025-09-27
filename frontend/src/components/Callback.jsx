//frontend/components/Callback.jsx
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import { LoaderCircle } from "lucide-react";
import { app } from "../firebase";

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);

    // 1️⃣ 先檢查是否已經登入過
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 已登入，直接導向 Homepage
        navigate("/Homepage");
      } else {
        // 沒有登入，處理 LINE callback
        processLogin();
      }
    });

    const processLogin = async () => {
      const code = searchParams.get("code");
      if (!code) {
        navigate("/");
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/callback`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          }
        );

        const data = await res.json();
        if (data.firebase_token) {
          await signInWithCustomToken(auth, data.firebase_token);
          console.log("✅ 登入成功:", auth.currentUser);
          navigate("/Homepage");
        } else {
          console.error("登入失敗:", data);
          navigate("/");
        }
      } catch (err) {
        console.error("登入錯誤:", err);
        navigate("/");
      }
    };

    return () => unsubscribe();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl flex flex-col items-center">
        <LoaderCircle className="animate-spin h-12 w-12 text-cyan-700 mb-6" />
        <h1 className="text-2xl font-bold">登入中...</h1>
      </div>
    </div>
  );
}
