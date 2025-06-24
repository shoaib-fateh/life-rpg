import React from "react";

const CustomButton = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
  ...props
}) => {
  const baseClasses = `
    px-6 py-3 rounded-xl font-bold text-white transition-all duration-500
    transform hover:scale-[1.03] focus:outline-none backdrop-blur-lg
    animate-pop-in border border-white/10 shadow-2xl
    relative overflow-hidden
  `;

  const variantGradients = {
    primary: disabled
      ? "bg-gray-700/50 cursor-not-allowed"
      : "bg-gradient-to-br from-purple-600/80 to-blue-600/80 hover:from-purple-500/80 hover:to-blue-500/80 active:from-purple-700/80 active:to-blue-700/80",
    secondary: disabled
      ? "bg-gray-700/50 cursor-not-allowed"
      : "bg-gradient-to-br from-gray-600/80 to-gray-500/80 hover:from-gray-500/80 hover:to-gray-400/80 active:from-gray-700/80 active:to-gray-600/80",
    danger: disabled
      ? "bg-gray-700/50 cursor-not-allowed"
      : "bg-gradient-to-br from-red-600/80 to-pink-600/80 hover:from-red-500/80 hover:to-pink-500/80 active:from-red-700/80 active:to-pink-700/80"
  };

  const variantGlows = {
    primary: "shadow-[0_0_15px_rgba(139,92,246,0.7)]",
    secondary: "shadow-[0_0_15px_rgba(156,163,175,0.5)]",
    danger: "shadow-[0_0_15px_rgba(244,63,94,0.7)]"
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`
        ${baseClasses} 
        ${variantGradients[variant]} 
        ${!disabled && variantGlows[variant]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {/* افکت نور */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 hover:opacity-100
        transition-opacity duration-500 pointer-events-none
        ${variant === 'primary' && 'bg-[radial-gradient(circle_at_center,_rgba(124,58,237,0.4)_0%,_transparent_70%)]'}
        ${variant === 'secondary' && 'bg-[radial-gradient(circle_at_center,_rgba(156,163,175,0.3)_0%,_transparent_70%)]'}
        ${variant === 'danger' && 'bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.4)_0%,_transparent_70%)]'}
      `} />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

export default CustomButton;