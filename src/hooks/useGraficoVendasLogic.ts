import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../database/database';

export function useGraficoVendasLogic(navigation: any) {
  const [vendas, setVendas] = useState<{ dia: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; value: number; label: string }>({ visible: false, x: 0, y: 0, value: 0, label: '' });
  const hideTimeout = useRef<any>(null);

  useEffect(() => {
    carregarVendas();
  }, []);

  async function carregarVendas() {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);
      dataLimite.setHours(0, 0, 0, 0);

      const q = query(
        collection(db, 'pedidos'),
        where('vendedorId', '==', auth.currentUser.uid),
        where('status', 'in', ['homologada', 'retirado']),
        where('criadoEm', '>=', dataLimite)
      );
      const snapshot = await getDocs(q);
      const pedidos = snapshot.docs.map(doc => doc.data());

      const vendasPorDia: { [key: string]: number } = {};
      pedidos.forEach(pedido => {
        const data = pedido.criadoEm.toDate();
        const diaStr = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
        vendasPorDia[diaStr] = (vendasPorDia[diaStr] || 0) + (pedido.total || 0);
      });

      const dados = Object.entries(vendasPorDia)
        .map(([dia, total]) => ({ dia, total }))
        .sort((a, b) => {
          const [diaA, mesA] = a.dia.split('/');
          const [diaB, mesB] = b.dia.split('/');
          return new Date(2024, parseInt(mesA) - 1, parseInt(diaA)).getTime() -
            new Date(2024, parseInt(mesB) - 1, parseInt(diaB)).getTime();
        });

      setVendas(dados);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function showTooltip(data: any, labels: string[]) {
    if (hideTimeout.current) clearTimeout(hideTimeout.current as any);
    setTooltip({ visible: true, x: data.x, y: data.y, value: data.value, label: labels[data.index] });
    hideTimeout.current = setTimeout(() => setTooltip(t => ({ ...t, visible: false })), 2500) as any;
  }

  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  const labels = vendas.map(v => v.dia);
  const valores = vendas.map(v => v.total);
  const totalSales = valores.reduce((s, v) => s + v, 0);
  const avgSales = vendas.length ? totalSales / vendas.length : 0;

  return {
    vendas,
    loading,
    tooltip,
    setTooltip,
    labels,
    valores,
    totalSales,
    avgSales,
    showTooltip,
    carregarVendas,
  };
}
