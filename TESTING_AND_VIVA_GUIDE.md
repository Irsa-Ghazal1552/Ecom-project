# E-Commerce Store - Complete Testing & Viva Guide

## Part 1: System Architecture Overview (Viva Talking Points)

### Backend Architecture
- **Node.js + Express**: RESTful API server on port 5000
- **MongoDB**: NoSQL database storing users, products, orders
- **JWT**: Token-based authentication for secure sessions
- **Helmet**: Security middleware for HTTP headers protection
- **Bcrypt**: Password hashing for user security
- **CORS**: Cross-origin resource sharing for frontend communication

### Frontend Architecture
- **React 19**: Component-based UI library
- **Vite**: Fast build tool and dev server on port 5173
- **React Router**: Client-side routing between pages
- **Axios**: HTTP client with auto-token attachment
- **Context API**: Global state management (Auth + Shop)
- **Tailwind CSS**: Utility-first styling
- **React Helmet**: SEO meta tag injection
- **Swiper**: Carousel for hero slider

### Key Features Implemented
1. **Admin Authentication**: Role-based access control
2. **Product Management**: Full CRUD with SEO metadata
3. **Shopping Cart**: Add/remove/update quantities
4. **User Wishlist**: Save favorite products
5. **Order Management**: Place orders and track status
6. **Admin Dashboard**: Centralized management hub for all operations
7. **On-Page SEO**: Helmet tags + product metadata

---

## Part 2: Step-by-Step Testing Guide

### SETUP & SERVER START

#### Step 1: Open Two Terminals
1. Open Terminal 1 (Backend)
2. Open Terminal 2 (Frontend)

#### Step 2: Start Backend Server
**Terminal 1:**
```
cd C:\Users\PMLS\Documents\a sem7\E-commerce\E-comProject\backend
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB Connected
```

#### Step 3: Start Frontend Server
**Terminal 2:**
```
cd C:\Users\PMLS\Documents\a sem7\E-commerce\E-comProject\frontend\vite-project
npm run dev
```

**Expected Output:**
```
VITE v8.0.1  ready in XXX ms
➜  Local: http://localhost:5173/
```

#### Step 4: Open Browser
- Go to `http://localhost:5173`
- You should see the **Luwia Fine Jewellery** home page with hero slider

---

### TEST 1: Home Page & Styling (Assignment Part: Website Design)

**What it demonstrates:**
- Frontend styling consistency
- Responsive design
- SEO helmet tags

**Click Steps:**
1. Navigate to home page (already open)
2. Notice:
   - **Hero Slider**: 3 rotating banner images with text overlay
   - **Brand Story Section**: "Fine Jewellery, Curated for Everyday Luxury"
   - **Product Rows**: "Best Products" and "Viral Products" sections
   - **Categories Section**: "Curation by Form" with product categories
   - **Footer**: Styled with dark emerald color, contact info

**Technical Explanation (Viva):**
- Uses React Helmet to add `<title>` and meta description tags for SEO
- Tailwind CSS utility classes for responsive grid layout
- Swiper library handles auto-rotating hero slider with pagination
- Context API loads all products from backend on app initialization
- Global color scheme uses emerald (#0f3f33) and gold (#ae7a2c) for luxury branding

**How to verify SEO tags:**
- Right-click → Inspect → head section
- See: `<title>Luwia Jewellery - Home</title>`
- See: `<meta name="description" content="Buy luxury jewellery online">`

---

### TEST 2: User Signup (Assignment Part: USER Management - Signup)

**What it demonstrates:**
- User registration with bcrypt password hashing
- Email validation
- Database persistence

**Click Steps:**
1. Click **"Sign In"** button (top right of header)
2. On Login page, click **"Create account"** link
3. Fill the Signup form:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `Password123`
4. Click **"Sign Up"** button
5. See green success message: "Account created. You can now login."
6. Auto-redirect to Login page after 700ms

**Technical Explanation (Viva):**
- Frontend sends POST to `/auth/signup` with name, email, password
- Backend validates email doesn't already exist (409 Conflict if duplicate)
- Backend bcryptjs hashes password with salt factor 10
- User stored in MongoDB with role: "user"
- No JWT token returned on signup (login is separate flow)
- Error handling shows specific messages (duplicate email, etc.)

**Database Check:**
- In MongoDB, new user doc created with hashed password (not plaintext)
- Example doc structure:
  ```json
  {
    "_id": ObjectId(...),
    "name": "John Doe",
    "email": "john@example.com",
    "password": "$2a$10$...", // bcrypt hash
    "role": "user",
    "cart": [],
    "wishlist": [],
    "orders": []
  }
  ```

---

### TEST 3: User Login (Assignment Part: Authentication & Authorization)

**What it demonstrates:**
- Authentication flow
- JWT token generation
- LocalStorage persistence

**Click Steps:**
1. On Login page, fill form:
   - Email: `john@example.com`
   - Password: `Password123`
   - **Leave "Sign in as admin" unchecked** (user mode)
2. Click **"Login"** button
3. Page redirects to `/products` automatically
4. Header now shows your name "John Doe" + **"Logout"** button instead of "Sign In"

**Technical Explanation (Viva):**
- Frontend sends POST to `/auth/login` with email and password
- Backend finds user by email (case-insensitive)
- Backend bcrypt compares plaintext password with stored hash
- If match: JWT token generated with: `{ id: userId, role: "user", expiresIn: "7d" }`
- Token stored in localStorage as "token"
- User object stored in localStorage as "user"
- All subsequent API calls automatically include: `Authorization: Bearer <token>`
- Token verified on protected routes (cart, orders, wishlist)

**How to verify token:**
- Open browser DevTools → Application → Local Storage
- See keys: "token" and "user"
- Token is Base64 encoded JWT (3 parts: header.payload.signature)

---

### TEST 4: Products Page with Search (Assignment Part: Product Management)

**What it demonstrates:**
- Backend product listing
- Search functionality with SEO fields
- Add to cart / wishlist flows

**Click Steps:**
1. Click **"Products"** in header navigation
2. See all products in grid layout
3. Type in search box: `ring`
4. Products filter real-time to show only matching items
5. Click **"Add to Cart"** on any product
   - Product added to your cart (visible in context state)
6. Click **"Wishlist"** button on another product
   - Added to wishlist for later

**Technical Explanation (Viva):**
- Backend GET `/products` returns all products with SEO fields:
  ```json
  {
    "_id": "...",
    "name": "Diamond Ring",
    "price": 500,
    "description": "...",
    "category": "Rings",
    "seoTitle": "Diamond Engagement Ring - Luwia",
    "seoDescription": "Premium diamond rings...",
    "keywords": ["diamond", "ring", "engagement"],
    "seoSlug": "diamond-ring",
    "metaRobots": "index,follow",
    "canonicalUrl": "https://luwia.example/products/diamond-ring"
  }
  ```
- Frontend search filters products by matching name/description/keywords
- Products loaded into global ShopContext state
- AddToCart triggers POST `/cart` with productId and quantity
- AddToWishlist triggers POST `/wishlist/:productId`
- Both require valid JWT token

**How SEO fields work:**
- Stored in database but not visible on product card
- Used by admin to optimize search rankings
- Helmet can inject these into page head for individual product pages

---

### TEST 5: Wishlist Page (Assignment Part: USER Management - Wishlist)

**What it demonstrates:**
- Wishlist persistence in database
- Move to cart functionality
- Remove items

**Click Steps:**
1. Click **"Wishlist"** in header navigation
2. See all products you added to wishlist
3. Click **"Move to Cart"** on a wishlist item
   - Item removes from wishlist
   - Item adds to cart
4. Click **"Remove"** on another item
   - Item removes from wishlist

**Technical Explanation (Viva):**
- Wishlist stored as array of product IDs in user document:
  ```json
  "wishlist": [ObjectId(...), ObjectId(...)],
  ```
- GET `/wishlist` returns populated product objects (MongoDB populate)
- POST `/wishlist/:productId` adds product ID if not duplicate
- DELETE `/wishlist/:productId` filters out product ID
- All operations require valid JWT token from localStorage
- React context subscribes to user object, re-renders on change

---

### TEST 6: Cart & Checkout (Assignment Part: Cart working + Checkout Sandbox)

**What it demonstrates:**
- Shopping cart functionality
- Quantity management
- Sandbox payment simulation
- Order creation

**Click Steps:**
1. Click **"Cart"** in header navigation
2. See all items in cart with:
   - Product name
   - Unit price
   - Quantity input field
   - Unit price × quantity subtotal
3. **Modify quantity:**
   - Change quantity to 3
   - TOTAL updates automatically
4. **Remove item:**
   - Click "Remove" button
   - Item disappears, total recalculates
5. **Enter shipping address:**
   - Edit address field (pre-filled with "Sandbox Street, Demo City")
   - Change to: `123 Main St, New York, NY`
6. **Click "Checkout (Sandbox)"**
   - See success message: "Checkout successful in sandbox mode"
   - Cart empties
   - Order created in database

**Technical Explanation (Viva):**
- Cart stored in user document as array of objects:
  ```json
  "cart": [
    {
      "product": ObjectId(...),
      "quantity": 2
    }
  ]
  ```
- GET `/cart` returns populated product details for each item
- PUT `/cart/:productId` updates quantity (minimum 1)
- DELETE `/cart/:productId` removes item
- POST `/checkout` does:
  1. Calculate total: sum of (product.price × quantity)
  2. Create order doc with items, totalAmount, status: "placed", paymentStatus: "sandbox_paid"
  3. Prepend order to user.orders array
  4. Clear user.cart array
  5. Return order confirmation
- All operations validatedby JWT middleware

**Order document structure:**
```json
{
  "_id": ObjectId(...),
  "items": [
    {
      "product": ObjectId(...),
      "quantity": 2,
      "priceAtPurchase": 500
    }
  ],
  "totalAmount": 1000,
  "status": "placed",
  "paymentStatus": "sandbox_paid",
  "shippingAddress": "123 Main St, New York, NY",
  "placedAt": "2026-04-08T10:30:00Z"
}
```

---

### TEST 7: Order Tracking (Assignment Part: USER Management - Order Tracking)

**What it demonstrates:**
- Order history retrieval
- Order status display
- Frontend-backend sync

**Click Steps:**
1. Click **"Orders"** in header navigation
2. See your order from TEST 6:
   - Order ID (last 6 chars)
   - Status badge: "placed"
   - Payment status: "sandbox_paid"
   - Total amount: e.g., "$1000.00"
   - List of items with quantities
3. Note the order details for admin testing later

**Technical Explanation (Viva):**
- GET `/orders/me` requires valid JWT token
- Returns all orders from authenticated user
- Orders populated with product details via MongoDB populate
- Each order shows:
  - Order ID (unique MongoDB ObjectId)
  - Status: "placed", "processing", "shipped", "delivered", "cancelled"
  - Items with product names, quantities, and prices at purchase
  - Total amount
  - Shipping address
  - Date placed
- Frontend renders in a clean card layout with status badges

---

### TEST 8: Admin Signup (Creating Admin Account)

**What it demonstrates:**
- Bootstrap endpoint for initial admin creation
- Role-based system

**Click Steps:**
1. Use **Postman** or **curl** to create admin account:

**Using curl (in Terminal):**
```bash
curl -X POST http://localhost:5000/auth/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d '{
    "key": "make-admin-2026",
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "AdminPass123"
  }'
```

**Expected Response:**
```json
{
  "message": "Admin created",
  "user": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Technical Explanation (Viva):**
- Bootstrap endpoint only accessible with correct key: `make-admin-2026`
- Prevents unauthorized admin creation
- Creates user with role: "admin"
- Used only once to seed first admin
- In production, change key via environment variable
- Security: key should only be known to deployment team

---

### TEST 9: Admin Login (Assignment Part: Admin Sign In - Authentication & Authorization)

**What it demonstrates:**
- Admin-specific authentication
- Role-based access control
- Protected dashboard access

**Click Steps:**
1. Click **"Sign In"** (or Logout if currently logged in as John)
2. On Login page, fill form:
   - Email: `admin@example.com`
   - Password: `AdminPass123`
   - **Check "Sign in as admin"** (very important!)
3. Click **"Login"** button
4. Page redirects to `/dashboard`
5. Header now shows "Admin User" + "Logout"
6. Dashboard page displays with admin controls

**Technical Explanation (Viva):**
- When "Sign in as admin" checked: frontend sends to `/auth/admin/login` instead of `/auth/login`
- Backend validates:
  1. User exists
  2. Password matches
  3. **User role === "admin"** (403 Forbidden if not admin)
- JWT token includes role: "admin"
- Frontend AdminRoute wrapper checks:
  ```javascript
  if (user.role !== "admin") return <Navigate to="/" replace />
  ```
- Non-admin users cannot access `/dashboard` (redirected to home)
- Authorization implemented at frontend and backend

---

### TEST 10: Admin Dashboard - Product Management (Assignment Part: Admin should manage products CRUD + SEO)

**What it demonstrates:**
- Product creation with SEO fields
- Product editing
- Product deletion
- Real-time frontend sync

#### Subtest 10a: Create Product with SEO

**Click Steps:**
1. On Dashboard, locate **"Create Product + SEO"** form (left side)
2. Fill all fields:
   |Field|Value|
   |---|---|
   |Name|Gold Necklace Deluxe|
   |Price|299.99|
   |Category|Necklaces|
   |Image URL|(leave empty)|
   |Description|Beautiful 18K gold necklace with intricate patterns|
   |**SEO Title**|Luxury Gold Necklace - 18K Fine Jewellery\|Luwia|
   |**SEO Description**|Handcrafted 18K gold necklace for special occasions. Premium jewelry with lifetime guarantee.|
   |**Keywords**|gold necklace, 18k gold, luxury jewelry, handcrafted|
   |**SEO Slug**|gold-necklace-deluxe|
   |**Meta Robots**|index,follow|
   |**Canonical URL**|(leave empty)|

3. Click **"Create Product"** button
4. See success message: "Product created."
5. Product appears in **"Manage Products"** section below

**Technical Explanation (Viva):**
- Frontend POST `/products` with all fields (requires admin JWT)
- Backend validates authorization (adminOnly middleware)
- Keywords split by comma into array
- Product stored with complete SEO metadata:
  ```json
  {
    "name": "Gold Necklace Deluxe",
    "seoTitle": "Luxury Gold Necklace - 18K Fine Jewellery|Luwia",
    "seoDescription": "Handcrafted 18K gold...",
    "keywords": ["gold necklace", "18k gold", "luxury jewelry", "handcrafted"],
    "seoSlug": "gold-necklace-deluxe",
    "metaRobots": "index,follow"
  }
  ```
- ShopContext re-fetches products
- New product appears in Products page and home
- SEO fields used for search engine optimization

**How SEO fields improve rankings (Viva explanation):**
- **SEO Title**: Displayed in search results; should be <60 chars and include keywords
- **SEO Description**: Shown under title in results; ~160 chars; attracts clicks
- **Keywords**: Used by search engines for relevance matching
- **SEO Slug**: URL-friendly name for better indexing
- **Meta Robots**: Instructs search engines (index = appear in results, follow = crawl links)
- **Canonical URL**: Prevents duplicate content issues
- Together these form "on-page SEO" which improves organic search visibility

#### Subtest 10b: Edit Product with SEO

**Click Steps:**
1. In "Manage Products" section, find "Gold Necklace Deluxe"
2. Click **"Edit"** button
3. Form repopulates with existing values
4. Change **SEO Description** to:
   ```
   Stunning 18K gold necklace perfect for weddings and celebrations. Direct from artisan to you.
   ```
5. Change **Keywords** to:
   ```
   gold necklace, wedding jewelry, 18k, luxury, handmade
   ```
6. Click **"Update Product"** button
7. See success message: "Product updated."

**Technical Explanation (Viva):**
- Frontend PUT `/products/:id` with updated fields (requires admin JWT)
- Backend validates authorization
- MongoDB findByIdAndUpdate with new: true option
- Only modified fields updated (partial update)
- ShopContext refetches all products
- Changes visible in Products page and home immediately

#### Subtest 10c: Delete Product

**Click Steps:**
1. In "Manage Products" section, find any product
2. Click **"Delete"** button
3. Product disappears from list
4. Confirm by navigating to Products page
5. Deleted product no longer appears

**Technical Explanation (Viva):**
- Frontend DELETE `/products/:id` (requires admin JWT)
- Backend finds and removes product document
- ShopContext refetches
- All references removed from client state
- Important: Cascade delete not implemented (orders still reference deleted product)

---

### TEST 11: Admin Dashboard - User Management (Assignment Part: USER Management from Admin)

**What it demonstrates:**
- Admin viewing all users
- Changing user roles
- Authorization control

**Click Steps:**
1. On Dashboard, locate **"User Management"** section (right side)
2. See all registered users:
   - John Doe (john@example.com) - currently role: "user"
   - Admin User (admin@example.com) - currently role: "admin"
3. Click dropdown on John Doe user, change from "user" to "admin"
4. See confirmation
5. John Doe now has admin privileges (can access dashboard)

**Technical Explanation (Viva):**
- GET `/users` returns all users (admin-only endpoint)
- Returns: name, email, role fields (no passwords)
- PUT `/users/:id/role` updates user role
- Validates role is "user" or "admin" before saving
- Used for granting/revoking admin access
- Useful for:
  - Promoting trusted users to admin
  - Demoting compromised admin accounts
  - Controlling platform access levels

---

### TEST 12: Admin Dashboard - Order Tracking (Assignment Part: Admin order status updates)

**What it demonstrates:**
- Admin viewing all orders from all users
- Updating order shipment status
- Real-time customer notification (in production)

**Click Steps:**
1. On Dashboard, locate **"Order Tracking Management"** section (bottom)
2. See the order you created as "John Doe" in TEST 6
3. Current status: "placed"
4. Click dropdown on that order
5. Change status to **"processing"**
6. Verify it updates immediately
7. Change again to **"shipped"**
8. Change final to **"delivered"**

**Technical Explanation (Viva):**
- GET `/orders` (admin-only) returns all users with their orders
- Shows: username, email, order ID, amount, current status
- PUT `/orders/:userId/:orderId/status` updates status
- Validates status is one of: "placed", "processing", "shipped", "delivered", "cancelled"
- Status updates reflected in order document:
  ```json
  "orders": [
    {
      "_id": ObjectId(...),
      "status": "shipped", // UPDATED
      "totalAmount": 1000,
      "paymentStatus": "sandbox_paid",
      "items": [...],
      "placedAt": "2026-04-08T..."
    }
  ]
  ```
- In production: status changes trigger customer emails/notifications
- Admin can cancel orders by setting status: "cancelled"

---

### TEST 13: Helmet SEO Headers (Assignment Part: On-page SEO using Helmet)

**What it demonstrates:**
- HTTP security headers
- Metadata injection
- Browser developer tools inspection

**Click Steps:**
1. On any page, right-click → **"Inspect"** or press **F12**
2. Go to **"Elements"** or **"Inspector"** tab
3. Expand `<head>` section
4. Scroll through and find:
   - `<title>` tag (e.g., "All Products - Luwia")
   - `<meta name="description">`
   - `<meta name="keywords">`
5. Go to **"Network"** tab
6. Refresh page (F5)
7. Click home page request
8. View **"Response Headers"**
9. Search for Helmet headers:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY` (prevents clickjacking)
   - `X-XSS-Protection: 0` (modern browser protection)
   - `Strict-Transport-Security` (HTTPS enforcement)

**Technical Explanation (Viva):**
- **Frontend Helmet**: Injects meta tags into HTML head
  ```javascript
  <Helmet>
    <title>All Products - Luwia</title>
    <meta name="description" content="Explore all jewellery products" />
    <meta name="keywords" content="jewellery, gold, rings" />
  </Helmet>
  ```
- **Backend Helmet Middleware**: Adds security headers automatically
  ```javascript
  app.use(helmet()); // Adds all default security headers
  ```
- Headers prevent:
  - MIME-type sniffing attacks (can load JS as CSS)
  - Clickjacking (embedding site in iframe on malicious pages)
  - Cross-site scripting (XSS) injection
  - Mixed content (HTTP on HTTPS)
- SEO benefit: meta tags tell search engines page content and keywords
- Security benefit: protects users from common web vulnerabilities

---

### TEST 14: End-to-End Flow (Assignment Integration Test)

**What it demonstrates:**
- Complete user journey
- Multi-feature integration
- Data persistence

**Click Steps:**
1. **Logout** as Admin
2. **Click "Home"** navigation
3. **Signup** new user:
   - Name: Jane Smith
   - Email: jane@example.com
   - Password: Jane123!
4. **Login** as Jane
5. **Navigate to Products**
6. **Search** for "necklace"
7. **Add "Gold Necklace Deluxe"** to cart
8. **Add another product** to wishlist
9. **View Wishlist**, move item to cart
10. **View Cart**, update quantity to 2
11. **Checkout** with address "456 Oak Ave, LA, CA"
12. **View Orders**, confirm order appears with correct total
13. **Logout**
14. **Login as Admin**
15. **Go to Dashboard**
16. **View all orders**, see Jane's order in "Order Tracking Management"
17. **Change Jane's order status** from "placed" → "shipped"
18. **Logout**
19. **Login as Jane**
20. **View Orders**, confirm status changed to "shipped"

**What this demonstrates (Viva):**
- User registration and authentication work
- Password hashing and JWT tokens secure
- Shopping cart persists across sessions (stored in database)
- Wishlist functionality integrates with cart
- Search filters work correctly
- Checkout creates order and clears cart
- Admin can modify order status
- Changes reflect in real-time for users
- Role-based access control works (Jane can't access dashboard)
- All data persisted in MongoDB

---

## Part 3: Key Technical Details for Viva Questions

### Q: How does authentication work?
**Answer:**
1. User enters email and password on login form
2. Frontend sends POST to `/auth/login` with credentials
3. Backend finds user by email, compares plaintext password with bcrypt hash using bcrypt.compare()
4. If match: Backend generates JWT token with user ID and role
5. Frontend stores token in localStorage
6. All subsequent requests attach token in `Authorization: Bearer <token>` header
7. API interceptor automatically adds token to every request
8. Backend middleware verifies token signature and expiration before allowing access
9. Protected routes check token and user role (admin-only endpoints)

### Q: How does password security work?
**Answer:**
- Passwords never stored as plaintext
- During signup: password hashed with bcryptjs (salt rounds: 10)
- Hash is one-way function (cannot unhash to plaintext)
- During login: plaintext password compared to hash using bcrypt.compare()
- All hashed passwords in MongoDB look like: `$2a$10$...` (bcrypt format)
- Even if database leaked, passwords are unrecoverable
- No plain passwords transmitted (HTTPS in production)

### Q: How does SEO work on the platform?
**Answer:**
1. **On-page SEO fields** stored in product database (seoTitle, seoDescription, keywords, etc.)
2. **Frontend Helmet** injects these into HTML `<head>` as meta tags
3. **Backend Helmet** adds security headers (X-Frame-Options, X-XSS-Protection, etc.)
4. **Meta tags** visible to search engine crawlers (Google, Bing, etc.)
5. **Search engines** read:
   - `<title>` to display in results
   - `description` as snippet below title
   - `keywords` for relevance
6. **Canonical URL** prevents duplicate content penalties
7. **Meta Robots** tells crawlers what to do (index = include in results, follow = crawl links)
8. **SEO Slug** makes URLs readable for humans and crawlers
9. **Result**: Better search engine visibility and organic traffic

### Q: What is CRUD and how is it implemented?
**Answer:**
- CRUD = Create, Read, Update, Delete
- **Create**: POST `/products` (admin) → new product saved to MongoDB
- **Read**: GET `/products` (public) → all products fetched and displayed
- **Update**: PUT `/products/:id` (admin) → existing product modified
- **Delete**: DELETE `/products/:id` (admin) → product removed from database
- All operations require admin JWT authentication
- Frontend admin dashboard provides UI for each operation
- Backend validates authorization before each operation

### Q: How does the cart system work?
**Answer:**
1. Cart stored in MongoDB user document: `cart: [{ product: ObjectId, quantity: Number }]`
2. **Add to Cart**: POST `/cart` with productId, quantity added/incremented
3. **View Cart**: GET `/cart` returns populated products with current quantities
4. **Update Quantity**: PUT `/cart/:productId` changes quantity (min: 1)
5. **Remove Item**: DELETE `/cart/:productId` removes from cart array
6. **Calculations**: Frontend multiplies product.price × quantity for subtotals
7. **Persistence**: Cart survives page refresh (stored in database, not localStorage)
8. **Checkout**: POST `/checkout` converts cart items into order, clears cart

### Q: How does checkout work in sandbox mode?
**Answer:**
1. User logs in, adds items to cart
2. User enters shipping address
3. User clicks "Checkout (Sandbox)"
4. Frontend POST `/checkout` with shippingAddress
5. Backend:
   - Fetches all cart items with current prices
   - Creates items array with: product ID, quantity, priceAtPurchase
   - Calculates totalAmount: sum of (price × quantity)
   - Creates order object with status: "placed", paymentStatus: "sandbox_paid"
   - Prepends order to user.orders array
   - Clears user.cart to empty array
6. Returns order confirmation to frontend
7. User sees success message and can view order in Orders page
8. **Sandbox mode**: No real payment processing (in production would integrate Stripe/PayPal)
9. **paymentStatus: "sandbox_paid"** indicates fake payment (for testing only)

### Q: How does role-based authorization work?
**Answer:**
1. Users have role: "user" or "admin" in database
2. JWT token includes role field during login
3. Frontend AdminRoute wrapper checks: `if (user.role !== "admin") return <Navigate to="/" />`
4. Backend middleware checks before sensitive routes:
   ```javascript
   const adminOnly = (req, res, next) => {
     if (req.user.role !== "admin") return res.status(403).json({ ... })
     next()
   }
   ```
5. Admin-only endpoints:
   - POST `/products` (create)
   - PUT `/products/:id` (edit)
   - DELETE `/products/:id` (delete)
   - GET `/users` (list all users)
   - PUT `/users/:id/role` (change roles)
   - GET `/orders` (view all orders)
   - PUT `/orders/:userId/:orderId/status` (update status)
6. Non-admin users attempting access get 403 Forbidden error
7. Frontend and backend validation ensures security (defense in depth)

### Q: How does the product search work?
**Answer:**
1. GET `/products?search=keyword` sends search query to backend
2. Backend MongoDB query uses `$regex` for case-insensitive matching:
   ```javascript
   {
     $or: [
       { name: { $regex: "ring", $options: "i" } },
       { description: { $regex: "ring", $options: "i" } },
       { keywords: { $elemMatch: { $regex: "ring", $options: "i" } } }
     ]
   }
   ```
3. Matches product name OR description OR keywords
4. Returns all matching products
5. Frontend also does client-side filtering using array.filter()
6. **Benefit**: Searches across SEO fields (keywords, description, title)
7. **Scalability**: Database query more efficient for large product catalogs

### Q: How is the shopping cart state synchronized?
**Answer:**
1. **Backend**: Cart stored in user.cart array in MongoDB
2. **Frontend**: ShopContext maintains cart state in React
3. **Synchronization**:
   - On login: refreshProfile() fetches user data including cart
   - On add/update/remove: API returns updated cart immediately
   - ShopContext setState with new cart array
   - Components subscribed to ShopContext re-render
4. **Persistence**: Every change saved to database immediately
5. **Offline behavior**: Cart accessible on browser until logout
6. **Multi-device**: Cart syncs when user logs in on different device
7. **Real-time**: No polling needed (each action updates server and client)

---

## Part 4: Running Tests Checklist

### Pre-Test Checklist
- [ ] MongoDB running on localhost:27017
- [ ] Backend server running (port 5000)
- [ ] Frontend dev server running (port 5173)
- [ ] Browser open to http://localhost:5173
- [ ] Two terminal windows open

### Test Execution Checklist
- [ ] TEST 1: Home page loads and displays correctly
- [ ] TEST 2: User signup creates account successfully
- [ ] TEST 3: User login redirects to products page
- [ ] TEST 4: Product search filters correctly
- [ ] TEST 5: Wishlist persists and functions
- [ ] TEST 6: Cart and checkout create orders
- [ ] TEST 7: Order tracking displays correctly
- [ ] TEST 8: Admin bootstrap creates admin account
- [ ] TEST 9: Admin login with role check works
- [ ] TEST 10: Product CRUD with SEO fields works
- [ ] TEST 11: User role management works
- [ ] TEST 12: Order status updates work
- [ ] TEST 13: Helmet headers present in requests
- [ ] TEST 14: End-to-end flow works seamlessly

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Cannot connect to MongoDB" | Ensure MongoDB is running. Default: `mongod` in terminal |
| "CORS error in console" | Backend CORS middleware enabled, should not occur |
| "Token undefined in requests" | Check localStorage has "token" key (DevTools → Application) |
| "404 on product API" | Ensure backend server running on http://localhost:5000 |
| "Admin dashboard blank" | Login as admin (not regular user) and have admin role |
| "Helmet headers not showing" | Inspect Network tab → Response Headers (not Request Headers) |
| "Search not working" | Ensure products exist in database, check browser console |
| "Can't checkout with empty cart" | Add items to cart first, then go to /cart page |

---

## Part 5: Architecture Diagram (Viva Explanation)

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                     │
├─────────────────────────────────────────────────────────────────┤
│  Pages: Home, Products, Cart, Login, Signup, Wishlist, Orders   │
│  Components: Header, Navbar, Footer, ProductRow, Categories     │
│  State: AuthContext (user, login, logout), ShopContext (cart)   │
│  Storage: LocalStorage (token, user), MongoDB (persistent)      │
│  Styling: Tailwind CSS + Global design system                   │
│  SEO: React Helmet (meta tags injection)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / REST API / JWT Bearer Token
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                     │
├─────────────────────────────────────────────────────────────────┤
│  Routes:                                                         │
│   - /auth/signup, /auth/login, /auth/admin/login (Auth)         │
│   - /products (CRUD - admin only for create/update/delete)      │
│   - /cart (add, view, update, remove items)                      │
│   - /wishlist (add, view, remove items)                         │
│   - /checkout (place order, clear cart)                         │
│   - /orders (view user orders, admin view all)                  │
│   - /users (admin: view all, change roles)                      │
│  Middleware:                                                     │
│   - helmet() for security headers                               │
│   - cors() for cross-origin requests                            │
│   - auth() to verify JWT tokens                                 │
│   - adminOnly() to restrict to admin users                      │
│  Authentication: JWT tokens (7-day expiration)                  │
│  Password Security: bcryptjs hashing (10 salt rounds)           │
└────────────────────────────┬────────────────────────────────────┘
                             │ Mongoose / MongoDB Driver
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DATABASE (MongoDB)                              │
├─────────────────────────────────────────────────────────────────┤
│  Collections:                                                    │
│   - users: { name, email, password (hashed), role, cart,        │
│      wishlist, orders }                                          │
│   - products: { name, price, category, description, image,      │
│      seoTitle, seoDescription, keywords, seoSlug,               │
│      metaRobots, canonicalUrl }                                 │
│  Relationships:                                                  │
│   - cart.product → products._id (reference)                     │
│   - wishlist[].* → products._id (reference array)               │
│   - orders.items[].product → products._id (reference)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary: What Each Assignment Requirement Covers

| Requirement | Component | How to Test |
|---|---|---|
| Signup | Login.jsx → /auth/signup | TEST 2: Create account and verify in MongoDB |
| Authentication | AuthContext + JWT | TEST 3: Login and check localStorage "token" |
| Authorization | AdminRoute + adminOnly middleware | TEST 9: Login as non-admin and try /dashboard |
| Product CRUD | dashboard.jsx | TEST 10: Create, edit, delete products |
| SEO Fields | Product schema + Helmet | TEST 10: Fill SEO fields, TEST 13: Inspect meta tags |
| Cart | Cart.jsx + ShopContext | TEST 6: Add/remove items, change qty |
| Checkout | Cart.jsx + /checkout endpoint | TEST 6: Click "Checkout (Sandbox)" |
| Wishlist | Wishlist.jsx + /wishlist endpoint | TEST 5: Add/remove from wishlist |
| Orders | Orders.jsx + /orders endpoint | TEST 7: View user orders, TEST 12: Admin updates status |
| User Management | Dashboard.jsx + /users endpoint | TEST 11: Change user roles |
| Styling | index.css + components | TEST 1 & all: Consistent emerald/gold theme |
| Dashboard | dashboard.jsx (full admin panel) | TEST 10-12: Products, users, orders management |

---

END OF TESTING GUIDE
