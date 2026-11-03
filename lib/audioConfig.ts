/**
 * =========================================================================
 * CONFIGURACIÓN DE AUDIO AMBIENTAL DE CRIPTICARDO
 * =========================================================================
 * 
 * Aquí puedes cambiar fácilmente el archivo de audio y el volumen inicial.
 * 
 * - defaultVolume: Número decimal entre 0.0 y 1.0
 *     * 0.10 = Muy despacio (10%)
 *     * 0.25 = Volumen suave recomendado de fondo (25%)
 *     * 0.50 = Volumen medio (50%)
 *     * 1.00 = Volumen máximo (100%)
 */
export const AUDIO_CONFIG = {
  // Ruta del archivo dentro de la carpeta /public
  src: '/audio/cripticardo-audio.mp4',

  // 👇 EDITA AQUÍ EL VOLUMEN POR DEFECTO 👇
  defaultVolume: 0.08,

  // Reproducir en bucle continuo infinito
  loop: true,
};
