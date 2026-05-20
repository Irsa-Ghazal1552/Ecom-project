import { useState, useEffect } from "react";
import API from "../../services/api";
import { useAuth } from "../../store/AuthContext";

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user?.role !== "admin") return;

    const fetchDashboard = async () => {
      try {
        const res = await API.get("/analytics/dashboard");
        setDashboard(res.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (!user?.role === "admin") {
    return <div className="p-6 text-red-600">⛔ Admin access required</div>;
  }

  if (loading) {
    return <div className="p-6 text-center">⏳ Loading analytics...</div>;
  }

  if (!dashboard) {
    return <div className="p-6 text-center">❌ Failed to load dashboard</div>;
  }

  const { overview, inventory, priceAnomalies, monthlyTrends, categoryTrends } = dashboard;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">📊 Analytics Dashboard</h1>
        <p className="text-slate-600">Real-time inventory, pricing, and sales insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-600">
          <p className="text-slate-600 text-sm">Total Products</p>
          <p className="text-3xl font-bold text-emerald-600">{overview.totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <p className="text-slate-600 text-sm">Total Sales</p>
          <p className="text-3xl font-bold text-blue-600">{overview.totalSales}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
          <p className="text-slate-600 text-sm">⚠️ Low Stock</p>
          <p className="text-3xl font-bold text-orange-600">{overview.lowStockItems}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
          <p className="text-slate-600 text-sm">❌ Out of Stock</p>
          <p className="text-3xl font-bold text-red-600">{overview.outOfStockItems}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex gap-2 border-b border-slate-200 p-4 flex-wrap">
          {[
            { id: "overview", label: "📈 Overview" },
            { id: "inventory", label: "📦 Inventory" },
            { id: "pricing", label: "💰 Pricing" },
            { id: "trends", label: "🔥 Trends" },
            { id: "categories", label: "🏷️ Categories" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md transition ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Dashboard Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Products</p>
                  <p className="text-2xl font-bold text-emerald-600">{overview.totalProducts}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Total Sales</p>
                  <p className="text-2xl font-bold text-blue-600">{overview.totalSales}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600">{overview.lowStockItems}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Price Issues</p>
                  <p className="text-2xl font-bold text-red-600">{overview.priceAnomalies}</p>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Inventory Management</h2>

              {inventory.outOfStock.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-3">❌ Out of Stock ({inventory.outOfStock.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {inventory.outOfStock.map((item) => (
                      <div key={item.productId} className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <p className="font-semibold text-red-900">{item.name}</p>
                        <p className="text-sm text-red-700">{item.category} • CRITICAL</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inventory.lowStock.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-orange-700 mb-3">⚠️ Low Stock ({inventory.lowStock.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {inventory.lowStock.map((item) => (
                      <div key={item.productId} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <p className="font-semibold text-orange-900">{item.name}</p>
                        <p className="text-sm text-orange-700">
                          Stock: {item.currentStock} / Min: {item.minLevel} • {item.category}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inventory.overstocked.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3">📦 Overstocked ({inventory.overstocked.length})</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {inventory.overstocked.map((item) => (
                      <div key={item.productId} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="font-semibold text-blue-900">{item.name}</p>
                        <p className="text-sm text-blue-700">
                          Stock: {item.currentStock} • {item.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Price Anomalies</h2>
              {priceAnomalies.length === 0 ? (
                <p className="text-slate-600">✅ No price anomalies detected</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {priceAnomalies.map((item) => (
                    <div
                      key={item.productId}
                      className={`p-4 rounded-lg border ${
                        item.status === "CRITICAL"
                          ? "bg-red-50 border-red-200"
                          : "bg-orange-50 border-orange-200"
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className={item.status === "CRITICAL" ? "text-red-700" : "text-orange-700"}>
                        ${item.previousPrice} → ${item.currentPrice} ({item.percentChange.toFixed(2)}%) • {item.status}
                      </p>
                      <p className="text-sm text-slate-600">{item.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Monthly Trends Tab */}
          {activeTab === "trends" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">🔥 This Month's Predicted Top Sellers</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {monthlyTrends.map((item, idx) => (
                  <div key={item._id} className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-900">
                          #{idx + 1} {item.name}
                        </p>
                        <p className="text-sm text-slate-600">{item.category} • ${item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">{item.expectedSales} sales</p>
                        <p className="text-xs text-slate-600">Confidence: {item.confidence.toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="mt-2 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Category Performance This Month</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {categoryTrends.map((cat) => (
                  <div key={cat.category} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-slate-900">{cat.category}</p>
                      <span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full">
                        {cat.totalSalesPredicted} sales
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      Avg Price: ${cat.averagePrice} • {cat.productCount} products
                    </div>
                    <div className="bg-white rounded p-2 text-xs">
                      <p className="font-semibold text-slate-700 mb-1">Top Performers:</p>
                      {cat.topProducts.slice(0, 3).map((prod, idx) => (
                        <p key={idx} className="text-slate-600">
                          • {prod.name} ({prod.sales} sales)
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
