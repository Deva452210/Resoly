import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-wider">
          RESOLY
        </Link>
        <div className="flex gap-4">
          <Link to="/feed" className="hover:text-blue-400 transition-colors">Feed</Link>
          <Link to="/officer-dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
          <Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link>
          <Link to="/register" className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-500 transition-colors">Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
