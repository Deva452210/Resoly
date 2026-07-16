const Login = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Login</h2>
        <form className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button type="button" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-500 transition-colors mt-2">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
