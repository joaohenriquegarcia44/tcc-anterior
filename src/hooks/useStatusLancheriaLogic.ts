import { useMemo } from 'react';

function minutosDe(tempo: any): number | null {
  if (typeof tempo === 'number' && !Number.isNaN(tempo)) return tempo;
  if (typeof tempo !== 'string') return null;
  // aceita "15", "15-25", "15 a 25 min"
  const match = tempo.match(/\d+/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  return Number.isNaN(n) ? null : n;
}

/**
 * Status da lancheria calculado a partir dos lanches REAIS do Firestore.
 * Não inventa dados: se o vendedor marcou tudo como indisponível,
 * o card mostra "FECHADO".
 */
export function useStatusLancheriaLogic(lanches: any[]) {
  return useMemo(() => {
    const disponiveis = (lanches || []).filter((l) => l?.disponivel !== false);
    const tempos = disponiveis
      .map((l) => minutosDe(l?.tempoPreparo))
      .filter((t): t is number => t !== null && t > 0);

    return {
      disponiveis: disponiveis.length,
      preparoMin: tempos.length ? Math.min(...tempos) : null,
    };
  }, [lanches]);
}
