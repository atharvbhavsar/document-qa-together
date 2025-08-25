import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
}

export const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, className, inputClassName, labelClassName, containerClassName, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Merge the forwarded ref with our local ref
    const handleRef = (element: HTMLInputElement) => {
      inputRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement>).current = element;
      }
    };

    // Check if input has value on mount and on change
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
            // Border with gradient
            'border border-transparent',
            'bg-gradient-to-r p-[1px] from-transparent via-transparent to-transparent',
            // Focus and hover states for gradient
            isFocused ? 
              'from-blue-400 via-purple-400 to-pink-400 shadow-md' : 
              hasValue ? 
                'from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700' : 
                'hover:from-gray-200 hover:via-gray-300 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:via-gray-600 dark:hover:to-gray-700',
            error ? '!from-red-400 !via-red-400 !to-red-400' : '',
            className
          )}
        >
          <div className="relative flex items-center">
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
              id={props.id || `animated-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
            />
            <label
              htmlFor={props.id || `animated-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
              className={cn(
                'absolute left-4 top-1/2',
                'transform -translate-y-1/2',
                'px-1 pointer-events-none',
                'transition-all duration-200 ease-in-out',
                'text-gray-500 dark:text-gray-400',
                'bg-gradient-to-r from-transparent via-white to-transparent dark:via-gray-900',
                'select-none',
                (isFocused || hasValue) ? 
                  'top-0 text-xs' : 
                  'text-base',
                isFocused ? 
                  'text-blue-600 dark:text-blue-400' : 
                  error ? 'text-red-500' : '',
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
      </div>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';

export default AnimatedInput;
