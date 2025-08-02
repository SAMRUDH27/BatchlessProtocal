import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize MetaMask detection
if (typeof window !== 'undefined') {
  // Wait for MetaMask to be fully loaded
  window.addEventListener('load', () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask detected!')
    } else {
      console.log('MetaMask not detected. Please install MetaMask.')
    }
  })
}

createRoot(document.getElementById("root")!).render(<App />);