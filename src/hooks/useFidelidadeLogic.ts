import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../database/database';

/**
 * Tela de Fidelidade — SOMENTE LEITURA.
 * Não cria, não edita e não consome pontos: apenas mostra o que já existe
 * no documento `usuarios/{uid}`. A regra de crédito continua sendo aplicada
 * em useConfirmarPedidoLogic.
 */
export function useFidelidadeLogic() {
  const [pontos, setPontos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
    try {
      setErro(null);
      const snap = await getDoc(doc(db, 'usuarios', auth.currentUser.uid));
      if (snap.exists()) {
        setPontos(Number(snap.data().pontos) || 0);
      }
    } catch (e: any) {
      setErro(e?.message || 'Não foi possível carregar seus pontos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { pontos, loading, erro, recarregar: carregar };
}
