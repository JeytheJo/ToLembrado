import * as Notifications from 'expo-notifications';
import db from '../database/database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function configurarCanal() {
  // Canal Android com ícone
  await Notifications.setNotificationChannelAsync('tarefas', {
    name: 'Lembretes de Tarefas',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1A3CFF',
    sound: true,
  });

  // Categoria com botão de ação
  await Notifications.setNotificationCategoryAsync('tarefa', [
    {
      identifier: 'MARCAR_FEITO',
      buttonTitle: '✓ Marcar como Feito',
      options: {
        opensAppToForeground: false,
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
  ]);
}

export async function solicitarPermissao() {
  const { status: existente } = await Notifications.getPermissionsAsync();
  if (existente === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function marcarTarefaFeita(idMedicamento) {
  const hoje = new Date().toISOString().split('T')[0];
  const agora = new Date().toTimeString().slice(0, 5);
  const existe = db.getFirstSync(
    'SELECT id_registro FROM historico_uso WHERE id_medicamento = ? AND data_execucao = ?',
    [idMedicamento, hoje]
  );
  if (existe) {
    db.runSync(
      'UPDATE historico_uso SET status = ?, horario_confirmacao = ? WHERE id_registro = ?',
      ['feito', agora, existe.id_registro]
    );
  } else {
    db.runSync(
      'INSERT INTO historico_uso (id_medicamento, data_execucao, status, horario_confirmacao) VALUES (?, ?, ?, ?)',
      [idMedicamento, hoje, 'feito', agora]
    );
  }
  // Cancela a notificação após marcar como feito
  await Notifications.dismissNotificationAsync(
    `tarefa_${idMedicamento}_dia_${new Date().getDay()}`
  ).catch(() => {});
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
        categoryIdentifier: 'tarefa',
        android: {
          channelId: 'tarefas',
          smallIcon: 'notification_icon',
          color: '#1A3CFF',
        },
        data: { idMedicamento: tarefa.id_medicamento },
      },
      trigger: {
        type: 'weekly',
        weekday: diaSemana + 1,
        hour: hora,
        minute: minuto,
        repeats: true,
        channelId: 'tarefas',
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