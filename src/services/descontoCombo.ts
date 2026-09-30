import { doc, getDoc } from 'firebase/firestore';
import { db } from '../database/database';

export type DescontoCombo = {
  /** Percentual de desconto aplicado no combo, ex.: 15 => 15%. */
  percentual: number;
  /** Teto em reais do desconto, para o vendedor não perder demais. */
  teto: number;
};

/** Usado quando o vendedor nunca configurou o desconto do combo. */
export const DESCONTO_COMBO_PADRAO: DescontoCombo = { percentual: 10, teto: 5 };

/** Travas de segurança para o vendedor não zerar a margem por engano. */
export const MAX_PERCENTUAL_COMBO = 50;
export const MAX_TETO_COMBO = 20;

const cache = new Map<string, DescontoCombo>();

/** Traz qualquer valor salvo (ou digitado) para dentro dos limites. */
export function normalizarDescontoCombo(valor: any): DescontoCombo {
  const percentual = Number(valor?.percentual);
  const teto = Number(valor?.teto);

  return {
    percentual: Number.isFinite(percentual)
      ? Math.min(Math.max(percentual, 0), MAX_PERCENTUAL_COMBO)
      : DESCONTO_COMBO_PADRAO.percentual,
    teto: Number.isFinite(teto) ? Math.min(Math.max(teto, 0), MAX_TETO_COMBO) : DESCONTO_COMBO_PADRAO.teto,
  };
}

/** Desconto em reais: percentual do subtotal, limitado pelo teto do vendedor. */
export function calcularDescontoCombo(subtotal: number, desconto: DescontoCombo): number {
  if (subtotal <= 0) return 0;
  return Math.max(0, Math.min((subtotal * desconto.percentual) / 100, desconto.teto));
}

/** Lê `usuarios/{uid}.descontoCombo` do Firestore (com cache em memória). */
export async function carregarDescontoCombo(vendedorId?: string | null): Promise<DescontoCombo> {
  if (!vendedorId) return DESCONTO_COMBO_PADRAO;

  const emCache = cache.get(vendedorId);
  if (emCache) return emCache;

  try {
    const snap = await getDoc(doc(db, 'usuarios', vendedorId));
    const desconto = normalizarDescontoCombo(snap.data()?.descontoCombo);
    cache.set(vendedorId, desconto);
    return desconto;
  } catch (error) {
    console.log('Erro ao ler o desconto de combo do vendedor:', error);
    return DESCONTO_COMBO_PADRAO;
  }
}

/** Usado depois de salvar, para o combo já abrir com o valor novo. */
export function guardarDescontoCombo(vendedorId: string, desconto: DescontoCombo) {
  cache.set(vendedorId, normalizarDescontoCombo(desconto));
}

export function limparCacheDescontoCombo(vendedorId?: string) {
  if (vendedorId) cache.delete(vendedorId);
  else cache.clear();
}
