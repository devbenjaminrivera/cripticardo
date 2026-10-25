'use client';

import React from 'react';

export function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function SpotifyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.215.353-.674.464-1.026.25-2.812-1.718-6.353-2.107-10.521-1.155-.403.092-.806-.16-.898-.563-.092-.403.16-.806.563-.898 4.568-1.044 8.484-.596 11.632 1.33.353.215.464.674.25 1.036zm1.467-3.262c-.27.441-.849.58-1.29.31-3.218-1.978-8.125-2.55-11.932-1.393-.497.15-1.026-.134-1.176-.63-.15-.497.134-1.026.63-1.176 4.35-1.32 9.774-.684 13.458 1.579.441.27.58.849.31 1.29zm.126-3.41c-3.859-2.292-10.228-2.503-13.896-1.389-.59.18-1.22-.16-1.4-.75-.18-.59.16-1.22.75-1.4 4.218-1.28 11.25-1.035 15.688 1.6 1.076.64.912 2.127-.142 2.539z" />
    </svg>
  );
}

export const INSTAGRAM_URL = 'https://www.instagram.com/dafacoo';
export const SPOTIFY_URL = 'https://open.spotify.com/user/2paev6q3vmw6xh68cfbxzffn9';

interface SocialButtonsProps {
  compact?: boolean;
}

export function SocialButtons({ compact = false }: SocialButtonsProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram @dafacoo"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 transition-all shadow-2xs active:scale-95"
        >
          <InstagramIcon className="w-3.5 h-3.5" />
          <span>@dafacoo</span>
        </a>

        <a
          href={SPOTIFY_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Spotify de Daniel Fajardo"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-[#1DB954] hover:bg-[#1aa34a] transition-all shadow-2xs active:scale-95"
        >
          <SpotifyIcon className="w-3.5 h-3.5" />
          <span>Spotify</span>
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 transition-all shadow-xs active:scale-95"
      >
        <InstagramIcon className="w-4 h-4" />
        <span>Instagram @dafacoo</span>
      </a>

      <a
        href={SPOTIFY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-[#1DB954] hover:bg-[#1aa34a] transition-all shadow-xs active:scale-95"
      >
        <SpotifyIcon className="w-4 h-4" />
        <span>Escuchar en Spotify</span>
      </a>
    </div>
  );
}
