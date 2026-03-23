# Changelog — Tô Lembrado

Todas as mudanças relevantes do projeto serão documentadas aqui.

---

## [0.4.0] — 2026-03-23
### Adicionado
- Tela de histórico dos últimos 7 dias com status por tarefa
- Botão de acesso ao histórico (📋) na tela inicial
- Agrupamento por dia com resumo de tarefas realizadas vs total
- Expansão/colapso por dia no histórico

### Adicionado
- Serviço de notificações locais (`src/services/notificacoes.js`)
- Agendamento semanal por dia da semana por tarefa
- Solicitação de permissão de notificação no primeiro acesso
- Instalação do `expo-notifications` e `expo-dev-client`

### Infraestrutura
- Configuração do Android SDK e `local.properties`
- Tentativa de build nativo via `npx expo run:android`
- Remoção do `react-native-reanimated` (não utilizado)
- Configuração do Java 21 para compilação Gradle

---

## [0.3.0] — 2026-03-22
### Adicionado
- Tela de cadastro de perfil unificada com tela de edição
- Logo e saudação no primeiro acesso
- Botão Voltar visível na tela de adicionar novo perfil
- Campos opcionais: descrição e observações gerais no perfil
- Indicação visual de campos obrigatórios com asterisco (*)

### Alterado
- `CadastroScreen` agora suporta prop `primeroAcesso` para alternar layout
- Fluxo de "Adicionar novo perfil" redireciona para a mesma tela de cadastro

---

## [0.2.0] — 2026-03-21
### Adicionado
- Tema global de acessibilidade (`src/constants/theme.js`)
  - Fontes maiores (mínimo 16px, padrão 18-22px)
  - Altura mínima de toque de 56px em todos os botões
  - Paleta de cores com alto contraste
- Componente `BotaoAcessivel` reutilizável com variantes (primário, secundário, perigo)
- Componente `BotaoVoltar` com borda e tamanho acessível
- Tela de seleção e gerenciamento de perfis (`MudarPerfilScreen`)
  - Avatar com inicial do nome
  - Indicador de perfil ativo
  - Botões de editar (✏️) e excluir (🗑️) por perfil
  - Proteção contra exclusão do único perfil
- Tela de edição de perfil (`EditarPerfilScreen`)
  - Edição de nome, idade, descrição e observações gerais
  - Validação de campos obrigatórios
- Cards de tarefa com emoji do ícone visível
- Menu de três pontos (⋮) nos cards com opções de editar e excluir
- Confirmação antes de excluir tarefa
- Suporte a edição de tarefa existente no `CadastroTarefaScreen`

### Alterado
- `CadastroScreen` aplicado padrão de acessibilidade
- `CadastroTarefaScreen` usa `BotaoVoltar` e `BotaoAcessivel`
- Cards da home exibem emoji do ícone e destacam tarefas concluídas

---

## [0.1.0] — 2026-03-20
### Adicionado
- Estrutura inicial do projeto com Expo + React Native (JavaScript)
- Banco de dados SQLite local com 3 tabelas:
  - `perfil_usuario` — dados do idoso
  - `medicamento` — tarefas e medicamentos com horário e frequência
  - `historico_uso` — registro de execuções por data
- Tela de primeiro acesso / cadastro de perfil (`CadastroScreen`)
  - Botão desabilitado até preenchimento dos campos obrigatórios
- Tela inicial (`HomeScreen`)
  - Listagem de tarefas do dia agrupadas por período (Manhã, Tarde, Noite)
  - Filtro por dia da semana via `frequencia_dias`
  - Marcar tarefa como feita ou não realizada
  - Botão flutuante (+) para adicionar tarefa
- Tela de cadastro de tarefa (`CadastroTarefaScreen`)
  - Seleção de ícone (💊 🩺 💧 🍽️ 🩹)
  - Título, instrução rápida, horário, dias da semana e descrição
  - Validação de campos obrigatórios
- Sistema de navegação por estados no `app/index.jsx`
- Repositório Git configurado e publicado no GitHub

### Infraestrutura
- Node.js v22, Expo SDK 54
- Dependências: `expo-sqlite`, `expo-file-system`, `@react-navigation/native`
- Estrutura de pastas: `src/screens`, `src/components`, `src/database`, `src/assets`, `src/constants`
- `.gitignore` configurado
- `README.md` personalizado

---

## Próximos passos
- [ ] Publicar build de desenvolvimento via EAS Build
- [ ] Testar notificações locais no dispositivo físico
- [ ] Publicar na Google Play Store
- [ ] Adicionar foto de perfil
- [ ] Tutorial interativo (onboarding) para primeiro acesso
