import { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ICONES } from '../assets/icons/icones';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import db from '../database/database';

const PERIODOS = [
  { label: 'Pela Manhã', inicio: 5, fim: 11 },
  { label: 'Pela Tarde', inicio: 12, fim: 17 },
  { label: 'Pela Noite', inicio: 18, fim: 23 },
];

export default function HomeScreen({ idUsuario, onAddTarefa, onEditTarefa, onMudarPerfil, onHistorico, onEditarPerfil }) {
  const [tarefas, setTarefas] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [menuTarefa, setMenuTarefa] = useState(null);

  useEffect(() => {
    carregarDados();
  }, [idUsuario]);

  function carregarDados() {
    const p = db.getFirstSync('SELECT * FROM perfil_usuario WHERE id_usuario = ?', [idUsuario]);
    setPerfil(p);
    const hoje = new Date().toISOString().split('T')[0];
    const diaSemana = new Date().getDay();
    const t = db.getAllSync(
      `SELECT m.*, 
        (SELECT status FROM historico_uso h 
         WHERE h.id_medicamento = m.id_medicamento 
         AND h.data_execucao = ? LIMIT 1) as status_hoje
       FROM medicamento m 
       WHERE m.id_usuario = ? AND m.ativo = 1`,
      [hoje, idUsuario]
    ).filter(t => {
      const freq = t.frequencia_dias || '1111111';
      return freq[diaSemana] === '1';
    });
    setTarefas(t);
  }

  function marcarStatus(idMedicamento, novoStatus) {
    const hoje = new Date().toISOString().split('T')[0];
    const agora = new Date().toTimeString().slice(0, 5);
    const existe = db.getFirstSync(
      'SELECT id_registro FROM historico_uso WHERE id_medicamento = ? AND data_execucao = ?',
      [idMedicamento, hoje]
    );
    if (existe) {
      db.runSync(
        'UPDATE historico_uso SET status = ?, horario_confirmacao = ? WHERE id_registro = ?',
        [novoStatus, agora, existe.id_registro]
      );
    } else {
      db.runSync(
        'INSERT INTO historico_uso (id_medicamento, data_execucao, status, horario_confirmacao) VALUES (?, ?, ?, ?)',
        [idMedicamento, hoje, novoStatus, agora]
      );
    }
    carregarDados();
  }

  function excluirTarefa(idMedicamento) {
    Alert.alert(
      'Excluir tarefa',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            db.runSync('DELETE FROM historico_uso WHERE id_medicamento = ?', [idMedicamento]);
            db.runSync('DELETE FROM medicamento WHERE id_medicamento = ?', [idMedicamento]);
            setMenuTarefa(null);
            carregarDados();
          }
        }
      ]
    );
  }

  function getTarefasPorPeriodo(inicio, fim) {
    return tarefas.filter(t => {
      const hora = parseInt(t.horario_programado?.split(':')[0] || '0');
      return hora >= inicio && hora <= fim;
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerEsq}>
          <View style={styles.avatarPequeno}>
            <TouchableOpacity 
            style={styles.headerEsq} 
            onPress={onEditarPerfil} 
            activeOpacity={0.7}
          >
            <Text style={styles.avatarPequenoTexto}>👤</Text>
          </TouchableOpacity>
          </View>
          <Text style={styles.saudacao}>Olá, {perfil?.name}</Text>
        </View>
        <View style={styles.headerDir}>
          <TouchableOpacity style={styles.botaoIcone} onPress={onHistorico}>
            <Text style={styles.botaoIconeTexto}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botaoMudar} onPress={onMudarPerfil}>
            <Text style={styles.botaoMudarTexto}>Mudar Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de tarefas */}
      {PERIODOS.map(periodo => {
        const lista = getTarefasPorPeriodo(periodo.inicio, periodo.fim);
        if (lista.length === 0) return null;
        return (
          <View key={periodo.label}>
            <Text style={styles.periodoTitulo}>{periodo.label}</Text>
            {lista.map(tarefa => {
              const icone = ICONES[tarefa.icone_tipo] || ICONES.remedio;
              const feito = tarefa.status_hoje === 'feito';
              return (
                <View key={tarefa.id_medicamento} style={[styles.card, feito && styles.cardFeito]}>
                  <View style={styles.cardTopo}>
                    {icone.imagem ? (
                      <Image source={icone.imagem} style={styles.cardIconeImagem} />
                    ) : (
                      <Text style={styles.cardEmoji}>{icone.emoji}</Text>
                    )}
                    <View style={styles.cardTextos}>
                      <Text style={styles.cardTitulo}>{tarefa.titulo}</Text>
                      <Text style={styles.cardSubtitulo}>{tarefa.subtitulo_instrucao}</Text>
                      <Text style={styles.cardHorario}>{tarefa.horario_programado}</Text>
                    </View>
                    <TouchableOpacity style={styles.menuBotao} onPress={() => setMenuTarefa(tarefa)}>
                      <Text style={styles.menuPontos}>⋮</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[styles.botaoStatus, feito && styles.botaoFeito]}
                    onPress={() => marcarStatus(tarefa.id_medicamento, feito ? 'pendente' : 'feito')}
                  >
                    <Text style={styles.botaoStatusTexto}>
                      {feito ? 'Feito! ✓' : 'Não realizada!'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        );
      })}

      {/* Tela vazia */}
      {tarefas.length === 0 && (
        <View style={styles.vazio}>
          <Text style={styles.vazioTitulo}>Nenhuma tarefa para hoje!</Text>
          <Text style={styles.vazioSub}>Toque em <Text style={styles.vazioPlus}>+</Text> para adicionar um lembrete</Text>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onAddTarefa}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <View style={{ height: 80 }} />

      {/* Modal menu */}
      <Modal
        visible={!!menuTarefa}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuTarefa(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuTarefa(null)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalData}>Hoje</Text>
            <TouchableOpacity
              style={styles.modalOpcao}
              onPress={() => { setMenuTarefa(null); onEditTarefa(menuTarefa); }}
            >
              <Text style={styles.modalOpcaoTexto}>✏️ Editar tarefa</Text>
            </TouchableOpacity>
            <View style={styles.modalDivisor} />
            <TouchableOpacity
              style={styles.modalOpcao}
              onPress={() => excluirTarefa(menuTarefa?.id_medicamento)}
            >
              <Text style={[styles.modalOpcaoTexto, styles.modalExcluir]}>🗑️ Excluir Tarefa</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  conteudo: { paddingBottom: 80 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 48,
    paddingBottom: SPACING.md,
  },
  headerEsq: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarPequeno: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  avatarPequenoTexto: { fontSize: 20 },
  saudacao: { fontSize: FONTS.large, fontWeight: 'bold', color: COLORS.textPrimary },
  headerDir: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botaoIcone: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoIconeTexto: { fontSize: 18 },
  botaoMudar: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  botaoMudarTexto: { color: COLORS.white, fontSize: FONTS.medium, fontWeight: 'bold' },
  periodoTitulo: { fontSize: FONTS.medium, fontWeight: 'bold', color: COLORS.textSecondary, paddingHorizontal: SPACING.lg, paddingVertical: 8 },
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  cardFeito: { borderColor: COLORS.primary, backgroundColor: '#f0f4ff' },
  cardTopo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardEmoji: { fontSize: 40, marginRight: 12 },
  cardIconeImagem: { width: 40, height: 40, resizeMode: 'contain', marginRight: 12 },
  cardTextos: { flex: 1 },
  cardTitulo: { fontSize: FONTS.large, fontWeight: 'bold', color: COLORS.textPrimary },
  cardSubtitulo: { fontSize: FONTS.medium, color: COLORS.textSecondary, marginTop: 2 },
  cardHorario: { fontSize: FONTS.medium, fontWeight: '600', color: COLORS.primary, marginTop: 4 },
  menuBotao: { padding: 8 },
  menuPontos: { fontSize: 24, color: COLORS.primary, fontWeight: 'bold' },
  botaoStatus: { backgroundColor: COLORS.border, borderRadius: 8, padding: 12, alignItems: 'center' },
  botaoFeito: { backgroundColor: COLORS.primary },
  botaoStatusTexto: { color: COLORS.white, fontWeight: 'bold', fontSize: FONTS.medium },
  vazio: { alignItems: 'center', marginTop: 80, paddingHorizontal: SPACING.lg },
  vazioTitulo: { fontSize: FONTS.xlarge, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: SPACING.sm },
  vazioSub: { fontSize: FONTS.large, color: COLORS.textSecondary, textAlign: 'center' },
  vazioPlus: { color: COLORS.primary, fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabTexto: { color: COLORS.white, fontSize: 32, lineHeight: 36 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: COLORS.white, borderRadius: 16, width: 292, elevation: 8, overflow: 'hidden' },
  modalData: { fontSize: FONTS.small, fontWeight: 'bold', color: COLORS.textMuted, padding: SPACING.md, paddingBottom: 8 },
  modalDivisor: { height: 1, backgroundColor: COLORS.surface },
  modalOpcao: { padding: SPACING.lg },
  modalOpcaoTexto: { fontSize: FONTS.large, color: COLORS.textPrimary },
  modalExcluir: { color: COLORS.danger },
});
