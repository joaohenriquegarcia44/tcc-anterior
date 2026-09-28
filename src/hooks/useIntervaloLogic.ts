import { useEffect, useMemo, useState } from 'react';

type Intervalo = {
  /** Início do intervalo em minutos desde 00:00. */
  inicio: number;
  /** Fim do intervalo em minutos desde 00:00. */
  fim: number;
  rotulo: string;
};

/**
 * Intervalos do campus (em minutos desde 00:00).
 * Ajuste aqui se a grade de horários do campus mudar.
 */
export const INTERVALOS_IF: Intervalo[] = [
  { inicio: 7 * 60 + 10, fim: 7 * 60 + 30, rotulo: '1º intervalo' },
  { inicio: 9 * 60 + 50, fim: 10 * 60 + 10, rotulo: '2º intervalo' },
  { inicio: 12 * 60, fim: 12 * 60 + 40, rotulo: 'Almoço' },
  { inicio: 15 * 60, fim: 15 * 60 + 20, rotulo: '3º intervalo' },
  { inicio: 17 * 60 + 10, fim: 17 * 60 + 30, rotulo: 'Saída' },
];

function minutosAgora(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

function formatarHora(minutos: number) {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0');
  const m = String(minutos % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export type EstadoIntervalo = {
  rotulo: string;
  emIntervalo: boolean;
  minutosRestantes: number;
  hora: string;
  horaFim: string;
};

/**
 * Contador do próximo intervalo do IF.
 * É apenas cálculo local de horário — não grava nem lê nada do Firestore.
 */
export function useIntervaloLogic(): EstadoIntervalo {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  return useMemo(() => {
    const minutos = minutosAgora(agora);

    const atual = INTERVALOS_IF.find((i) => minutos >= i.inicio && minutos < i.fim);
    if (atual) {
      return {
        rotulo: atual.rotulo,
        emIntervalo: true,
        minutosRestantes: Math.max(0, atual.fim - minutos),
        hora: formatarHora(atual.inicio),
        horaFim: formatarHora(atual.fim),
      };
    }

    const proximo = INTERVALOS_IF.find((i) => i.inicio > minutos);
    if (proximo) {
      return {
        rotulo: proximo.rotulo,
        emIntervalo: false,
        minutosRestantes: proximo.inicio - minutos,
        hora: formatarHora(proximo.inicio),
        horaFim: formatarHora(proximo.fim),
      };
    }

    const primeiro = INTERVALOS_IF[0];
    const minutosAteAmanha = 24 * 60 - minutos + primeiro.inicio;
    return {
      rotulo: primeiro.rotulo,
      emIntervalo: false,
      minutosRestantes: minutosAteAmanha,
      hora: formatarHora(primeiro.inicio),
      horaFim: formatarHora(primeiro.fim),
    };
  }, [agora]);
}
