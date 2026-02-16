"use client";

import { Suspense, useEffect, useState } from "react";
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
  Heading,
  Text,
  ErrorAlert
} from "../../components/ui";

  function RedirectReader({ onRedirect }: { onRedirect: (value: string) => void }) {
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/dashboard";

    useEffect(() => {
      onRedirect(redirect);
    }, [redirect, onRedirect]);

    return null;
  }


  export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [redirectAfterLogin, setRedirectAfterLogin] = useState("/dashboard");
    const registerHref =
      redirectAfterLogin && redirectAfterLogin !== "/dashboard"
        ? `/register?redirect=${encodeURIComponent(redirectAfterLogin)}`
        : "/register";

  
    async function handleLogin(e: React.FormEvent) {
      e.preventDefault();
      setLoading(true);
      setError(null);
      const redirect = redirectAfterLogin || "/dashboard";
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      console.log("[LOGIN] redirect-Parameter:", redirect);
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("token", data.token);
          router.push(redirect);
        } else {
          setError(data.message || "Login fehlgeschlagen");
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
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">Login bei Plannify</h2>
                  <p className="text-gray-600 text-base max-w-md mx-auto">Dein Zugang zu Events.</p>
                </div>
                <Form onSubmit={handleLogin} className="space-y-6">
                  <FormGroup>
                    <Input
                      label="E-Mail-Adresse"
                      type="email"
                      placeholder="ihre@email.ch"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Input
                      label="Passwort"
                      type="password"
                      placeholder="Ihr Passwort"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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
                      {loading ? "Logge ein..." : "Anmelden"}
                    </Button>
                  </FormActions>
                </Form>
                <div className="mt-8 text-center">
                  <Text className="text-gray-600 text-base">
                    Noch kein Konto?{" "}
                    <Link
                      href={registerHref}
                      className="text-blue-700 hover:text-blue-900 font-semibold"
                    >
                      Jetzt registrieren
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