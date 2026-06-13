const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);
console.log("🌐 Using DNS resolvers: 1.1.1.1, 8.8.8.8");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const projectRoutes = require("./routes/projectRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");

const app = express();

// Request Logger (Black Box)
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// 0. Trust Proxy (Essential for OAuth behind Vite proxy)
app.set("trust proxy", 1);

// 1. Basic Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Session & Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "electricmart_secret_2024",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// 3. API Routes
app.get("/", (req, res) => res.send("ElectricMart API is Online"));
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

// ─── Direct Social Auth Routes ───────────────────────────────────────────────
app.get("/api/auth/login_social", (req, res, next) => {
  console.log("[DEBUG] DIRECT Social Login Initiated");
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next,
  );
});

app.get(
  "/api/auth/callback_social",
  (req, res, next) => {
    console.log("[DEBUG] DIRECT Social Callback Received!");
    passport.authenticate("google", {
      session: false,
      failureRedirect: "http://localhost:5173/login?error=google_failed",
    })(req, res, next);
  },
  (req, res) => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.redirect(
      `http://localhost:5173/auth/success?token=${token}&user=${encodeURIComponent(
        JSON.stringify({
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar,
          role: req.user.role,
        }),
      )}`,
    );
  },
);

app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/newsletter", newsletterRoutes);

// 4. Database & Startup
const PORT = Number(process.env.PORT) || 5005;
const MONGO_URI = (process.env.MONGO_URI || "").trim();

if (!MONGO_URI) {
  console.error(
    "❌ Missing MONGO_URI. Add it to server/.env (MONGO_URI=...). Server not started.",
  );
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err?.message || err);
  });

// Only listen locally, Vercel handles the serverless execution
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
