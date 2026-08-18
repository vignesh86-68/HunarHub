import React from 'react';

export default function Problem({ message = 'We could not load this information. Check that the server is running and try again.' }) {
  return (
    <div className="state-card error-state">
      <span>⚠️</span>
      <p>{message}</p>
    </div>
  );
}
