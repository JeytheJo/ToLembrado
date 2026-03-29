import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { initDatabase } from '../src/database/database';
import db from '../src/database/database';
import CadastroScreen from '../src/screens/CadastroScreen';
import CadastroTarefaScreen from '../src/screens/CadastroTarefaScreen';
import EditarPerfilScreen from '../src/screens/EditarPerfilScreen';
import HistoricoScreen from '../src/screens/HistoricoScreen';
import HomeScreen from '../src/screens/HomeScreen';
import MudarPerfilScreen from '../src/screens/MudarPerfilScreen';
import OnboardingScreen from '../src/screens/OnboardingScreen';
import { agendarNotificacoesPerfil, configurarCanal, marcarTarefaFeita, solicitarPermissao } from '../src/services/notificacoes';

export default function Index() {
  const [carregando, setCarregando] = useState(true);
  const [idUsuario, setIdUsuario] = useState(null);
  const [tela, setTela] = useState('home');
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [idPerfilEditando, setIdPerfilEditando] = useState(null);
  const [onboardingVisto, setOnboardingVisto] = useState(false);
  const responseListener = useRef();

  useEffect(() => {
    initDatabase();
    solicitarPermissao();
    configurarCanal();

    const perfil = db.getFirstSync('SELECT id_usuario FROM perfil_usuario LIMIT 1');
    if (perfil) {
      setIdUsuario(perfil.id_usuario);
      agendarNotificacoesPerfil(perfil.id_usuario);
      setOnboardingVisto(true);
    }
    setCarregando(false);

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
      const actionId = response.actionIdentifier;
      const idMedicamento = response.notification.request.content.data?.idMedicamento;
      if (actionId === 'MARCAR_FEITO' && idMedicamento) {
        await marcarTarefaFeita(idMedicamento);
      }
    });

    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        setTela(t => t === 'home' ? 'home_reload' : t);
        setTimeout(() => setTela(t => t === 'home_reload' ? 'home' : t), 100);
      }
    });

    return () => {
      responseListener.current?.remove();
      subscription.remove();
    };
  }, []);

  async function trocarPerfil(id) {
    setIdUsuario(id);
    setTela('home');
    await agendarNotificacoesPerfil(id);
  }

  if (carregando) return null;

  // Mostra onboarding apenas para novos usuários
  if (!onboardingVisto) {
    return (
      <OnboardingScreen
        onTerminar={() => setOnboardingVisto(true)}
      />
    );
  }

  if (!idUsuario) {
    return <CadastroScreen primeroAcesso={true} onCadastro={(id) => { setIdUsuario(id); agendarNotificacoesPerfil(id); setTela('home'); }} />;
  }

  if (tela === 'novoPerfil') {
    return (
      <CadastroScreen
        primeroAcesso={false}
        onCadastro={() => setTela('mudarPerfil')}
        onVoltar={() => setTela('mudarPerfil')}
      />
    );
  }

  if (tela === 'mudarPerfil') {
    return (
      <MudarPerfilScreen
        idUsuarioAtivo={idUsuario}
        onSelecionar={(id) => {
          if (id === 'novo') { setTela('novoPerfil'); }
          else { trocarPerfil(id); }
        }}
        onVoltar={() => setTela('home')}
        onEditarPerfil={(id) => { setIdPerfilEditando(id); setTela('editarPerfil'); }}
      />
    );
  }

  if (tela === 'editarPerfil') {
    return (
      <EditarPerfilScreen
        idUsuario={idPerfilEditando}
        onSalvar={() => { setIdPerfilEditando(null); setTela('mudarPerfil'); }}
        onVoltar={() => { setIdPerfilEditando(null); setTela('mudarPerfil'); }}
      />
    );
  }

  if (tela === 'cadastroTarefa') {
    return (
      <CadastroTarefaScreen
        idUsuario={idUsuario}
        tarefaExistente={tarefaEditando}
        onSalvar={async () => {
          setTarefaEditando(null);
          setTela('home');
          await agendarNotificacoesPerfil(idUsuario);
        }}
        onVoltar={() => { setTarefaEditando(null); setTela('home'); }}
      />
    );
  }

  if (tela === 'historico') {
    return (
      <HistoricoScreen
        idUsuario={idUsuario}
        onVoltar={() => setTela('home')}
        onEditTarefa={(tarefa) => { setTarefaEditando(tarefa); setTela('cadastroTarefa'); }}
      />
    );
  }

  return (
    <HomeScreen
      key={tela}
      idUsuario={idUsuario}
      onAddTarefa={() => { setTarefaEditando(null); setTela('cadastroTarefa'); }}
      onEditTarefa={(tarefa) => { setTarefaEditando(tarefa); setTela('cadastroTarefa'); }}
      onMudarPerfil={() => setTela('mudarPerfil')}
      onHistorico={() => setTela('historico')}
      onEditarPerfil={() => { setIdPerfilEditando(idUsuario); setTela('editarPerfil'); }}
    />
  );
}
