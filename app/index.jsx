import { useEffect, useState } from 'react';
import db, { initDatabase } from '../src/database/database';
import CadastroScreen from '../src/screens/CadastroScreen';
import CadastroTarefaScreen from '../src/screens/CadastroTarefaScreen';
import EditarPerfilScreen from '../src/screens/EditarPerfilScreen';
import HistoricoScreen from '../src/screens/HistoricoScreen';
import HomeScreen from '../src/screens/HomeScreen';
import MudarPerfilScreen from '../src/screens/MudarPerfilScreen';
import { agendarNotificacoesPerfil, solicitarPermissao } from '../src/services/notificacoes';

export default function Index() {
  const [carregando, setCarregando] = useState(true);
  const [idUsuario, setIdUsuario] = useState(null);
  const [tela, setTela] = useState('home');
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [idPerfilEditando, setIdPerfilEditando] = useState(null);

  useEffect(() => {
    initDatabase();
    solicitarPermissao();
    const perfil = db.getFirstSync('SELECT id_usuario FROM perfil_usuario LIMIT 1');
    if (perfil) {
      setIdUsuario(perfil.id_usuario);
      agendarNotificacoesPerfil(perfil.id_usuario);
    }
    setCarregando(false);
  }, []);

  async function trocarPerfil(id) {
    setIdUsuario(id);
    setTela('home');
    await agendarNotificacoesPerfil(id);
  }

  if (carregando) return null;

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
        onSalvar={async (tarefa) => {
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
