import React from 'react';
import RegisterForm from '../components/RegisterForm';

const TestRegister: React.FC = () => {
  const handleSuccess = (data: any) => {
    console.log('Registration successful:', data);
    // Hier können Sie weitere Aktionen nach erfolgreicher Registrierung durchführen
    // z.B. Weiterleitung, Toast-Nachricht, etc.
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Laravel Registration Test
          </h1>
          <p className="text-gray-600">
            Testen Sie die ASCII-Passwort-Policy mit dem Laravel Backend
          </p>
        </div>
        
        <RegisterForm onSuccess={handleSuccess} />
        
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Test-Konfiguration:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:8000'}</p>
              <p><strong>Register Path:</strong> {import.meta.env.VITE_API_REGISTER_PATH || '/register'}</p>
              <p><strong>Session Mode:</strong> {import.meta.env.VITE_SESSION_MODE === 'true' ? 'Sanctum (CSRF)' : 'Pure API'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRegister;
