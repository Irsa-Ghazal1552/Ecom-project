// ✅ Seasonal Prediction & Analytics Utility

const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const getCurrentMonthKey = () => {
  const date = new Date();
  return months[date.getMonth()];
};

const getCurrentMonth = () => {
  return new Date().getMonth() + 1;
};

// Analyze which products are seasonal and predict trends
const analyzeSeasonalTrends = (products) => {
  const trends = {};
  const categories = {};

  products.forEach((product) => {
    const { category, name, seasonalData, soldCount } = product;

    // Find peak selling month for this product
    let peakMonth = null;
    let maxSales = 0;
    months.forEach((month) => {
      if ((seasonalData[month] || 0) > maxSales) {
        maxSales = seasonalData[month] || 0;
        peakMonth = month;
      }
    });

    trends[product._id] = {
      name,
      category,
      peakMonth: peakMonth || "year-round",
      seasonalSales: seasonalData,
      totalSales: soldCount
    };

    // Organize by category
    if (!categories[category]) categories[category] = [];
    categories[category].push(product._id);
  });

  return { trends, byCategory: categories };
};

// Predict which products will likely sell this month
const predictMonthlyTrends = (products) => {
  const currentMonth = getCurrentMonthKey();
  const predictions = products
    .map((p) => ({
      _id: p._id,
      name: p.name,
      category: p.category,
      expectedSales: p.seasonalData[currentMonth] || 0,
      totalHistoricalSales: p.soldCount,
      stock: p.stock,
      price: p.price,
      confidence: Math.min(100, (p.seasonalData[currentMonth] || 0) * 5) // Confidence as percentage
    }))
    .sort((a, b) => b.expectedSales - a.expectedSales)
    .slice(0, 20);

  return predictions;
};

// Get category trends for a specific month
const getCategoryTrendsByMonth = (products, month = null) => {
  const targetMonth = month || getCurrentMonthKey();
  const categoryTrends = {};

  products.forEach((product) => {
    const { category, seasonalData } = product;
    if (!categoryTrends[category]) {
      categoryTrends[category] = { totalSales: 0, products: [], avgPrice: 0, priceSum: 0 };
    }
    categoryTrends[category].totalSales += seasonalData[targetMonth] || 0;
    categoryTrends[category].products.push({
      name: product.name,
      sales: seasonalData[targetMonth] || 0,
      price: product.price
    });
    categoryTrends[category].priceSum += product.price;
  });

  // Calculate averages and sort
  Object.keys(categoryTrends).forEach((cat) => {
    const data = categoryTrends[cat];
    data.avgPrice = data.priceSum / data.products.length;
    data.products.sort((a, b) => b.sales - a.sales);
  });

  return Object.entries(categoryTrends)
    .map(([category, data]) => ({
      category,
      totalSalesPredicted: data.totalSales,
      topProducts: data.products.slice(0, 5),
      averagePrice: Math.round(data.avgPrice),
      productCount: data.products.length
    }))
    .sort((a, b) => b.totalSalesPredicted - a.totalSalesPredicted);
};

// Detect inventory issues
const detectInventoryIssues = (products) => {
  const issues = {
    lowStock: [],
    outOfStock: [],
    overstocked: []
  };

  products.forEach((product) => {
    const { stock, minStockLevel, soldCount, category, name } = product;

    if (stock === 0) {
      issues.outOfStock.push({
        productId: product._id,
        name,
        category,
        urgency: "CRITICAL"
      });
    } else if (stock < minStockLevel) {
      issues.lowStock.push({
        productId: product._id,
        name,
        category,
        currentStock: stock,
        minLevel: minStockLevel,
        needsReorder: true
      });
    } else if (stock > soldCount * 2 && stock > 500) {
      issues.overstocked.push({
        productId: product._id,
        name,
        category,
        currentStock: stock,
        recommendation: "Consider promotion or discount"
      });
    }
  });

  return issues;
};

// Predict price change risk (exponential changes)
const detectPriceAnomalies = (products) => {
  const anomalies = [];

  products.forEach((product) => {
    if (!product.previousPrice || !product.priceHistory.length) return;

    const latestPrice = product.price;
    const previousPrice = product.previousPrice;
    
    if (previousPrice === 0) return; // Avoid division by zero

    const percentChange = Math.abs(((latestPrice - previousPrice) / previousPrice) * 100);

    // Flag if change is > 30% (exponential/unusual)
    if (percentChange > 30) {
      anomalies.push({
        productId: product._id,
        name: product.name,
        previousPrice,
        currentPrice: latestPrice,
        percentChange: Math.round(percentChange * 100) / 100,
        status: percentChange > 50 ? "CRITICAL" : "WARNING",
        recommendation: percentChange > 50 ? "Price change blocked - too high" : "Please review this price change"
      });
    }
  });

  return anomalies;
};

// Generate product recommendations based on season
const getSeasonalRecommendations = (products) => {
  const currentMonth = getCurrentMonth();
  const season =
    currentMonth >= 12 || currentMonth <= 2
      ? "winter"
      : currentMonth >= 3 && currentMonth <= 5
      ? "spring"
      : currentMonth >= 6 && currentMonth <= 8
      ? "summer"
      : "fall";

  const monthKey = getCurrentMonthKey();
  const recommended = products
    .filter((p) => (p.seasonalData[monthKey] || 0) > 0)
    .map((p) => ({
      ...p.toObject(),
      seasonalScore: p.seasonalData[monthKey] || 0,
      season
    }))
    .sort((a, b) => b.seasonalScore - a.seasonalScore);

  return recommended;
};

module.exports = {
  getCurrentMonthKey,
  getCurrentMonth,
  analyzeSeasonalTrends,
  predictMonthlyTrends,
  getCategoryTrendsByMonth,
  detectInventoryIssues,
  detectPriceAnomalies,
  getSeasonalRecommendations,
  months,
  monthNames
};
