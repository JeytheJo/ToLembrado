import { Modak_400Regular, useFonts } from '@expo-google-fonts/modak';
import { Image, StyleSheet, Text, View } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { COLORS, FONTS, SPACING } from '../constants/theme';

function Slide({ emoji, titulo, descricao }) {
  return (
    <View style={styles.slide}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.descricao}>{descricao}</Text>
    </View>
  );
}

export default function OnboardingScreen({ onTerminar }) {
  const [fontsLoaded] = useFonts({ Modak_400Regular });
  if (!fontsLoaded) return null;

  return (
    <Onboarding
      onSkip={onTerminar}
      onDone={onTerminar}
      skipLabel="Pular"
      nextLabel="Próximo"
      bottomBarColor={COLORS.white}
      dotStyle={styles.dot}
      activeDotStyle={styles.dotAtivo}
      pages={[
        {
          backgroundColor: COLORS.white,
          image: (
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/icon.png')}
                style={styles.logoIcone}
              />
              <View style={styles.logoTextoContainer}>
                <Text style={styles.logoTo}>Tô </Text>
                <Text style={styles.logoLembrado}>Lembrado</Text>
              </View>
            </View>
          ),
          title: 'Bem vindo!',
          subtitle: 'O app que ajuda cuidadores a não esquecer nenhum detalhe dos seus idosos.',
          titleStyles: styles.paginaTitulo,
          subTitleStyles: styles.paginaSubtitulo,
        },
        {
          backgroundColor: '#f0f4ff',
          image: <Slide emoji="👤" titulo="" descricao="" />,
          title: 'Cadastre os perfis',
          subtitle: 'Adicione um perfil para cada idoso que você cuida, com nome, idade e uma foto.',
          titleStyles: styles.paginaTitulo,
          subTitleStyles: styles.paginaSubtitulo,
        },
        {
          backgroundColor: COLORS.white,
          image: <Slide emoji="💊" titulo="" descricao="" />,
          title: 'Adicione tarefas',
          subtitle: 'Cadastre medicamentos, horários de refeição, medição de pressão e muito mais.',
          titleStyles: styles.paginaTitulo,
          subTitleStyles: styles.paginaSubtitulo,
        },
        {
          backgroundColor: '#f0f4ff',
          image: <Slide emoji="🔔" titulo="" descricao="" />,
          title: 'Receba lembretes',
          subtitle: 'O app avisa no horário certo, mesmo com a tela bloqueada. Nunca mais esqueça!',
          titleStyles: styles.paginaTitulo,
          subTitleStyles: styles.paginaSubtitulo,
        },
        {
          backgroundColor: COLORS.white,
          image: <Slide emoji="📋" titulo="" descricao="" />,
          title: 'Acompanhe o histórico',
          subtitle: 'Veja tudo que foi realizado nos últimos 7 dias e mantenha o controle completo.',
          titleStyles: styles.paginaTitulo,
          subTitleStyles: styles.paginaSubtitulo,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  emoji: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  titulo: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  descricao: {
    fontSize: FONTS.large,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcone: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: SPACING.sm,
  },
  logoTextoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTo: {
    fontSize: 36,
    fontFamily: 'Modak_400Regular',
    color: '#1A3CFF',
  },
  logoLembrado: {
    fontSize: 36,
    fontFamily: 'Modak_400Regular',
    color: '#FF7474',
  },
  paginaTitulo: {
    fontSize: FONTS.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  paginaSubtitulo: {
    fontSize: FONTS.large,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    textAlign: 'center',
  },
  dot: {
    backgroundColor: COLORS.border,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotAtivo: {
    backgroundColor: COLORS.primary,
    width: 20,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
