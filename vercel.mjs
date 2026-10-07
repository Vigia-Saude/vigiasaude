import { buildVercelConfiguration } from './scripts/vercel-configuration.mjs';

// Build-time external rewrites preserve the existing PDF upload path.
export const config = buildVercelConfiguration();
