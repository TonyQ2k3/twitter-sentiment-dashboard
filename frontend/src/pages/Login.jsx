import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { setToken, isAuthenticated } from "../auth";
import { logo } from "../assets";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) 
        throw new Error("Login failed");
      const data = await res.json();
      setToken(data.access_token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  });

  return (
  <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 overflow-hidden">
    
    {/* Decorative blurred background blobs */}
    <div className="absolute w-72 h-72 bg-purple-300 dark:bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse top-[-4rem] left-[-4rem]"></div>
    <div className="absolute w-96 h-96 bg-indigo-300 dark:bg-indigo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse bottom-[-6rem] right-[-6rem]"></div>

    {/* Login Form */}
    <form onSubmit={handleSubmit} className="relative z-10 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] dark:shadow-[0_20px_50px_rgba(0,_0,_0,_0.3)] w-96 border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:translate-y-[-5px]">
      <div className="flex items-center justify-center gap-3 mb-6">
        {/* Logo Image or Fallback Circle Logo */}
        <img src={logo} alt="" className="w-10 h-10" />
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight">
          Social Scope
        </h1>
      </div>

      {error && <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">{error}</p>}
      <div className="mb-5">
        <input
          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all duration-200 text-base"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <input
          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all duration-200 text-base"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white py-3 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transform transition-all duration-300 hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
        Sign In
      </button>
      <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-300">
        Don't have an account?{" "}
        <a href="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200">
          Register now
        </a>
      </p>
    </form>
  </main>
);

}
