import { Modak_400Regular, useFonts } from '@expo-google-fonts/modak';
import { useState } from 'react';
import {
  Alert, Image,
  ScrollView,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import BotaoAcessivel from '../components/BotaoAcessivel';
import BotaoVoltar from '../components/BotaoVoltar';
import { COLORS, FONTS, MIN_TOUCH, SPACING } from '../constants/theme';
import db from '../database/database';

export default function CadastroScreen({ onCadastro, onVoltar, primeroAcesso = true }) {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [descricao, setDescricao] = useState('');

  const [fontLoaded] = useFonts({ Modak_400Regular });
  if (!fontLoaded) return null;

  const formularioValido = nome.trim().length > 0 && idade.trim().length > 0;

  function salvar() {
    if (nome.trim().length < 2) {
      Alert.alert('Nome inválido', 'Por favor, informe um nome com pelo menos 2 letras.');
      return;
    }
    const idadeNum = parseInt(idade);
    if (isNaN(idadeNum) || idadeNum < 1 || idadeNum > 120) {
      Alert.alert('Idade inválida', 'Por favor, informe uma idade válida entre 1 e 120 anos.');
      return;
    }
    db.runSync(
      'INSERT INTO perfil_usuario (name, idade, descricao) VALUES (?, ?, ?)',
      [nome.trim(), idade.trim(), descricao.trim()]
    );
    const novo = db.getFirstSync('SELECT id_usuario FROM perfil_usuario ORDER BY id_usuario DESC LIMIT 1');
    onCadastro(novo.id_usuario);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      {!primeroAcesso && <BotaoVoltar onPress={onVoltar} />}

      {primeroAcesso && (
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logoIcone}
          />
          <View style={styles.logoTextoContainer}>
            <Text style={styles.logoTo}>Tô </Text>
            <Text style={styles.logoLembrado}>Lembrado</Text>
          </View>
        </View>
      )}

      {primeroAcesso ? (
        <>
          <Text style={styles.tituloPrimeiro}>Olá! Vamos Começar?</Text>
          <Text style={styles.subtituloPrimeiro}>Cadastre o primeiro perfil para continuar</Text>
        </>
      ) : (
        <Text style={styles.titulo}>Novo Perfil</Text>
      )}

      <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.8}>
        <View style={styles.avatar}>
          {nome.trim().length > 0 ? (
            <Text style={styles.avatarLetra}>{nome.charAt(0).toUpperCase()}</Text>
          ) : (
            <Text style={styles.avatarQuestao}>?</Text>
          )}
        </View>
        <Text style={styles.avatarDica}>Adicionar foto de perfil?</Text>
      </TouchableOpacity>

      <Text style={styles.secao}>Nome <Text style={styles.obrigatorio}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do idoso ou usuário"
        placeholderTextColor={COLORS.textMuted}
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
      />

      <Text style={styles.secao}>Idade <Text style={styles.obrigatorio}>*</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="Idade do idoso ou usuário"
        placeholderTextColor={COLORS.textMuted}
        keyboardType="numeric"
        value={idade}
        onChangeText={setIdade}
        maxLength={3}
      />

      <Text style={styles.secao}>Descrição rápida</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Ex: Gosta de caminhadas pela manhã..."
        placeholderTextColor={COLORS.textMuted}
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.camposObrigatorios}>* Campos Obrigatórios</Text>

      <BotaoAcessivel
        titulo={primeroAcesso ? 'Salvar e Continuar' : 'Salvar'}
        onPress={salvar}
        desabilitado={!formularioValido}
        style={{ marginTop: SPACING.lg }}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  conteudo: { padding: SPACING.lg },
  logoContainer: { alignItems: 'center', marginTop: SPACING.lg, marginBottom: SPACING.md },
  logoIcone: { width: 80, height: 80, resizeMode: 'contain' },
  logoTextoContainer: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs },
  logoTo: { fontSize: FONTS.xlarge, fontFamily: 'Modak_400Regular', color: '#1A3CFF' },
  logoLembrado: { fontSize: FONTS.xlarge, fontFamily: 'Modak_400Regular', color: '#FF7474' },
  tituloPrimeiro: { fontSize: FONTS.title, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: SPACING.xs },
  subtituloPrimeiro: { fontSize: FONTS.medium, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.md },
  titulo: { fontSize: FONTS.title, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  avatarContainer: { alignItems: 'center', marginBottom: SPACING.lg },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  avatarLetra: { fontSize: 48, color: COLORS.white, fontWeight: 'bold' },
  avatarQuestao: { fontSize: 48, color: COLORS.white, fontWeight: 'bold' },
  avatarDica: { fontSize: FONTS.medium, color: COLORS.textSecondary },
  secao: { fontSize: FONTS.medium, fontWeight: '700', color: COLORS.textSecondary, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  obrigatorio: { color: COLORS.danger },
  camposObrigatorios: { fontSize: FONTS.small, color: COLORS.danger, marginTop: SPACING.md },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONTS.large,
    color: COLORS.textPrimary,
    borderWidth: 2,
    borderColor: COLORS.border,
    minHeight: MIN_TOUCH,
  },
  inputMultiline: { height: 136, textAlignVertical: 'top' },
});
