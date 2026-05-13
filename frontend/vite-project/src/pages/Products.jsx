import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useShop } from "../store/ShopContext";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const emptyForm = {
  name: "", price: "", category: "", brand: "Luwia", rating: "4.2",
  description: "", image: "", seoTitle: "", seoDescription: "",
  keywords: "", seoSlug: "", metaRobots: "index,follow", canonicalUrl: ""
};

const Products = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeProducts, setActiveProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    rating: ""
  });

  // admin state
  const [adminForm, setAdminForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = hidden, "" = create mode, id = edit mode
  const [adminStatus, setAdminStatus] = useState("");
  const formRef = useRef(null);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();
  const { products, addToCart, addToWishlist, loadProducts } = useShop();

  useEffect(() => {
    setActiveProducts(products);
  }, [products]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!search.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await API.get("/products/suggest", { params: { q: search } });
        setSuggestions(res.data);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const loadRecs = async () => {
      try {
        const res = await API.get("/recommendations/me");
        setRecommendations(res.data.products || []);
      } catch {
        setRecommendations([]);
      }
    };
    loadRecs();
  }, [user]);

  const openCreate = () => {
    setAdminForm(emptyForm);
    setEditingId("");
    setAdminStatus("");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setAdminForm({
      name: p.name || "", price: p.price || "", category: p.category || "",
      brand: p.brand || "Luwia", rating: p.rating || "4",
      description: p.description || "", image: p.image || "",
      seoTitle: p.seoTitle || "", seoDescription: p.seoDescription || "",
      keywords: (p.keywords || []).join(", "), seoSlug: p.seoSlug || "",
      metaRobots: p.metaRobots || "index,follow", canonicalUrl: p.canonicalUrl || ""
    });
    setAdminStatus("");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const cancelAdminForm = () => {
    setEditingId(null);
    setAdminForm(emptyForm);
    setAdminStatus("");
  };

  const submitAdminForm = async (e) => {
    e.preventDefault();
    const payload = {
      ...adminForm,
      price: Number(adminForm.price),
      rating: Number(adminForm.rating || 4),
      keywords: adminForm.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    };
    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, payload);
        setAdminStatus("Product updated successfully.");
      } else {
        await API.post("/products", payload);
        setAdminStatus("Product created successfully.");
      }
      await loadProducts();
      setAdminForm(emptyForm);
      setEditingId(null);
    } catch {
      setAdminStatus("Error saving product. Check backend.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    await API.delete(`/products/${id}`);
    await loadProducts();
  };

  const runDiscovery = async () => {
    const params = {
      q: search,
      category: filters.category,
      brand: filters.brand,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      rating: filters.rating
    };

    const cleaned = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== ""));
    const res = await API.get("/discover", { params: cleaned });
    setActiveProducts(res.data.products || []);
  };

  const resetDiscovery = async () => {
    setSearch("");
    setFilters({ category: "", brand: "", minPrice: "", maxPrice: "", rating: "" });
    await loadProducts();
  };

  return (
    <>
      <Helmet>
        <title>All Products - Luwia</title>
        <meta name="description" content="Explore all jewellery products" />
        <meta name="keywords" content="jewellery, gold, rings" />
      </Helmet>

      <Navbar isOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} />
      <Header toggleMenu={() => setMenuOpen(!menuOpen)} />

      <section className="mx-auto max-w-6xl p-6">

        {/* ── Admin bar ───────────────────────────────────────────── */}
        {isAdmin && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-900">Admin mode — you can create, edit and delete products below.</p>
            <button className="gold-button text-sm" onClick={openCreate}>+ Add New Product</button>
          </div>
        )}

        {/* ── Admin create / edit form ─────────────────────────────── */}
        {isAdmin && editingId !== null && (
          <div ref={formRef} className="mb-6 glass-card p-5">
            <h2 className="mb-4 text-2xl text-emerald-950">
              {editingId ? "Edit Product" : "Create New Product"}
            </h2>
            <form onSubmit={submitAdminForm} className="grid gap-3 md:grid-cols-2">
              <input className="w-full rounded border p-2" placeholder="Name *" required value={adminForm.name} onChange={(e) => setAdminForm((f) => ({ ...f, name: e.target.value }))} />
              <input className="w-full rounded border p-2" placeholder="Price *" required type="number" min="0" value={adminForm.price} onChange={(e) => setAdminForm((f) => ({ ...f, price: e.target.value }))} />
              <input className="w-full rounded border p-2" placeholder="Category" value={adminForm.category} onChange={(e) => setAdminForm((f) => ({ ...f, category: e.target.value }))} />
              <input className="w-full rounded border p-2" placeholder="Brand" value={adminForm.brand} onChange={(e) => setAdminForm((f) => ({ ...f, brand: e.target.value }))} />
              <input className="w-full rounded border p-2" placeholder="Rating (0-5)" type="number" min="0" max="5" step="0.1" value={adminForm.rating} onChange={(e) => setAdminForm((f) => ({ ...f, rating: e.target.value }))} />
              <input className="w-full rounded border p-2" placeholder="Image URL" value={adminForm.image} onChange={(e) => setAdminForm((f) => ({ ...f, image: e.target.value }))} />
              <textarea className="col-span-full w-full rounded border p-2" placeholder="Description" value={adminForm.description} onChange={(e) => setAdminForm((f) => ({ ...f, description: e.target.value }))} />

              <p className="col-span-full text-sm font-semibold text-emerald-900">SEO fields (optional)</p>
              <input className="w-full rounded border p-2" placeholder="SEO Title" value={adminForm.seoTitle} onChange={(e) => setAdminForm((f) => ({ ...f, seoTitle: e.target.value }))} />
              <input className="w-full rounded border p-2" placeholder="SEO Slug" value={adminForm.seoSlug} onChange={(e) => setAdminForm((f) => ({ ...f, seoSlug: e.target.value }))} />
              <input className="col-span-full w-full rounded border p-2" placeholder="Keywords, comma-separated" value={adminForm.keywords} onChange={(e) => setAdminForm((f) => ({ ...f, keywords: e.target.value }))} />
              <textarea className="col-span-full w-full rounded border p-2" placeholder="SEO Description" value={adminForm.seoDescription} onChange={(e) => setAdminForm((f) => ({ ...f, seoDescription: e.target.value }))} />
              <input className="w-full rounded border p-2" placeholder="Meta Robots" value={adminForm.metaRobots} onChange={(e) => setAdminForm((f) => ({ ...f, metaRobots: e.target.value }))} />
              <input className="w-full rounded border p-2" placeholder="Canonical URL" value={adminForm.canonicalUrl} onChange={(e) => setAdminForm((f) => ({ ...f, canonicalUrl: e.target.value }))} />

              <div className="col-span-full flex gap-3">
                <button className="gold-button" type="submit">{editingId ? "Update Product" : "Create Product"}</button>
                <button type="button" className="rounded-full border border-emerald-900 px-4 py-2 text-sm text-emerald-900" onClick={cancelAdminForm}>Cancel</button>
              </div>
              {adminStatus && <p className="col-span-full text-sm text-emerald-800">{adminStatus}</p>}
            </form>
          </div>
        )}

        <div className="glass-card mb-6 p-4">
          <p className="mb-2 text-sm font-semibold text-emerald-900">
            Natural Search: try "show me rings under $300 with rating above 4"
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Describe what you need..."
              className="w-full rounded-lg border border-amber-100 px-4 py-2"
            />
            <input
              value={filters.brand}
              onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
              placeholder="Brand filter"
              className="w-full rounded-lg border border-amber-100 px-4 py-2"
            />
            <input
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
              placeholder="Category filter"
              className="w-full rounded-lg border border-amber-100 px-4 py-2"
            />
            <input
              value={filters.rating}
              onChange={(e) => setFilters((f) => ({ ...f, rating: e.target.value }))}
              placeholder="Rating >="
              className="w-full rounded-lg border border-amber-100 px-4 py-2"
              type="number"
              min="0"
              max="5"
              step="0.1"
            />
            <input
              value={filters.minPrice}
              onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
              placeholder="Min price"
              className="w-full rounded-lg border border-amber-100 px-4 py-2"
              type="number"
            />
            <input
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
              placeholder="Max price"
              className="w-full rounded-lg border border-amber-100 px-4 py-2"
              type="number"
            />
          </div>

          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  className="rounded-full border border-amber-200 px-3 py-1 text-xs text-emerald-900"
                  onClick={() => setSearch(s.name)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button className="gold-button" onClick={runDiscovery}>Search</button>
            <button className="rounded-full border border-emerald-900 px-4 py-2 text-sm text-emerald-900" onClick={resetDiscovery}>
              Reset
            </button>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-3xl text-emerald-950">Recommended for You</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recommendations.map((r) => (
                <div key={r._id} className="glass-card min-w-[220px] p-3">
                  <p className="font-semibold text-emerald-900">{r.name}</p>
                  <p className="text-sm text-amber-800">${r.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeProducts.map((p) => (
            <article key={p._id} className="glass-card p-4">
              {p.image ? (
                <img src={p.image} alt={p.name} className="mb-3 h-48 w-full rounded object-cover" />
              ) : (
                <div className="mb-3 h-48 rounded bg-emerald-50" />
              )}
              <h3 className="text-xl text-emerald-950">{p.name}</h3>
              <p className="mt-1 text-sm text-emerald-900/80">{p.description}</p>
              <p className="mt-1 text-xs text-emerald-800">{p.brand || "Luwia"} | Rating: {p.rating || 4}</p>
              <p className="mt-2 font-bold text-amber-800">${p.price}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {isAdmin ? (
                  <>
                    <button
                      className="gold-button text-sm"
                      onClick={() => openEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-full border border-red-400 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                      onClick={() => deleteProduct(p._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="rounded-full border border-emerald-900 px-3 py-1 text-sm text-emerald-900"
                      onClick={() => { addToCart(p._id); }}
                    >
                      Add to Cart
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="gold-button"
                      onClick={() => {
                        if (!user) return navigate("/login");
                        addToCart(p._id);
                      }}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="rounded-full border border-emerald-900 px-3 text-sm text-emerald-900"
                      onClick={() => {
                        if (!user) return navigate("/login");
                        addToWishlist(p._id);
                      }}
                    >
                      Wishlist
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
          {activeProducts.length === 0 && (
            <p className="text-emerald-900">No products found.</p>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Products;