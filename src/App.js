import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import SpotTrading from './pages/SpotTrading';
import LoginPage from './pages/login/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Footer from './components/common/Footer';
import ChatBubble from './components/common/ChatBubble';
import './styles.css';
import FutureTrading from './pages/FutureTrading';
import Conversion from './pages/Conversion';
import Market from './pages/discover/Market';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/conversion" element={
            <>
              <Navbar />
              <main>
                <Conversion/>
              </main>
              <Footer />
              <ChatBubble />
            </>
          } />
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
          <Route path="/market" element={
            <>
              <Navbar />
              <main>
                <Market/>
              </main>
              <Footer />
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