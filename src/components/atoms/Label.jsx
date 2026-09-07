import React from 'react';

export default function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor}>
      {children}
    </label>
  );
}