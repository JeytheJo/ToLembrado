import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, MIN_TOUCH } from '../constants/theme';

export default function BotaoVoltar({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.botao}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Voltar para a tela anterior"
    >
      <Text style={styles.texto}>← Voltar</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: MIN_TOUCH + 10,
    paddingHorizontal: 24,
    marginTop: 40,
    marginBottom: 16,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  texto: {
    fontSize: FONTS.large,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
