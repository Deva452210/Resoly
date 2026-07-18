import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === "officer" ? "/officer-dashboard" : "/feed");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Login
        </h2>
        {error && (
          <div className="bg-red-500/20 text-red-500 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-white text-gray-800 p-2 rounded hover:bg-gray-300 transition-colors mt-2 cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
