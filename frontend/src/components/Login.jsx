//frontend/components/Login.jsx
import React from "react";
import { SiLine } from "react-icons/si";

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/login";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 p-4">
      <div className="bg-zinc-800 p-8 rounded-xl shadow-lg w-full max-w-sm text-center text-white">
        <h1 className="text-3xl font-bold mb-6">群組記帳</h1>
        <p className="mb-4 text-gray-400">請使用 LINE 登入</p>
        <button
          onClick={handleLogin}
          className="w-full flex justify-center items-center py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700"
        >
          <SiLine className="w-6 h-6 mr-2" />
          使用 LINE 登入
        </button>
      </div>
    </div>
  );
}
