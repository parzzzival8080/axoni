import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ChatBubble from '../components/common/ChatBubble';

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ChatBubble />
    </>
  );
};

export default MainLayout; 