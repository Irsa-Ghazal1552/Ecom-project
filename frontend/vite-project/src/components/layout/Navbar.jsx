import { Link } from "react-router-dom";

const Navbar = ({ isOpen, toggleMenu }) => {
  return (
    <div
      className={`fixed top-0 left-0 z-50 h-full w-72 border-r border-amber-100 bg-[#fdfbf6] shadow-lg transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 z-50`}
    >
      <button onClick={toggleMenu} className="w-full p-4 text-right text-xl text-emerald-900">
        ✕
      </button>

      <div className="flex flex-col gap-4 px-6 py-2 text-emerald-900">
        <Link onClick={toggleMenu} to="/" className="menu-link">Home</Link>
        <Link onClick={toggleMenu} to="/products" className="menu-link">All Products</Link>
        <Link onClick={toggleMenu} to="/wishlist" className="menu-link">Wishlist</Link>
        <Link onClick={toggleMenu} to="/orders" className="menu-link">Order Tracking</Link>
        <Link onClick={toggleMenu} to="/cart" className="menu-link">Cart and Checkout</Link>
        <Link onClick={toggleMenu} to="/dashboard" className="menu-link">Admin Dashboard</Link>
      </div>
    </div>
  );
};

export default Navbar;