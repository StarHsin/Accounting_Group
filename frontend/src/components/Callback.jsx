// frontend/components/Callback.jsx
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { LoaderCircle } from "lucide-react";
import { app } from "../firebase";

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(app);
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      console.error("登入錯誤:", error);
      navigate("/", { replace: true });
      return;
    }

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    signInWithCustomToken(auth, token)
      .then(() => {
        console.log("✅ 登入成功");
        navigate("/Homepage", { replace: true });
      })
      .catch((err) => {
        console.error("Firebase 登入失敗:", err);
        navigate("/", { replace: true });
      });
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
