import { useEffect, useState } from 'react';
import { initDatabase } from '../src/database/database';
import db from '../src/database/database';
import CadastroScreen from '../src/screens/CadastroScreen';
import HomeScreen from '../src/screens/HomeScreen';
import CadastroTarefaScreen from '../src/screens/CadastroTarefaScreen';
import MudarPerfilScreen from '../src/screens/MudarPerfilScreen';
import EditarPerfilScreen from '../src/screens/EditarPerfilScreen';

export default function Index() {
  const [carregando, setCarregando] = useState(true);
  const [idUsuario, setIdUsuario] = useState(null);
  const [tela, setTela] = useState('home');
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [idPerfilEditando, setIdPerfilEditando] = useState(null);

  useEffect(() => {
    initDatabase();
    const perfil = db.getFirstSync('SELECT id_usuario FROM perfil_usuario LIMIT 1');
    if (perfil) setIdUsuario(perfil.id_usuario);
    setCarregando(false);
  }, []);

  if (carregando) return null;

  if (!idUsuario) {
    return <CadastroScreen primeroAcesso={true} onCadastro={(id) => { setIdUsuario(id); setTela('home'); }} />;
  }

  if (tela === 'novoPerfil') {
    return (
      <CadastroScreen
        primeroAcesso={false}
        onCadastro={(id) => { setTela('mudarPerfil'); }}
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
          else { setIdUsuario(id); setTela('home'); }
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
        onSalvar={() => { setTarefaEditando(null); setTela('home'); }}
        onVoltar={() => { setTarefaEditando(null); setTela('home'); }}
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
    />
  );
}
