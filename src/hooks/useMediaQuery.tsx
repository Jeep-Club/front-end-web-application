'use client';

import { useEffect, useState } from 'react';

/**
 * A custom React hook that listens for changes in the viewport size and returns a boolean indicating whether the specified media query matches the current viewport.
 *
 * @param {string} query - The media query string to evaluate (e.g., '(min-width: 1024px)').
 * @returns {boolean} - A boolean indicating whether the media query matches the current viewport.
 * @example 
 * ```
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * ```
 */
const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);

    return matches;
};

export default useMediaQuery;