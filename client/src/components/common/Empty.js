import React from 'react';
import { Link } from 'react-router-dom';

export default function Empty({ text, action, to }) {
  return (
    <div className="empty-state">
      <span>✨</span>
      <p>{text}</p>
      {action && to && (
        <Link className="btn btn-primary" to={to}>
          {action} &rarr;
        </Link>
      )}
    </div>
  );
}
