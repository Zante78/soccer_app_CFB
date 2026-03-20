"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function SignUpPage() {
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      const msg = signUpError.message;
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setError("Registrierung fehlgeschlagen. Bitte versuche es erneut oder melde dich an.");
      } else if (msg.includes("Password") || msg.includes("password")) {
        setError("Passwort zu schwach. Bitte verwende mindestens 8 Zeichen.");
      } else {
        setError("Registrierung fehlgeschlagen. Bitte versuche es später erneut.");
      }
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Registrierung erfolgreich!</h2>
            <p className="text-gray-700 mt-2">
              Bitte bestätige deine E-Mail-Adresse und wende dich an einen Administrator,
              um Zugang zum Admin-Dashboard zu erhalten.
            </p>
            <Link href="/sign-in" className="btn-primary mt-6 inline-block">
              Zur Anmeldung
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0055A4]">CFB Digitale Passstelle</h1>
          <p className="text-gray-700 mt-2">Registrieren</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Vollständiger Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="input w-full"
              placeholder="Max Mustermann"
            />
          </div>

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
              minLength={8}
              className="input w-full"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-700 mt-1">Mindestens 8 Zeichen</p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrierung läuft..." : "Registrieren"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-700 mt-6">
          Bereits ein Konto?{" "}
          <Link href="/sign-in" className="text-[#0055A4] hover:underline font-medium">
            Anmelden
          </Link>
        </p>
      </Card>
    </div>
  );
}
