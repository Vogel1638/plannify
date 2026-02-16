import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RegisterFormData, validateRegisterForm, ValidationErrors } from '../schemas/registerSchema';
import { registerUser, ValidationError } from '../services/api';

interface RegisterFormProps {
  onSuccess?: (data: any) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState<ValidationError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    // Client-side validation
    const clientErrors = validateRegisterForm(data);
    if (Object.keys(clientErrors).length > 0) {
      Object.keys(clientErrors).forEach((field) => {
        setError(field as keyof RegisterFormData, {
          type: 'manual',
          message: clientErrors[field as keyof ValidationErrors],
        });
      });
      return;
    }

    setIsLoading(true);
    setServerErrors(null);
    setSuccessMessage('');
    clearErrors();

    try {
      const response = await registerUser(data);
      setSuccessMessage('Registrierung erfolgreich! Sie werden weitergeleitet...');
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error: any) {
      if (error.errors) {
        // Laravel validation errors
        setServerErrors(error);
        
        // Set field-specific errors
        Object.keys(error.errors).forEach((field) => {
          setError(field as keyof RegisterFormData, {
            type: 'server',
            message: error.errors[field][0],
          });
        });
      } else {
        // General error
        setServerErrors({
          message: error.message || 'Ein Fehler ist aufgetreten',
          errors: {},
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Registrierung</h2>
      
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {serverErrors?.message && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {serverErrors.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ihr vollständiger Name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail-Adresse
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="ihre.email@beispiel.de"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Passwort
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ihr sicheres Passwort"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          <div className="mt-1 text-xs text-gray-600">
            <p>Passwort-Anforderungen:</p>
            <ul className="list-disc list-inside">
              <li>12-64 Zeichen lang</li>
              <li>Nur Buchstaben (A-Z, a-z) und Zahlen (0-9)</li>
              <li>Mindestens ein Großbuchstabe</li>
              <li>Mindestens eine Zahl</li>
            </ul>
          </div>
        </div>

        {/* Password Confirmation Field */}
        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
            Passwort bestätigen
          </label>
          <input
            {...register('password_confirmation')}
            type="password"
            id="password_confirmation"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Passwort wiederholen"
          />
          {errors.password_confirmation && (
            <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          } text-white`}
        >
          {isLoading ? 'Registrierung läuft...' : 'Registrieren'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
