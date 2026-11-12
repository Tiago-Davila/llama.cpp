import { FAVICON_PATHS } from '../src/lib/constants/pwa.constants';
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT_DIR = resolve(HERE, '..', 'static');
const BRAND_DIR = resolve(HERE, '..', 'src', 'lib', 'assets', 'ferrovias');

/** The FerroviasIA favicons, keyed by the file they become. */
export const BRAND_FAVICONS = {
	[FAVICON_PATHS.SVG_DARK]: resolve(BRAND_DIR, 'favicon-dark.svg'),
	[FAVICON_PATHS.SVG_LIGHT]: resolve(BRAND_DIR, 'favicon.svg')
} as const;

/**
 * Copy the light and dark favicons into the static directory, where they are
 * served as they are and feed the PWA asset generator.
 */
export function writeBrandFavicons(outDir: string = DEFAULT_OUT_DIR): void {
	mkdirSync(outDir, { recursive: true });

	for (const [fileName, source] of Object.entries(BRAND_FAVICONS)) {
		copyFileSync(source, resolve(outDir, fileName));
	}
}
