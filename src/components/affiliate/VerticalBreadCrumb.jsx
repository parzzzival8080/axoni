import React from 'react';
import './VerticalBreadcrumb.css';

const VerticalBreadcrumb = ({ steps, activeStep, onStepClick }) => {
  return (
    <div className="vertical-breadcrumb">
      {steps.map((step, index) => (
        <div key={index} className="breadcrumb-item">
          <div 
            className={`breadcrumb-circle ${activeStep === step.number ? 'active' : ''}`}
            onClick={() => onStepClick(step.number)}
          >
            {step.number}
          </div>
          {index < steps.length - 1 && <div className="breadcrumb-line"></div>}
          <div className={`breadcrumb-label ${activeStep === step.number ? 'active' : ''}`}>
            {step.title || step.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerticalBreadcrumb;