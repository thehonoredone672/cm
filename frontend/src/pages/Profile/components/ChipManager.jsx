import React, { useState } from 'react';
import './ChipManager.css';

const ChipManager = ({
  title,
  subtitle,
  items,
  options,
  onAddItem,
  onRemoveItem,
  searchPlaceholder,
  itemKey,
  itemName
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !items.some(item => item[itemKey] === option.id)
  );

  return (
    <div className="chip-manager-card">
      <h3>{title}</h3>
      <p className="subtitle">{subtitle}</p>

      <div className="chips-row">
        {items.length === 0 ? (
          <span className="muted-text">No items selected.</span>
        ) : (
          items.map(item => (
            <span key={item.id} className="chip" onClick={() => onRemoveItem(item[itemKey])}>
              {item[itemName]?.name} <span className="close-x">×</span>
            </span>
          ))
        )}
      </div>

      <div className="chip-search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={searchPlaceholder}
          className="chip-search-input"
        />
        {searchTerm && (
          <div className="chips-dropdown">
            {filteredOptions.slice(0, 5).map(option => (
              <div
                key={option.id}
                className="dropdown-item"
                onClick={() => {
                  onAddItem(option.id);
                  setSearchTerm('');
                }}
              >
                + {option.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChipManager;
