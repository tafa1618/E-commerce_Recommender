import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'

// Pages
import DashboardHome from './pages/DashboardHome'
import AnalyseProduitPage from './pages/AnalyseProduitPage'
import VeilleConcurrentielle from './pages/VeilleConcurrentielle'
import Alibaba from './pages/Alibaba'
import CreerBoutique from './pages/CreerBoutique'
import Marketing from './pages/Marketing'
import JournalVente from './pages/JournalVente'
import GoogleTrends from './pages/GoogleTrends'
import AgentsDashboard from './pages/AgentsDashboard'

// Styles
import './App.css'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/analyse" element={<AnalyseProduitPage />} />
          <Route path="/agents" element={<AgentsDashboard />} />
          <Route path="/veille" element={<VeilleConcurrentielle />} />
          <Route path="/alibaba" element={<Alibaba />} />
          <Route path="/boutique" element={<CreerBoutique />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/journal-vente" element={<JournalVente />} />
          <Route path="/trends" element={<GoogleTrends />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App


