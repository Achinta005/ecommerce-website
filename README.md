# 🛍️ Online Ecommerce Platform

An **e-commerce product catalog** built with **Next.js**, demonstrating multiple rendering strategies — **SSG**, **ISR**, **SSR**, and **CSR** — along with a **MongoDB database** for product management.  
Users can browse products, view details, and administrators can manage inventory.

---

## 🚀 Features

- Browse products on the **Home Page** (Static Generation)
- View product details with **Incremental Static Regeneration (ISR)**
- Real-time **Inventory Dashboard** using **Server-Side Rendering (SSR)**
- Fully interactive **Admin Panel** using **Client-Side Rendering (CSR)**
- MongoDB integration with Mongoose for product management
- Auto-updating `lastUpdated` timestamps for product modifications

---

## ⚙️ Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** MongoDB (via Mongoose)
- **Language:** TypeScript / JavaScript (ESNext)
- **Styling:** Tailwind CSS or any preferred UI library
- **Icons:** Lucide React

---

## 🧩 Project Structure

```
/app
 ├── page.tsx                → Home Page (SSG)
 ├── products/[slug]/page.tsx → Product Detail Page (ISR)
 ├── dashboard/page.tsx      → Inventory Dashboard (SSR)
 ├── admin/page.tsx          → Admin Panel (CSR)
 /lib
 ├── dbConnect.ts            → MongoDB connection
 /models
 ├── Product.js              → Mongoose schema with auto-updated lastUpdated field
```

---

## 🧠 Rendering Strategies Used

| Page | Route | Rendering Strategy | Reason |
|------|--------|--------------------|---------|
| **Home Page** | `/` | **SSG (Static Site Generation)** | Pre-generates product listings at build time for faster performance and caching. |
| **Product Detail** | `/products/[slug]` | **ISR (Incremental Static Regeneration)** | Combines static speed with periodic revalidation (e.g., every 60 seconds) for semi-dynamic data like price or stock. |
| **Inventory Dashboard** | `/dashboard` | **SSR (Server-Side Rendering)** | Fetches live inventory on every request, ensuring always up-to-date statistics. |
| **Admin Panel** | `/admin` | **CSR (Client-Side Rendering)** | Fetches and updates data dynamically from the API, supporting interactive form submissions. |

---

## 🗄️ Database Setup

### 1. Install MongoDB (Local or Atlas)
You can either:
- Use **MongoDB Atlas** (recommended for cloud access), or  
- Run MongoDB locally.

### 2. Create a `.env.local` file in your project root:
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerceDB
```

### 3. Connect to MongoDB
Your `lib/dbConnect.js` should look like:
```js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");

let cached = global.mongoose || { conn: null, promise: null };

export default async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

---

## 🧰 Installation & Running

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/product-catalog.git
cd product-catalog
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file and add your MongoDB connection string as shown above.

### 4. Run the development server
```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🧾 Product Schema Overview

```js
const ProductSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, required: true },
  inventory: { type: Number, required: true },
  images: { type: [String], default: [] },
  lastUpdated: { type: Date, default: Date.now },
});
```

Includes a middleware to **auto-update `lastUpdated`** on every modification.

---

## 🧑‍💻 Admin Functionality

The `/admin` page allows:
- Adding new products
- Editing or deleting existing products
- Updating stock and details
- All operations handled through API routes (client-side fetch)

---

## 📈 Dashboard Functionality

The `/dashboard` route shows:
- Total products
- Low-stock products
- Real-time inventory data fetched directly from MongoDB using SSR

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

## 🧹 Optional Commands

```bash
# Lint code
npm run lint

# Format with Prettier
npm run format
```

