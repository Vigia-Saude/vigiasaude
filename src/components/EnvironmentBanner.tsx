import { useEffect, useState } from 'react';

export function EnvironmentBanner() {
  const [development, setDevelopment] = useState(import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development');
  useEffect(() => {
    if (import.meta.env.DEV) return;
    fetch('/environment.json').then(response => response.json())
      .then(data => setDevelopment(data.environment === 'development')).catch(() => {});
  }, []);
  if (!development) return null;
  return <div role="status" className="fixed bottom-0 left-0 right-0 z-[100] bg-amber-400 px-3 py-1 text-center text-xs font-semibold text-black">AMBIENTE DE TESTES — dados separados da produção</div>;
}
