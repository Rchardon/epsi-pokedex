// components/Button.tsx

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled,
  ...rest
}) => {
  const baseStyles = 'font-bold rounded-lg transition-all ease-in-out duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-75 uppercase tracking-wider border-2';
  
  const variantStyles = {
    primary: 'bg-cyan-500 border-cyan-500 text-gray-900 hover:bg-cyan-400 hover:shadow-neon-blue focus:ring-cyan-400 disabled:bg-gray-600 disabled:border-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none',
    secondary: 'bg-transparent border-gray-400 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-200 focus:ring-gray-500 disabled:border-gray-700 disabled:text-gray-500',
    danger: 'bg-pink-600 border-pink-600 text-white hover:bg-pink-500 hover:shadow-neon-pink focus:ring-pink-500 disabled:bg-gray-600 disabled:border-gray-600 disabled:text-gray-400 disabled:shadow-none',
    ghost: 'border-transparent text-gray-400 hover:bg-gray-800 hover:text-cyan-400 focus:ring-gray-600 disabled:text-gray-600',
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedStyles}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
