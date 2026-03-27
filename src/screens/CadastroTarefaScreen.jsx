import { useState } from 'react';
import {
  Alert, Image,
  ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { ICONES_LISTA } from '../assets/icons/icones';
import BotaoAcessivel from '../components/BotaoAcessivel';
import BotaoVoltar from '../components/BotaoVoltar';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import db from '../database/database';

const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function CadastroTarefaScreen({ idUsuario, tarefaExistente, onSalvar, onVoltar }) {
  const editando = !!tarefaExistente;

  const [titulo, setTitulo] = useState(tarefaExistente?.titulo || '');
  const [subtitulo, setSubtitulo] = useState(tarefaExistente?.subtitulo_instrucao || '');
  const [horario, setHorario] = useState(tarefaExistente?.horario_programado || '08:00');
  const [icone, setIcone] = useState(tarefaExistente?.icone_tipo || 'remedio');
  const [descricao, setDescricao] = useState(tarefaExistente?.descricao || '');
  const [diasSelecionados, setDiasSelecionados] = useState(
    tarefaExistente?.frequencia_dias
      ? tarefaExistente.frequencia_dias.split('').map(Number)
      : [0,0,0,0,0,0,]
  );

  const formularioValido = titulo.trim().length > 0 && horario.trim().length > 0;

  function toggleDia(index) {
    const novos = [...diasSelecionados];
    novos[index] = novos[index] === 1 ? 0 : 1;
    setDiasSelecionados(novos);
  }

  function salvar() {
    if (diasSelecionados.every(d => d === 0)) {
      Alert.alert('Atenção', 'Selecione pelo menos um dia da semana.');
      return;
    }
    if (editando) {
      db.runSync(
        `UPDATE medicamento SET titulo=?, subtitulo_instrucao=?, horario_programado=?, icone_tipo=?, frequencia_dias=?
         WHERE id_medicamento=?`,
        [titulo.trim(), subtitulo.trim(), horario.trim(), icone, diasSelecionados.join(''), tarefaExistente.id_medicamento]
      );
    } else {
      db.runSync(
        `INSERT INTO medicamento (id_usuario, titulo, subtitulo_instrucao, horario_programado, icone_tipo, frequencia_dias, ativo)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [idUsuario, titulo.trim(), subtitulo.trim(), horario.trim(), icone, diasSelecionados.join('')]
      );
    }
    onSalvar();
  }

  return (
    <ScrollView style={styles.container}>
      <BotaoVoltar onPress={onVoltar} />

      <Text style={styles.titulo}>{editando ? 'Editar Tarefa' : 'Nova Tarefa'}</Text>

      <Text style={styles.secao}>Ícone</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconesList}>
        {ICONES_LISTA.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[styles.iconeOpcao, icone === item.key && styles.iconeSelecionado]}
            onPress={() => setIcone(item.key)}
          >
            {item.imagem ? (
              <Image source={item.imagem} style={styles.iconeImagem} />
            ) : (
              <Text style={styles.iconeEmoji}>{item.emoji}</Text>
            )}
            <Text style={styles.iconeLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.secao}>Adicione o Título da Tarefa</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Remédio da manhã"
        placeholderTextColor={COLORS.textMuted}
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={styles.secao}>Instrução rápida</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Antes da manhã"
        placeholderTextColor={COLORS.textMuted}
        value={subtitulo}
        onChangeText={setSubtitulo}
      />

      <Text style={styles.secao}>Horário</Text>
      <TextInput
        style={styles.input}
        placeholder="08:00"
        placeholderTextColor={COLORS.textMuted}
        value={horario}
        onChangeText={setHorario}
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.secao}>Dias da semana</Text>
      <View style={styles.diasContainer}>
        {DIAS.map((dia, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dia, diasSelecionados[index] === 1 && styles.diaSelecionado]}
            onPress={() => toggleDia(index)}
          >
            <Text style={[styles.diaTexto, diasSelecionados[index] === 1 && styles.diaTextoSelecionado]}>
              {dia}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.secao}>Descrição detalhada</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Detalhes adicionais sobre esta tarefa..."
        placeholderTextColor={COLORS.textMuted}
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={4}
      />

      <BotaoAcessivel
        titulo={editando ? 'Salvar alterações' : 'Salvar'}
        onPress={salvar}
        desabilitado={!formularioValido}
        style={{ marginTop: SPACING.lg }}
      />

      <View style={{ height: 57 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  titulo: { fontSize: FONTS.title, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  secao: { fontSize: FONTS.medium, fontWeight: '700', color: COLORS.textSecondary, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONTS.large,
    color: COLORS.textPrimary,
    borderWidth: 2,
    borderColor: COLORS.border,
    minHeight: 56,
  },
  inputMultiline: { height: 120, textAlignVertical: 'top' },
  iconesList: { marginBottom: 4 },
  iconeOpcao: {
    alignItems: 'center',
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    width: 110,
    height: 110,
    justifyContent: 'center',
  },
  iconeSelecionado: { borderColor: COLORS.primary, backgroundColor: '#eef0ff' },
  iconeEmoji: { fontSize: 40 },
  iconeImagem: { width: 48, height: 48, resizeMode: 'contain' },
  iconeLabel: { fontSize: FONTS.small, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' },
  diasContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  dia: {
    width: 41,
    height: 41,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diaSelecionado: { backgroundColor: COLORS.primary },
  diaTexto: { fontWeight: 'bold', color: COLORS.textSecondary, fontSize: FONTS.medium },
  diaTextoSelecionado: { color: COLORS.white },
});
