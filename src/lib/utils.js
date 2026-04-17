import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Función para combinar clases de Tailwind de forma inteligente.
 * Es el motor principal de los componentes de la carpeta ui/
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}