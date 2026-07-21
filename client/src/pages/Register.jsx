import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import WaitMessage from '../components/WaitMessage';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showWaitMessage, setShowWaitMessage] = useState(false);
  const [error, setError] = useState('');
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/feed');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowWaitMessage(false);
    
    const waitTimer = setTimeout(() => {
      setShowWaitMessage(true);
    }, 2000);

    try {
      await register(name, email, password);
      clearTimeout(waitTimer);
    } catch (err) {
      clearTimeout(waitTimer);
      setError(err.response?.data?.message || 'Failed to register');
      setShowWaitMessage(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Register</h2>
        {error && <div className="bg-red-500/20 text-red-500 p-2 rounded mb-4 text-sm">{error}</div>}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Name" 
            className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-gray-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative flex items-center">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password" 
              className="p-2 pr-14 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-gray-700 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-sm text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button type="submit" className="bg-white text-black p-2 rounded hover:bg-gray-200 transition-colors mt-2 cursor-pointer font-medium">
            Sign Up
          </button>
        </form>
      </div>
      {showWaitMessage && <WaitMessage />}
    </div>
  );
};

export default Register;
