import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  StyleSheet, Alert, TouchableOpacity
} from 'react-native';
import db from '../database/database';
import BotaoVoltar from '../components/BotaoVoltar';
import BotaoAcessivel from '../components/BotaoAcessivel';
import { COLORS, FONTS, SPACING, MIN_TOUCH } from '../constants/theme';

export default function EditarPerfilScreen({ idUsuario, onSalvar, onVoltar }) {
  const perfil = db.getFirstSync('SELECT * FROM perfil_usuario WHERE id_usuario = ?', [idUsuario]);

  const [nome, setNome] = useState(perfil?.name || '');
  const [idade, setIdade] = useState(perfil?.idade || '');
  const [descricao, setDescricao] = useState(perfil?.descricao || '');
  const [observacoes, setObservacoes] = useState(perfil?.observacoes_gerais || '');

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
      `UPDATE perfil_usuario SET name=?, idade=?, descricao=?, observacoes_gerais=? WHERE id_usuario=?`,
      [nome.trim(), idade.trim(), descricao.trim(), observacoes.trim(), idUsuario]
    );
    Alert.alert('Sucesso!', 'Perfil atualizado com sucesso.', [
      { text: 'OK', onPress: onSalvar }
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <BotaoVoltar onPress={onVoltar} />

      <Text style={styles.titulo}>Editar Perfil</Text>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>
            {nome.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.avatarDica}>Foto de perfil em breve</Text>
      </View>

      <Text style={styles.secao}>Nome</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do idoso"
        placeholderTextColor={COLORS.textMuted}
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
      />

      <Text style={styles.secao}>Idade</Text>
      <TextInput
        style={styles.input}
        placeholder="Idade"
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

      <Text style={styles.secao}>Observações gerais</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Ex: Alérgico a dipirona, usa marca-passo..."
        placeholderTextColor={COLORS.textMuted}
        value={observacoes}
        onChangeText={setObservacoes}
        multiline
        numberOfLines={4}
      />

      <BotaoAcessivel
        titulo="Salvar alterações"
        onPress={salvar}
        desabilitado={!formularioValido}
        style={{ marginTop: SPACING.lg }}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  titulo: { fontSize: FONTS.title, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  avatarContainer: { alignItems: 'center', marginBottom: SPACING.lg },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarTexto: { fontSize: 48, color: COLORS.white, fontWeight: 'bold' },
  avatarDica: { fontSize: FONTS.small, color: COLORS.textMuted },
  secao: { fontSize: FONTS.medium, fontWeight: '700', color: COLORS.textSecondary, marginTop: SPACING.lg, marginBottom: SPACING.sm },
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
  inputMultiline: { height: 100, textAlignVertical: 'top' },
});
