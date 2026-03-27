import { StyleSheet, Text, TouchableOpacity } from 'react-native';

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
    width: 140,
    height: 57,
    marginTop: 56,
    marginBottom: 22,
    marginLeft: 2,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1A3CFF',
    backgroundColor: 'rgba(161, 175, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  texto: {
    fontSize: 18,
    color: '#1A3CFF',
    fontWeight: 'bold',
  },
});
