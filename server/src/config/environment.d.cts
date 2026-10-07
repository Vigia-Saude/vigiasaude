export function appEnvironment(env?: Record<string, string | undefined>): 'production' | 'development';
export function projectReference(value: string): string | null;
export function assertDatabaseIsolation(env?: Record<string, string | undefined>, productionProject?: string): 'production' | 'development';
export function assertDestination(value: string, env?: Record<string, string | undefined>): URL;
export function browserOriginAllowed(origin?: string, env?: Record<string, string | undefined>): boolean;
