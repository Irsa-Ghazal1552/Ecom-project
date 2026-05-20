import { useState, useEffect } from "react";
import API from "../../services/api";
import { useAuth } from "../../store/AuthContext";

const PriceMonitoring = () => {
  const { user } = useAuth();
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") return;

    const fetchAnomalies = async () => {
      try {
        const res = await API.get("/pricing/anomalies");
        setAnomalies(res.data);
      } catch (error) {
        console.error("Failed to fetch price anomalies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, [user]);

  if (!user?.role === "admin") {
    return <div className="p-6 text-red-600">⛔ Admin access required</div>;
  }

  if (loading) return <div className="p-6 text-center">⏳ Loading price data...</div>;
  if (!anomalies) return <div className="p-6 text-center">❌ Failed to load price data</div>;

  const criticalCount = anomalies.filter((a) => a.status === "CRITICAL").length;
  const warningCount = anomalies.filter((a) => a.status === "WARNING").length;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">💰 Price Monitoring</h1>
        <p className="text-slate-600">
          {anomalies.length === 0
            ? "✅ No price anomalies detected"
            : `⚠️ ${criticalCount + warningCount} alert(s) require review`}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-600">
          <p className="text-slate-600 text-sm">Total Tracked</p>
          <p className="text-3xl font-bold text-emerald-600">
            {anomalies.length > 0 ? anomalies.length : "✅ OK"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
          <p className="text-slate-600 text-sm">🚨 Critical Changes</p>
          <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
          <p className="text-slate-600 text-sm">⚠️ Warnings</p>
          <p className="text-3xl font-bold text-orange-600">{warningCount}</p>
        </div>
      </div>

      {/* Anomalies List */}
      {anomalies.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <p className="text-5xl mb-4">✅</p>
          <p className="text-green-700 font-semibold text-lg">All prices are stable!</p>
          <p className="text-green-600 text-sm mt-2">No exponential price changes detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {anomalies.map((anomaly) => {
            const changeColor = anomaly.percentChange > 50 ? "red" : "orange";
            const statusColor = anomaly.status === "CRITICAL" ? "red" : "orange";

            return (
              <div
                key={anomaly.productId}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  statusColor === "red" ? "border-red-600" : "border-orange-600"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Info */}
                  <div>
                    <p className="font-bold text-lg text-slate-900 mb-2">{anomaly.name}</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-slate-600">Previous Price</p>
                        <p className="text-xl font-semibold text-slate-800">${anomaly.previousPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Current Price</p>
                        <p className="text-xl font-semibold text-slate-800">${anomaly.currentPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Change Info */}
                  <div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-900">Price Change</p>
                        <span
                          className={`text-2xl font-bold ${
                            changeColor === "red"
                              ? "text-red-600"
                              : "text-orange-600"
                          }`}
                        >
                          {anomaly.percentChange > 0 ? "+" : "-"}{Math.abs(anomaly.percentChange).toFixed(2)}%
                        </span>
                      </div>
                      <div
                        className={`bg-${changeColor}-200 rounded-full h-3 overflow-hidden`}
                        style={{
                          background: changeColor === "red" ? "#fee2e2" : "#fed7aa"
                        }}
                      >
                        <div
                          className={
                            changeColor === "red"
                              ? "bg-red-500"
                              : "bg-orange-500"
                          }
                          style={{ width: `${Math.min(100, anomaly.percentChange)}%`, height: "100%" }}
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        className={`inline-block px-4 py-2 rounded-full font-semibold text-white ${
                          statusColor === "red"
                            ? "bg-red-600"
                            : "bg-orange-600"
                        }`}
                      >
                        {anomaly.status === "CRITICAL" ? "🚨 CRITICAL" : "⚠️ WARNING"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    <strong>Recommendation:</strong> {anomaly.recommendation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Price Change Threshold Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-3">📊 Price Change Threshold Rules</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>30% - 50% Change:</strong> ⚠️ WARNING - Automatically flagged for review
          </p>
          <p>
            <strong>Above 50% Change:</strong> 🚨 CRITICAL - Price change blocked, requires explicit admin approval
          </p>
          <p>
            <strong>Below 30% Change:</strong> ✅ Allowed - No anomaly flag
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-bold text-red-900 mb-2">🚨 Critical Actions</h3>
          <ul className="text-sm text-red-800 space-y-1">
            <li>✓ Review all critical price changes immediately</li>
            <li>✓ Contact management for approval</li>
            <li>✓ Document reason for price change</li>
            <li>✓ Notify relevant teams of changes</li>
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Best Practices</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Implement price changes gradually</li>
            <li>✓ Monitor competitor prices regularly</li>
            <li>✓ Test price changes on subset first</li>
            <li>✓ Communicate changes to customers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PriceMonitoring;
