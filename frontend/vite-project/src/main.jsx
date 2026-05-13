import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "./index.css";
import App from './App.jsx'
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./store/AuthContext";
import { ShopProvider } from "./store/ShopContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <ShopProvider>
          <App />
        </ShopProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
