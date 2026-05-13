import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../store/AuthContext";
import { useShop } from "../store/ShopContext";

const Cart = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [address, setAddress] = useState("Sandbox Street, Demo City");
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [status, setStatus] = useState("");
  const { user } = useAuth();
  const { cart, updateCartQty, removeCartItem, checkout, applyCoupon, getCartReminder } = useShop();

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
    [cart]
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Helmet>
        <title>Cart and Checkout - Luwia</title>
        <meta name="description" content="Manage cart and complete checkout in sandbox mode" />
      </Helmet>

      <Navbar isOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />
      <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

      <section className="mx-auto max-w-5xl p-6">
        <h1 className="mb-4 text-4xl text-emerald-950">Your Cart</h1>

        <button
          className="mb-4 rounded-full border border-amber-200 px-4 py-2 text-sm text-emerald-900"
          onClick={async () => {
            const res = await getCartReminder();
            setStatus(res.message);
          }}
        >
          Check Abandoned Cart Reminder
        </button>

        {cart.length === 0 ? (
          <div className="glass-card p-6 text-emerald-900">No items in cart yet.</div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.product?._id} className="glass-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl text-emerald-950">{item.product?.name}</h3>
                  <p className="text-sm text-emerald-900/80">${item.product?.price} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateCartQty(item.product?._id, Number(e.target.value))}
                    className="w-20 rounded border border-amber-100 px-2 py-1"
                  />
                  <button
                    onClick={() => removeCartItem(item.product?._id)}
                    className="rounded-full border border-red-300 px-3 py-1 text-sm text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="glass-card p-5">
              <p className="text-lg">Total: <strong>${total.toFixed(2)}</strong></p>

              <label className="mt-3 block text-sm">Coupon</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full rounded border border-amber-100 px-3 py-2"
                  placeholder="Try SAVE10 / FLAT50 / NEWUSER15"
                />
                <button
                  className="rounded-full border border-emerald-900 px-3 text-sm text-emerald-900"
                  onClick={async () => {
                    try {
                      const res = await applyCoupon(couponCode);
                      setCouponResult(res);
                      setStatus(`Coupon applied: save $${res.discount}`);
                    } catch (error) {
                      setCouponResult(null);
                      setStatus(error.response?.data?.message || "Invalid coupon");
                    }
                  }}
                >
                  Apply
                </button>
              </div>
              {couponResult && (
                <p className="mt-2 text-sm text-emerald-800">
                  Discounted total: ${couponResult.finalTotal.toFixed(2)}
                </p>
              )}

              <label className="mt-3 block text-sm">Shipping Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded border border-amber-100 px-3 py-2"
              />
              <button
                className="gold-button mt-4"
                onClick={async () => {
                  const res = await checkout({
                    shippingAddress: address,
                    couponCode
                  });
                  setStatus(res.message || "Checkout complete");
                  setCouponResult(null);
                  setCouponCode("");
                }}
              >
                Checkout (Sandbox)
              </button>
              {status && <p className="mt-3 text-sm text-emerald-900">{status}</p>}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
};

export default Cart;