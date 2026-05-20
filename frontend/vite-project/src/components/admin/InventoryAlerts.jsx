import { useState, useEffect } from "react";
import API from "../../services/api";
import { useAuth } from "../../store/AuthContext";

const InventoryAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restocking, setRestocking] = useState({});

  useEffect(() => {
    if (user?.role !== "admin") return;

    const fetchAlerts = async () => {
      try {
        const res = await API.get("/inventory/alerts");
        setAlerts(res.data);
      } catch (error) {
        console.error("Failed to fetch inventory alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [user]);

  const handleRestock = async (productId, quantity) => {
    try {
      setRestocking((prev) => ({ ...prev, [productId]: true }));
      await API.put(`/inventory/restock/${productId}`, { quantity });
      alert("Restocked successfully!");
      // Refresh alerts
      const res = await API.get("/inventory/alerts");
      setAlerts(res.data);
    } catch (error) {
      alert("Failed to restock: " + error.response?.data?.message);
    } finally {
      setRestocking((prev) => ({ ...prev, [productId]: false }));
    }
  };

  if (!user?.role === "admin") {
    return <div className="p-6 text-red-600">⛔ Admin access required</div>;
  }

  if (loading) return <div className="p-6 text-center">⏳ Loading alerts...</div>;
  if (!alerts) return <div className="p-6 text-center">❌ Failed to load alerts</div>;

  const { lowStock, outOfStock, overstocked } = alerts;
  const totalIssues = lowStock.length + outOfStock.length + overstocked.length;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">📦 Inventory Alerts</h1>
        <p className="text-slate-600">
          {totalIssues === 0 ? "✅ All inventory levels are optimal" : `⚠️ ${totalIssues} alert(s) need attention`}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 font-semibold mb-2">❌ Out of Stock</p>
          <p className="text-4xl font-bold text-red-600">{outOfStock.length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <p className="text-orange-700 font-semibold mb-2">⚠️ Low Stock</p>
          <p className="text-4xl font-bold text-orange-600">{lowStock.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-700 font-semibold mb-2">📦 Overstocked</p>
          <p className="text-4xl font-bold text-blue-600">{overstocked.length}</p>
        </div>
      </div>

      {/* Out of Stock Section */}
      {outOfStock.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-red-700 mb-4">❌ Out of Stock ({outOfStock.length})</h2>
          <div className="space-y-3">
            {outOfStock.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between bg-red-50 p-4 rounded-lg border border-red-200"
              >
                <div>
                  <p className="font-bold text-red-900">{item.name}</p>
                  <p className="text-sm text-red-700">{item.category} • URGENT</p>
                </div>
                <button
                  onClick={() => handleRestock(item.productId, 50)}
                  disabled={restocking[item.productId]}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
                >
                  {restocking[item.productId] ? "Processing..." : "Restock (50)"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Section */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-orange-700 mb-4">⚠️ Low Stock ({lowStock.length})</h2>
          <div className="space-y-3">
            {lowStock.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between bg-orange-50 p-4 rounded-lg border border-orange-200"
              >
                <div className="flex-1">
                  <p className="font-bold text-orange-900">{item.name}</p>
                  <div className="flex gap-4 mt-1">
                    <p className="text-sm text-orange-700">{item.category}</p>
                    <p className="text-sm text-orange-700">Current: {item.currentStock}</p>
                    <p className="text-sm text-orange-700">Min: {item.minLevel}</p>
                  </div>
                  {/* Stock Progress Bar */}
                  <div className="mt-2 bg-orange-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-orange-500 h-2"
                      style={{ width: `${Math.min(100, (item.currentStock / item.minLevel) * 100)}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleRestock(item.productId, item.reorderQuantity || 50)}
                  disabled={restocking[item.productId]}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold ml-4 disabled:opacity-50"
                >
                  {restocking[item.productId] ? "Processing..." : "Restock"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overstocked Section */}
      {overstocked.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">📦 Overstocked ({overstocked.length})</h2>
          <p className="text-sm text-slate-600 mb-4">Consider running promotions for these items</p>
          <div className="space-y-3">
            {overstocked.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200"
              >
                <div>
                  <p className="font-bold text-blue-900">{item.name}</p>
                  <p className="text-sm text-blue-700">
                    {item.category} • Stock: {item.currentStock} • {item.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Issues */}
      {totalIssues === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-green-700 font-semibold">All inventory levels are optimal!</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">ℹ️ Inventory Management Tips</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Monitor low stock items to avoid stockouts</li>
          <li>• Use the restock button to quickly update inventory</li>
          <li>• Consider promotions for overstocked items</li>
          <li>• Set appropriate minimum stock levels for each product</li>
        </ul>
      </div>
    </div>
  );
};

export default InventoryAlerts;
