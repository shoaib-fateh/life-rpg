import React from 'react';

const CustomButton = ({ children, onClick, type, className, loading, loadingText = '...', disabled = false }) => {
  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type || 'button'}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`px-4 py-2 rounded transition-all duration-200 backdrop-blur-md bg-opacity-70 border border-white border-opacity-20 text-white ${className} ${
        disabled ? 'bg-gray-700 cursor-not-allowed opacity-50' : 
        loading ? 'bg-yellow-600 animate-pulse' : 
        'hover:bg-opacity-80'
      }`}
    >
      {loading ? loadingText : children}
    </button>
  );
};

export default CustomButton;