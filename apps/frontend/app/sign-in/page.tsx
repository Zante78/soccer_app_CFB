"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const LOGIN_TIMEOUT_MS = 15_000;

function getLoginErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "LOGIN_TIMEOUT") {
    return "Zeitüberschreitung: Der Server antwortet nicht. Bitte prüfe deine Internetverbindung oder versuche es später erneut.";
  }

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("Invalid login credentials")) {
    return "Ungültige Anmeldedaten. Bitte überprüfe E-Mail und Passwort.";
  }
  if (message.includes("Email not confirmed")) {
    return "E-Mail-Adresse nicht bestätigt. Bitte prüfe dein Postfach.";
  }
  if (message.includes("Failed to fetch") || message.includes("NetworkError") || message.includes("503")) {
    return "Server nicht erreichbar. Bitte versuche es später erneut.";
  }

  return `Anmeldung fehlgeschlagen: ${message}`;
}

export default function SignInPage() {
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("LOGIN_TIMEOUT")), LOGIN_TIMEOUT_MS)
        ),
      ]);

      if (result.error) {
        setError(getLoginErrorMessage(result.error));
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError(getLoginErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0055A4]">CFB Digitale Passstelle</h1>
          <p className="text-gray-600 mt-2">Anmelden</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input w-full"
              placeholder="deine@email.de"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input w-full"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Anmeldung läuft..." : "Anmelden"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Noch kein Konto?{" "}
          <Link href="/sign-up" className="text-[#0055A4] hover:underline font-medium">
            Registrieren
          </Link>
        </p>
      </Card>
    </div>
  );
}
