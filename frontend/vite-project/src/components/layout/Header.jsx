import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

const Header = ({ toggleMenu }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-40 border-b border-amber-100 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
                <div className="flex items-center gap-3">
                    <button onClick={toggleMenu} className="text-2xl text-emerald-900" aria-label="Open menu">
                        ☰
                    </button>
                    <Link to="/" className="font-serif text-lg tracking-[0.2em] text-emerald-950 md:text-xl">
                        LUWIA
                    </Link>
                </div>

                <nav className="hidden items-center gap-5 text-sm text-emerald-900 md:flex">
                    <Link to="/products" className="hover:text-amber-700">Products</Link>
                    <Link to="/wishlist" className="hover:text-amber-700">Wishlist</Link>
                    <Link to="/orders" className="hover:text-amber-700">Orders</Link>
                    <Link to="/cart" className="hover:text-amber-700">Cart</Link>
                    {user?.role === "admin" && (
                        <Link to="/dashboard" className="hover:text-amber-700">Dashboard</Link>
                    )}
                </nav>

                <div className="flex items-center gap-3 text-sm">
                    {user ? (
                        <>
                            <span className="hidden text-emerald-900 md:block">{user.name}</span>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate("/");
                                }}
                                className="rounded-full border border-emerald-900 px-3 py-1 text-emerald-900 hover:bg-emerald-900 hover:text-white"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="rounded-full bg-emerald-900 px-4 py-1 text-white hover:bg-emerald-800"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;