import type { Persistence } from "firebase/auth";

/**
 * O `firebase/auth` publica os tipos da build web, onde `getReactNativePersistence`
 * nao existe. No React Native a funcao existe e e exportada pela build RN
 * (condicao `react-native` do pacote `@firebase/auth`), por isso o Metro funciona.
 * Esta declaracao preenche a lacuna apenas de tipagem.
 */
declare module "firebase/auth" {
  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
