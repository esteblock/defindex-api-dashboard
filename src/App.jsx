import { useState } from 'react'
import './App.css'
import VaultDashboard from './components/VaultDashboard'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>DeFindex Vault Dashboard</h1>
        <p>Explore Vault Information using the DeFindex API</p>
      </header>
      <VaultDashboard />
    </div>
  )
}

export default App
