import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { auth, db } from "../database/database";
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, deleteDoc, orderBy } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, signOut, updateProfile } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { IMGBB_API_KEY } from "@env";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FoodImage from "../components/FoodImage";
import LoyaltyCard from "../components/LoyaltyCard";
import LoadingState from "../components/LoadingState";
import BottomNavigation from "../components/BottomNavigation";
import { colors, spacing, borderRadius, shadows, typography } from "../styles/theme";
import { abasDoApp } from "../navigation/tabs";
import { useEhVendedor, ehPedidoPendenteDeEntrega } from "../hooks/useEhVendedor";
import type { DocumentoFirestore } from "../types/models";

export default function Perfil({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<any>({});
  const [editando, setEditando] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [refreshing, setRefreshing] = useState(false);

  const [meusLanches, setMeusLanches] = useState<any[]>([]);
  const [pedidosRecebidos, setPedidosRecebidos] = useState<any[]>([]);
  const [avaliacoesRecebidas, setAvaliacoesRecebidas] = useState<any[]>([]);
  const [mediaAvaliacaoVendedor, setMediaAvaliacaoVendedor] = useState(0);
  const [graficos, setGraficos] = useState({
    pedidosHoje: 0,
    pedidosSemana: 0,
    lucroEstimado: 0,
  });

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  async function carregarDadosUsuario() {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "usuarios", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserData(userDoc.data());
        if (userDoc.data().papel === "admin") {
          carregarDadosVendedor();
        }
      } else {
        const newUserData = {
          nome: auth.currentUser.displayName || auth.currentUser.email?.split("@")[0] || "Aluno",
          email: auth.currentUser.email,
          telefone: "Não informado",
          fotoPerfil: auth.currentUser.photoURL || null,
          pontos: 0,
          criadoEm: new Date(),
          tipo: "aluno",
        };
        await setDoc(userRef, newUserData);
        setUserData(newUserData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarDadosVendedor() {
    if (!auth.currentUser) return;
    try {
      const lanchesQuery = query(collection(db, "lanches"), where("userId", "==", auth.currentUser.uid));
      const lanchesSnap = await getDocs(lanchesQuery);
      setMeusLanches(lanchesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const pedidosQuery = query(collection(db, "pedidos"), where("vendedorId", "==", auth.currentUser.uid), orderBy("criadoEm", "desc"));
      const pedidosSnap = await getDocs(pedidosQuery);
      const pedidosLista: DocumentoFirestore[] = pedidosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPedidosRecebidos(pedidosLista);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());

      const pedidosHoje = pedidosLista.filter((p) => p.criadoEm?.toDate() >= hoje && p.status === "finalizado").length;
      const pedidosSemana = pedidosLista.filter((p) => p.criadoEm?.toDate() >= inicioSemana && p.status === "finalizado").length;
      const lucroEstimado = pedidosLista.filter((p) => p.status === "finalizado").reduce((sum, p) => sum + p.total, 0);
      setGraficos({ pedidosHoje, pedidosSemana, lucroEstimado });

      const avaliacoesQuery = query(collection(db, "avaliacoes_vendedor"), where("vendedorId", "==", auth.currentUser.uid), orderBy("criadoEm", "desc"));
      const avaliacoesSnap = await getDocs(avaliacoesQuery);
      const listaAvaliacoes: DocumentoFirestore[] = avaliacoesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAvaliacoesRecebidas(listaAvaliacoes);
      const soma = listaAvaliacoes.reduce((acc, av) => acc + av.nota, 0);
      setMediaAvaliacaoVendedor(listaAvaliacoes.length ? soma / listaAvaliacoes.length : 0);
    } catch (error) {
      console.log(error);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDadosUsuario();
    setRefreshing(false);
  };

  function escolherOpcaoImagem() {
    Alert.alert("Foto de Perfil", "De onde você quer pegar a foto?", [
      { text: "Cancelar", style: "cancel" },
      { text: "📷 Tirar Foto (Câmera)", onPress: () => processarImagem("camera") },
      { text: "🖼️ Abrir Galeria", onPress: () => processarImagem("galeria") },
    ]);
  }

  const processarImagem = async (origem: "camera" | "galeria") => {
    if (!auth.currentUser) return;
    try {
      let result;
      const opcoes: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true };
      if (origem === "camera") {
        const permissao = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissao.granted) {
          Alert.alert("Atenção", "Permissão para usar a câmera é necessária");
          return;
        }
        result = await ImagePicker.launchCameraAsync(opcoes);
      } else {
        const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissao.granted) {
          Alert.alert("Atenção", "Permissão para acessar a galeria é necessária");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(opcoes);
      }
      if (!result.canceled && result.assets[0].base64) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("image", result.assets[0].base64);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
        const data = await response.json();
        if (data.success) {
          const downloadUrl = data.data.url;
          const userRef = doc(db, "usuarios", auth.currentUser.uid);
          await updateDoc(userRef, { fotoPerfil: downloadUrl });
          await updateProfile(auth.currentUser, { photoURL: downloadUrl });
          setUserData((prev: any) => ({ ...prev, fotoPerfil: downloadUrl }));
          Alert.alert("Sucesso", "Foto de perfil atualizada!");
        } else {
          Alert.alert("Erro", "Falha ao fazer upload");
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao anexar imagem.");
    } finally {
      setUploadingImage(false);
    }
  };

  async function atualizarPerfil() {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, "usuarios", auth.currentUser.uid);
      await updateDoc(userRef, { nome: userData.nome, telefone: userData.telefone });
      await updateProfile(auth.currentUser, { displayName: userData.nome });
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      setEditando(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o perfil");
    }
  }

  async function alterarSenha() {
    if (!auth.currentUser) return;
    if (novaSenha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }
    if (novaSenha.length < 6) {
      Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (!senhaAtual) {
      Alert.alert("Erro", "Digite sua senha atual");
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, senhaAtual);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, novaSenha);
      Alert.alert("Sucesso", "Senha alterada com sucesso!");
      setShowPasswordModal(false);
      setNovaSenha("");
      setConfirmarSenha("");
      setSenhaAtual("");
    } catch (error: any) {
      if (error.code === "auth/wrong-password") Alert.alert("Erro", "Senha atual incorreta");
      else Alert.alert("Erro", "Não foi possível alterar a senha");
    }
  }

  async function limparPedidosAntigos() {
    if (!auth.currentUser) return;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);
    try {
      const q = query(
        collection(db, "pedidos"),
        where("vendedorId", "==", auth.currentUser.uid),
        where("status", "in", ["homologada", "retirado"]),
        where("criadoEm", "<", dataLimite)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        Alert.alert("Info", "Não há pedidos antigos para remover.");
        return;
      }
      const promises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(promises);
      Alert.alert("Limpeza concluída", `${snapshot.size} pedidos removidos com sucesso.`);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível limpar os pedidos antigos.");
    }
  }

  function confirmarLimpeza() {
    Alert.alert(
      "Limpar pedidos antigos",
      "Esta ação irá remover permanentemente todos os pedidos finalizados com mais de 30 dias.\n\nEsta operação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Limpar", style: "destructive", onPress: limparPedidosAntigos },
      ]
    );
  }

  function handleLogout() {
    Alert.alert("Sair do App", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => signOut(auth).then(() => navigation.replace("Login")).catch(() => Alert.alert("Erro", "Não foi possível sair")),
      },
    ]);
  }

  function formatarData(data: any) {
    if (!data) return "Data não disponível";
    try {
      if (data.toDate) return data.toDate().toLocaleDateString("pt-BR");
      return new Date(data).toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  }

  const isAdmin = useEhVendedor();

  // O vendedor não cancela: só entrega. A lista mostra o que ainda está com ele.
  const pedidosPendentes = pedidosRecebidos.filter((p: any) => ehPedidoPendenteDeEntrega(p.status));

  function rotuloStatusEntrega(status: string) {
    switch (status) {
      case "pago":
        return "💰 Pago · preparar";
      case "homologada":
        return "📦 Pronto para retirada";
      default:
        return "⏳ Aguardando pagamento";
    }
  }

  if (loading)
    return <LoadingState mensagem="Carregando seu perfil..." />;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
      <View style={[styles.header, { paddingTop: insets.top + spacing.xl }]}>
        <View style={styles.halo} pointerEvents="none" />
        <TouchableOpacity onPress={escolherOpcaoImagem} disabled={uploadingImage} activeOpacity={0.8} style={styles.avatarWrapper}>
          {userData.fotoPerfil ? (
            <Image source={{ uri: userData.fotoPerfil }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{userData.nome?.charAt(0).toUpperCase() || "U"}</Text>
            </View>
          )}
          {uploadingImage && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator size="small" color={colors.white} />
            </View>
          )}
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={18} color={colors.primary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.nome}>{userData.nome || "Aluno IFSul"}</Text>
        <Text style={styles.email}>{auth.currentUser?.email}</Text>

        {userData.pontos > 0 && (
          <View style={styles.pontosChip}>
            <Text style={styles.pontosChipTexto}>👑 {userData.pontos} pontos</Text>
          </View>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "perfil" && styles.tabActive]}
          onPress={() => setActiveTab("perfil")}
        >
          <Ionicons name="person-outline" size={22} color={activeTab === "perfil" ? colors.primary : colors.textLight} />
          <Text style={[styles.tabText, activeTab === "perfil" && styles.tabTextActive]}>Perfil</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity
            style={[styles.tab, activeTab === "vendedor" && styles.tabActive]}
            onPress={() => setActiveTab("vendedor")}
          >
            <Ionicons name="storefront-outline" size={22} color={activeTab === "vendedor" ? colors.primary : colors.textLight} />
            <Text style={[styles.tabText, activeTab === "vendedor" && styles.tabTextActive]}>Vendedor</Text>
          </TouchableOpacity>
        )}
      </View>

        {activeTab === "perfil" && (
          <View style={styles.content}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>📋 Informações Pessoais</Text>
                <TouchableOpacity onPress={() => setEditando(!editando)}>
                  <Text style={styles.editButton}>{editando ? "Cancelar" : "Editar"}</Text>
                </TouchableOpacity>
              </View>
              {editando ? (
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                  <ScrollView>
                    <Text style={styles.label}>Nome completo</Text>
                    <TextInput style={styles.input} value={userData.nome} onChangeText={(text) => setUserData({ ...userData, nome: text })} placeholder="Seu nome" />
                    <Text style={styles.label}>Telefone</Text>
                    <TextInput style={styles.input} value={userData.telefone} onChangeText={(text) => setUserData({ ...userData, telefone: text })} keyboardType="phone-pad" placeholder="(00) 00000-0000" />
                    <TouchableOpacity style={styles.saveButton} onPress={atualizarPerfil}>
                      <Text style={styles.saveButtonText}>Salvar alterações</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </KeyboardAvoidingView>
              ) : (
                <View>
                  <View style={styles.infoRow}>
                    <Ionicons name="person" size={20} color={colors.textSecondary} />
                    <Text style={styles.infoLabel}>Nome</Text>
                    <Text style={styles.infoValue}>{userData.nome || "Não informado"}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="call" size={20} color={colors.textSecondary} />
                    <Text style={styles.infoLabel}>Telefone</Text>
                    <Text style={styles.infoValue}>{userData.telefone || "Não informado"}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="mail" size={20} color={colors.textSecondary} />
                    <Text style={styles.infoLabel}>E-mail</Text>
                    <Text style={styles.infoValue}>{auth.currentUser?.email}</Text>
                  </View>
                  <TouchableOpacity style={styles.passwordButton} onPress={() => setShowPasswordModal(true)}>
                    <Ionicons name="lock-closed" size={20} color={colors.primary} />
                    <Text style={styles.passwordButtonText}>Alterar senha</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <LoyaltyCard
              pontos={Number(userData.pontos) || 0}
              onPress={() => navigation.navigate("Fidelidade")}
            />

            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>📊 Sua atividade</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{pedidosRecebidos.length}</Text>
                  <Text style={styles.statLabel}>Compras</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{meusLanches.length}</Text>
                  <Text style={styles.statLabel}>Vendas</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>⭐ {mediaAvaliacaoVendedor.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Avaliação</Text>
                </View>
              </View>
            </View>

            {isAdmin && (
              <View style={styles.adminActionsRow}>
                <TouchableOpacity style={styles.adminActionCard} onPress={() => navigation.navigate("Vendas")} activeOpacity={0.8}>
                  <View style={[styles.adminActionIcon, { backgroundColor: "rgba(255,107,107,0.15)" }]}>
                    <Ionicons name="stats-chart" size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.adminActionTitle}>Vendas</Text>
                  <Text style={styles.adminActionSub}>Painel do vendedor</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.adminActionCard} onPress={confirmarLimpeza} activeOpacity={0.8}>
                  <View style={[styles.adminActionIcon, { backgroundColor: "rgba(108,92,231,0.15)" }]}>
                    <Ionicons name="trash-bin" size={22} color={colors.purple} />
                  </View>
                  <Text style={styles.adminActionTitle}>Limpar</Text>
                  <Text style={styles.adminActionSub}>Pedidos antigos</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
              <Ionicons name="log-out" size={20} color={colors.danger} />
              <Text style={styles.logoutButtonText}>Sair do app</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAdmin && activeTab === "vendedor" && (
          <View style={styles.content}>
            {meusLanches.length === 0 ? (
              <View style={styles.emptyVendorCard}>
                <Text style={styles.emptyIcon}>🍔</Text>
                <Text style={styles.emptyTitle}>Você ainda não é um vendedor</Text>
                <Text style={styles.emptyText}>Comece a vender seus lanches para outros alunos do IFSul!</Text>
                <TouchableOpacity style={styles.startSellingButton} onPress={() => navigation.navigate("CriarLanche")}>
                  <Text style={styles.startSellingText}>+ Criar meu primeiro lanche</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.statsCard}>
                  <Text style={styles.cardTitle}>📈 Desempenho</Text>
                  <View style={styles.metricsContainer}>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricValue}>{graficos.pedidosHoje}</Text>
                      <Text style={styles.metricLabel}>Hoje</Text>
                    </View>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricValue}>{graficos.pedidosSemana}</Text>
                      <Text style={styles.metricLabel}>Semana</Text>
                    </View>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricValue}>R$ {graficos.lucroEstimado}</Text>
                      <Text style={styles.metricLabel}>Lucro</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>🍔 Meus Lanches ({meusLanches.length})</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("CriarLanche")}>
                      <Text style={styles.addButton}>+ Adicionar</Text>
                    </TouchableOpacity>
                  </View>
                  {meusLanches.map((lanche) => (
                    <View key={lanche.id} style={styles.lancheItem}>
                      <FoodImage uri={lanche.imagem} style={styles.lancheImage} radius={borderRadius.md} fallbackIcon="🍔" />
                      <View style={styles.lancheInfo}>
                        <Text style={styles.lancheName}>{lanche.nome}</Text>
                        <Text style={styles.lanchePrice}>R$ {lanche.preco}</Text>
                        <Text style={styles.lancheOrders}>
                          {pedidosRecebidos.filter((p) => p.lanches?.some((l: any) => l.id === lanche.id)).length} pedidos
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.editLancheButton} onPress={() => navigation.navigate("EditarLanche", { lanche })}>
                        <Ionicons name="pencil" size={20} color={colors.info} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>📦 Pedidos Pendentes</Text>
                    <Text style={styles.pendingCount}>{pedidosPendentes.length} para entregar</Text>
                  </View>
                  {pedidosPendentes.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum pedido aguardando entrega 🎉</Text>
                  ) : (
                    pedidosPendentes.slice(0, 5).map((pedido: any) => (
                      <View key={pedido.id} style={styles.pedidoItem}>
                        <View style={styles.pedidoHeader}>
                          <Text style={styles.pedidoId}>Pedido #{pedido.id.slice(-6)}</Text>
                          <Text style={[styles.pedidoStatus, styles.statusPending]}>
                            {rotuloStatusEntrega(pedido.status)}
                          </Text>
                        </View>
                        <Text style={styles.pedidoDate}>{formatarData(pedido.criadoEm)}</Text>
                        <Text style={styles.pedidoTotal}>Total: R$ {pedido.total}</Text>
                        <TouchableOpacity
                          style={styles.entregarButton}
                          onPress={() => navigation.navigate("LerQRCode", {
                            pedidoId: pedido.id,
                            codigoNumerico: pedido.codigoNumerico,
                            acao: pedido.status === "homologada" ? "retirar" : "homologar",
                          })}
                        >
                          <Text style={styles.entregarButtonText}>📷 Entregar pedido</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>⭐ Avaliações dos Clientes</Text>
                  {avaliacoesRecebidas.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhuma avaliação recebida ainda</Text>
                  ) : (
                    avaliacoesRecebidas.slice(0, 5).map((avaliacao, idx) => (
                      <View key={idx} style={styles.avaliacaoItem}>
                        <View style={styles.avaliacaoHeader}>
                          <Text style={styles.avaliacaoStars}>{"★".repeat(Math.floor(avaliacao.nota))}{"☆".repeat(5 - Math.floor(avaliacao.nota))}</Text>
                          <Text style={styles.avaliacaoNota}>{avaliacao.nota.toFixed(1)}</Text>
                        </View>
                        {avaliacao.comentario && <Text style={styles.avaliacaoComentario}>"{avaliacao.comentario}"</Text>}
                        <Text style={styles.avaliacaoDate}>{formatarData(avaliacao.criadoEm)}</Text>
                      </View>
                    ))
                  )}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>

      <BottomNavigation
        abas={abasDoApp(isAdmin)}
        ativa="Perfil"
        onSelect={(key) => navigation.navigate(key)}
      />

      <Modal visible={showPasswordModal} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar senha</Text>
            <View style={styles.modalInputContainer}>
              <Ionicons name="lock-closed" size={20} color={colors.textLight} />
              <TextInput style={styles.modalInput} placeholder="Senha atual" placeholderTextColor={colors.textLight} secureTextEntry value={senhaAtual} onChangeText={setSenhaAtual} />
            </View>
            <View style={styles.modalInputContainer}>
              <Ionicons name="lock-closed" size={20} color={colors.textLight} />
              <TextInput style={styles.modalInput} placeholder="Nova senha" placeholderTextColor={colors.textLight} secureTextEntry value={novaSenha} onChangeText={setNovaSenha} />
            </View>
            <View style={styles.modalInputContainer}>
              <Ionicons name="lock-closed" size={20} color={colors.textLight} />
              <TextInput style={styles.modalInput} placeholder="Confirmar nova senha" placeholderTextColor={colors.textLight} secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowPasswordModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={alterarSenha}>
                <Text style={styles.confirmButtonText}>Alterar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingBottom: spacing.xxl,
    alignItems: "center",
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  halo: {
    position: "absolute",
    top: -30,
    alignSelf: "center",
    width: 320,
    height: 260,
    borderRadius: 160,
    backgroundColor: colors.glow,
  },
  pontosChip: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 5,
    borderRadius: borderRadius.round,
    backgroundColor: "rgba(255,196,0,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,196,0,0.35)",
  },
  pontosChipTexto: { color: colors.secondary, fontSize: 12, fontWeight: "800" },
  avatarWrapper: { position: "relative", marginBottom: spacing.md, overflow: "visible" },
  avatarContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.card, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: colors.borderLight, ...shadows.medium },
  avatarImage: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: colors.primary },
  avatarText: { fontSize: 40, fontWeight: "800", color: colors.primaryText },
  cameraIconContainer: { position: "absolute", bottom: 0, right: 0, backgroundColor: colors.surface, borderRadius: 20, padding: 7, borderWidth: 1, borderColor: colors.border, zIndex: 10 },
  uploadOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 48, justifyContent: "center", alignItems: "center" },
  nome: { ...typography.h2, marginBottom: 2 },
  email: { fontSize: 13, color: colors.textSecondary },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
  },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: spacing.lg, gap: 8, minHeight: 48 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 14, color: colors.textLight },
  tabTextActive: { color: colors.primaryText, fontWeight: "700" },
  content: { padding: spacing.xl, gap: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.small,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.small,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: colors.text },
  editButton: { color: colors.primaryText, fontSize: 14, fontWeight: "500" },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: 15, color: colors.text, backgroundColor: colors.input, minHeight: 48 },
  saveButton: { backgroundColor: colors.primary, padding: 15, borderRadius: borderRadius.round, alignItems: "center", marginTop: spacing.lg, minHeight: 48 },
  saveButtonText: { color: colors.white, fontWeight: "800", fontSize: 15 },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 14, color: colors.textSecondary, flex: 1, marginLeft: spacing.md },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: "600", flex: 2, textAlign: "right" },
  passwordButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surfaceAlt, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, gap: 8, minHeight: 48 },
  passwordButtonText: { color: colors.primaryText, fontSize: 14, fontWeight: "600" },
  statsGrid: { flexDirection: "row", justifyContent: "space-around", marginTop: spacing.md },
  statItem: { alignItems: "center", flex: 1 },
  statNumber: { fontSize: 24, fontWeight: "900", color: colors.primaryText },
  statLabel: { fontSize: 11, color: colors.textLight, marginTop: 4 },
  adminActionsRow: { flexDirection: "row", gap: spacing.md },
  adminActionCard: { flex: 1, backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: "center", minHeight: 88 },
  adminActionIcon: { width: 44, height: 44, borderRadius: borderRadius.md, justifyContent: "center", alignItems: "center", marginBottom: spacing.sm },
  adminActionTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 2 },
  adminActionSub: { fontSize: 11, color: colors.textLight, textAlign: "center" },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "transparent", borderWidth: 1, borderColor: colors.danger, padding: 15, borderRadius: borderRadius.round, gap: 10, minHeight: 48 },
  logoutButtonText: { color: colors.danger, fontSize: 15, fontWeight: "700" },
  emptyVendorCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xxl, alignItems: "center" },
  emptyIcon: { fontSize: 56, marginBottom: spacing.lg },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: spacing.sm, textAlign: "center" },
  emptyText: { fontSize: 13, color: colors.textLight, textAlign: "center", marginBottom: spacing.lg, lineHeight: 19 },
  startSellingButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: 14, borderRadius: borderRadius.round, minHeight: 48, justifyContent: "center" },
  startSellingText: { color: colors.white, fontWeight: "700" },
  metricsContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md, gap: spacing.sm },
  metricCard: { flex: 1, alignItems: "center", backgroundColor: colors.input, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  metricValue: { fontSize: 18, fontWeight: "800", color: colors.primaryText },
  metricLabel: { fontSize: 11, color: colors.textLight, marginTop: 5 },
  addButton: { color: colors.primaryText, fontWeight: "700" },
  lancheItem: { flexDirection: "row", marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  lancheImage: { width: 60, height: 60, borderRadius: borderRadius.md },
  lancheInfo: { flex: 1, marginLeft: spacing.md },
  lancheName: { fontSize: 15, fontWeight: "600", color: colors.text },
  lanchePrice: { fontSize: 14, color: colors.primaryText, marginTop: 4, fontWeight: "700" },
  lancheOrders: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  editLancheButton: { justifyContent: "center", paddingHorizontal: spacing.md },
  pedidoItem: { marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  pedidoHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  pedidoId: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
  pedidoStatus: { fontSize: 12, fontWeight: "600" },
  statusSuccess: { color: colors.success },
  statusPending: { color: colors.warning },
  pedidoDate: { fontSize: 12, color: colors.textLight, marginBottom: 5 },
  pedidoTotal: { fontSize: 14, fontWeight: "700", color: colors.text },
  pendingCount: { fontSize: 12, color: colors.warning, fontWeight: "700" },
  entregarButton: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginTop: spacing.sm, gap: 6, paddingVertical: 10, paddingHorizontal: spacing.lg, backgroundColor: colors.primary, borderRadius: borderRadius.round, minHeight: 40 },
  entregarButtonText: { fontSize: 13, color: colors.white, fontWeight: "700" },
  avaliacaoItem: { marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  avaliacaoHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  avaliacaoStars: { fontSize: 15, color: colors.secondary },
  avaliacaoNota: { fontSize: 13, fontWeight: "700", color: colors.secondary },
  avaliacaoComentario: { fontSize: 13, color: colors.textSecondary, marginBottom: 5, fontStyle: "italic" },
  avaliacaoDate: { fontSize: 11, color: colors.textLight },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.overlay },
  modalContent: { backgroundColor: colors.card, borderRadius: borderRadius.xxl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: "90%", ...shadows.large },
  modalTitle: { ...typography.h2, marginBottom: spacing.lg, textAlign: "center" },
  modalInputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.input, minHeight: 48 },
  modalInput: { flex: 1, paddingVertical: spacing.md, fontSize: 15, color: colors.text },
  modalButtons: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  modalButton: { flex: 1, padding: 14, borderRadius: borderRadius.round, alignItems: "center", minHeight: 48 },
  cancelButton: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  cancelButtonText: { color: colors.textSecondary, fontWeight: "600" },
  confirmButton: { backgroundColor: colors.primary },
  confirmButtonText: { color: colors.white, fontWeight: "700" },
});