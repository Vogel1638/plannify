import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export function Input({ 
  label, 
  error, 
  helper, 
  icon, 
  iconPosition = "left", 
  className = "", 
  id,
  inputRef,
  ...props 
}: InputProps & { inputRef?: React.Ref<HTMLInputElement> }) {
  const reactId = useId();
  const inputId = id || `input-${reactId}`;
  
  const baseClasses = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-gray-900";
  const errorClasses = error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "";
  const iconClasses = icon ? (iconPosition === "left" ? "pl-10" : "pr-10") : "";
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          id={inputId}
          className={`${baseClasses} ${errorClasses} ${iconClasses} ${className}`}
          ref={inputRef}
          {...props}
        />
        {icon && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
}

export function Textarea({ 
  label, 
  error, 
  helper, 
  className = "", 
  id,
  ...props 
}: TextareaProps) {
  const reactId = useId();
  const inputId = id || `textarea-${reactId}`;
  
  const baseClasses = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-gray-900";
  const errorClasses = error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "";
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
}

export function Select({ 
  label, 
  error, 
  helper, 
  options, 
  className = "", 
  id,
  ...props 
}: SelectProps) {
  const reactId = useId();
  const inputId = id || `select-${reactId}`;
  
  const baseClasses = "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-gray-900";
  const errorClasses = error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "";
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
}

export function Checkbox({ 
  label, 
  error, 
  helper, 
  className = "", 
  id,
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helper?: string;
}) {
  const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="w-full">
      <div className="flex items-center">
        <input
          id={inputId}
          type="checkbox"
          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${className}`}
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className="ml-2 block text-sm text-gray-700">
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
}

export function Radio({ 
  label, 
  error, 
  helper, 
  className = "", 
  id,
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helper?: string;
}) {
  const inputId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="w-full">
      <div className="flex items-center">
        <input
          id={inputId}
          type="radio"
          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${className}`}
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className="ml-2 block text-sm text-gray-700">
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
}
