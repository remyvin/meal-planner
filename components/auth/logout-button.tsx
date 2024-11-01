'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Appeler une API pour supprimer le cookie
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth');
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      Déconnexion
    </Button>
  );
}