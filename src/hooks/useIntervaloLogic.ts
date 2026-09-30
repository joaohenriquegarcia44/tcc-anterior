import { useEffect, useMemo, useState } from 'react';

type Intervalo = {
  /** Início do intervalo em minutos desde 00:00. */
  inicio: number;
  /** Fim do intervalo em minutos desde 00:00. */
  fim: number;
  rotulo: string;
};

const h = (hora: number, minuto = 0) => hora * 60 + minuto;

/** Intervalo começa no horário citado e dura 15 min. */
const DURACAO = 15;

/** 0 = domingo … 6 = sábado. */
export const DIAS_UTEIS = [1, 2, 3, 4, 5];

/**
 * 1º intervalo e almoço são iguais em todos os dias úteis.
 * O almoço é maior (40 min) porque é a refeição, não só a pausa.
 */
const MANHA_COMUM: Intervalo[] = [
  { inicio: h(7, 10), fim: h(7, 30), rotulo: '1º intervalo' },
  { inicio: h(12), fim: h(12, 40), rotulo: 'Almoço' },
];

/**
 * 2º intervalo da manhã: 10:00 nos dias úteis, 9:30 na quarta.
 * A quarta é o único dia que antecipa o horário no IFRS.
 */
const INTERVALO_MANHA: Record<number, { inicio: number; rotulo: string }> = {
  1: { inicio: h(10), rotulo: '2º intervalo' },
  2: { inicio: h(10), rotulo: '2º intervalo' },
  3: { inicio: h(9, 30), rotulo: '2º intervalo' },
  4: { inicio: h(10), rotulo: '2º intervalo' },
  5: { inicio: h(10), rotulo: '2º intervalo' },
};

/** Turno da tarde. */
const TARDE: Intervalo[] = [
  { inicio: h(15), fim: h(15) + DURACAO, rotulo: 'Intervalo da tarde' },
  { inicio: h(17, 10), fim: h(17, 30), rotulo: 'Saída' },
];

/** Turno da noite: mesmo campus, nos dias úteis, com a pausa antes da saída. */
const NOITE: Intervalo[] = [
  { inicio: h(19, 50), fim: h(20, 10), rotulo: 'Intervalo da noite' },
  { inicio: h(21, 50), fim: h(22, 10), rotulo: 'Saída da noite' },
];

/** Grade completa de um dia (manhã + tarde + noite). Sábado e domingo são vazios. */
export function intervalosDoDia(diaDaSemana: number): Intervalo[] {
  const manifesto = INTERVALO_MANHA[diaDaSemana];
  if (!manifesto) return [];

  return [
    MANHA_COMUM[0],
    { inicio: manifesto.inicio, fim: manifesto.inicio + DURACAO, rotulo: manifesto.rotulo },
    MANHA_COMUM[1],
    ...TARDE,
    ...NOITE,
  ];
}

function proximoDiaUtil(diaDaSemana: number): number {
  for (let i = 1; i <= 7; i++) {
    const dia = (diaDaSemana + i) % 7;
    if (DIAS_UTEIS.includes(dia)) return dia;
  }
  return 1;
}

function minutosAgora(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

function formatarHora(minutos: number) {
  const hh = String(Math.floor(minutos / 60)).padStart(2, '0');
  const mm = String(minutos % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export type EstadoIntervalo = {
  rotulo: string;
  emIntervalo: boolean;
  minutosRestantes: number;
  hora: string;
  horaFim: string;
};

/** Estado do contador para um instante qualquer (função pura, fácil de testar). */
export function estadoDoIntervalo(agora: Date): EstadoIntervalo {
  const minutos = minutosAgora(agora);
  const hoje = intervalosDoDia(agora.getDay());

  const atual = hoje.find((i) => minutos >= i.inicio && minutos < i.fim);
  if (atual) {
    return {
      rotulo: atual.rotulo,
      emIntervalo: true,
      minutosRestantes: Math.max(0, atual.fim - minutos),
      hora: formatarHora(atual.inicio),
      horaFim: formatarHora(atual.fim),
    };
  }

  const proximo = hoje.find((i) => i.inicio > minutos);
  if (proximo) {
    return {
      rotulo: proximo.rotulo,
      emIntervalo: false,
      minutosRestantes: proximo.inicio - minutos,
      hora: formatarHora(proximo.inicio),
      horaFim: formatarHora(proximo.fim),
    };
  }

  // Fim do dia (ou fim de semana): conta até o 1º intervalo do próximo dia útil.
  const primeiro = intervalosDoDia(proximoDiaUtil(agora.getDay()))[0];
  return {
    rotulo: primeiro.rotulo,
    emIntervalo: false,
    minutosRestantes: 24 * 60 - minutos + primeiro.inicio,
    hora: formatarHora(primeiro.inicio),
    horaFim: formatarHora(primeiro.fim),
  };
}

/**
 * Contador do próximo intervalo do IF, respeitando a grade do dia
 * (manhã, tarde e noite). É cálculo local de horário — não usa o Firestore.
 */
export function useIntervaloLogic(): EstadoIntervalo {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  return useMemo(() => estadoDoIntervalo(agora), [agora]);
}
