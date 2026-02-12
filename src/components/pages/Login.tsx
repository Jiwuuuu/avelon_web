import { useState } from "react";
import avelonLogo from "../../assets/avelon_nobg.png";


interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = () => {
    if (!email || !password) {
      alert("Enter credentials");
      return;
    }
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-3xl shadow-lg p-8 border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <img src={avelonLogo.src} alt="Logo" className="h-[125px] mb-4" />
          <p className="text-center text-sm text-gray-500">
            Admin Panel Login
          </p>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            placeholder="admin@avelon.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 transition"
        >
          Login
        </button>

        <p className="text-xs text-gray-400 text-center mt-6">
          Protected by AI-based risk models & secure authentication
        </p>
      </div>
    </div>
  );
}