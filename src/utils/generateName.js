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

export const generateName = (proteins, size, forcedName = null) => {
  // 🔥 PRIORIDAD: nombre sugerido
  if (forcedName) {
    const sizeName = size === "30" ? "Grande" : "Pequeño";
    return `${forcedName} ${sizeName}`;
  }

  const names = proteins.map(p => p.name);

  let baseName = "🥪 Personalizado";

  if (names.includes("Chorizo") && names.includes("Pepperoni")) {
    baseName = "🔥 Explosivo";
  } else if (names.includes("Jamón serrano") && names.includes("Jamón asado")) {
    baseName = "🥓 Doble Jamón";
  } else if (names.includes("Chorizo") && names.includes("Salami")) {
    baseName = "🌶️ Picante Especial";
  } else if (names.length >= 5) {
    baseName = "💣 Carnívoro Extremo";
  } else if (names.length === 4) {
    baseName = "👑 Mega Protein";
  } else if (names.length === 3) {
    baseName = "💪 Triple Protein";
  } else if (names.length === 2) {
    baseName = "🥪 Doble Protein";
  } else if (names.length === 1) {
    baseName = `🥪 ${names[0]}`;
  }

  const sizeName = size === "30" ? "Grande" : "Pequeño";

  return `${baseName} ${sizeName}`;
};