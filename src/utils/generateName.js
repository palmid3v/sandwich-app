const sandwichRules = [ 
  {
    match: ["Pepperoni", "Salami", "Chorizo"],
    name: "💣 Carnívoro Extremo",
  },
  {
    match: ["Chorizo", "Pepperoni"],
    name: "🔥 Explosivo",
  },
  {
    match: ["Jamón serrano", "Jamón asado"],
    name: "🥓 Doble Jamón",
  },
  {
    match: ["Chorizo", "Salami"],
    name: "🌶️ Picante Especial",
  },
  {
    match: ["Jamón de pavo", "Jamón asado"],
    name: "🍗 Mix Clásico",
  },
];

export const generateName = (proteins, size) => {
  const names = proteins.map(p => p.name);
  const nameSet = new Set(names);

  let baseName = null;

  // 🔍 reglas inteligentes
  for (const rule of sandwichRules) {
    const matches = rule.match.every(item => nameSet.has(item));
    if (matches) {
      baseName = rule.name;
      break;
    }
  }

  // 🧠 fallback
  if (!baseName) {
    if (names.length >= 5) baseName = "👑 Ultra Protein";
    else if (names.length === 4) baseName = "👑 Mega Protein";
    else if (names.length === 3) baseName = "💪 Triple Protein";
    else if (names.length === 2) baseName = "🥪 Doble Protein";
    else if (names.length === 1) baseName = `🥪 ${names[0]} Especial`;
    else baseName = "🥪 Personalizado";
  }

  // 📏 tamaño
  const sizeName = size === "30" ? "Grande" : "Pequeño";

  return `${baseName} ${sizeName}`;
};