
import { useState } from "react";
import { NavLink } from "react-router";
import ErrorMessage from "./ErrorMessage";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/login/", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }
      
      const data = await response.json();
      console.log("Login successful:", data);

      window.location.href = "/home";
    } catch (err: any) {
      console.error("Login error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  



  return (
    <div className="flex flex-col justify-center items-center w-[900px] max-w-[99%] h-[100] grow">
      <ErrorMessage message={error} />

      <div className="bg-black shadow-inner text-sm bg-opacity-10 rounded-lg p-4 text-white w-full max-w-md">
        <h1 className="text-center text-3xl mb-4">Login to Miniu</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-lg mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-lg mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md text-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-lg mt-4">
          Don't have an account?{" "}
          <NavLink to="/signup" className="text-indigo-400 hover:underline">
            Sign up here
          </NavLink>
        </p>
      </div>
    </div>
  );
}
