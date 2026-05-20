require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const Groq = require("groq-sdk");

const User = require("./models/User");
const Product = require("./models/Product");
const Setting = require("./models/Setting");
const { generateMetaTags } = require("./utils/metaTagGenerator");
const {
  analyzeSeasonalTrends,
  predictMonthlyTrends,
  getCategoryTrendsByMonth,
  detectInventoryIssues,
  detectPriceAnomalies,
  getSeasonalRecommendations,
  getCurrentMonthKey,
  months
} = require("./utils/analyticsEngine");

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const ADMIN_BOOTSTRAP_KEY = process.env.ADMIN_BOOTSTRAP_KEY || "make-admin-2026";

// ── Groq AI Agent Setup ────────────────────────────────────────────
const groqClient = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
if (groqClient) console.log("✅ Groq AI connected");
else console.warn("⚠️  GROQ_API_KEY not set — chatbot running in keyword-only mode");

const GROQ_SYSTEM_PROMPT = `You are Luwia AI, a smart shopping assistant for Luwia, a jewelry and accessories e-commerce store.
You are also a general knowledge AI that can answer questions about technology, web development, science, and other topics.

For e-commerce queries, respond with a valid JSON object with the specified structure below.
For general knowledge questions (not e-commerce related), provide a helpful conversational response in plain text (not JSON).

E-commerce JSON structure (when intent is e-commerce related):
{
  "intent": "<intent>",
  "params": {
    "category": null or string,
    "minPrice": null or number,
    "maxPrice": null or number,
    "rating": null or number,
    "brand": null or string,
    "productName": null or string,
    "couponCode": null or string
  },
  "reply": "<reply>"
}

Intent values (for e-commerce):
- product_search, trending, popular_searches, recommendations, order_tracking, cart_add, cart_remove, cart_reminder, coupon, faq_shipping, faq_returns, faq_payment, general_knowledge

Price extraction rules:
- "under $X" / "below $X" / "less than $X" / "cheaper than $X" → maxPrice: X
- "above $X" / "over $X" / "more than $X" / "at least $X" → minPrice: X
- "between $X and $Y" → minPrice: X, maxPrice: Y

Category extraction (only these values): rings, necklaces, earrings, bracelets, watches, shoes, bags
Rating extraction: "rated 4+" / "rating above 4" / "4 stars" → rating: 4

IMPORTANT ROUTING RULES:
1. If the message is about Luwia store, products, cart, orders, shipping, returns, payment, or coupons → return JSON with appropriate e-commerce intent
2. If the message is a general question about technology, web, science, history, math, or any other topic → respond in plain text with helpful information (DO NOT return JSON)
3. For ambiguous messages, use context to determine if it's e-commerce or general knowledge

General knowledge examples that should be answered in plain text:
- "What is JavaScript?" → Answer directly about JavaScript
- "How does the internet work?" → Explain in detail
- "Tell me about web development" → Provide educational information
- "What is React?" → Answer about React framework
- "How to code?" → Provide coding guidance

Reply rules for e-commerce (KEEP UNDER 2 SENTENCES):
- product_search: "Let me find [description] for you!"
- trending: "Here are our hottest items right now!"
- popular_searches: "Here is what shoppers are loving!"
- recommendations: "Here are some picks based on your taste!"
- faq_shipping: "Standard shipping 3-7 days, Express 1-3 days. Free shipping on orders over $150!"
- faq_returns: "Returns accepted within 14 days for unused items in original packaging."
- faq_payment: "We accept all major cards. Sandbox checkout mode for this demo."
- cart_add / cart_remove: brief confirmation
- order_tracking: "Let me check your latest order!"
- coupon: list available coupons if no code given, or confirm if code found
- general_knowledge: [helpful response]`;

const askGroq = async (userMessage) => {
  if (!groqClient) return null;
  try {
    const completion = await groqClient.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: GROQ_SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 500
    });
    const content = completion.choices[0].message.content;
    
    // Try to parse as JSON first
    try {
      return JSON.parse(content);
    } catch {
      // If JSON parsing fails, it's a general knowledge response
      return { intent: "general_knowledge", reply: content, isPlainText: true };
    }
  } catch (err) {
    console.error("Groq error:", err.message);
    return null;
  }
};

app.use(cors());
app.use(helmet());
app.use(express.json());

// ✅ DB CONNECT
mongoose.connect("mongodb://localhost:27017/jewelleryDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: admin only" });
  }
  next();
};

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  wishlist: user.wishlist,
  cart: user.cart,
  orders: user.orders
});

const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return next();

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};

const STATUS_TIMELINE = ["placed", "processing", "shipped", "delivered"];

const parseNaturalSearch = (text = "") => {
  const q = text.toLowerCase();
  const maxMatch = q.match(/(?:under|below|less than|cheaper than)\s*\$?\s*(\d+(?:\.\d+)?)/i);
  const minMatch = q.match(/(?:above|over|more than|greater than|at least)\s*\$?\s*(\d+(?:\.\d+)?)/i);
  const ratingMatch = q.match(/(?:rating|rated|stars?)\s*(?:above|over|>=|at least)?\s*(\d(?:\.\d)?)/i);

  const knownCategories = [
    "rings", "necklaces", "earrings", "bracelets", "watches", "shoes", "bags",
    "head wear", "neck wear", "hand wear", "ear wear", "foot wear",
    "wedding", "corporate", "daily wear", "dailywear", "gifts", "gothic", "desi"
  ];
  const category = knownCategories.find((cat) => q.includes(cat)) || "";

  return {
    text,
    category,
    minPrice: minMatch ? Number(minMatch[1]) : undefined,
    maxPrice: maxMatch ? Number(maxMatch[1]) : undefined,
    rating: ratingMatch ? Number(ratingMatch[1]) : undefined
  };
};

const categoryGroup = (category) => {
  const normalized = category.toString().toLowerCase().trim();
  if (!normalized) return null;

  const groups = {
    "hand wear": ["hand wear", "rings", "bracelets", "watches", "bags"],
    "neck wear": ["neck wear", "necklaces"],
    "ear wear": ["ear wear", "earrings"],
    "foot wear": ["foot wear", "shoes"],
    "head wear": ["head wear", "tiaras", "headbands"]
  };

  return groups[normalized] || [category];
};

const getCurrentStoreSeason = async () => {
  try {
    const setting = await Setting.findOne({ key: "featuredCollection" });
    return setting?.value || null;
  } catch {
    return null;
  }
};

const upsertFeaturedCollection = async (theme) => {
  const labelMap = {
    wedding: "Wedding & Bridal",
    corporate: "Corporate Signature",
    dailywear: "Daily Luxe",
    gifts: "Gift Edit",
    gothic: "Gothic Glam",
    desi: "Desi Heritage"
  };
  const value = {
    theme,
    label: labelMap[theme] || theme.charAt(0).toUpperCase() + theme.slice(1),
    updatedAt: new Date()
  };
  return Setting.findOneAndUpdate(
    { key: "featuredCollection" },
    { value },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const applyCoupon = (code = "", subtotal = 0) => {
  const normalized = code.trim().toUpperCase();
  const coupons = {
    SAVE10: { type: "percent", value: 10 },
    FLAT50: { type: "flat", value: 50 },
    NEWUSER15: { type: "percent", value: 15 }
  };
  const coupon = coupons[normalized];
  if (!coupon) return null;

  const discount = coupon.type === "percent"
    ? (subtotal * coupon.value) / 100
    : coupon.value;

  const finalTotal = Math.max(0, subtotal - discount);
  return {
    code: normalized,
    discount: Number(discount.toFixed(2)),
    finalTotal: Number(finalTotal.toFixed(2))
  };
};

// ================= AUTH =================
const signupHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: "user" });
    res.status(201).json({ message: "User created", user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Signup failed" });
  }
};

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password || "", user.password);
    if (!isMatch) return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

app.post("/auth/signup", signupHandler);
app.post("/auth/login", loginHandler);

app.post("/auth/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin account required" });
    }

    const isMatch = await bcrypt.compare(password || "", user.password);
    if (!isMatch) return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Admin login failed" });
  }
});

app.post("/auth/bootstrap-admin", async (req, res) => {
  try {
    const { key, name, email, password } = req.body;
    const adminExists = await User.exists({ role: "admin" });
    if (adminExists && key !== ADMIN_BOOTSTRAP_KEY) {
      return res.status(403).json({ message: "Invalid bootstrap key" });
    }

    const existing = await User.findOne({ email: email?.toLowerCase() });
    if (existing) {
      // With a valid key, promote an existing account to admin instead of failing
      if (key === ADMIN_BOOTSTRAP_KEY) {
        if (existing.role === "admin") {
          return res.status(409).json({ message: "This email is already an admin. Use Admin Login mode to sign in." });
        }
        existing.role = "admin";
        await existing.save();
        return res.status(200).json({ message: "Account promoted to admin. Use your existing password in Admin Login mode.", user: safeUser(existing) });
      }
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password || "", 10);
    const admin = await User.create({ name, email, password: hashed, role: "admin" });
    res.status(201).json({ message: "Admin created", user: safeUser(admin) });
  } catch (error) {
    res.status(500).json({ message: "Failed to bootstrap admin" });
  }
});

// Backward compatibility for current frontend URLs.
app.post("/signup", signupHandler);
app.post("/login", loginHandler);

// ================= PRODUCTS =================
app.get("/discover", async (req, res) => {
  try {
    const { q = "", category = "", brand = "", minPrice, maxPrice, rating, theme = "" } = req.query;
    const parsed = parseNaturalSearch(q);

    const effectiveCategory = category || parsed.category || "";
    const effectiveMin = minPrice !== undefined ? Number(minPrice) : parsed.minPrice;
    const effectiveMax = maxPrice !== undefined ? Number(maxPrice) : parsed.maxPrice;
    const effectiveRating = rating !== undefined ? Number(rating) : parsed.rating;

    const query = {};
    if (effectiveCategory) query.category = new RegExp(effectiveCategory, "i");
    if (brand) query.brand = new RegExp(brand, "i");
    if (effectiveRating) query.rating = { $gte: effectiveRating };
    if (effectiveMin !== undefined || effectiveMax !== undefined) {
      query.price = {};
      if (effectiveMin !== undefined) query.price.$gte = effectiveMin;
      if (effectiveMax !== undefined) query.price.$lte = effectiveMax;
    }

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { keywords: { $elemMatch: { $regex: q, $options: "i" } } },
        { brand: { $regex: q, $options: "i" } }
      ];
    }

    if (theme) query.themes = theme;

    const products = await Product.find(query).limit(30).sort({ soldCount: -1, rating: -1 });
    res.json({ filters: { category: effectiveCategory, brand, minPrice: effectiveMin, maxPrice: effectiveMax, rating: effectiveRating, theme }, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Discovery failed" });
  }
});

app.get("/products/suggest", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) return res.json([]);

    const products = await Product.find(
      { name: { $regex: q, $options: "i" } },
      "name category brand price"
    )
      .limit(8)
      .sort({ soldCount: -1, rating: -1 });

    res.json(products.map((p) => ({
      id: p._id,
      label: `${p.name} (${p.category})`,
      name: p.name,
      brand: p.brand,
      price: p.price
    })));
  } catch {
    res.status(500).json({ message: "Suggestion lookup failed" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const { category = "", search = "", theme = "" } = req.query;
    let query = {};

    if (category) {
      const groups = categoryGroup(category) || [category];
      query.category = { $in: groups.map((c) => new RegExp(c, "i")) };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { keywords: { $elemMatch: { $regex: search, $options: "i" } } }
      ];
    }

    if (theme) query.themes = theme;

    const products = await Product.find(query).sort({ _id: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get("/recommendations/trending", async (_req, res) => {
  const products = await Product.find().sort({ soldCount: -1, rating: -1 }).limit(10);
  res.json(products);
});

app.get("/recommendations/also-bought/:productId", async (req, res) => {
  try {
    const users = await User.find({ "orders.items.product": req.params.productId }).select("orders");
    const coBoughtCounts = new Map();

    users.forEach((u) => {
      u.orders.forEach((o) => {
        const hasMain = o.items.some((i) => i.product.toString() === req.params.productId);
        if (!hasMain) return;
        o.items.forEach((i) => {
          const id = i.product.toString();
          if (id === req.params.productId) return;
          coBoughtCounts.set(id, (coBoughtCounts.get(id) || 0) + i.quantity);
        });
      });
    });

    const topIds = [...coBoughtCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => id);

    const products = topIds.length
      ? await Product.find({ _id: { $in: topIds } })
      : await Product.find().sort({ soldCount: -1 }).limit(8);

    res.json(products);
  } catch {
    res.status(500).json({ message: "Could not compute also-bought products" });
  }
});

app.get("/recommendations/me", optionalAuth, async (req, res) => {
  try {
    const trending = await Product.find().sort({ soldCount: -1, rating: -1 }).limit(6);
    if (!req.user) {
      return res.json({ reason: "guest", products: trending });
    }

    const user = await User.findById(req.user._id).populate("orders.items.product");
    const categories = new Map();

    user.orders.forEach((order) => {
      order.items.forEach((item) => {
        const cat = item.product?.category;
        if (cat) categories.set(cat, (categories.get(cat) || 0) + item.quantity);
      });
    });

    const topCategory = [...categories.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const personalized = topCategory
      ? await Product.find({ category: topCategory }).sort({ rating: -1, soldCount: -1 }).limit(6)
      : [];

    const merged = [...personalized, ...trending].reduce((acc, item) => {
      if (!acc.some((p) => p._id.toString() === item._id.toString())) acc.push(item);
      return acc;
    }, []).slice(0, 10);

    res.json({ reason: topCategory ? `Based on your ${topCategory} interest` : "Trending for you", products: merged });
  } catch {
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

app.post("/products", auth, adminOnly, async (req, res) => {
  try {
    const productData = req.body;
    
    // Auto-generate meta tags if not provided
    if (!productData.seoTitle || !productData.seoDescription) {
      const autoMeta = generateMetaTags(productData);
      productData.seoTitle = productData.seoTitle || autoMeta.seoTitle;
      productData.seoDescription = productData.seoDescription || autoMeta.seoDescription;
      productData.keywords = productData.keywords?.length ? productData.keywords : autoMeta.keywords;
      productData.seoSlug = productData.seoSlug || autoMeta.seoSlug;
      productData.canonicalUrl = productData.canonicalUrl || autoMeta.canonicalUrl;
      productData.autoGeneratedMetaTags = true;
    }
    
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Failed to create product" });
  }
});

app.put("/products/:id", auth, adminOnly, async (req, res) => {
  try {
    const updateData = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Track price changes
    if (updateData.price && updateData.price !== product.price) {
      const percentChange = Math.abs(((updateData.price - product.price) / product.price) * 100);
      
      // Flag if exponential change (>30%)
      if (percentChange > 30) {
        return res.status(400).json({
          message: `Price change too high (${percentChange.toFixed(2)}%). Please review.`,
          currentPrice: product.price,
          newPrice: updateData.price,
          percentChange
        });
      }

      // Store price history
      updateData.previousPrice = product.price;
      product.priceHistory.push({
        price: product.price,
        changedAt: new Date(),
        percentChange
      });
      updateData.priceChangedAt = new Date();
    }

    // Auto-update seasonal data based on category if selling
    if (updateData.soldCount && updateData.soldCount > product.soldCount) {
      const currentMonth = getCurrentMonthKey();
      const soldDiff = updateData.soldCount - product.soldCount;
      if (!updateData.seasonalData) updateData.seasonalData = product.seasonalData;
      updateData.seasonalData[currentMonth] = (product.seasonalData[currentMonth] || 0) + soldDiff;
    }

    // Regenerate meta tags if auto-generated or not provided
    if (product.autoGeneratedMetaTags || !updateData.seoTitle) {
      const autoMeta = generateMetaTags(updateData);
      updateData.seoTitle = updateData.seoTitle || autoMeta.seoTitle;
      updateData.seoDescription = updateData.seoDescription || autoMeta.seoDescription;
      updateData.keywords = updateData.keywords?.length ? updateData.keywords : autoMeta.keywords;
      updateData.seoSlug = updateData.seoSlug || autoMeta.seoSlug;
      updateData.autoGeneratedMetaTags = true;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update product" });
  }
});

app.delete("/products/:id", auth, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete product" });
  }
});

// ================= INVENTORY MANAGEMENT =================
app.get("/inventory/alerts", auth, adminOnly, async (req, res) => {
  try {
    const products = await Product.find();
    const alerts = detectInventoryIssues(products);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory alerts" });
  }
});

app.get("/inventory/stock/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select("name stock minStockLevel category");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({
      name: product.name,
      category: product.category,
      stock: product.stock,
      minLevel: product.minStockLevel,
      status: product.stock === 0 ? "out_of_stock" : product.stock < product.minStockLevel ? "low_stock" : "in_stock"
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stock" });
  }
});

app.put("/inventory/restock/:productId", auth, adminOnly, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { $inc: { stock: quantity }, lastRestockDate: new Date() },
      { new: true }
    );
    res.json({ message: `Restocked ${quantity} units`, product });
  } catch (error) {
    res.status(500).json({ message: "Failed to restock" });
  }
});

// ================= PRICE MONITORING =================
app.get("/pricing/anomalies", auth, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({ priceHistory: { $exists: true, $ne: [] } });
    const anomalies = detectPriceAnomalies(products);
    res.json(anomalies);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch price anomalies" });
  }
});

app.get("/pricing/history/:productId", auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select("name price previousPrice priceHistory");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({
      name: product.name,
      currentPrice: product.price,
      previousPrice: product.previousPrice,
      history: product.priceHistory
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch price history" });
  }
});

// ================= SEASONAL ANALYTICS & PREDICTIONS =================
app.get("/analytics/trends", async (req, res) => {
  try {
    const products = await Product.find();
    const predictions = predictMonthlyTrends(products);
    res.json({
      currentMonth: getCurrentMonthKey(),
      predictions,
      summary: `${predictions.length} products predicted to sell this month`
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trends" });
  }
});

app.get("/analytics/category-trends", async (req, res) => {
  try {
    const month = req.query.month || null;
    const products = await Product.find();
    const trends = getCategoryTrendsByMonth(products, month);
    res.json({ trends });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category trends" });
  }
});

app.get("/analytics/seasonal-analysis", async (req, res) => {
  try {
    const products = await Product.find();
    const analysis = analyzeSeasonalTrends(products);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch seasonal analysis" });
  }
});

app.get("/analytics/recommendations/seasonal", async (req, res) => {
  try {
    const products = await Product.find().sort({ rating: -1 });
    const featured = await getCurrentStoreSeason();
    let recommendations = getSeasonalRecommendations(products).slice(0, 12);
    if (featured?.theme) {
      const themeFiltered = products
        .filter((p) => Array.isArray(p.themes) && p.themes.includes(featured.theme))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));
      if (themeFiltered.length) {
        recommendations = themeFiltered.slice(0, 12);
      }
    }
    res.json({
      season: featured?.theme || (new Date().getMonth() >= 11 || new Date().getMonth() <= 1 ? "winter" : 
               new Date().getMonth() >= 2 && new Date().getMonth() <= 4 ? "spring" :
               new Date().getMonth() >= 5 && new Date().getMonth() <= 7 ? "summer" : "fall"),
      label: featured?.label || null,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch seasonal recommendations" });
  }
});

app.get("/settings/featured-collection", auth, adminOnly, async (req, res) => {
  try {
    const setting = await getCurrentStoreSeason();
    res.json(setting || { theme: "dailywear", label: "Daily Luxe" });
  } catch {
    res.status(500).json({ message: "Failed to read featured collection" });
  }
});

app.put("/settings/featured-collection", auth, adminOnly, async (req, res) => {
  try {
    const { theme } = req.body;
    if (!theme) return res.status(400).json({ message: "Theme is required" });
    const updated = await upsertFeaturedCollection(theme);
    res.json(updated.value);
  } catch {
    res.status(500).json({ message: "Failed to update featured collection" });
  }
});

app.get("/analytics/dashboard", auth, adminOnly, async (req, res) => {
  try {
    const products = await Product.find();
    const totalProducts = products.length;
    const totalSales = products.reduce((sum, p) => sum + p.soldCount, 0);
    const inventory = detectInventoryIssues(products);
    const priceAnomalies = detectPriceAnomalies(products);
    const monthlyTrends = predictMonthlyTrends(products).slice(0, 5);
    const categoryTrends = getCategoryTrendsByMonth(products).slice(0, 5);

    res.json({
      overview: {
        totalProducts,
        totalSales,
        lowStockItems: inventory.lowStock.length,
        outOfStockItems: inventory.outOfStock.length,
        priceAnomalies: priceAnomalies.length
      },
      inventory,
      priceAnomalies,
      monthlyTrends,
      categoryTrends
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard" });
  }
});

// ================= AUTO META TAGS GENERATION =================
app.post("/admin/regenerate-meta-tags", auth, adminOnly, async (req, res) => {
  try {
    const { productId, forAll } = req.body;

    if (forAll) {
      // Regenerate for all products
      const products = await Product.find();
      await Promise.all(
        products.map((product) => {
          const autoMeta = generateMetaTags(product);
          return Product.findByIdAndUpdate(product._id, {
            ...autoMeta,
            autoGeneratedMetaTags: true
          });
        })
      );
      return res.json({ message: `Meta tags regenerated for ${products.length} products` });
    }

    if (productId) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const autoMeta = generateMetaTags(product);
      const updated = await Product.findByIdAndUpdate(productId, {
        ...autoMeta,
        autoGeneratedMetaTags: true
      }, { new: true });
      return res.json({ message: "Meta tags regenerated", product: updated });
    }

    res.status(400).json({ message: "Provide productId or forAll parameter" });
  } catch (error) {
    res.status(500).json({ message: "Failed to regenerate meta tags" });
  }
});

// ================= USER PROFILE / CART / WISHLIST =================
app.get("/users/me", auth, async (req, res) => {
  const populated = await User.findById(req.user._id)
    .populate("wishlist")
    .populate("cart.product")
    .populate("orders.items.product")
    .lean();
  res.json(populated);
});

app.get("/users", auth, adminOnly, async (req, res) => {
  const users = await User.find({}, "name email role").sort({ _id: -1 });
  res.json(users);
});

app.put("/users/:id/role", auth, adminOnly, async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "Role updated", user: safeUser(user) });
});

app.get("/wishlist", auth, async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user.wishlist);
});

app.post("/wishlist/:productId", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  if (!user.wishlist.some((id) => id.toString() === productId)) {
    user.wishlist.push(productId);
    await user.save();
  }
  const populated = await User.findById(req.user._id).populate("wishlist");
  res.json(populated.wishlist);
});

app.delete("/wishlist/:productId", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
  await user.save();
  const populated = await User.findById(req.user._id).populate("wishlist");
  res.json(populated.wishlist);
});

app.get("/cart", auth, async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart.product");
  res.json(user.cart);
});

app.post("/cart", auth, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const user = await User.findById(req.user._id);
  const found = user.cart.find((item) => item.product.toString() === productId);

  if (found) {
    found.quantity += Number(quantity || 1);
  } else {
    user.cart.push({ product: productId, quantity: Number(quantity || 1) });
  }

  await user.save();
  const populated = await User.findById(req.user._id).populate("cart.product");
  res.json(populated.cart);
});

app.put("/cart/:productId", auth, async (req, res) => {
  const { quantity } = req.body;
  const user = await User.findById(req.user._id);
  const item = user.cart.find((entry) => entry.product.toString() === req.params.productId);

  if (!item) return res.status(404).json({ message: "Cart item not found" });
  item.quantity = Math.max(1, Number(quantity || 1));

  await user.save();
  const populated = await User.findById(req.user._id).populate("cart.product");
  res.json(populated.cart);
});

app.delete("/cart/:productId", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter((entry) => entry.product.toString() !== req.params.productId);
  await user.save();
  const populated = await User.findById(req.user._id).populate("cart.product");
  res.json(populated.cart);
});

app.post("/coupons/apply", auth, async (req, res) => {
  const { code = "" } = req.body;
  const user = await User.findById(req.user._id).populate("cart.product");
  const subtotal = user.cart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
  const result = applyCoupon(code, subtotal);
  if (!result) return res.status(400).json({ message: "Invalid coupon code" });
  res.json({ subtotal, ...result });
});

app.get("/cart/reminder", auth, async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart.product", "name price");
  if (!user.cart.length) {
    return res.json({ remind: false, message: "Your cart is empty." });
  }
  const count = user.cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = user.cart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
  res.json({
    remind: true,
    message: `You still have ${count} item(s) worth $${total.toFixed(2)} in your cart.`,
    cart: user.cart
  });
});

// ================= CHECKOUT & ORDERS =================
app.post("/checkout", auth, async (req, res) => {
  try {
    const { shippingAddress = "Sandbox Address", couponCode = "" } = req.body;
    const user = await User.findById(req.user._id).populate("cart.product");

    if (!user.cart.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = user.cart.map((entry) => ({
      product: entry.product._id,
      quantity: entry.quantity,
      priceAtPurchase: entry.product.price
    }));

    const subtotal = items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
    const coupon = couponCode ? applyCoupon(couponCode, subtotal) : null;
    const totalAmount = coupon ? coupon.finalTotal : subtotal;

    user.orders.unshift({
      items,
      totalAmount,
      status: "placed",
      paymentStatus: "sandbox_paid",
      shippingAddress,
      placedAt: new Date()
    });

    // Update product soldCount and seasonal data
    const currentMonth = getCurrentMonthKey();
    await Promise.all(
      items.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { soldCount: item.quantity, stock: -item.quantity },
          $inc: { [`seasonalData.${currentMonth}`]: item.quantity }
        })
      )
    );

    user.cart = [];
    await user.save();

    res.json({
      message: "Checkout successful in sandbox mode",
      order: user.orders[0],
      coupon: coupon || null,
      subtotal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Checkout failed" });
  }
});

app.get("/orders/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).populate("orders.items.product");
  res.json(user.orders);
});

app.get("/orders/track/:orderId", auth, async (req, res) => {
  const orderId = req.params.orderId;

  if (req.user.role === "admin") {
    const user = await User.findOne({ "orders._id": orderId }).populate("orders.items.product");
    const order = user?.orders?.id(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const activeIndex = Math.max(STATUS_TIMELINE.indexOf(order.status), 0);
    const timeline = STATUS_TIMELINE.map((step, index) => ({
      step,
      completed: index <= activeIndex,
      current: step === order.status
    }));

    return res.json({
      owner: { name: user.name, email: user.email },
      order,
      timeline
    });
  }

  const user = await User.findById(req.user._id).populate("orders.items.product");
  const order = user.orders.id(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const activeIndex = Math.max(STATUS_TIMELINE.indexOf(order.status), 0);
  const timeline = STATUS_TIMELINE.map((step, index) => ({
    step,
    completed: index <= activeIndex,
    current: step === order.status
  }));

  res.json({ order, timeline });
});

app.get("/orders", auth, adminOnly, async (req, res) => {
  const users = await User.find({ "orders.0": { $exists: true } })
    .select("name email orders")
    .populate("orders.items.product");
  res.json(users);
});

app.put("/orders/:userId/:orderId/status", auth, adminOnly, async (req, res) => {
  const { status } = req.body;
  const allowed = ["placed", "processing", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const order = user.orders.id(req.params.orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status;
  await user.save();
  res.json({ message: "Order updated", order });
});

// ================= CHATBOT / AI AGENT (Groq-powered) =================
const localChatResponses = [
  {
    triggers: [
      /what is this app/i,
      /what is luwia/i,
      /tell me about the app/i,
      /what does luwia do/i,
      /what is luwia ai/i
    ],
    intent: "general_knowledge",
    reply: "Luwia is a premium jewelry shopping demo with an AI assistant, curated seasonal picks, product discovery, and elegant collections for rings, necklaces, earrings, bracelets, watches, bags, and shoes."
  },
  {
    triggers: [
      /how do i sign up/i,
      /create an account/i,
      /register/i
    ],
    intent: "general_knowledge",
    reply: "Use the signup page, enter your name, email and password, then log in to save favorites, get recommendations, and add items to your cart."
  },
  {
    triggers: [
      /how do i log in/i,
      /login/i,
      /sign in/i
    ],
    intent: "general_knowledge",
    reply: "Go to the Login page and enter the email and password you registered with. Once signed in, you can use the cart, wishlist, and personalized recommendations."
  },
  {
    triggers: [
      /apply coupon/i,
      /use coupon/i,
      /coupon/i,
      /discount code/i,
      /promo code/i
    ],
    intent: "coupon",
    reply: "Available coupons: SAVE10 (10% off), NEWUSER15 (15% off), FLAT50 ($50 off). Ask me to apply one and I can tell you the savings."
  },
  {
    triggers: [
      /return policy/i,
      /returns/i,
      /refund/i,
      /can i return/i
    ],
    intent: "faq_returns",
    reply: "Returns are accepted within 14 days for unused items in original packaging. Refunds process in 5-7 business days."
  },
  {
    triggers: [
      /shipping policy/i,
      /shipping/i,
      /delivery/i,
      /how long does it take/i,
      /ship internationally/i
    ],
    intent: "faq_shipping",
    reply: "Standard shipping takes 3-7 business days. Express shipping is 1-3 days. Free shipping is available on orders over $150."
  },
  {
    triggers: [
      /gift wrap/i,
      /gift wrapping/i,
      /gift package/i,
      /gift box/i
    ],
    intent: "general_knowledge",
    reply: "Yes — we offer luxury gift wrapping for special occasions. In the app demo, add your favorites to the cart and imagine them arriving in elegant packaging."
  },
  {
    triggers: [
      /track my order/i,
      /where is my order/i,
      /order status/i,
      /track order/i
    ],
    intent: "order_tracking",
    reply: "I can check your order status when you are logged in. Ask me to track your order and I will show the latest shipment stage."
  },
  {
    triggers: [
      /wishlist/i,
      /save for later/i,
      /favorites/i,
      /favorite items/i
    ],
    intent: "general_knowledge",
    reply: "Use the wishlist to save products you love. After login, click the wishlist button on any product to keep it for later."
  },
  {
    triggers: [
      /seasonal/i,
      /summer/i,
      /winter/i,
      /spring/i,
      /fall/i,
      /autumn/i,
      /holiday/i,
      /valentine/i,
      /wedding/i
    ],
    intent: "seasonal_recommendations",
    reply: "Let me find the best seasonal jewelry and accessories for you. Here are curated picks for this season."
  },
  {
    triggers: [
      /what is react/i,
      /what is javascript/i,
      /how does ai work/i,
      /how does the internet work/i,
      /what is web development/i
    ],
    intent: "general_knowledge",
    reply: "I can answer general tech questions as well. Just ask me about React, JavaScript, AI, or anything related to web development."
  },
  {
    triggers: [
      /random question/i,
      /tell me something/i,
      /fun fact/i,
      /interesting fact/i
    ],
    intent: "general_knowledge",
    reply: "Here is a fun fact: Jewelry trends often reflect the season — warm golds and sunset tones shine in autumn, while pearls and icy gemstones glow in winter."
  }
];

const findLocalResponse = (text) => {
  const normalized = text.toString();
  for (const item of localChatResponses) {
    if (item.triggers.some((pattern) => typeof pattern === "string" ? normalized.toLowerCase().includes(pattern.toLowerCase()) : pattern.test(normalized))) {
      return item;
    }
  }
  return null;
};

const seasonalTriggerWords = ["season", "summer", "winter", "spring", "fall", "autumn", "holiday", "valentine", "wedding", "springtime", "summertime", "festive"];
const isSeasonalQuestion = (text) => seasonalTriggerWords.some((word) => text.toLowerCase().includes(word));

app.post("/assistant/chat", optionalAuth, async (req, res) => {
  try {
    const message = (req.body.message || "").toString().trim();
    if (!message) return res.json({ reply: "Please type a message so I can help.", intent: "empty" });

    const lower = message.toLowerCase();

    // ── Step 1: Groq intent classification ──────────────────────────
    const groqResult = await askGroq(message);

    const localResponse = findLocalResponse(message);
    const seasonalQuery = isSeasonalQuestion(message);

    // ── Step 2: Decide intent (Groq first, keyword fallback if unavailable) ──
    let intent = groqResult?.intent || "unknown";
    const params = groqResult?.params || {};
    let reply = groqResult?.reply || "";
    let payload = null;

    if ((intent === "unknown" || !groqResult) && localResponse) {
      return res.json({
        intent: localResponse.intent || "general_knowledge",
        reply: localResponse.reply,
        payload: localResponse.payload || null
      });
    }

    if (!groqResult && seasonalQuery) intent = "seasonal_recommendations";

    // Handle plain text general knowledge responses
    if (groqResult?.isPlainText) {
      return res.json({
        intent: "general_knowledge",
        reply: groqResult.reply,
        payload: null
      });
    }

    if (!groqResult) {
      if (lower.includes("shipping") || lower.includes("delivery")) intent = "faq_shipping";
      else if (lower.includes("return") || lower.includes("refund")) intent = "faq_returns";
      else if (lower.includes("payment") || lower.includes("pay")) intent = "faq_payment";
      else if (lower.includes("where is my order") || lower.includes("track")) intent = "order_tracking";
      else if (lower.includes("coupon") || lower.includes("discount") || lower.includes("promo")) intent = "coupon";
      else if (lower.includes("trending") || lower.includes("popular") || lower.includes("best seller")) intent = "trending";
      else if (lower.includes("recommend") || lower.includes("suggest")) intent = "recommendations";
      else if ((lower.includes("what") && lower.includes("people")) || lower.includes("popular search")) intent = "popular_searches";
      else if (lower.includes("add") && lower.includes("cart")) intent = "cart_add";
      else if (lower.includes("remove") && lower.includes("cart")) intent = "cart_remove";
      else if (lower.includes("cart")) intent = "cart_reminder";
      else intent = "general_knowledge";
    }

    // ── Step 3: Execute intent against database ──────────────────────
    switch (intent) {

      case "product_search": {
        const parsed = parseNaturalSearch(message);
        const cat = params.category || parsed.category;
        const minP = params.minPrice != null ? params.minPrice : parsed.minPrice;
        const maxP = params.maxPrice != null ? params.maxPrice : parsed.maxPrice;
        const rat = params.rating != null ? params.rating : parsed.rating;
        const brandFilter = params.brand || null;
        const hasFilters = !!(cat || minP != null || maxP != null || rat || brandFilter);

        const query = {};
        if (cat) query.category = new RegExp(cat, "i");
        if (brandFilter) query.brand = new RegExp(brandFilter, "i");
        if (rat) query.rating = { $gte: rat };
        if (minP != null || maxP != null) {
          query.price = {};
          if (minP != null) query.price.$gte = minP;
          if (maxP != null) query.price.$lte = maxP;
        }
        if (!hasFilters && message.length > 2) {
          query.$or = [
            { name: { $regex: message, $options: "i" } },
            { description: { $regex: message, $options: "i" } },
            { keywords: { $elemMatch: { $regex: message, $options: "i" } } }
          ];
        }

        let products = await Product.find(query).sort({ rating: -1, soldCount: -1 }).limit(8);

        if (!products.length && hasFilters && cat) {
          products = await Product.find({ category: new RegExp(cat, "i") }).sort({ rating: -1 }).limit(6);
          if (products.length && !reply) reply = `No exact price match, but here are our top ${cat}!`;
        }

        if (products.length) {
          if (!reply) reply = `I found ${products.length} product(s) matching your search!`;
          payload = { products };
        } else {
          reply = reply || `No products found. Try "show me rings", "necklaces under $300", or ask what is trending!`;
        }
        break;
      }

      case "trending": {
        const products = await Product.find().sort({ soldCount: -1, rating: -1 }).limit(8);
        if (!reply) reply = "Here are our hottest trending products right now!";
        payload = { products };
        break;
      }

      case "popular_searches": {
        const topProducts = await Product.find().sort({ soldCount: -1 }).limit(30);
        const topByCategory = {};
        topProducts.forEach((p) => {
          const cat = p.category || "General";
          if (!topByCategory[cat]) topByCategory[cat] = [];
          if (topByCategory[cat].length < 3) topByCategory[cat].push(p.name);
        });
        const summary = Object.entries(topByCategory)
          .map(([cat, items]) => `${cat}: ${items.join(", ")}`)
          .join(" | ");
        if (!reply) reply = `People are shopping for: ${summary || "rings, necklaces, earrings and more!"}`;
        payload = { topByCategory };
        break;
      }

      case "seasonal_recommendations": {
        const allProducts = await Product.find();
        const seasonal = getSeasonalRecommendations(allProducts);
        const products = seasonal.recommendations || [];
        if (!reply) reply = seasonal.summary || `Discover our curated ${seasonal.season} collection. Here are the best seasonal picks!`;
        payload = { products: products.slice(0, 8), season: seasonal.season, summary: seasonal.summary };
        break;
      }

      case "recommendations": {
        let products;
        if (req.user) {
          const u = await User.findById(req.user._id).populate("orders.items.product");
          const categories = new Map();
          u.orders.forEach((order) => {
            order.items.forEach((item) => {
              const cat = item.product?.category;
              if (cat) categories.set(cat, (categories.get(cat) || 0) + item.quantity);
            });
          });
          const topCat = [...categories.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
          products = topCat
            ? await Product.find({ category: topCat }).sort({ rating: -1 }).limit(6)
            : await Product.find().sort({ soldCount: -1, rating: -1 }).limit(6);
          if (!reply) reply = topCat ? `Based on your history, you will love these ${topCat}!` : "Here are our top-rated picks for you!";
        } else {
          products = await Product.find().sort({ soldCount: -1, rating: -1 }).limit(6);
          if (!reply) reply = "Here are our best picks! Login for personalized recommendations.";
        }
        payload = { products };
        break;
      }

      case "order_tracking": {
        if (!req.user) {
          reply = reply || "Please login first so I can check your order status!";
          break;
        }
        const u = await User.findById(req.user._id).populate("orders.items.product");
        const latest = u.orders[0];
        if (!latest) {
          reply = "You do not have any orders yet. Start shopping!";
          break;
        }
        const activeIndex = Math.max(STATUS_TIMELINE.indexOf(latest.status), 0);
        const timeline = STATUS_TIMELINE.map((step, index) => ({
          step,
          completed: index <= activeIndex,
          current: step === latest.status
        }));
        reply = reply || `Your latest order #${latest._id.toString().slice(-6).toUpperCase()} is currently "${latest.status}".`;
        payload = { order: latest, timeline };
        break;
      }

      case "cart_add": {
        if (!req.user) {
          reply = reply || "Please login first to add items to your cart!";
          break;
        }
        const allProducts = await Product.find().limit(100);
        const found = allProducts.find((p) =>
          lower.includes((p.name || "").toLowerCase()) ||
          (params.productName && p.name.toLowerCase().includes(params.productName.toLowerCase()))
        );
        if (!found) {
          reply = "I could not find that product. Try its exact name, or browse the Products page!";
          break;
        }
        const uAdd = await User.findById(req.user._id);
        const existing = uAdd.cart.find((item) => item.product.toString() === found._id.toString());
        if (existing) existing.quantity += 1;
        else uAdd.cart.push({ product: found._id, quantity: 1 });
        await uAdd.save();
        reply = reply || `${found.name} has been added to your cart!`;
        break;
      }

      case "cart_remove": {
        if (!req.user) {
          reply = reply || "Please login first to manage your cart!";
          break;
        }
        const uRem = await User.findById(req.user._id).populate("cart.product");
        if (!uRem.cart.length) { reply = "Your cart is already empty!"; break; }
        const cartProds = uRem.cart.map((item) => item.product).filter(Boolean);
        const found = cartProds.find((p) =>
          lower.includes((p.name || "").toLowerCase()) ||
          (params.productName && p.name.toLowerCase().includes(params.productName.toLowerCase()))
        );
        if (!found) { reply = "Please mention the exact product name to remove from your cart."; break; }
        uRem.cart = uRem.cart.filter((item) => item.product._id.toString() !== found._id.toString());
        await uRem.save();
        reply = reply || `${found.name} has been removed from your cart.`;
        break;
      }

      case "cart_reminder": {
        if (!req.user) { reply = reply || "Login to check what is in your cart!"; break; }
        const uCart = await User.findById(req.user._id).populate("cart.product", "name price");
        if (!uCart.cart.length) { reply = "Your cart is empty. Browse products and add something you love!"; break; }
        const count = uCart.cart.reduce((sum, item) => sum + item.quantity, 0);
        const total = uCart.cart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
        reply = reply || `You have ${count} item(s) in your cart worth $${total.toFixed(2)}. Do not forget to checkout!`;
        break;
      }

      case "coupon": {
        if (!req.user) {
          reply = reply || "Login first so I can apply coupons! Available: SAVE10 (10% off), NEWUSER15 (15% off), FLAT50 ($50 off).";
          break;
        }
        const codeMatch = message.match(/\b([A-Z0-9]{4,12})\b/gi);
        const code = params.couponCode || (codeMatch ? codeMatch[codeMatch.length - 1].toUpperCase() : "");
        if (!code) {
          reply = reply || "Available coupons: SAVE10 (10% off), NEWUSER15 (15% off), FLAT50 ($50 off). Which would you like?";
          break;
        }
        const uCoupon = await User.findById(req.user._id).populate("cart.product");
        const subtotal = uCoupon.cart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
        const result = applyCoupon(code, subtotal);
        if (!result) { reply = `"${code}" is not valid. Try SAVE10, NEWUSER15, or FLAT50!`; break; }
        reply = `Coupon ${result.code} applied! You saved $${result.discount}. New total: $${result.finalTotal}.`;
        payload = result;
        break;
      }

      case "faq_shipping":
        if (!reply) reply = "Standard shipping takes 3-7 business days. Express takes 1-3 days. Free shipping on orders over $150!";
        break;

      case "faq_returns":
        if (!reply) reply = "Returns accepted within 14 days for unused items in original packaging. Refunds process in 5-7 business days.";
        break;

      case "faq_payment":
        if (!reply) reply = "We accept all major credit and debit cards. This project uses sandbox checkout mode for demo purposes.";
        break;

      case "general_knowledge": {
        // If Groq returned a general knowledge response, use it
        if (reply) break;
        
        // Fallback for general knowledge questions
        reply = "I can help with information about web development, technology, and general questions! What would you like to know?";
        break;
      }

      default: {
        // Final fallback: broad keyword/NLP product search
        const parsed = parseNaturalSearch(message);
        const fbQuery = {};
        if (parsed.category) fbQuery.category = new RegExp(parsed.category, "i");
        if (parsed.minPrice != null || parsed.maxPrice != null) {
          fbQuery.price = {};
          if (parsed.minPrice != null) fbQuery.price.$gte = parsed.minPrice;
          if (parsed.maxPrice != null) fbQuery.price.$lte = parsed.maxPrice;
        }
        if (message.length > 2) {
          fbQuery.$or = [
            { name: { $regex: message, $options: "i" } },
            { keywords: { $elemMatch: { $regex: message, $options: "i" } } }
          ];
        }
        const products = await Product.find(fbQuery).limit(5);
        if (products.length) {
          reply = reply || "I found some products that might interest you!";
          payload = { products };
        } else {
          reply = reply || `I can help with: product search ("show me rings under $200"), order tracking, cart, coupons, and also answer general questions about tech and web!`;
        }
      }
    }

    return res.json({ intent, reply, payload });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ reply: "Something went wrong on my end. Please try again!", intent: "error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});