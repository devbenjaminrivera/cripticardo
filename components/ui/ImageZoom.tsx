'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface ImageZoomProps {
  src: string;
  alt: string;
  caption?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageZoom({ src, alt, caption, isOpen, onClose }: ImageZoomProps) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; distance: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Reset transform when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [isOpen]);

  // Calculate natural dimensions when image loads
  const handleLoad = useCallback(() => {
    if (imgRef.current) {
      setNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
      setImageLoaded(true);
      // Auto-fit to container on load
      fitToContainer();
    }
  }, []);

  // Fit image to container (calculate initial scale)
  const fitToContainer = useCallback(() => {
    if (!containerRef.current || !imgRef.current || naturalSize.width === 0) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const imgAspect = naturalSize.width / naturalSize.height;
    const containerAspect = containerRect.width / containerRect.height;

    let newScale: number;
    if (imgAspect > containerAspect) {
      // Image is wider - fit to width
      newScale = containerRect.width / naturalSize.width;
    } else {
      // Image is taller - fit to height
      newScale = containerRect.height / naturalSize.height;
    }

    // Cap at 1x (don't upscale beyond natural size initially)
    setScale(Math.min(newScale, 1));
    setTranslate({ x: 0, y: 0 });
  }, [naturalSize]);

  // Re-fit on container resize
  useEffect(() => {
    if (isOpen && imageLoaded) {
      fitToContainer();
      const handleResize = () => fitToContainer();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isOpen, imageLoaded, fitToContainer]);

  // Clamp translate to keep image within bounds when zoomed
  const clampTranslate = useCallback((newScale: number, newTranslate: { x: number; y: number }) => {
    if (!containerRef.current || !imgRef.current || naturalSize.width === 0) return newTranslate;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const scaledWidth = naturalSize.width * newScale;
    const scaledHeight = naturalSize.height * newScale;

    // How much the image can move in each direction
    const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, newTranslate.x)),
      y: Math.max(-maxY, Math.min(maxY, newTranslate.y)),
    };
  }, [naturalSize]);

  // Zoom to point (for wheel zoom and double-click)
  const zoomToPoint = useCallback((clientX: number, clientY: number, delta: number) => {
    if (!containerRef.current || !imgRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Mouse position relative to container center
    const offsetX = clientX - rect.left - rect.width / 2;
    const offsetY = clientY - rect.top - rect.height / 2;

    // Calculate new scale
    const newScale = Math.max(0.5, Math.min(5, scale * (1 + delta * 0.001)));

    // Calculate new translate to zoom toward cursor
    const scaleRatio = newScale / scale;
    const newTranslate = {
      x: offsetX * (1 - scaleRatio) + translate.x * scaleRatio,
      y: offsetY * (1 - scaleRatio) + translate.y * scaleRatio,
    };

    const clamped = clampTranslate(newScale, newTranslate);
    setScale(newScale);
    setTranslate(clamped);
  }, [scale, translate, clampTranslate]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    zoomToPoint(e.clientX, e.clientY, -e.deltaY);
  }, [zoomToPoint]);

  // Double-click to zoom in/out
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    if (scale > 1.2) {
      // Zoom out to fit
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      // Zoom in to 2x at click point
      const offsetX = e.clientX - rect.left - rect.width / 2;
      const offsetY = e.clientY - rect.top - rect.height / 2;
      const newScale = 2;
      const scaleRatio = newScale / scale;
      const newTranslate = {
        x: offsetX * (1 - scaleRatio),
        y: offsetY * (1 - scaleRatio),
      };
      const clamped = clampTranslate(newScale, newTranslate);
      setScale(newScale);
      setTranslate(clamped);
    }
  }, [scale, clampTranslate]);

  // Mouse drag to pan
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1) return; // Only pan when zoomed in
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
    (e.currentTarget as HTMLDivElement).style.cursor = 'grabbing';
  }, [scale, translate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const newTranslate = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
    const clamped = clampTranslate(scale, newTranslate);
    setTranslate(clamped);
  }, [isDragging, dragStart, scale, clampTranslate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
    }
  }, [scale]);

  // Touch handling for pinch zoom and pan
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - pan if zoomed
      if (scale > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - translate.x,
          y: e.touches[0].clientY - translate.y
        });
      }
    } else if (e.touches.length === 2) {
      // Two touches - pinch zoom
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      setTouchStart({ x: midX, y: midY, distance });
      setIsDragging(false);
    }
  }, [scale, translate]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      // Pan with one finger
      e.preventDefault();
      const newTranslate = {
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      };
      const clamped = clampTranslate(scale, newTranslate);
      setTranslate(clamped);
    } else if (e.touches.length === 2 && touchStart) {
      // Pinch zoom with two fingers
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const scaleChange = distance / touchStart.distance;
      const newScale = Math.max(0.5, Math.min(5, scale * scaleChange));

      // Zoom toward center of pinch
      if (containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const offsetX = touchStart.x - rect.left - rect.width / 2;
        const offsetY = touchStart.y - rect.top - rect.height / 2;

        const scaleRatio = newScale / scale;
        const newTranslate = {
          x: offsetX * (1 - scaleRatio) + translate.x * scaleRatio,
          y: offsetY * (1 - scaleRatio) + translate.y * scaleRatio,
        };
        const clamped = clampTranslate(newScale, newTranslate);
        setScale(newScale);
        setTranslate(clamped);
      }
    }
  }, [isDragging, dragStart, scale, translate, touchStart, clampTranslate]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      setTouchStart(null);
      if (containerRef.current) {
        containerRef.current.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
      }
    } else if (e.touches.length === 1 && touchStart) {
      // Switching from pinch to pan
      setTouchStart(null);
      if (scale > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - translate.x,
          y: e.touches[0].clientY - translate.y
        });
      }
    }
  }, [scale, translate, touchStart]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '0' || e.key === ' ') {
        // Reset zoom
        e.preventDefault();
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      } else if (e.key === '+' || e.key === '=') {
        // Zoom in
        e.preventDefault();
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          zoomToPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, 500);
        }
      } else if (e.key === '-') {
        // Zoom out
        e.preventDefault();
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          zoomToPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, -500);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, zoomToPoint]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-ink-900/95 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      onWheel={handleWheel}
    >
      <div
        ref={containerRef}
        className="relative max-w-[95vw] max-h-[95vh] w-full h-full bg-ink-950/50 rounded-xl shadow-2xl border border-ink-700 flex flex-col items-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: scale > 1 ? 'grab' : 'zoom-in' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top bar */}
        <div className="w-full flex items-center justify-between p-3 sm:p-4 border-b border-ink-800 bg-ink-900/50 flex-shrink-0">
          <div className="min-w-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScale(scale > 1.2 ? 1 : 2)}
              onDoubleClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg bg-ink-800 hover:bg-ink-700 text-parchment-100 transition-colors flex-shrink-0"
              title={scale > 1.2 ? 'Ajustar a pantalla (Doble clic o 0)' : 'Zoom 2x (Doble clic o +)'}
              aria-label={scale > 1.2 ? 'Ajustar a pantalla' : 'Zoom 2x'}
            >
              {scale > 1.2 ? (
                <Maximize2 className="w-5 h-5" />
              ) : (
                <Minimize2 className="w-5 h-5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setScale(1)}
              onDoubleClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg bg-ink-800 hover:bg-ink-700 text-parchment-100 transition-colors flex-shrink-0"
              title="Tamaño real (1x)"
              aria-label="Tamaño real"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            {caption && (
              <span className="font-sans font-medium text-sm sm:text-base text-parchment-100 truncate max-w-[300px]">
                {caption}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom indicator */}
            <span className="text-xs font-mono text-parchment-400 px-2 py-1 bg-ink-800/50 rounded hidden sm:inline-flex">
              {Math.round(scale * 100)}%
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-ink-800 hover:bg-ink-700 text-parchment-100 transition-colors flex-shrink-0"
              title="Cerrar (Escape)"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image container */}
        <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-ink-900">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-parchment-400">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-2 border-parchment-300 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-mono">Cargando imagen...</span>
              </div>
            </div>
          )}

          <img
            ref={imgRef}
            src={src}
            alt={alt}
            onLoad={handleLoad}
            className={`select-none transition-transform duration-100 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform,
              transformOrigin: 'center center',
              willChange: 'transform',
              maxWidth: 'none',
              maxHeight: 'none',
            }}
            draggable={false}
          />

          {/* Zoom hints for mobile */}
          {(scale > 1 || (typeof window !== 'undefined' && 'ontouchstart' in window)) && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-ink-900/80 backdrop-blur-sm rounded-full text-[11px] text-parchment-300 pointer-events-none animate-in fade-in duration-300">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 bg-parchment-200/20 rounded flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-parchment-300 rounded-full"></span>
                </span>
                <span>Pellizca para zoom</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 border-l border-ink-600 pl-2">
                <span className="w-4 h-4 bg-parchment-200/20 rounded flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-parchment-300 rounded-full"></span>
                </span>
                <span>Arrastra para mover</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 border-l border-ink-600 pl-2">
                <kbd className="px-1.5 py-0.5 bg-parchment-200/20 border border-ink-600 rounded text-[10px] font-mono text-parchment-200">Esc</kbd>
                <span>Cierra</span>
              </span>
            </div>
          )}
        </div>

        {/* Bottom bar with instructions */}
        <div className="w-full px-3 sm:px-4 py-3 border-t border-ink-800 bg-ink-900/50 flex-shrink-0">
          <p className="text-[11px] text-center text-parchment-400 sm:text-left">
            <span className="hidden sm:inline">
              Doble clic / Rueda del ratón: Zoom · Arrastrar: Mover ·
            </span>
            <kbd className="px-1.5 py-0.5 bg-parchment-200/20 border border-ink-600 rounded text-[10px] font-mono text-parchment-200 mx-1">
              Esc
            </kbd>
            {' '}Cierra ·{' '}
            <kbd className="px-1.5 py-0.5 bg-parchment-200/20 border border-ink-600 rounded text-[10px] font-mono text-parchment-200 mx-1">
              0
            </kbd>
            {' '}Ajustar
          </p>
        </div>
      </div>
    </div>
  );
}