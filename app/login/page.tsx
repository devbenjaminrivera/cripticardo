import type { Metadata } from 'next';
import LoginFormClient from '@/components/auth/LoginFormClient';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Acceso al panel de administración de Cripticardo.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginFormClient />;
}