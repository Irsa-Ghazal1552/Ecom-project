import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../store/AuthContext";
import { useShop } from "../store/ShopContext";
import API from "../services/api";

const Orders = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tracking, setTracking] = useState({});
  const { user } = useAuth();
  const { orders } = useShop();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Helmet>
        <title>Order Tracking - Luwia</title>
        <meta name="description" content="Track placed orders and shipment status" />
      </Helmet>

      <Navbar isOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />
      <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

      <section className="mx-auto max-w-5xl p-6">
        <h1 className="mb-5 text-4xl text-emerald-950">Order Tracking</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order._id} className="glass-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-2xl text-emerald-950">Order {order._id.slice(-6).toUpperCase()}</h3>
                <span className="rounded-full border border-amber-300 px-3 py-1 text-xs uppercase tracking-wide text-amber-800">
                  {order.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-emerald-900/80">Payment: {order.paymentStatus}</p>
              <p className="text-sm text-emerald-900/80">Total: ${order.totalAmount.toFixed(2)}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-emerald-900/85">
                {order.items.map((item) => (
                  <li key={item._id || item.product?._id}>
                    {item.product?.name || "Product"} x {item.quantity}
                  </li>
                ))}
              </ul>

              <button
                className="mt-3 rounded-full border border-emerald-900 px-3 py-1 text-xs text-emerald-900"
                onClick={async () => {
                  const res = await API.get(`/orders/track/${order._id}`);
                  setTracking((prev) => ({ ...prev, [order._id]: res.data.timeline || [] }));
                }}
              >
                Fetch Real-Time Tracking
              </button>

              {tracking[order._id]?.length > 0 && (
                <div className="mt-2 rounded border border-amber-100 p-2">
                  <p className="text-xs font-semibold text-emerald-900">Timeline</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    {tracking[order._id].map((step) => (
                      <span
                        key={step.step}
                        className={`rounded-full px-2 py-1 ${step.completed ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}
                      >
                        {step.step}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
          {orders.length === 0 && <p className="text-emerald-900">No orders placed yet.</p>}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Orders;
