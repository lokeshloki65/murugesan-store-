import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAt2yWD-QvGLQsulAz7uwLyQ9e1v-jY5xM",
  authDomain: "murugesan-df96e.firebaseapp.com",
  projectId: "murugesan-df96e",
  storageBucket: "murugesan-df96e.firebasestorage.app",
  messagingSenderId: "63638703732",
  appId: "1:63638703732:web:4dadd6421d8b22c9a30b21",
  measurementId: "G-GNT9RH2901",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Sample grocery products
const sampleProducts = [
  // Fruits & Vegetables
  {
    name: "Bananas (1kg)",
    price: 45,
    barcode: "8901030875021",
    category: "Fruits",
    description: "Fresh yellow bananas",
    stock: 50,
  },
  {
    name: "Apples (1kg)",
    price: 120,
    barcode: "8901030875038",
    category: "Fruits",
    description: "Red delicious apples",
    stock: 30,
  },
  {
    name: "Onions (1kg)",
    price: 35,
    barcode: "8901030875045",
    category: "Vegetables",
    description: "Fresh red onions",
    stock: 40,
  },
  {
    name: "Tomatoes (1kg)",
    price: 60,
    barcode: "8901030875052",
    category: "Vegetables",
    description: "Fresh red tomatoes",
    stock: 25,
  },
  {
    name: "Potatoes (1kg)",
    price: 25,
    barcode: "8901030875069",
    category: "Vegetables",
    description: "Fresh potatoes",
    stock: 60,
  },
  {
    name: "Carrots (500g)",
    price: 30,
    barcode: "8901030875076",
    category: "Vegetables",
    description: "Fresh orange carrots",
    stock: 35,
  },

  // Dairy Products
  {
    name: "Milk (1L)",
    price: 55,
    barcode: "8901030875083",
    category: "Dairy",
    description: "Fresh full cream milk",
    stock: 20,
  },
  {
    name: "Yogurt (400g)",
    price: 45,
    barcode: "8901030875090",
    category: "Dairy",
    description: "Natural yogurt",
    stock: 15,
  },
  {
    name: "Cheese Slices (200g)",
    price: 85,
    barcode: "8901030875106",
    category: "Dairy",
    description: "Processed cheese slices",
    stock: 12,
  },
  {
    name: "Butter (100g)",
    price: 65,
    barcode: "8901030875113",
    category: "Dairy",
    description: "Fresh butter",
    stock: 18,
  },

  // Beverages
  {
    name: "Coca Cola (500ml)",
    price: 40,
    barcode: "8901030875120",
    category: "Beverages",
    description: "Refreshing cola drink",
    stock: 50,
  },
  {
    name: "Pepsi (500ml)",
    price: 40,
    barcode: "8901030875137",
    category: "Beverages",
    description: "Pepsi cola drink",
    stock: 45,
  },
  {
    name: "Orange Juice (1L)",
    price: 80,
    barcode: "8901030875144",
    category: "Beverages",
    description: "Fresh orange juice",
    stock: 20,
  },
  {
    name: "Water Bottle (1L)",
    price: 20,
    barcode: "8901030875151",
    category: "Beverages",
    description: "Mineral water",
    stock: 100,
  },

  // Snacks & Confectionery
  {
    name: "Lays Chips (50g)",
    price: 20,
    barcode: "8901030875168",
    category: "Snacks",
    description: "Potato chips",
    stock: 40,
  },
  {
    name: "Biscuits (200g)",
    price: 35,
    barcode: "8901030875175",
    category: "Snacks",
    description: "Cream biscuits",
    stock: 30,
  },
  {
    name: "Chocolate Bar (50g)",
    price: 45,
    barcode: "8901030875182",
    category: "Confectionery",
    description: "Milk chocolate",
    stock: 25,
  },
  {
    name: "Candy (100g)",
    price: 25,
    barcode: "8901030875199",
    category: "Confectionery",
    description: "Mixed fruit candy",
    stock: 35,
  },

  // Grains & Pulses
  {
    name: "Rice (1kg)",
    price: 65,
    barcode: "8901030875205",
    category: "Grains",
    description: "Basmati rice",
    stock: 30,
  },
  {
    name: "Wheat Flour (1kg)",
    price: 45,
    barcode: "8901030875212",
    category: "Grains",
    description: "Whole wheat flour",
    stock: 25,
  },
  {
    name: "Toor Dal (500g)",
    price: 85,
    barcode: "8901030875229",
    category: "Pulses",
    description: "Yellow lentils",
    stock: 20,
  },
  {
    name: "Chana Dal (500g)",
    price: 75,
    barcode: "8901030875236",
    category: "Pulses",
    description: "Split chickpeas",
    stock: 18,
  },

  // Spices & Condiments
  {
    name: "Salt (1kg)",
    price: 20,
    barcode: "8901030875243",
    category: "Spices",
    description: "Iodized salt",
    stock: 50,
  },
  {
    name: "Sugar (1kg)",
    price: 55,
    barcode: "8901030875250",
    category: "Spices",
    description: "White sugar",
    stock: 40,
  },
  {
    name: "Turmeric Powder (100g)",
    price: 35,
    barcode: "8901030875267",
    category: "Spices",
    description: "Pure turmeric powder",
    stock: 25,
  },
  {
    name: "Red Chili Powder (100g)",
    price: 40,
    barcode: "8901030875274",
    category: "Spices",
    description: "Hot chili powder",
    stock: 22,
  },

  // Personal Care
  {
    name: "Soap (100g)",
    price: 25,
    barcode: "8901030875281",
    category: "Personal Care",
    description: "Bathing soap",
    stock: 45,
  },
  {
    name: "Shampoo (200ml)",
    price: 85,
    barcode: "8901030875298",
    category: "Personal Care",
    description: "Hair shampoo",
    stock: 20,
  },
  {
    name: "Toothpaste (100g)",
    price: 55,
    barcode: "8901030875304",
    category: "Personal Care",
    description: "Dental care",
    stock: 30,
  },

  // Household Items
  {
    name: "Detergent (500g)",
    price: 95,
    barcode: "8901030875311",
    category: "Household",
    description: "Washing powder",
    stock: 15,
  },
  {
    name: "Dish Soap (500ml)",
    price: 65,
    barcode: "8901030875328",
    category: "Household",
    description: "Dishwashing liquid",
    stock: 18,
  },
]

async function seedProducts() {
  try {
    console.log("[v0] Starting to seed products...")

    // Check if products already exist
    const productsRef = collection(db, "products")
    const existingProducts = await getDocs(productsRef)

    if (existingProducts.size > 0) {
      console.log("[v0] Products already exist in database. Skipping seed.")
      return
    }

    // Add each product to Firestore
    for (const product of sampleProducts) {
      const productData = {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(productsRef, productData)
      console.log(`[v0] Added product: ${product.name}`)
    }

    console.log(`[v0] Successfully seeded ${sampleProducts.length} products!`)
  } catch (error) {
    console.error("[v0] Error seeding products:", error)
  }
}

// Run the seeding function
seedProducts()
