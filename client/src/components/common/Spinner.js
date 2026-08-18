import React from 'react';

export default function Spinner({ message = 'Loading your workspace...' }) {
  return (
    <div className="state-card loading-state">
      <span className="spinner" />
      <span>{message}</span>
    </div>
  );
}
