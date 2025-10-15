🛍️ Murugesan Store - Point of Sale (POS) System
A modern, fast, and intuitive Point of Sale (POS) system designed to streamline retail operations. Built with Next.js and Firebase, this application provides a complete solution for inventory management, sales processing, and business analytics, all within a clean and user-friendly interface.

✨ Key Features
This system offers a comprehensive suite of tools for efficient retail management.

⚡ Fast & Intuitive POS Interface:

Barcode Scanning: Quickly add products to the cart using a barcode scanner.

Dynamic Shopping Cart: Easily manage cart items, update quantities, and view the total in real-time.

Secure Checkout: A seamless checkout process with multiple payment options and automatic receipt generation.

📦 Robust Product & Inventory Management:

Full CRUD Operations: Easily add, view, update, and delete products from your inventory.

Enhanced Product Creation: A guided workflow to add new products, including details like category, stock, and pricing.

Bulk Seeding: A utility script to quickly populate the database with initial product data.

📊 Powerful Analytics & Reporting:

Analytics Dashboard: A comprehensive dashboard to visualize key metrics like total revenue, sales volume, and top-selling products.

Purchase History: Track and review all past transactions with detailed information.

PDF Receipts: Automatically generate and print beautiful, customized PDF receipts for every transaction.

🔐 Secure & Modern Architecture:

Authentication: Secure login system powered by Firebase Authentication.

Protected Routes: Role-based access control to secure sensitive admin and user routes.

UI Components: Built with the sleek and customizable shadcn/ui component library.

🛠️ Tech Stack
Area	Technology / Library
Framework	Next.js, React.js
Language	TypeScript
Backend	Google Firebase (Firestore, Authentication, Storage)
Styling	Tailwind CSS
UI	shadcn/ui, Radix UI, Lucide React
State	React Context API, Custom Hooks
Forms	React Hook Form, Zod
PDF	@react-pdf/renderer

Export to Sheets
🚀 Getting Started
To get a local copy up and running, follow these steps.

Prerequisites
Node.js (v18 or later)

pnpm (or npm/yarn)

A Firebase project with Firestore and Authentication enabled.

Installation & Setup
Clone the Repository:

Bash

git clone https://github.com/your-username/murugesan-store.git
cd murugesan-store
Install Dependencies:

Bash

pnpm install
Configure Environment Variables:

Create a .env.local file in the root directory.

Add your Firebase project configuration keys to this file. You can get these from your Firebase project settings.

Code snippet

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
Run the Development Server:

Bash

pnpm dev
Open http://localhost:3000 with your browser to see the result.

(Optional) Seed the Database:

To populate your Firestore with initial product data, run the seed script:

Bash

pnpm seed
