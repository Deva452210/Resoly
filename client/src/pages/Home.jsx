const Home = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Note for judges:</h1>
      <div className="text-lg text-gray-400 mb-8 max-w-2xl text-left bg-gray-900 p-8 rounded-xl border border-gray-800">
        <p className="mb-4">You have to login with 3 accounts one by one to see the full flow.</p>
        
        <h3 className="text-white font-bold mt-4 mb-2">1. Citizen Login</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1 text-sm text-gray-300">
          <li>You can register and log in OR</li>
          <li>Use my credentials: <br/><span className="text-white">Email:</span> <span className="text-yellow-400 font-bold">devakarun01@gmail.com</span> <br/><span className="text-white">Password:</span> <span className="text-yellow-400 font-bold">deva01</span></li>
        </ul>

        <h3 className="text-white font-bold mt-4 mb-2">2. Officer Login</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1 text-sm text-gray-300">
          <li><span className="text-white">Email:</span> <span className="text-yellow-400 font-bold">officer@resoly.com</span></li>
          <li><span className="text-white">Password:</span> <span className="text-yellow-400 font-bold">password123</span></li>
        </ul>

        <h3 className="text-white font-bold mt-4 mb-2">3. Higher Authority Login</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1 text-sm text-gray-300">
          <li><span className="text-white">Email:</span> <span className="text-yellow-400 font-bold">authority@resoly.com</span></li>
          <li><span className="text-white">Password:</span> <span className="text-yellow-400 font-bold">password123</span></li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
