const wordBanks = {
  pt: {
    cultura: ["filme", "livro", "musica", "arte", "danca", "teatro", "poema", "cantor", "ator", "grupo", "banda", "conto", "festa", "mitos", "lenda", "heroi", "samba", "bossa", "circo", "magia"],
    ciencia: ["terra", "agua", "fogo", "atomos", "celula", "genes", "luz", "onda", "dados", "teste", "massa", "forca", "energ", "calor", "frio", "gases", "solid", "plasm", "quark", "neuro"],
    esporte: ["futeb", "tenis", "natac", "corri", "boxeo", "volei", "skate", "surfe", "gimna", "judo", "caval", "remar", "vela", "esqui", "patim", "basqu", "handb", "rugby", "golfe", "dardo"]
  },
  en: {
    culture: ["movie", "music", "dance", "theater", "poem", "novel", "paint", "sculpt", "comedy", "drama", "opera", "ballet", "jazz", "blues", "rock", "pop", "hipho", "rap", "folk", "class"],
    science: ["earth", "water", "fire", "atoms", "cells", "genes", "light", "waves", "sound", "force", "mass", "speed", "power", "heat", "cold", "gas", "solid", "plasm", "quant", "neuro"],
    sports: ["socce", "tenni", "swim", "run", "boxin", "volle", "skate", "surf", "gym", "judo", "horse", "row", "sail", "ski", "skate", "baskt", "handb", "rugby", "golf", "darts"]
  },
  es: {
    cultura: ["pelic", "libro", "musica", "arte", "baile", "teatr", "poema", "canto", "actor", "grupo", "banda", "cuento", "fiest", "mitos", "leyen", "heroe", "ritmo", "verso", "toque", "estil"],
    ciencia: ["tierr", "agua", "fuego", "atomos", "celul", "genes", "luz", "onda", "datos", "prueb", "masa", "fuerz", "energ", "calor", "frio", "gases", "solid", "plasm", "cuant", "neuro"],
    deporte: ["futbo", "tenis", "natac", "carr", "boxeo", "volei", "patin", "surf", "gimna", "judo", "cabal", "remar", "vela", "esqui", "patin", "basqu", "handb", "rugby", "golf", "dardo"]
  }
};

function getRandomWord(lang, theme) {
  const list = wordBanks[lang][theme];
  return list[Math.floor(Math.random() * list.length)];
}

function getDailyWord(lang = 'pt', theme = 'cultura') {
  const dayIndex = Math.floor(Date.now() / (3 * 60 * 60 * 1000)) % wordBanks[lang][theme].length;
  return wordBanks[lang][theme][dayIndex] || "filme";
}

const themes = {
  pt: ["cultura", "ciencia", "esporte"],
  en: ["culture", "science", "sports"],
  es: ["cultura", "ciencia", "deporte"]
};