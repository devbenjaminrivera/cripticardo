'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import ClueEditorForm from '@/components/admin/ClueEditorForm';
import {
  fetchAllCrypticsAsync,
  saveCrypticAsync,
  deleteCrypticAsync,
  formatDatePretty,
  getTodayDateString,
} from '@/lib/dataService';
import { Cryptic } from '@/lib/types';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  LogOut,
  Sparkles,
  BookOpen,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [cryptics, setCryptics] = useState<Cryptic[]>([]);
  const [editingCryptic, setEditingCryptic] = useState<Cryptic | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Comprobar autenticación
  useEffect(() => {
    const auth = localStorage.getItem('cripticardo_admin_auth');
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      loadCryptics();
    }
  }, [router]);

  const loadCryptics = async () => {
    const list = await fetchAllCrypticsAsync();
    // Ordenar por fecha programada descendente
    list.sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
    setCryptics(list);
  };

  const handleLogout = () => {
    localStorage.removeItem('cripticardo_admin_auth');
    localStorage.removeItem('cripticardo_admin_user');
    router.push('/login');
  };

  const handleSave = async (data: Omit<Cryptic, 'id' | 'clueNumber'> & { id?: string }) => {
    await saveCrypticAsync(data);
    await loadCryptics();
    setIsCreating(false);
    setEditingCryptic(null);
  };

  const handleDelete = async (id: string, clueNum: number) => {
    if (window.confirm(`¿Estás seguro de eliminar el críptico #${clueNum}?`)) {
      await deleteCrypticAsync(id);
      await loadCryptics();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-serif text-sm text-ink-600">Verificando credenciales...</p>
      </div>
    );
  }

  const todayStr = getTodayDateString();
  const todayCryptic = cryptics.find((c) => c.scheduledDate === todayStr);

  return (
    <div className="min-h-screen flex flex-col bg-parchment-100/60">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Cabecera del Taller */}
        <div className="bg-parchment-50 border border-ink-300 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-terracotta font-bold">
                Administración
              </span>
              <span className="text-ink-400">•</span>
              <span className="text-[10px] font-sans text-ink-600">Edición y Programación</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
              Panel de Administración
            </h1>
            <p className="text-xs sm:text-sm text-ink-600 mt-1">
              Creación, programación y archivo de crípticos del calendario.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isCreating && !editingCryptic && (
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-ink-900 hover:bg-ink-800 text-parchment-50 font-serif text-xs font-semibold rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-parchment-300" />
                <span>Nuevo Críptico</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="px-3 py-2 border border-ink-300 hover:border-ink-800 rounded text-xs font-semibold text-ink-700 hover:bg-parchment-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Métricas */}
        {!isCreating && !editingCryptic && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/80 p-4 rounded-lg border border-ink-300 shadow-2xs">
              <span className="text-xs uppercase font-mono tracking-wider text-ink-600 block">
                Total de Pistas
              </span>
              <span className="text-serif text-2xl font-bold text-ink-900">
                {cryptics.length}
              </span>
              <span className="text-[11px] text-ink-600 block mt-0.5">
                Programadas automáticamente
              </span>
            </div>

            <div className="bg-white/80 p-4 rounded-lg border border-ink-300 shadow-2xs">
              <span className="text-xs uppercase font-mono tracking-wider text-ink-600 block">
                Pista del Día de Hoy
              </span>
              <span className="font-serif text-base font-bold text-ink-900 line-clamp-1">
                {todayCryptic ? `Pista #${todayCryptic.clueNumber}: ${todayCryptic.answer}` : 'Ninguna para hoy'}
              </span>
              <span className="text-[11px] text-sage-dark block mt-0.5 font-medium">
                {todayCryptic ? '✓ Activa y visible al público' : 'Se mostrará la primera disponible'}
              </span>
            </div>

            <div className="bg-white/80 p-4 rounded-lg border border-ink-300 shadow-2xs">
              <span className="text-xs uppercase font-mono tracking-wider text-ink-600 block">
                Vista de Jugador
              </span>
              <Link
                href="/"
                target="_blank"
                className="font-serif text-sm font-semibold text-terracotta hover:underline inline-flex items-center gap-1 mt-1"
              >
                <span>Probar portada pública</span>
                <Eye className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] text-ink-600 block mt-0.5">
                Abre en pestaña nueva
              </span>
            </div>
          </div>
        )}

        {/* Formulario de Creación / Edición */}
        {isCreating ? (
          <ClueEditorForm
            onSave={handleSave}
            onCancel={() => setIsCreating(false)}
          />
        ) : editingCryptic ? (
          <ClueEditorForm
            initialData={editingCryptic}
            onSave={handleSave}
            onCancel={() => setEditingCryptic(null)}
          />
        ) : (
          /* Lista de Crípticos Programados */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-ink-900">
                Calendario de Enigmas Programados ({cryptics.length})
              </h2>
            </div>

            {cryptics.length === 0 ? (
              <div className="bg-parchment-50 border border-ink-300 rounded-lg p-10 text-center space-y-4">
                <div className="inline-flex p-3 rounded-full bg-parchment-200 border border-parchment-300 text-ink-700">
                  <BookOpen className="w-6 h-6 text-terracotta" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink-900">
                  Aún no has creado ningún críptico
                </h3>
                <p className="text-xs sm:text-sm text-ink-600 max-w-md mx-auto">
                  La colección está limpia y vacía. Redacta tu primer críptico y se programará automáticamente para la fecha correspondiente en Chile.
                </p>
                <div>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="px-5 py-2.5 bg-ink-900 hover:bg-ink-800 text-parchment-50 font-serif text-xs font-semibold rounded shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-parchment-300" />
                    <span>Crear mi primer críptico</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {cryptics.map((item) => {
                const isToday = item.scheduledDate === todayStr;

                return (
                  <div
                    key={item.id}
                    className={`bg-parchment-50 border rounded-lg p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      isToday
                        ? 'border-sage ring-1 ring-sage/30 bg-sage-light/10'
                        : 'border-ink-300 hover:border-ink-700'
                    }`}
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif font-bold text-ink-900 text-base">
                          Pista #{item.clueNumber}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-mono font-bold uppercase bg-sage text-parchment-50 px-2 py-0.5 rounded shadow-2xs">
                            HOY
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-ink-300 text-ink-900">
                          {item.answer} ({item.letterCount})
                        </span>
                        <span className="text-[11px] font-mono uppercase text-ink-600 bg-parchment-200 px-2 py-0.5 rounded">
                          {item.difficulty}
                        </span>
                      </div>

                      <p className="font-serif text-sm text-ink-800">
                        «{item.clue}»
                      </p>

                      <div className="text-xs text-ink-600 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-ink-600" />
                        <span className="capitalize">{formatDatePretty(item.scheduledDate)}</span>
                        <span className="text-ink-400">•</span>
                        <span className="text-[11px] italic truncate max-w-md">
                          Mecanismo: {item.mechanismText}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setEditingCryptic(item)}
                        className="p-2 border border-ink-300 hover:border-ink-800 rounded bg-white hover:bg-parchment-100 text-ink-800 text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
                        title="Editar pista"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ink-700" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDelete(item.id, item.clueNumber)}
                        className="p-2 border border-ink-300 hover:border-terracotta rounded bg-white hover:bg-red-50 text-terracotta text-xs font-medium transition-colors shadow-2xs"
                        title="Eliminar pista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
