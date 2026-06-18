import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAkVdOvLPhmtt4A8El33V0-S_Dg8EXIelE",
  authDomain: "sizzle-99eb5.firebaseapp.com",
  projectId: "sizzle-99eb5",
  storageBucket: "sizzle-99eb5.firebasestorage.app",
  messagingSenderId: "930303196976",
  appId: "1:930303196976:web:2b9fcb5dda669080ae52f5",
  measurementId: "G-5XQX7E02RN"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
