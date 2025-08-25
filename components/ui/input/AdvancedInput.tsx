import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface AdvancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  variant?: 'default' | 'outline' | 'filled' | 'underlined' | 'minimalist';
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  description?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
}

export const AdvancedInput = React.forwardRef<HTMLInputElement, AdvancedInputProps>(
  ({ 
    label, 
    error, 
    success,
    variant = 'default',
    icon,
    rightIcon,
    description,
    className, 
    inputClassName, 
    labelClassName, 
    containerClassName,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Merge refs
    const handleRef = (element: HTMLInputElement) => {
      inputRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement>).current = element;
      }
    };

    // Check if input has value
    useEffect(() => {
      if (inputRef.current) {
        setHasValue(!!inputRef.current.value);
      }
    }, [props.value, props.defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    // Apply different styles based on variant
    const getVariantStyles = () => {
      switch (variant) {
        case 'outline':
          return {
            container: 'bg-transparent',
            input: 'bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded-lg',
            focusedContainer: 'border-blue-500 dark:border-blue-400',
          };
        case 'filled':
          return {
            container: 'bg-gray-100 dark:bg-gray-800 rounded-lg',
            input: 'bg-transparent',
            focusedContainer: 'bg-gray-200 dark:bg-gray-700',
          };
        case 'underlined':
          return {
            container: 'bg-transparent border-b-2 border-gray-300 dark:border-gray-600 rounded-none',
            input: 'bg-transparent px-0',
            focusedContainer: 'border-blue-500 dark:border-blue-400',
          };
        case 'minimalist':
          return {
            container: 'bg-transparent',
            input: 'bg-transparent border-none',
            focusedContainer: '',
          };
        default:
          return {
            container: 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg',
            input: 'bg-transparent',
            focusedContainer: 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20',
          };
      }
    };

    const variantStyles = getVariantStyles();

    return (
      <div 
        className={cn(
          'relative font-sans mb-4',
          containerClassName
        )}
      >
        <div
          className={cn(
            'relative overflow-hidden',
            'transition-all duration-300 ease-in-out',
            variantStyles.container,
            isFocused && variantStyles.focusedContainer,
            error ? '!border-red-500 dark:!border-red-400' : '',
            success ? '!border-green-500 dark:!border-green-400' : '',
            className
          )}
        >
          <div className="relative flex items-center">
            {icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {icon}
              </div>
            )}
            
            <input
              {...props}
              ref={handleRef}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={cn(
                'block w-full py-3 text-base',
                'text-gray-900 dark:text-gray-100',
                'focus:outline-none',
                'transition-all duration-200 ease-in-out',
                'placeholder-transparent',
                icon ? 'pl-10' : 'pl-4',
                rightIcon ? 'pr-10' : 'pr-4',
                variantStyles.input,
                inputClassName
              )}
              placeholder={label}
              id={props.id || `advanced-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
            />
            
            {rightIcon && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {rightIcon}
              </div>
            )}
            
            <label
              htmlFor={props.id || `advanced-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
              className={cn(
                'absolute left-4',
                icon && 'left-10',
                'transform',
                'px-1 pointer-events-none',
                'transition-all duration-200 ease-in-out',
                'select-none',
                'text-gray-500 dark:text-gray-400',
                (isFocused || hasValue) ? 
                  'top-0 text-xs bg-white dark:bg-gray-900' : 
                  'top-1/2 -translate-y-1/2 text-base bg-transparent',
                variant === 'filled' && (isFocused || hasValue) && 'bg-gray-100 dark:bg-gray-800',
                variant === 'filled' && isFocused && 'bg-gray-200 dark:bg-gray-700',
                variant === 'underlined' && 'px-0',
                variant === 'minimalist' && 'px-0',
                isFocused ? 
                  'text-blue-600 dark:text-blue-400' : 
                  error ? 'text-red-500' : 
                  success ? 'text-green-500' : '',
                labelClassName
              )}
            >
              {label}
            </label>
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-500 transition-all duration-200 ease-in">
            {error}
          </p>
        )}
        
        {!error && description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-all duration-200 ease-in">
            {description}
          </p>
        )}
        
        {!error && success && (
          <p className="mt-1 text-sm text-green-500 transition-all duration-200 ease-in">
            Input is valid!
          </p>
        )}
      </div>
    );
  }
);

AdvancedInput.displayName = 'AdvancedInput';

export default AdvancedInput;
