import React from 'react';

interface ControlButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

const ControlButton: React.FC<ControlButtonProps> = ({
  label,
  active = false,
  onClick,
  variant = 'default'
}) => {
  const baseClasses = "w-28 py-3 rounded-lg text-white font-medium transition-all duration-200 relative";
  const variants = {
    default: active 
      ? "bg-gray-800/70 border-2 border-yellow-500" 
      : "bg-gray-800/70 hover:bg-gray-700/70",
    danger: "bg-red-600/90 hover:bg-red-700/90"
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]}`}
      onClick={onClick}
    >
      {label}
      {active && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          <div className="w-1 h-1 bg-yellow-500 rounded-full" />
          <div className="w-1 h-1 bg-yellow-500 rounded-full" />
          <div className="w-1 h-1 bg-yellow-500 rounded-full" />
        </div>
      )}
    </button>
  );
};

export default ControlButton;