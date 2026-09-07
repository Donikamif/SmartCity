import React from 'react';

export default function Input({ id, type = 'text', placeholder, value, onChange, required = false }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
}