import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { collection, onSnapshot, query, orderBy, where, getDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../database/database';
import { categories as categorias } from '../styles/theme';

export function useHomeLogic(navigation: any) {
  const [lanches, setLanches] = useState<any[]>([]);
  const [filteredLanches, setFilteredLanches] = useState<any[]>([]);
  const [promocoes, setPromocoes] = useState<any[]>([]);
  const [lanchesFavoritos, setLanchesFavoritos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');
  const [refreshing, setRefreshing] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Buscar favoritos em tempo real
  useEffect(() => {
    if (!auth.currentUser) return;

    const favoritosQuery = query(
      collection(db, 'favoritos'),
      where('usuarioId', '==', auth.currentUser.uid),
      orderBy('usuarioId', 'asc')
    );

    const unsubscribeFavoritos = onSnapshot(favoritosQuery, async (snapshot) => {
      if (snapshot.empty) {
        setLanchesFavoritos([]);
        return;
      }
      const ids = snapshot.docs.map(doc => doc.data().lancheId);
      const lanchesPromises = ids.map(async (id) => {
        const lancheDoc = await getDoc(doc(db, 'lanches', id));
        return lancheDoc.exists() ? { id: lancheDoc.id, ...lancheDoc.data() } : null;
      });
      const lanchesData = (await Promise.all(lanchesPromises)).filter(l => l !== null);
      setLanchesFavoritos(lanchesData);
    }, (error) => {
      console.log("Erro ao carregar favoritos:", error);
    });

    return () => unsubscribeFavoritos();
  }, []);

  // Buscar lanches e promoções
  useEffect(() => {
    const unsubscribeLanches = onSnapshot(
      query(collection(db, 'lanches'), orderBy('criadoEm', 'desc')),
      (snapshot) => {
        const lista: any[] = [];
        snapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setLanches(lista);
        filtrarLanches(lista, categoriaSelecionada, searchText);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar lanches:", error);
        setFirebaseError(error.message || "Erro ao conectar no banco de dados");
        setLoading(false);
      }
    );

    const unsubscribePromos = onSnapshot(
      query(collection(db, 'lanches'), orderBy('criadoEm', 'desc')),
      (snapshot) => {
        const lista: any[] = [];
        snapshot.forEach((doc) => {
          if (doc.data().promocao === true) lista.push({ id: doc.id, ...doc.data() });
        });
        setPromocoes(lista);
      },
      (error) => {
        console.error("Erro ao carregar promoções:", error);
      }
    );

    return () => {
      unsubscribeLanches();
      unsubscribePromos();
    };
  }, []);

  function filtrarLanches(lista: any[], categoria: string, busca: string) {
    let resultado = [...lista];
    if (categoria !== 'todos') {
      if (categoria === 'promocao') {
        resultado = resultado.filter(item => item.promocao === true);
      } else {
        resultado = resultado.filter(item => {
          if (item.categorias && Array.isArray(item.categorias)) {
            return item.categorias.includes(categoria);
          } else if (item.categoria) {
            return item.categoria === categoria;
          }
          return false;
        });
      }
    }
    if (busca.trim() !== '') {
      resultado = resultado.filter(item =>
        item.nome.toLowerCase().includes(busca.toLowerCase()) ||
        item.descricao?.toLowerCase().includes(busca.toLowerCase())
      );
    }
    setFilteredLanches(resultado);
  }

  useEffect(() => {
    filtrarLanches(lanches, categoriaSelecionada, searchText);
  }, [categoriaSelecionada, searchText, lanches]);

  function filtrarPorCategoria(categoriaId: string) {
    setCategoriaSelecionada(categoriaId);
  }

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      alert('Erro ao sair');
    }
  };

  function getCategoriaIcon(cat: string) {
    switch (cat) {
      case 'lanche':
        return '🍔 Salgado';
      case 'bebida':
        return '🥤 Bebida';
      case 'doce':
        return '🍰 Doce';
      default:
        return cat;
    }
  }

  return {
    lanches,
    filteredLanches,
    promocoes,
    lanchesFavoritos,
    loading,
    searchText,
    setSearchText,
    categoriaSelecionada,
    refreshing,
    firebaseError,
    categorias,
    filtrarPorCategoria,
    onRefresh,
    handleLogout,
    getCategoriaIcon,
  };
}
