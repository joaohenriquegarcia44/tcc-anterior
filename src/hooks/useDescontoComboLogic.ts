import { useEffect, useMemo, useState } from 'react';
import { auth } from '../database/database';
import {
  DESCONTO_COMBO_PADRAO,
  carregarDescontoCombo,
  type DescontoCombo,
} from '../services/descontoCombo';

/**
 * Desconto de combo que está configurado no momento.
 * Como o app roda com um único vendedor, basta o `userId` do primeiro lanche
 * que não é do próprio usuário — e o do lanche escolhido quando já existe.
 */
export function useDescontoComboLogic(lanches: any[], vendedorPreferido?: string) {
  const uid = auth.currentUser?.uid;

  const vendedorId = useMemo(() => {
    if (vendedorPreferido) return vendedorPreferido;
    return (lanches || []).find((l) => l?.userId && l.userId !== uid)?.userId;
  }, [lanches, vendedorPreferido, uid]);

  const [desconto, setDesconto] = useState<DescontoCombo>(DESCONTO_COMBO_PADRAO);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;

    if (!vendedorId) {
      setDesconto(DESCONTO_COMBO_PADRAO);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    carregarDescontoCombo(vendedorId).then((valor) => {
      if (!ativo) return;
      setDesconto(valor);
      setCarregando(false);
    });

    return () => {
      ativo = false;
    };
  }, [vendedorId]);

  return { desconto, carregando };
}
