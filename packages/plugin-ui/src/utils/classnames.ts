import { twMerge as tailwindMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

/**
 * Merge class names with Tailwind conflict resolution.
 *
 * @param inputs - Class name values to merge
 */
export function cn( ...inputs: ClassValue[] ): string {
    return tailwindMerge( clsx( inputs ) );
}

/**
 * Re-export twMerge for direct usage.
 */
export { tailwindMerge as twMerge };

