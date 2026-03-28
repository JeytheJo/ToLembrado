import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BotaoAcessivel from '../components/BotaoAcessivel';
import BotaoVoltar from '../components/BotaoVoltar';
import { COLORS, FONTS, MIN_TOUCH, SPACING } from '../constants/theme';
import db from '../database/database';

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
          {/* Linha superior — avatar + info + ativo */}
          <View style={styles.cardTopo}>
            <View style={styles.avatar}>
              {perfil.foto_path ? (
                <Image source={{ uri: perfil.foto_path }} style={styles.avatarFoto} />
              ) : (
                <Text style={styles.avatarTexto}>{perfil.name.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{perfil.name}</Text>
              <Text style={styles.cardIdade}>{perfil.idade} Anos</Text>
            </View>
            {perfil.id_usuario === idUsuarioAtivo && (
              <View style={styles.ativoBadge}>
                <Text style={styles.ativoTexto}>✓ Ativo</Text>
              </View>
            )}
          </View>

          {/* Linha inferior — botões editar e excluir */}
          <View style={styles.cardAcoes}>
            <TouchableOpacity
              style={styles.botaoAcao}
              onPress={() => onEditarPerfil(perfil.id_usuario)}
            >
              <Text style={styles.botaoAcaoTexto}>✏️ Editar</Text>
            </TouchableOpacity>
            <View style={styles.acoesDivisor} />
            <TouchableOpacity
              style={styles.botaoAcao}
              onPress={() => excluirPerfil(perfil)}
            >
              <Text style={[styles.botaoAcaoTexto, styles.botaoExcluirTexto]}>🗑️ Excluir</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.divisor} />

      <BotaoAcessivel
        titulo="+ Adicionar Novo Perfil"
        onPress={() => onSelecionar('novo')}
        variante="secundario"
        style={{ marginHorizontal: SPACING.lg }}
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
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardAtivo: { borderColor: COLORS.primary, backgroundColor: '#eef0ff' },
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
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
  ativoBadge: { paddingHorizontal: SPACING.sm },
  ativoTexto: { fontSize: FONTS.medium, color: COLORS.primary, fontWeight: 'bold' },
  cardAcoes: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.xs,
  },
  botaoAcao: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
  },
  acoesDivisor: { width: 1, backgroundColor: COLORS.border },
  botaoAcaoTexto: { fontSize: FONTS.large, color: COLORS.primary, fontWeight: '600' },
  botaoExcluirTexto: { color: COLORS.danger },
  divisor: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },

  avatarFoto: { width: 56, height: 56, borderRadius: 28 },

});
