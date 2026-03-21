import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import db from '../database/database';
import BotaoVoltar from '../components/BotaoVoltar';
import BotaoAcessivel from '../components/BotaoAcessivel';
import { COLORS, FONTS, SPACING, MIN_TOUCH } from '../constants/theme';

export default function MudarPerfilScreen({ idUsuarioAtivo, onSelecionar, onVoltar, onEditarPerfil }) {
  const [perfis, setPerfis] = useState([]);

  useEffect(() => {
    carregarPerfis();
  }, []);

  function carregarPerfis() {
    const lista = db.getAllSync('SELECT * FROM perfil_usuario ORDER BY created_at ASC');
    setPerfis(lista);
  }

  function excluirPerfil(perfil) {
    if (perfis.length === 1) {
      Alert.alert('Atenção', 'Não é possível excluir o único perfil cadastrado.');
      return;
    }
    Alert.alert(
      'Excluir perfil',
      `Deseja excluir o perfil de ${perfil.name}? Todas as tarefas e histórico serão perdidos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const tarefas = db.getAllSync('SELECT id_medicamento FROM medicamento WHERE id_usuario = ?', [perfil.id_usuario]);
            tarefas.forEach(t => {
              db.runSync('DELETE FROM historico_uso WHERE id_medicamento = ?', [t.id_medicamento]);
            });
            db.runSync('DELETE FROM medicamento WHERE id_usuario = ?', [perfil.id_usuario]);
            db.runSync('DELETE FROM perfil_usuario WHERE id_usuario = ?', [perfil.id_usuario]);
            if (perfil.id_usuario === idUsuarioAtivo) {
              const outro = db.getFirstSync('SELECT id_usuario FROM perfil_usuario LIMIT 1');
              onSelecionar(outro.id_usuario);
            } else {
              carregarPerfis();
            }
          }
        }
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <BotaoVoltar onPress={onVoltar} />

      <Text style={styles.titulo}>Selecionar Perfil</Text>
      <Text style={styles.subtitulo}>Escolha o perfil que deseja gerenciar</Text>

      {perfis.map(perfil => (
        <TouchableOpacity
          key={perfil.id_usuario}
          style={[styles.card, perfil.id_usuario === idUsuarioAtivo && styles.cardAtivo]}
          onPress={() => onSelecionar(perfil.id_usuario)}
          activeOpacity={0.7}
        >
          <View style={styles.cardConteudo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>
                {perfil.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{perfil.name}</Text>
              <Text style={styles.cardIdade}>{perfil.idade} anos</Text>
              {perfil.descricao ? <Text style={styles.cardDescricao}>{perfil.descricao}</Text> : null}
            </View>
            {perfil.id_usuario === idUsuarioAtivo && (
              <Text style={styles.ativo}>✓ Ativo</Text>
            )}
          </View>
          <View style={styles.acoes}>
            <TouchableOpacity
              style={styles.botaoAcao}
              onPress={() => onEditarPerfil(perfil.id_usuario)}
            >
              <Text style={styles.botaoAcaoTexto}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botaoAcao}
              onPress={() => excluirPerfil(perfil)}
            >
              <Text style={styles.botaoAcaoTexto}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.divisor} />

      <BotaoAcessivel
        titulo="+ Adicionar novo perfil"
        onPress={() => onSelecionar('novo')}
        variante="secundario"
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  titulo: { fontSize: FONTS.title, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitulo: { fontSize: FONTS.medium, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    minHeight: MIN_TOUCH + 16,
  },
  cardAtivo: { borderColor: COLORS.primary, backgroundColor: '#eef0ff' },
  cardConteudo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarTexto: { fontSize: FONTS.xlarge, color: COLORS.white, fontWeight: 'bold' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: FONTS.large, fontWeight: 'bold', color: COLORS.textPrimary },
  cardIdade: { fontSize: FONTS.medium, color: COLORS.textSecondary, marginTop: 2 },
  cardDescricao: { fontSize: FONTS.small, color: COLORS.textMuted, marginTop: 4 },
  ativo: { fontSize: FONTS.small, color: COLORS.primary, fontWeight: 'bold' },
  acoes: { flexDirection: 'row', justifyContent: 'flex-end' },
  botaoAcao: { padding: SPACING.sm, minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: SPACING.md },
  botaoAcaoTexto: { fontSize: 24 },
  divisor: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
});
