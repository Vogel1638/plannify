import React from "react";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function Form({ children, className = "", ...props }: FormProps) {
  return (
    <form className={`space-y-6 ${className}`} {...props}>
      {children}
    </form>
  );
}

export function FormGroup({ children, className = "" }: FormGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}

export function FormRow({ children, className = "" }: FormRowProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function FormActions({ children, className = "" }: FormActionsProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

interface FieldsetProps {
  children: React.ReactNode;
  legend?: string;
  className?: string;
}

export function Fieldset({ children, legend, className = "" }: FieldsetProps) {
  return (
    <fieldset className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      {legend && (
        <legend className="px-2 text-sm font-medium text-gray-700">
          {legend}
        </legend>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </fieldset>
  );
}

interface FormErrorProps {
  children: React.ReactNode;
  className?: string;
}

export function FormError({ children, className = "" }: FormErrorProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Fehler
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormSuccessProps {
  children: React.ReactNode;
  className?: string;
}

export function FormSuccess({ children, className = "" }: FormSuccessProps) {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            Erfolg
          </h3>
          <div className="mt-2 text-sm text-green-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
