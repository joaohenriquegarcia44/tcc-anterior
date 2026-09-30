import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../database/database';

/** Cache em módulo: as telas de navegação compartilham a mesma consulta. */
let cache: { uid: string; ehVendedor: boolean } | null = null;

/** Pedidos que o vendedor ainda precisa entregar: pagos, mas não retirados. */
export const STATUS_ENTREGAR = ['pendente', 'pago', 'homologada'] as const;

export function ehPedidoPendenteDeEntrega(status: string | undefined): boolean {
  return !!status && (STATUS_ENTREGAR as readonly string[]).includes(status);
}

/**
 * Diz se o usuário logado vende no app (`usuarios/{uid}.papel === 'admin'`).
 * Usado para esconder abas que não fazem sentido para quem não compra.
 */
export function useEhVendedor(): boolean {
  const [ehVendedor, setEhVendedor] = useState(cache?.ehVendedor ?? false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      cache = null;
      setEhVendedor(false);
      return;
    }
    if (cache?.uid === uid) {
      setEhVendedor(cache.ehVendedor);
      return;
    }

    let ativo = true;
    getDoc(doc(db, 'usuarios', uid))
      .then((snap) => {
        const vendedor = snap.exists() && snap.data()?.papel === 'admin';
        cache = { uid, ehVendedor: vendedor };
        if (ativo) setEhVendedor(vendedor);
      })
      .catch((error) => console.log('Erro ao verificar papel do usuário:', error));

    return () => {
      ativo = false;
    };
  }, []);

  return ehVendedor;
}

/** Libera o cache (usado ao trocar de conta, no logout). */
export function limparCacheEhVendedor() {
  cache = null;
}
