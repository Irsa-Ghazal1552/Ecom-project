# 🚀 Quick Start Guide - New Features

## Prerequisites Setup

### 1. **Groq AI API Key** (Required for general Q&A chatbot)
```bash
# Get API Key from: https://console.groq.com/keys
# Add to backend/.env
GROQ_API_KEY=your_api_key_here
```

### 2. **Environment Variables** (backend/.env)
```
GROQ_API_KEY=gsk_xxxxx...
JWT_SECRET=your-secret-key
ADMIN_BOOTSTRAP_KEY=make-admin-2026
```

---

## 🏃 Running the Application

### Start Backend
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### Start Frontend
```bash
cd frontend/vite-project
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📍 Access New Features

### Customer Features

| Feature | URL | Description |
|---------|-----|-------------|
| Seasonal Picks | `/seasonal-recommendations` | Products trending this month |
| Sales Trends | `/trends` | Predicted best sellers & categories |
| AI Chatbot | Chat button (bottom right) | Ask any question (e-commerce or general) |

### Admin Features

| Feature | URL | Description |
|---------|-----|-------------|
| Analytics Dashboard | `/analytics/dashboard` | Complete overview & insights |
| Inventory Alerts | `/inventory/alerts` | Stock management |
| Price Monitoring | `/price-monitoring` | Price anomaly tracking |

---

## 🧪 Quick Test Commands

### 1. **Test Inventory Alerts**
```bash
# Get all inventory alerts
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/inventory/alerts
```

### 2. **Test Price Anomalies**
```bash
# Get price anomalies
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/pricing/anomalies
```

### 3. **Test Trend Predictions**
```bash
# Get monthly trends
curl http://localhost:5000/analytics/trends
```

### 4. **Test Chatbot with General Q&A**
```bash
# E-commerce question
curl -X POST http://localhost:5000/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me rings under $200"}'

# General Q&A question
curl -X POST http://localhost:5000/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is React?"}'
```

### 5. **Test Auto Meta Tags Generation**
```bash
# Regenerate meta tags for all products
curl -X POST http://localhost:5000/admin/regenerate-meta-tags \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"forAll": true}'
```

---

## 💾 Database Initialization

### Seed Products with New Fields
```bash
cd backend
node seedProducts.js
# This creates sample products with seasonal data
```

### Manual Product Update (If needed)
```javascript
// Example: Update product with inventory fields
const product = await Product.findByIdAndUpdate(productId, {
  stock: 100,
  minStockLevel: 10,
  reorderQuantity: 50,
  seasonalData: {
    jan: 10, feb: 15, mar: 20, ... // etc
  }
});
```

---

## 🎯 Key Workflows

### Workflow 1: Monitor Inventory
1. Admin logs in
2. Navigate to `/inventory/alerts`
3. See low stock and out of stock items
4. Click "Restock (50)" button to add inventory
5. System updates stock and removes from alerts

### Workflow 2: Check Price Anomalies
1. Admin logs in
2. Navigate to `/price-monitoring`
3. Review any critical price changes (>50%)
4. Warnings (30-50%) need review
5. All changes logged in history

### Workflow 3: Use Seasonal Recommendations
1. Customer browses to `/seasonal-recommendations`
2. Sees products trending this month
3. Confidence scores show prediction reliability
4. Click "Add to Cart" for trending items

### Workflow 4: Check Sales Trends
1. Customer/Admin visits `/trends`
2. View "This Month's Predictions" tab
3. Switch to "Category Performance" for breakdown
4. See top products and sales predictions

### Workflow 5: Use Advanced Chatbot
1. Click AI Assistant button (bottom right)
2. Try e-commerce: "Show me necklaces under $300"
3. Try general Q&A: "How does web development work?"
4. Chatbot routes intelligently to correct answer

---

## 📊 Sample API Responses

### Analytics Trends Response
```json
{
  "currentMonth": "may",
  "predictions": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Diamond Engagement Ring",
      "category": "rings",
      "price": 499.99,
      "stock": 45,
      "expectedSales": 78,
      "confidence": 92.5
    }
  ],
  "summary": "15 products predicted to sell this month"
}
```

### Inventory Alerts Response
```json
{
  "lowStock": [
    {
      "productId": "...",
      "name": "Gold Bracelet",
      "category": "bracelets",
      "currentStock": 5,
      "minLevel": 10,
      "needsReorder": true
    }
  ],
  "outOfStock": [
    {
      "productId": "...",
      "name": "Pearl Necklace",
      "category": "necklaces",
      "urgency": "CRITICAL"
    }
  ],
  "overstocked": []
}
```

### General Q&A Chatbot Response
```json
{
  "intent": "general_knowledge",
  "reply": "Machine learning is a subset of artificial intelligence that enables systems to learn from data...",
  "payload": null
}
```

---

## ⚙️ Configuration Tips

### Adjust Stock Thresholds
```javascript
// In Product model or update endpoint
minStockLevel: 10,  // Adjust per category
reorderQuantity: 50, // Typical order size
```

### Adjust Price Change Threshold
```javascript
// In server.js price update handler
if (percentChange > 30) {  // Change from 30 to your preferred value
  // Flag as warning
}
if (percentChange > 50) {  // Change from 50 to block threshold
  // Block the change
}
```

### Season Definition (Optional)
```javascript
// Current: Based on month (jan=winter, etc)
// Can modify in analyticsEngine.js if needed
const season = 
  currentMonth >= 12 || currentMonth <= 2 ? "winter" :
  currentMonth >= 3 && currentMonth <= 5 ? "spring" :
  // ... etc
```

---

## 🐛 Troubleshooting

### Issue: Trends showing no predictions
**Solution**: 
- Ensure products have sales history (soldCount > 0)
- Check seasonalData is populated
- Manually trigger some test orders

### Issue: Chatbot not answering general questions
**Solution**:
- Verify GROQ_API_KEY in .env
- Check internet connection
- Restart backend server

### Issue: Price change not blocked
**Solution**:
- Check percentChange calculation logic
- Verify update endpoint is being used
- Review error response for details

### Issue: Meta tags not generating
**Solution**:
- Call regenerate endpoint manually
- Check product has name and category
- Verify autoGeneratedMetaTags flag is true

---

## 📈 Monitoring & Analytics

### Check System Health
```bash
# Products overview
curl http://localhost:5000/products | jq '.length'

# Trends summary
curl http://localhost:5000/analytics/trends | jq '.summary'

# Inventory status
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/inventory/alerts | jq '.lowStock | length'
```

### Monitor Logs
```bash
# Backend logs show:
# ✅ Groq AI connected
# ✅ MongoDB Connected
# API request logs with timestamps
```

---

## 🎓 Learning Resources

- **Analytics**: Check `/analytics/dashboard` for real-time insights
- **Trends**: Visit `/trends` page to understand seasonal patterns
- **API Docs**: Review IMPLEMENTATION_GUIDE.md for full API reference
- **Database**: Check MongoDB collections for historical data

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] GROQ_API_KEY configured
- [ ] Admin account created
- [ ] Sample products seeded
- [ ] Chatbot responding to queries
- [ ] Analytics dashboard loading
- [ ] Inventory alerts working
- [ ] Price monitoring active

---

## 🎉 You're All Set!

Your e-commerce platform now has:
✅ AI-powered seasonal predictions
✅ Real-time inventory management
✅ Price change protection
✅ Auto-generated SEO meta tags
✅ Advanced analytics dashboard
✅ General knowledge chatbot

Start exploring the new features and optimize your e-commerce business!

For detailed information, see: **IMPLEMENTATION_GUIDE.md**
