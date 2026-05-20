import { Link } from "react-router-dom";

const Navbar = ({ isOpen, toggleMenu }) => {
  const categories = [
    { label: "Rings", query: "Rings", type: "category" },
    { label: "Necklaces", query: "Necklaces", type: "category" },
    { label: "Earrings", query: "Earrings", type: "category" },
    { label: "Bracelets", query: "Bracelets", type: "category" },
    { label: "Watches", query: "Watches", type: "category" },
    { label: "Bags", query: "Bags", type: "category" },
    { label: "Shoes", query: "Shoes", type: "category" },
    { label: "Wedding", query: "wedding", type: "theme" },
    { label: "Corporate", query: "corporate", type: "theme" },
    { label: "Daily Wear", query: "dailywear", type: "theme" },
    { label: "Gifts", query: "gifts", type: "theme" },
    { label: "Gothic", query: "gothic", type: "theme" },
    { label: "Desi", query: "desi", type: "theme" }
  ];

  return (
    <div
      className={`fixed top-0 left-0 z-50 h-full w-72 border-r border-amber-100 bg-[#fdfbf6] shadow-lg transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 overflow-y-auto`}
    >
      <button onClick={toggleMenu} className="w-full p-4 text-right text-xl text-emerald-900 font-semibold">
        ✕ Close
      </button>

      {/* Main Navigation */}
      <div className="flex flex-col gap-2 px-4 py-2 text-emerald-900">
        <Link onClick={toggleMenu} to="/" className="menu-link px-3 py-2 rounded-lg hover:bg-emerald-50 transition">
          🏠 Home
        </Link>
        <Link onClick={toggleMenu} to="/products" className="menu-link px-3 py-2 rounded-lg hover:bg-emerald-50 transition">
          📦 All Products
        </Link>
        <Link onClick={toggleMenu} to="/wishlist" className="menu-link px-3 py-2 rounded-lg hover:bg-emerald-50 transition">
          ❤️ Wishlist
        </Link>
        <Link onClick={toggleMenu} to="/orders" className="menu-link px-3 py-2 rounded-lg hover:bg-emerald-50 transition">
          📋 Order Tracking
        </Link>
        <Link onClick={toggleMenu} to="/cart" className="menu-link px-3 py-2 rounded-lg hover:bg-emerald-50 transition">
          🛒 Cart & Checkout
        </Link>
      </div>

      {/* Categories Section */}
      <div className="border-t border-amber-200 mt-4 pt-4 px-4">
        <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-3">Shop by Category</h3>
        <div className="flex flex-col gap-1">
          {categories.map((category) => (
            <Link
              key={category}
              onClick={toggleMenu}
              to={`/products?${category.type}=${encodeURIComponent(category.query)}`}
              className="text-sm text-emerald-800 px-3 py-2 rounded-lg hover:bg-emerald-100 transition"
            >
              → {category.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Admin Section */}
      <div className="border-t border-amber-200 mt-4 pt-4 px-4">
        <Link onClick={toggleMenu} to="/dashboard" className="block text-sm font-semibold text-emerald-900 px-3 py-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition">
          ⚙️ Admin Dashboard
        </Link>
      </div>

      {/* Footer Info */}
      <div className="border-t border-amber-200 mt-4 pt-4 px-4 pb-6 text-xs text-slate-600">
        <p className="mb-2">Luwia Jewelry 💎</p>
        <p>Fine jewellery, curated for everyday luxury</p>
      </div>
    </div>
  );
};

export default Navbar;