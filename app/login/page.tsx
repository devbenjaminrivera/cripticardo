'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('cripticardo_admin_auth', 'true');
          localStorage.setItem('cripticardo_admin_user', data.username || username.trim());
        }
        router.push('/admin');
      } else {
        setError(data.error || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
        setLoading(false);
      }
    } catch {
      setError('Error de conexión al intentar iniciar sesión.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-3 sm:px-4 py-8 sm:py-12">
      {/* Botón de regreso */}
      <div className="w-full max-w-md mb-4">
        <Link
          href="/"
          className="text-xs font-semibold flex items-center gap-1.5 text-ink-600 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la portada de Cripticardo</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-parchment-50 border border-ink-300 rounded-lg p-5 sm:p-8 shadow-xs space-y-5 sm:space-y-6">
        <div className="text-center space-y-1.5 border-b border-ink-300/60 pb-5">
          <div className="inline-flex p-2.5 rounded-full bg-parchment-200 border border-parchment-300 text-ink-900 mb-2">
            <KeyRound className="w-6 h-6 text-terracotta" />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-ink-600">
            Panel de administración y programación de crípticos.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-terracotta/40 text-terracotta-dark p-3 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-terracotta flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-ink-700 block">
              Usuario
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                placeholder="Nombre de usuario"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-ink-300 rounded text-ink-900 focus:outline-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900 font-sans"
              />
              <User className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-semibold text-ink-700 block">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-ink-300 rounded text-ink-900 focus:outline-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900 font-sans"
              />
              <Lock className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-ink-900 hover:bg-ink-800 text-parchment-50 text-sm font-semibold rounded shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Iniciando sesión...</span>
            ) : (
              <span>Entrar al Panel →</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-ink-600 italic">
            El público general resuelve los enigmas desde la portada sin requerir cuenta.
          </p>
        </div>
      </div>
    </div>
  );
}
