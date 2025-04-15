import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import SpotTrading from './pages/SpotTrading';
import Footer from './components/common/Footer';
import ChatBubble from './components/common/ChatBubble';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/spot-trading" element={<SpotTrading />} />
          <Route path="/" element={
            <>
              <Navbar />
              <main>
                <HomePage />
              </main>
              <Footer />
              <ChatBubble />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;