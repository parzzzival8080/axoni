import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import SpotTrading from './pages/SpotTrading';
import LoginPage from './pages/login/LoginPage';
import Footer from './components/common/Footer';
import ChatBubble from './components/common/ChatBubble';
import './styles.css';
import FutureTrading from './pages/FutureTrading';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/spot-trading" element={
            <>
              <Navbar />
              <main>
                <SpotTrading />
              </main>
              <ChatBubble />
            </>
          } />
          <Route path="/future-trading" element={
            <>
              <Navbar />
              <main>
                <FutureTrading/>
              </main>
              <ChatBubble />
            </>
          } />
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