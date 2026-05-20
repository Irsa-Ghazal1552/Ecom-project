import { useState, useEffect } from "react";
import API from "../../services/api";
import { useShop } from "../../store/ShopContext";
import { useAuth } from "../../store/AuthContext";

const TrendsAnalytics = () => {
  const { user } = useAuth();
  const { addToCart } = useShop();
  const [trends, setTrends] = useState(null);
  const [categoryTrends, setCategoryTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("monthly");

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const [trendsRes, catRes] = await Promise.all([
          API.get("/analytics/trends"),
          API.get("/analytics/category-trends")
        ]);
        setTrends(trendsRes.data);
        setCategoryTrends(catRes.data.trends);
      } catch (error) {
        console.error("Failed to fetch trends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-center text-slate-600">
        ⏳ Loading trends...
      </div>
    );

  if (!trends)
    return (
      <div className="p-6 text-center text-red-600">
        ❌ Failed to load trends
      </div>
    );

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">
          🔥 Sales Trends & Analytics
        </h1>
        <p className="text-slate-600 text-lg">
          Discover which products are trending and predicted to sell best
        </p>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 border-b border-slate-300">
        <button
          onClick={() => setActiveView("monthly")}
          className={`px-6 py-3 font-semibold transition ${
            activeView === "monthly"
              ? "text-emerald-600 border-b-2 border-emerald-600"
              : "text-slate-600 hover:text-emerald-600"
          }`}
        >
          📈 This Month's Predictions
        </button>
        <button
          onClick={() => setActiveView("categories")}
          className={`px-6 py-3 font-semibold transition ${
            activeView === "categories"
              ? "text-emerald-600 border-b-2 border-emerald-600"
              : "text-slate-600 hover:text-emerald-600"
          }`}
        >
          🏷️ Category Performance
        </button>
      </div>

      {/* Monthly Trends View */}
      {activeView === "monthly" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-600">
            <p className="text-slate-600 mb-1">📅 Current Month</p>
            <p className="text-2xl font-bold text-emerald-600">{trends.currentMonth.toUpperCase()}</p>
            <p className="text-sm text-slate-600 mt-2">{trends.summary}</p>
          </div>

          {/* Products Grid */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Top Predicted Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trends.predictions.slice(0, 12).map((product, idx) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
                >
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                    #{idx + 1}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col relative">
                    {/* Category & Rating */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Price & Stock */}
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-2xl font-bold text-emerald-600">${product.price}</p>
                      <p
                        className={`text-sm font-semibold ${
                          product.stock > 20
                            ? "text-green-600"
                            : product.stock > 0
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} left` : "Out of Stock"}
                      </p>
                    </div>

                    {/* Predicted Sales */}
                    <div className="mb-4">
                      <p className="text-xs text-slate-600 mb-1">Predicted Sales</p>
                      <p className="text-2xl font-bold text-emerald-600 mb-2">
                        {product.expectedSales} units
                      </p>
                      <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, product.confidence)}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {product.confidence.toFixed(0)}% confidence
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        if (!user) {
                          alert("Please login first");
                          return;
                        }
                        if (product.stock <= 0) {
                          alert("This product is out of stock");
                          return;
                        }
                        addToCart(product._id, 1);
                        alert(`${product.name} added to cart!`);
                      }}
                      className="mt-auto bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-semibold transition"
                    >
                      {product.stock <= 0 ? "Out of Stock" : "🛒 Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Trends View */}
      {activeView === "categories" && categoryTrends && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Category Performance This Month</h2>
          <div className="space-y-4">
            {categoryTrends.map((category) => (
              <div
                key={category.category}
                className="bg-white rounded-lg shadow-md p-6 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">{category.category}</h3>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">
                      {category.totalSalesPredicted}
                    </p>
                    <p className="text-xs text-slate-600">predicted sales</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-600">Products</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {category.productCount}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-600">Avg Price</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${category.averagePrice}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-600">Top Sale</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {category.topProducts[0]?.sales || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-600">Range</p>
                    <p className="text-sm font-bold text-slate-900">
                      {category.topProducts.length} top items
                    </p>
                  </div>
                </div>

                {/* Top Products */}
                <div>
                  <p className="font-semibold text-slate-900 mb-3">🏆 Top Products</p>
                  <div className="space-y-2">
                    {category.topProducts.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-slate-50 p-3 rounded-lg"
                      >
                        <p className="text-slate-800">
                          <span className="font-semibold">#{idx + 1}</span> {product.name}
                        </p>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">{product.sales} sales</p>
                          <p className="text-xs text-slate-600">${product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
          <h3 className="font-bold text-emerald-900 mb-3 text-lg">💡 Insights</h3>
          <ul className="space-y-2 text-sm text-emerald-800">
            <li>✓ Products ranked by predicted monthly sales</li>
            <li>✓ Confidence score shows prediction reliability</li>
            <li>✓ Based on historical seasonal patterns</li>
            <li>✓ Updates as new sales data comes in</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3 text-lg">🎯 Recommendations</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Increase stock for top predicted items</li>
            <li>✓ Create promotions for medium performers</li>
            <li>✓ Monitor low confidence predictions</li>
            <li>✓ Adjust pricing for peak demand items</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrendsAnalytics;
