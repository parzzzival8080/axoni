import React from 'react';
import { FaShieldAlt, FaGlobe, FaUsers, FaChartLine, FaHandshake } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About <span className="text-[#014EB2]">COINCHI</span></h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Your trusted partner in the world of cryptocurrency trading and investment
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 mt-16">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6">Our <span className="text-[#014EB2]">Mission</span></h2>
              <p className="text-lg text-gray-300 mb-6">
                At COINCHI, we're on a mission to make cryptocurrency trading accessible, secure, and efficient for everyone. 
                We believe in the transformative power of blockchain technology and digital assets to create a more 
                inclusive and transparent financial system.
              </p>
              <p className="text-lg text-gray-300">
                Our platform is designed with both beginners and experienced traders in mind, offering intuitive tools, 
                educational resources, and advanced trading features to help you navigate the crypto market with confidence.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-gradient-to-br from-[#014EB2] to-[#ff9f01] p-1 rounded-full">
                <div className="bg-black rounded-full p-8">
                  <FaChartLine className="text-[#014EB2] w-32 h-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our <span className="text-[#014EB2]">Values</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <FaShieldAlt className="text-[#014EB2] text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Security First</h3>
              <p className="text-gray-300 text-center">
                We implement industry-leading security measures to protect your assets and data, 
                with regular security audits and continuous monitoring.
              </p>
            </div>
            
            <div className="bg-black p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <FaUsers className="text-[#014EB2] text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">User-Centric</h3>
              <p className="text-gray-300 text-center">
                Our platform is designed with you in mind. We continuously improve based on user feedback 
                to create the best possible trading experience.
              </p>
            </div>
            
            <div className="bg-black p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <FaHandshake className="text-[#014EB2] text-4xl" />
              </div>
              <h3 className="text-xl font-bold text-center mb-4">Transparency</h3>
              <p className="text-gray-300 text-center">
                We believe in full transparency in all our operations, from fee structures to 
                platform performance and security practices.
              </p>
            </div>
          </div>
        </div>
      </section>
      

      
      {/* Global Presence */}
      <section className="py-16 bg-black">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6">Global <span className="text-[#014EB2]">Presence</span></h2>
              <p className="text-lg text-gray-300 mb-6">
                COINCHI operates globally with a presence in major financial hubs across Asia, Europe, and the Americas. 
                Our diverse team works around the clock to provide 24/7 support and ensure seamless trading experiences 
                for users worldwide.
              </p>
              <p className="text-lg text-gray-300">
                We comply with regulatory requirements in all jurisdictions where we operate, maintaining the highest 
                standards of legal compliance and user protection.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <FaGlobe className="text-[#014EB2] w-48 h-48 opacity-80" />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the <span className="text-[#014EB2]">COINCHI</span> Community</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Start your crypto journey with a platform you can trust. Sign up today and experience 
            the next generation of cryptocurrency trading.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup" className="bg-[#014EB2] hover:bg-[#e56800] text-white font-bold py-3 px-8 rounded-full text-lg">
              Create Account
            </a>
            <a href="/download" className="bg-transparent border border-[#014EB2] hover:bg-[#014EB2]/10 text-white font-bold py-3 px-8 rounded-full text-lg">
              Download App
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
