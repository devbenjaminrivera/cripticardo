'use client';

import React from 'react';

interface StructuredDataProps {
  type: 'game' | 'website' | 'article' | 'itemList';
  data: Record<string, unknown>;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type === 'game' ? 'Game' : type === 'website' ? 'WebSite' : type === 'article' ? 'Article' : 'ItemList',
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(baseSchema, null, 2) }}
    />
  );
}

// Helper function to generate Game schema for daily cryptic
export function generateGameSchema(cryptic: {
  id: string;
  clueNumber: number;
  scheduledDate: string;
  clue: string;
  answer: string;
  difficulty: string;
  mechanismText: string;
  imageUrl?: string;
  imageCaption?: string;
  defPart: string;
  mechanismPart: string;
  materialPart: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cripticardo.vercel.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: `Críptico #${cryptic.clueNumber} - ${cryptic.scheduledDate}`,
    description: `${cryptic.clue} - Dificultad: ${cryptic.difficulty}. ${cryptic.mechanismText}`,
    gamePlatform: 'Web',
    genre: ['Puzzle', 'Word Game', 'Educational'],
    numberOfPlayers: '1',
    typicalAgeRange: '12+',
    datePublished: cryptic.scheduledDate,
    publisher: {
      '@type': 'Organization',
      name: 'Cripticardo',
      url: baseUrl,
    },
    author: {
      '@type': 'Person',
      name: 'Daniel Fajardo',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CLP',
      availability: 'https://schema.org/InStock',
    },
    image: cryptic.imageUrl ? `${baseUrl}${cryptic.imageUrl}` : `${baseUrl}/og-image.png`,
    keywords: [
      'críptico',
      'enigma verbal',
      'música antigua',
      'anagrama',
      'juego de palabras',
      cryptic.difficulty.toLowerCase(),
    ],
    gameLocation: {
      '@type': 'Place',
      name: 'Cripticardo',
      url: `${baseUrl}/archivo/${cryptic.id}`,
    },
  };
}

// Helper for WebSite schema with SearchAction
export function generateWebSiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cripticardo.vercel.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cripticardo',
    url: baseUrl,
    description: 'El críptico diario de música antigua. Resuelve enigmas verbales con pistas progresivas y anatomía explicada.',
    publisher: {
      '@type': 'Organization',
      name: 'Cripticardo',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon-192.png`,
      },
      sameAs: [
        'https://twitter.com/daniel_fajardo',
        'https://github.com/daniel-fajardo',
      ],
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/archivo?q={search_term_string}`,
      },
      queryInput: 'required name=search_term_string',
    },
  };
}

// Helper for ItemList schema for archive page
export function generateItemListSchema(cryptics: Array<{
  id: string;
  clueNumber: number;
  scheduledDate: string;
  clue: string;
  answer: string;
  difficulty: string;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cripticardo.vercel.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Archivo de Crípticos Cripticardo',
    description: 'Colección completa de crípticos de música antigua publicados',
    numberOfItems: cryptics.length,
    itemListElement: cryptics.map((cryptic, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Game',
        name: `Críptico #${cryptic.clueNumber}`,
        url: `${baseUrl}/archivo/${cryptic.id}`,
        datePublished: cryptic.scheduledDate,
        description: cryptic.clue,
        genre: ['Puzzle', 'Word Game'],
        difficulty: cryptic.difficulty,
      },
    })),
  };
}