import { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ICONES } from '../assets/icons/icones';
import { COLORS } from '../constants/theme';
import db from '../database/database';

const PERIODOS = [
  { label: 'Pela Manhã', inicio: 5, fim: 11 },
  { label: 'Pela Tarde', inicio: 12, fim: 17 },
  { label: 'Pela Noite', inicio: 18, fim: 23 },
];

export default function HomeScreen({ idUsuario, onAddTarefa, onEditTarefa, onMudarPerfil, onHistorico }) {
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.saudacao}>Olá, {perfil?.name} 👋</Text>
        <View style={styles.headerBotoes}>
          <TouchableOpacity style={styles.botaoSecundario} onPress={onHistorico}>
            <Text style={styles.botaoSecundarioTexto}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botaoMudar} onPress={onMudarPerfil}>
            <Text style={styles.botaoMudarTexto}>Mudar Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

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
                    <TouchableOpacity
                      style={styles.menuBotao}
                      onPress={() => setMenuTarefa(tarefa)}
                    >
                      <Text style={styles.menuPontos}>⋮</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[styles.botaoStatus, feito && styles.botaoFeito]}
                    onPress={() => marcarStatus(tarefa.id_medicamento, feito ? 'pendente' : 'feito')}
                  >
                    <Text style={styles.botaoStatusTexto}>
                      {feito ? 'Feito! ✓' : 'Não Realizado'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        );
      })}

      {tarefas.length === 0 && (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>Nenhuma tarefa para hoje!</Text>
          <Text style={styles.vazioSub}>Toque em + para adicionar</Text>
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={onAddTarefa}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <View style={{ height: 80 }} />

      {/* Menu de opções da tarefa */}
      <Modal
        visible={!!menuTarefa}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuTarefa(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuTarefa(null)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>{menuTarefa?.titulo}</Text>
            <TouchableOpacity
              style={styles.modalOpcao}
              onPress={() => {
                setMenuTarefa(null);
                onEditTarefa(menuTarefa);
              }}
            >
              <Text style={styles.modalOpcaoTexto}>✏️ Editar tarefa</Text>
            </TouchableOpacity>
            <View style={styles.modalDivisor} />
            <TouchableOpacity
              style={styles.modalOpcao}
              onPress={() => excluirTarefa(menuTarefa?.id_medicamento)}
            >
              <Text style={[styles.modalOpcaoTexto, styles.modalExcluir]}>🗑️ Excluir tarefa</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 48 },
  saudacao: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  botaoMudar: { backgroundColor: '#1a3cff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  botaoMudarTexto: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  periodoTitulo: { fontSize: 15, fontWeight: 'bold', color: '#555', paddingHorizontal: 20, paddingVertical: 8 },
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', padding: 16 },
  cardFeito: { borderColor: '#1a3cff', backgroundColor: '#f0f4ff' },
  cardTopo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardEmoji: { fontSize: 36, marginRight: 12 },
  cardTextos: { flex: 1 },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  cardSubtitulo: { fontSize: 13, color: '#666', marginTop: 2 },
  cardHorario: { fontSize: 14, fontWeight: '600', color: '#1a3cff', marginTop: 4 },
  menuBotao: { padding: 8 },
  menuPontos: { fontSize: 22, color: '#1a3cff', fontWeight: 'bold' },
  botaoStatus: { backgroundColor: '#e0e0e0', borderRadius: 8, padding: 10, alignItems: 'center' },
  botaoFeito: { backgroundColor: '#1a3cff' },
  botaoStatusTexto: { color: '#fff', fontWeight: 'bold' },
  vazio: { alignItems: 'center', marginTop: 80 },
  vazioTexto: { fontSize: 18, fontWeight: 'bold', color: '#555' },
  vazioSub: { fontSize: 14, color: '#aaa', marginTop: 8 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1a3cff', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabTexto: { color: '#fff', fontSize: 32, lineHeight: 36 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 8, width: 260, elevation: 8 },
  modalTitulo: { fontSize: 14, fontWeight: 'bold', color: '#888', padding: 12, paddingBottom: 8 },
  modalDivisor: { height: 1, backgroundColor: '#f0f0f0' },
  modalOpcao: { padding: 16 },
  modalOpcaoTexto: { fontSize: 16, color: '#222' },
  modalExcluir: { color: '#e53935' },
  headerBotoes: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botaoSecundario: { backgroundColor: COLORS.surface, borderRadius: 8, padding: 10, borderWidth: 2, borderColor: COLORS.primary },
  botaoSecundarioTexto: { fontSize: 20 },
  cardIconeImagem: { width: 40, height: 40, resizeMode: 'contain', marginRight: 12 },
});
