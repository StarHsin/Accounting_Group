// frontend/components/Callback.jsx
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

    // 檢查是否已經登入
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 已登入，直接導向 Homepage
        navigate("/Homepage", { replace: true });
      } else {
        // 處理 LINE callback
        processLogin();
      }
    });

    const processLogin = async () => {
      const code = searchParams.get("code");
      if (!code) {
        navigate("/", { replace: true });
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
          // 延遲導向以確保 auth 狀態更新
          setTimeout(() => {
            navigate("/Homepage", { replace: true });
          }, 500);
        } else {
          console.error("登入失敗:", data);
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("登入錯誤:", err);
        navigate("/", { replace: true });
      }
    };

    return () => unsubscribe();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="bg-zinc-800 p-10 rounded-2xl shadow-xl flex flex-col items-center text-white">
        <LoaderCircle className="animate-spin h-12 w-12 text-emerald-500 mb-6" />
        <h1 className="text-2xl font-bold">登入中...</h1>
      </div>
    </div>
  );
}
