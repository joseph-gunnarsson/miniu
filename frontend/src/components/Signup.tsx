import { useState } from "react";
import ErrorMessage from "./ErrorMessage";

export default function Signup() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setError(""); // Clear any existing errors
      const response = await fetch("/api/user/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password_hash:password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to sign up");
        return;
      }

      alert("Signup successful! You can now log in.");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error during signup:", err);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-[900px] max-w-[99%] h-[100] grow">
          <ErrorMessage message={error} />
      <div className="bg-black shadow-inner text-sm bg-opacity-10 rounded-lg p-4 text-white w-full max-w-md">
        <h1 className="text-center text-3xl mb-4">Sign Up for Miniu</h1>
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
          <div>
            <label htmlFor="confirmPassword" className="block text-lg mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Confirm your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md text-lg"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-lg mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-400 hover:underline">
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
}
