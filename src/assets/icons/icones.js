import { Image } from 'react-native';

export const ICONES = {
  remedio: { emoji: '💊', label: 'Remédio' },
  pressao: { emoji: '🩺', label: 'Aferir Pressão' },
  hidratar: { emoji: '💧', label: 'Hidratar' },
  refeicao: { emoji: '🍽️', label: 'Refeição' },
  curativo: { emoji: '🩹', label: 'Curativo' },
  glicose: { imagem: require('./glicose.png'), label: 'Glicose' },
};

export const ICONES_LISTA = Object.entries(ICONES).map(([key, val]) => ({
  key,
  ...val,
}));
