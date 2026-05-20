import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import Footer from "../components/layout/Footer";
import API from "../services/api";

const initialForm = {
  name: "",
  price: "",
  category: "",
  brand: "Luwia",
  rating: "4.2",
  description: "",
  image: "",
  seoTitle: "",
  seoDescription: "",
  keywords: "",
  seoSlug: "",
  metaRobots: "index,follow",
  canonicalUrl: ""
};

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [ordersByUser, setOrdersByUser] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [status, setStatus] = useState("");

  const stats = useMemo(() => {
    const ordersCount = ordersByUser.reduce((sum, u) => sum + (u.orders?.length || 0), 0);
    const totalSales = ordersByUser.reduce(
      (sum, u) => sum + (u.orders || []).reduce((acc, order) => acc + (order.totalAmount || 0), 0),
      0
    );
    return { ordersCount, totalSales };
  }, [ordersByUser]);

  const loadData = async () => {
    const [productsRes, usersRes, ordersRes] = await Promise.all([
      API.get("/products"),
      API.get("/users"),
      API.get("/orders")
    ]);
    setProducts(productsRes.data);
    setUsers(usersRes.data);
    setOrdersByUser(ordersRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Featured collection control (admin)
  const [featured, setFeatured] = useState(null);
  const [updatingFeatured, setUpdatingFeatured] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get("/settings/featured-collection");
        setFeatured(res.data);
      } catch {
        setFeatured(null);
      }
    };
    fetchFeatured();
  }, []);

  const updateFeatured = async (theme) => {
    setUpdatingFeatured(true);
    try {
      const res = await API.put("/settings/featured-collection", { theme });
      setFeatured(res.data);
      await loadData();
    } catch {
      // ignore
    } finally {
      setUpdatingFeatured(false);
    }
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      rating: Number(form.rating || 4),
      keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    };

    if (editingId) {
      await API.put(`/products/${editingId}`, payload);
      setStatus("Product updated.");
    } else {
      await API.post("/products", payload);
      setStatus("Product created.");
    }

    setForm(initialForm);
    setEditingId("");
    loadData();
  };

  const beginEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      price: product.price || "",
      category: product.category || "",
      brand: product.brand || "Luwia",
      rating: product.rating || "4",
      description: product.description || "",
      image: product.image || "",
      seoTitle: product.seoTitle || "",
      seoDescription: product.seoDescription || "",
      keywords: (product.keywords || []).join(", "),
      seoSlug: product.seoSlug || "",
      metaRobots: product.metaRobots || "index,follow",
      canonicalUrl: product.canonicalUrl || ""
    });
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Admin Dashboard - Luwia</title>
        <meta name="description" content="Manage products, SEO tags, users, and order tracking" />
      </Helmet>

      <section className="mx-auto max-w-6xl p-6">
        <h1 className="mb-5 text-4xl text-emerald-950">Admin Dashboard</h1>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="glass-card p-4"><p className="text-xs">Products</p><p className="text-3xl">{products.length}</p></div>
          <div className="glass-card p-4"><p className="text-xs">Users</p><p className="text-3xl">{users.length}</p></div>
          <div className="glass-card p-4"><p className="text-xs">Orders</p><p className="text-3xl">{stats.ordersCount}</p></div>
          <div className="glass-card p-4"><p className="text-xs">Total Sales</p><p className="text-3xl">${stats.totalSales.toFixed(2)}</p></div>
        </div>

        <div className="mb-6">
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold text-emerald-900 mb-2">Featured Collection</h3>
            <p className="text-sm text-slate-700 mb-3">Current: {featured?.label || "(none)"}</p>
            <div className="flex gap-2">
              {[
                "wedding",
                "corporate",
                "dailywear",
                "gifts",
                "gothic",
                "desi"
              ].map((t) => (
                <button key={t} className="rounded-full border px-3 py-1 text-sm text-emerald-900" onClick={() => updateFeatured(t)} disabled={updatingFeatured}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={submitProduct} className="glass-card space-y-3 p-5">
            <h2 className="text-3xl text-emerald-950">
              {editingId ? "Edit Product + SEO" : "Create Product + SEO"}
            </h2>

            <input className="w-full rounded border p-2" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            <input className="w-full rounded border p-2" placeholder="Price" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required type="number" min="0" />
            <input className="w-full rounded border p-2" placeholder="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            <input className="w-full rounded border p-2" placeholder="Brand" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
            <input className="w-full rounded border p-2" placeholder="Rating (0-5)" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} type="number" min="0" max="5" step="0.1" />
            <input className="w-full rounded border p-2" placeholder="Image URL" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
            <textarea className="w-full rounded border p-2" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />

            <h3 className="pt-2 text-xl text-emerald-950">On-Page SEO Fields</h3>
            <input className="w-full rounded border p-2" placeholder="SEO Title" value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
            <textarea className="w-full rounded border p-2" placeholder="SEO Description" value={form.seoDescription} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))} />
            <input className="w-full rounded border p-2" placeholder="Keywords comma-separated" value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} />
            <input className="w-full rounded border p-2" placeholder="SEO Slug" value={form.seoSlug} onChange={(e) => setForm((f) => ({ ...f, seoSlug: e.target.value }))} />
            <input className="w-full rounded border p-2" placeholder="Meta Robots" value={form.metaRobots} onChange={(e) => setForm((f) => ({ ...f, metaRobots: e.target.value }))} />
            <input className="w-full rounded border p-2" placeholder="Canonical URL" value={form.canonicalUrl} onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))} />

            <button className="gold-button" type="submit">{editingId ? "Update Product" : "Create Product"}</button>
            {status && <p className="text-sm text-emerald-800">{status}</p>}
          </form>

          <div className="space-y-4">
            <div className="glass-card p-5">
              <h2 className="mb-3 text-3xl text-emerald-950">Manage Products</h2>
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p._id} className="rounded border border-amber-100 p-3">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-emerald-900/80">{p.brand || "Luwia"} | Rating {p.rating || 4}</p>
                    <p className="text-sm text-emerald-900/80">SEO: {p.seoTitle || "Not set"}</p>
                    <div className="mt-2 flex gap-2">
                      <button className="rounded border px-3 py-1 text-sm" onClick={() => beginEdit(p)}>Edit</button>
                      <button
                        className="rounded border border-red-300 px-3 py-1 text-sm text-red-700"
                        onClick={async () => {
                          await API.delete(`/products/${p._id}`);
                          loadData();
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <h2 className="mb-3 text-3xl text-emerald-950">User Management</h2>
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u._id} className="flex items-center justify-between rounded border border-amber-100 p-2">
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-xs">{u.email}</p>
                    </div>
                    <select
                      value={u.role}
                      onChange={async (e) => {
                        await API.put(`/users/${u._id}/role`, { role: e.target.value });
                        loadData();
                      }}
                      className="rounded border px-2 py-1 text-sm"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card mt-6 p-5">
          <h2 className="mb-3 text-3xl text-emerald-950">Order Tracking Management</h2>
          <div className="space-y-4">
            {ordersByUser.map((user) =>
              (user.orders || []).map((order) => (
                <div key={order._id} className="flex flex-col gap-2 rounded border border-amber-100 p-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">{user.name} ({user.email})</p>
                    <p className="text-sm">Order {order._id.slice(-6).toUpperCase()} | ${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <select
                    className="rounded border px-2 py-1"
                    value={order.status}
                    onChange={async (e) => {
                      await API.put(`/orders/${user._id}/${order._id}/status`, { status: e.target.value });
                      loadData();
                    }}
                  >
                    <option value="placed">placed</option>
                    <option value="processing">processing</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
