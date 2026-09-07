import React from 'react';
import Label from '../atoms/Label';
import Input from '../atoms/Input';
import Select from '../atoms/Select';

export default function FormField({ label, id, type = 'text', placeholder, value, onChange, options, required }) {
  return (
    <div className="input-group">
      {label && <Label htmlFor={id}>{label}</Label>}
      {type === 'select' ? (
        <Select id={id} value={value} onChange={onChange} options={options} />
      ) : (
        <Input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} />
      )}
    </div>
  );
}