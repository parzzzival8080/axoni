import React, { useState } from 'react';
import './dropdown.css';

const Dropdown = () => {
  const [selectedOption, setSelectedOption] = useState('20');

  const handleChange = (e) => {
    setSelectedOption(e.target.value);
    console.log('Selected:', e.target.value);
  };

  return (
    <div className="dropdown-container">
      <select
        id="mode-select"
        value={selectedOption}
        onChange={handleChange}
        className="dropdown-select"
      >
        <option value="10">10</option>
        <option value="20">20</option>
      </select>
    </div>
  );
};

export default Dropdown;
