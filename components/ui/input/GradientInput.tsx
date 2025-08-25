import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface GradientInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  gradientColors?: string[];
  error?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
}

export const GradientInput = React.forwardRef<HTMLInputElement, GradientInputProps>(
  ({ 
    label, 
    gradientColors = ['#6366f1', '#8b5cf6', '#d946ef', '#f97316'], 
    error, 
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

    // Generate gradient background style
    const gradientBackground = `linear-gradient(90deg, ${gradientColors.join(', ')})`;
    
    return (
      <div 
        className={cn(
          'relative font-sans mb-4',
          containerClassName
        )}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-lg',
            'transition-all duration-300 ease-in-out',
            'bg-white dark:bg-gray-900',
            'shadow-sm group',
            className
          )}
          style={{
            background: isFocused || hasValue ? gradientBackground : 'transparent',
            padding: '2px', // Border thickness
          }}
        >
          <div 
            className={cn(
              'relative flex items-center',
              'rounded-md overflow-hidden',
              'bg-white dark:bg-gray-900', // Inner background
              'transition-all duration-300 ease-in-out',
            )}
          >
            <input
              {...props}
              ref={handleRef}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={cn(
                'block w-full px-4 py-3 text-base',
                'text-gray-900 dark:text-gray-100',
                'bg-transparent',
                'focus:outline-none',
                'transition-all duration-200 ease-in-out',
                'placeholder-transparent', // Hide placeholder as we're using floating label
                'z-10', // Ensure input is above label
                inputClassName
              )}
              placeholder={label}
              id={props.id || `gradient-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
            />
            
            <label
              htmlFor={props.id || `gradient-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
              className={cn(
                'absolute left-4',
                'transform',
                'px-1 pointer-events-none',
                'transition-all duration-200 ease-in-out',
                'select-none',
                'bg-white dark:bg-gray-900', // Match inner background
                (isFocused || hasValue) ? 
                  'top-0 text-xs' : 
                  'top-1/2 -translate-y-1/2 text-base',
                labelClassName
              )}
              style={{
                color: isFocused ? 'transparent' : hasValue ? 'transparent' : '#6b7280',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                backgroundImage: gradientBackground,
              }}
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
      </div>
    );
  }
);

GradientInput.displayName = 'GradientInput';

export default GradientInput;
