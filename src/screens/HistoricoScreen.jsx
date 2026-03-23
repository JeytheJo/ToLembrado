import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ICONES } from '../assets/icons/icones';
import BotaoVoltar from '../components/BotaoVoltar';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import db from '../database/database';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function gerarUltimos7Dias() {
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dias.push({
      data: d.toISOString().split('T')[0],
      label: i === 0 ? 'Hoje' : i === 1 ? 'Ontem' : `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}`,
      diaSemana: d.getDay(),
    });
  }
  return dias.reverse();
}

export default function HistoricoScreen({ idUsuario, onVoltar }) {
  const [dias, setDias] = useState([]);
  const [diaAberto, setDiaAberto] = useState(null);
  const [registros, setRegistros] = useState({});

  useEffect(() => {
    const ultimos7 = gerarUltimos7Dias();
    setDias(ultimos7);
    setDiaAberto(ultimos7[0].data);
    carregarRegistros(ultimos7);
  }, [idUsuario]);

  function carregarRegistros(lista) {
    const todos = {};
    lista.forEach(({ data, diaSemana }) => {
      const tarefasDoDia = db.getAllSync(
        `SELECT m.*, 
          (SELECT status FROM historico_uso h 
           WHERE h.id_medicamento = m.id_medicamento 
           AND h.data_execucao = ? LIMIT 1) as status_dia
         FROM medicamento m 
         WHERE m.id_usuario = ? AND m.ativo = 1`,
        [data, idUsuario]
      ).filter(t => {
        const freq = t.frequencia_dias || '1111111';
        return freq[diaSemana] === '1';
      });
      todos[data] = tarefasDoDia;
    });
    setRegistros(todos);
  }

  function resumoDia(data) {
    const tarefas = registros[data] || [];
    const feitas = tarefas.filter(t => t.status_dia === 'feito').length;
    return { total: tarefas.length, feitas };
  }

  return (
    <ScrollView style={styles.container}>
      <BotaoVoltar onPress={onVoltar} />
      <Text style={styles.titulo}>Histórico</Text>
      <Text style={styles.subtitulo}>Últimos 7 dias</Text>

      {dias.map(({ data, label }) => {
        const { total, feitas } = resumoDia(data);
        const aberto = diaAberto === data;
        const todosFei = total > 0 && feitas === total;
        const nenhumFeito = feitas === 0;

        return (
          <View key={data} style={styles.diaContainer}>
            <TouchableOpacity
              style={[styles.diaHeader, todosFei && styles.diaHeaderCompleto]}
              onPress={() => setDiaAberto(aberto ? null : data)}
              activeOpacity={0.7}
            >
              <View style={styles.diaHeaderEsq}>
                <Text style={styles.diaLabel}>{label}</Text>
                {total === 0 ? (
                  <Text style={styles.diaResumoVazio}>Nenhuma tarefa</Text>
                ) : (
                  <Text style={[styles.diaResumo, todosFei && styles.diaResumoCompleto]}>
                    {feitas}/{total} realizadas
                  </Text>
                )}
              </View>
              <View style={styles.diaHeaderDir}>
                {total > 0 && (
                  <View style={[
                    styles.badge,
                    todosFei && styles.badgeCompleto,
                    nenhumFeito && styles.badgeVazio,
                  ]}>
                    <Text style={styles.badgeTexto}>
                      {todosFei ? '✓' : `${feitas}/${total}`}
                    </Text>
                  </View>
                )}
                <Text style={styles.seta}>{aberto ? '▲' : '▼'}</Text>
              </View>
            </TouchableOpacity>

            {aberto && (
              <View style={styles.diaConteudo}>
                {(registros[data] || []).length === 0 ? (
                  <Text style={styles.vazioTexto}>Nenhuma tarefa programada para este dia.</Text>
                ) : (
                  (registros[data] || []).map(tarefa => {
                    const icone = ICONES[tarefa.icone_tipo] || ICONES.remedio;
                    const feito = tarefa.status_dia === 'feito';
                    return (
                      <View key={tarefa.id_medicamento} style={[styles.tarefaCard, feito && styles.tarefaCardFeito]}>
                        <Text style={styles.tarefaEmoji}>{icone.emoji}</Text>
                        <View style={styles.tarefaInfo}>
                          <Text style={styles.tarefaTitulo}>{tarefa.titulo}</Text>
                          <Text style={styles.tarefaHorario}>{tarefa.horario_programado}</Text>
                        </View>
                        <View style={[styles.statusBadge, feito ? styles.statusFeito : styles.statusPendente]}>
                          <Text style={styles.statusTexto}>{feito ? 'Feito ✓' : 'Não realizado'}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  titulo: { fontSize: FONTS.title, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitulo: { fontSize: FONTS.medium, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  diaContainer: { marginBottom: SPACING.md, borderRadius: 16, borderWidth: 2, borderColor: COLORS.border, overflow: 'hidden' },
  diaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.surface },
  diaHeaderCompleto: { backgroundColor: '#eef0ff' },
  diaHeaderEsq: { flex: 1 },
  diaLabel: { fontSize: FONTS.large, fontWeight: 'bold', color: COLORS.textPrimary },
  diaResumo: { fontSize: FONTS.medium, color: COLORS.textSecondary, marginTop: 2 },
  diaResumoCompleto: { color: COLORS.primary },
  diaResumoVazio: { fontSize: FONTS.medium, color: COLORS.textMuted, marginTop: 2 },
  diaHeaderDir: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  badge: { backgroundColor: COLORS.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeCompleto: { backgroundColor: COLORS.primary },
  badgeVazio: { backgroundColor: COLORS.disabled },
  badgeTexto: { color: COLORS.white, fontWeight: 'bold', fontSize: FONTS.small },
  seta: { fontSize: FONTS.medium, color: COLORS.textMuted },
  diaConteudo: { padding: SPACING.md, backgroundColor: COLORS.background },
  vazioTexto: { fontSize: FONTS.medium, color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.md },
  tarefaCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm },
  tarefaCardFeito: { borderColor: COLORS.primary, backgroundColor: '#f0f4ff' },
  tarefaEmoji: { fontSize: 28, marginRight: SPACING.md },
  tarefaInfo: { flex: 1 },
  tarefaTitulo: { fontSize: FONTS.large, fontWeight: 'bold', color: COLORS.textPrimary },
  tarefaHorario: { fontSize: FONTS.medium, color: COLORS.primary, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  statusFeito: { backgroundColor: COLORS.primary },
  statusPendente: { backgroundColor: COLORS.disabled },
  statusTexto: { color: COLORS.white, fontWeight: 'bold', fontSize: FONTS.small },
});
