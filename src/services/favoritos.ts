import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../database/database';

/** Chave do favorito: um documento por usuário + lanche. */
export function chaveFavorito(usuarioId: string, lancheId: string) {
  return `${usuarioId}_${lancheId}`;
}

/** Coloca o lanche nos favoritos. Devolve false se não houver usuário logado. */
export async function adicionarAosFavoritos(lancheId: string): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;

  await setDoc(doc(db, 'favoritos', chaveFavorito(uid, lancheId)), {
    usuarioId: uid,
    lancheId,
    criadoEm: new Date(),
  });
  return true;
}

/** Tira o lanche dos favoritos. Devolve false se não houver usuário logado. */
export async function removerDosFavoritos(lancheId: string): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;

  await deleteDoc(doc(db, 'favoritos', chaveFavorito(uid, lancheId)));
  return true;
}