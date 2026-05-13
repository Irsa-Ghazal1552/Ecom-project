import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../store/AuthContext";
import { useShop } from "../store/ShopContext";

const Wishlist = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { wishlist, addToCart, removeWishlist } = useShop();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Helmet>
        <title>Wishlist - Luwia</title>
        <meta name="description" content="Saved products for signed-in users" />
      </Helmet>

      <Navbar isOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />
      <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

      <section className="mx-auto max-w-5xl p-6">
        <h1 className="mb-5 text-4xl text-emerald-950">Your Wishlist</h1>

        <div className="grid gap-4 md:grid-cols-2">
          {wishlist.map((item) => (
            <article key={item._id} className="glass-card p-4">
              <h3 className="text-2xl text-emerald-950">{item.name}</h3>
              <p className="mt-2 text-sm text-emerald-900/80">{item.description}</p>
              <p className="mt-2 font-bold text-amber-800">${item.price}</p>
              <div className="mt-3 flex gap-2">
                <button className="gold-button" onClick={() => addToCart(item._id)}>
                  Move to Cart
                </button>
                <button
                  className="rounded-full border border-red-300 px-3 py-1 text-sm text-red-700"
                  onClick={() => removeWishlist(item._id)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
          {wishlist.length === 0 && <p className="text-emerald-900">No items in wishlist.</p>}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Wishlist;
