"use client";

import { Suspense } from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { 
  Container, 
  Card, 
  CardHeader, 
  CardBody, 
  CardTitle, 
  CardDescription,
  Form,
  FormGroup,
  FormActions,
  Input,
  Button,
  Text,
  ErrorAlert
} from "../../components/ui";


export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState("/dashboard");


  function RedirectReader({ onRedirect }: { onRedirect: (value: string) => void }) {
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/dashboard";

    useEffect(() => {
      onRedirect(redirect);
    }, [redirect, onRedirect]);

    return null;
  }

  async function handleRegister(e: React.FormEvent) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, password, email }),
      });
      const data = await res.json();
      console.log("Registrierungsdaten:", data);
      if (res.ok) {
        // Automatisch nach Registrierung einloggen
        const loginRes = await fetch(`${API_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          localStorage.setItem("token", loginData.token);
          router.push(redirectAfterLogin);
        } else {
          const currentPath = window.location.pathname + window.location.search;
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        }
      } else {
        setError(data.message || "Registrierung fehlgeschlagen");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <Suspense fallback={null}>
        <RedirectReader onRedirect={setRedirectAfterLogin} />
      </Suspense>

      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#e8eaf6] via-[#f5f7fa] to-[#e3f0ff] min-h-[calc(100vh-80px)]">
        <Container size="sm" className="w-full">
          <Card shadow="lg" padding="lg" className="rounded-2xl border border-blue-100 bg-white/95">
            <CardBody>
              <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">Registriere dich</h2>
                <p className="text-gray-600 text-base max-w-md mx-auto">Werde Teil von Plannify.</p>
              </div>
              <Form onSubmit={handleRegister} className="space-y-6">
                <FormGroup>
                  <Input
                    label="Vollständiger Name"
                    type="text"
                    placeholder="Max Mustermann"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    label="E-Mail-Adresse"
                    type="email"
                    placeholder="max@beispiel.ch"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    label="Passwort"
                    type="password"
                    placeholder="Sicheres Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </FormGroup>
                <FormGroup>
                  <Input
                    label="Passwort bestätigen"
                    type="password"
                    placeholder="Passwort wiederholen"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </FormGroup>

                {error && (
                  <ErrorAlert>
                    {error}
                  </ErrorAlert>
                )}

                <FormActions>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full rounded-full text-lg font-bold py-3 shadow-md bg-gradient-to-r from-blue-700 to-purple-600 hover:from-blue-800 hover:to-purple-700"
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? "Erstelle Konto..." : "Konto erstellen"}
                  </Button>
                </FormActions>
              </Form>

              <div className="mt-8 text-center">
                <Text className="text-gray-600 text-base">
                  Bereits ein Konto?{" "}
                  <Link 
                    href="/login" 
                    className="text-blue-700 hover:text-blue-900 font-semibold"
                  >
                    Jetzt anmelden
                  </Link>
                </Text>
              </div>
            </CardBody>
          </Card>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
