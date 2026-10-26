import { useEffect, useState } from 'react';
import { easternDate } from '../utils/date';

export function useEasternToday(): string {
  const [today, setToday] = useState(() => easternDate());

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = easternDate();
      setToday((prev) => (prev === next ? prev : next));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return today;
}
