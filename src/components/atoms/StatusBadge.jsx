import React from 'react';

export default function StatusBadge({ status }) {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'in progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      default: return 'status-pending';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}