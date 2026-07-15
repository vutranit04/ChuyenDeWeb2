import React from 'react';

export default function LoadingSpinner({ text = 'Đang tải...' }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <span className="loading-text">{text}</span>
    </div>
  );
}
