// app/auth/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Tentative de connexion...'); // Debug log
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include', // Important pour les cookies
      });

      const data = await response.json();
      console.log('Réponse reçue:', data); // Debug log

      if (data.success) {
        console.log('Authentification réussie, redirection...'); // Debug log
        // Force un rafraîchissement complet
        window.location.href = '/';
      } else {
        setError(data.message || 'Mot de passe incorrect');
      }
    } catch (err) {
      console.error('Erreur d\'authentification:', err); // Debug log
      setError('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Accéder au planificateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Mot de passe"
                className="w-full p-2 border rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Chargement...' : 'Accéder'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}