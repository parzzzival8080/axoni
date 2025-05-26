import React from 'react';
import svgIcon from '../../assets/homepage/faq.png';

const ServiceItem = ({ title, description, isActive }) => (
  <div className="flex items-start gap-4 mb-8">
    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
      isActive ? 'bg-white' : 'bg-gray-500'
    }`} />
    <div>
      <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

const Services = () => {
  const services = [
    {
      title: 'Spot Trading',
      description: 'Buy, sell or trade crypto at the current market price.',
      isActive: true
    },
    {
      title: 'Perpetual Futures',
      description: 'Get into a contract by buying long or selling short.',
      isActive: false
    },
    {
      title: 'Flux Earn',
      description: 'One-click pledge for daily income increase.',
      isActive: false
    },
    {
      title: 'New Listing',
      description: 'Subscribe to high-quality new tokens.',
      isActive: false
    }
  ];

  return (
    <div className="bg-black py-20">
      <div className="container mx-auto px-8 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Services list */}
          <div className="pt-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-white leading-tight">
              A variety of services for you to choose from
            </h2>
            <div>
              {services.map((service, index) => (
                <ServiceItem
                  key={index}
                  title={service.title}
                  description={service.description}
                  isActive={service.isActive}
                />
              ))}
            </div>
          </div>

          {/* Right side - Image */}
          <div className="flex justify-center lg:justify-end">
            <img
              src={svgIcon}
              alt="Services Illustration"
              className="w-full max-w-lg h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;