// Firebase configuration and initialization
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

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

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)

// For development, you can use emulators
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Uncomment these lines if you want to use Firebase emulators
  // connectFirestoreEmulator(db, 'localhost', 8080)
  // connectAuthEmulator(auth, 'http://localhost:9099')
}

export default app
