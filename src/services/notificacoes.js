import * as Notifications from 'expo-notifications';
import db from '../database/database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function solicitarPermissao() {
  const { status: existente } = await Notifications.getPermissionsAsync();
  if (existente === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function agendarNotificacoesPerfil(idUsuario) {
  await cancelarNotificacoesPerfil(idUsuario);
  const permitido = await solicitarPermissao();
  if (!permitido) return;
  const tarefas = db.getAllSync(
    'SELECT * FROM medicamento WHERE id_usuario = ? AND ativo = 1',
    [idUsuario]
  );
  for (const tarefa of tarefas) {
    await agendarNotificacaoTarefa(tarefa);
  }
}

export async function agendarNotificacaoTarefa(tarefa) {
  if (!tarefa.horario_programado) return;
  const [hora, minuto] = tarefa.horario_programado.split(':').map(Number);
  const freq = tarefa.frequencia_dias || '1111111';
  for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
    if (freq[diaSemana] !== '1') continue;
    const identifier = `tarefa_${tarefa.id_medicamento}_dia_${diaSemana}`;
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: `⏰ ${tarefa.titulo}`,
        body: tarefa.subtitulo_instrucao || 'Hora de realizar esta tarefa!',
        sound: true,
        data: { idMedicamento: tarefa.id_medicamento },
      },
      trigger: {
        type: 'weekly',
        weekday: diaSemana + 1,
        hour: hora,
        minute: minuto,
        repeats: true,
      },
    });
  }
}

export async function cancelarNotificacoesTarefa(idMedicamento) {
  for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
    const identifier = `tarefa_${idMedicamento}_dia_${diaSemana}`;
    await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
  }
}

export async function cancelarNotificacoesPerfil(idUsuario) {
  const tarefas = db.getAllSync(
    'SELECT id_medicamento FROM medicamento WHERE id_usuario = ?',
    [idUsuario]
  );
  for (const tarefa of tarefas) {
    await cancelarNotificacoesTarefa(tarefa.id_medicamento);
  }
}
