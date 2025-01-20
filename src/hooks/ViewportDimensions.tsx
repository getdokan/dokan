import { useState, useEffect, useCallback } from '@wordpress/element';

interface ViewportDimensions {
    width: number | null;
    height: number | null;
}

/**
 * Hook to track viewport dimensions.
 *
 * @since DOKAN_PRO_SINCE
 *
 * @return {ViewportDimensions} The viewport dimensions.
 */
export default function useWindowDimensions() {
    const getViewportDimensions = useCallback((): ViewportDimensions => ({
        width: typeof window !== 'undefined' ? window.innerWidth : null,
        height: typeof window !== 'undefined' ? window.innerHeight : null,
    }), []);

    const [viewport, setViewport] = useState<ViewportDimensions>(getViewportDimensions());

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleResize = () => {
            // Use requestAnimationFrame to throttle updates
            window.requestAnimationFrame(() => {
                setViewport(getViewportDimensions());
            });
        };

        window.addEventListener('resize', handleResize);

        // Initial measurement after mount
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [getViewportDimensions]);

    return viewport;
};
