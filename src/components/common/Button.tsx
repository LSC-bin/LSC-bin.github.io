/**
 * 접근성 강화된 Button 컴포넌트
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  onKeyDown,
  ...props
}) => {
  const baseClasses = 'button';
  const variantClasses = {
    primary: 'button--primary',
    secondary: 'button--secondary',
    danger: 'button--danger',
    ghost: 'button--ghost',
  };
  const sizeClasses = {
    sm: 'button--sm',
    md: 'button--md',
    lg: 'button--lg',
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // 키보드 접근성: Enter/Space로 활성화
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isLoading && props.onClick) {
      e.preventDefault();
      (props.onClick as (e: React.MouseEvent<HTMLButtonElement>) => void)(
        e as unknown as React.MouseEvent<HTMLButtonElement>
      );
    }
    onKeyDown?.(e);
  };

  return (
    <button
      type={props.type || 'button'}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      onKeyDown={handleKeyDown}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? '로딩 중...' : children}
    </button>
  );
};

