import React, { useState } from 'react';
import './dropdown';

const Dropdown = () => {
  const [selectedOption, setSelectedOption] = useState('isolated');

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
        <option value="isolated">Isolated</option>
        <option value="cross">Cross</option>
      </select>
    </div>
  );
};

export default Dropdown;
