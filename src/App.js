import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Hero from './components/home/Hero';
import Trading from './components/home/Trading';
import Journey from './components/home/Journey';
import About from './components/home/About';
import FAQ from './components/home/FAQ';
import Footer from './components/common/Footer';
import ChatBubble from './components/common/ChatBubble';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Hero />
          <Trading />
          <Journey />
          <About />
          <FAQ />
        </main>
        <Footer />
        <ChatBubble />
      </div>
    </Router>
  );
}

export default App;