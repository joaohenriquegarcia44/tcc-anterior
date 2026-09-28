/**
 * Documento do Firestore com o id do documento mesclado aos campos.
 * O `doc.data()` devolve apenas um indice de assinatura, entao ao espalhar
 * num objeto literal o TypeScript infere somente `{ id: string }` e perde
 * as demais propriedades. Tipar o destino preserva o acesso a elas.
 */
export type DocumentoFirestore = {
  id: string;
  [campo: string]: any;
};
