import React from 'react';

export default function Select({ id, value, onChange, options = [] }) {
  return (
    <div className="select-wrapper">
      <select id={id} value={value} onChange={onChange}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}