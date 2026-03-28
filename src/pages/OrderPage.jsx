import { useState } from "react";
import { addDoc, collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Category from "../components/Category";
import { generateName } from "../utils/generateName";


// 🔥 DATA
const proteinsData = [
  { name: "Jamón asado", price: 9900, units: 6, used: 1 },
  { name: "Jamón serrano", price: 7990, units: 5, used: 1 },
  { name: "Chorizo", price: 8400, units: 8, used: 1 },
  { name: "Salami", price: 8400, units: 8, used: 1 },
  { name: "Jamón de pavo", price: 11950, units: 20, used: 1 },
  { name: "Pepperoni", price: 4990, units: 39, used: 3 },
];

const suggestedSandwiches = [
  {
    name: "🔥 Explosivo",
    proteins: ["Chorizo", "Salami", "Pepperoni"]
  },
  {
    name: "🥓 Doble Jamón",
    proteins: ["Jamón asado", "Jamón serrano"]
  },
  {
    name: "🍗 Mix Clásico",
    proteins: ["Jamón de pavo", "Jamón asado"]
  },
  {
    name: "🌶️ Picante Especial",
    proteins: ["Chorizo", "Salami"]
  },
  {
    name: "💪 Triple Protein",
    proteins: ["Jamón asado", "Jamón serrano", "Pepperoni"]
  },
  {
    name: "👑 Full Protein",
    proteins: [
      "Jamón asado",
      "Jamón serrano",
      "Chorizo",
      "Salami",
      "Jamón de pavo",
      "Pepperoni"
    ]
  }
];

const toppingsData = [
  { name: "Lechuga", price: 2900, units: 20, used: 2 },
  { name: "Pimentón", price: 6490, units: 10, used: 1 },
];

const extrasData = [
  { name: "Queso extra", price: 6490, units: 16, used: 1 },
  { name: "Doble proteína", price: 0, units: 1, used: 1 },
];

export default function OrderPage() {
  const [size, setSize] = useState("15");
  const [proteins, setProteins] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [extras, setExtras] = useState([]);
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [cart, setCart] = useState([]);
  const removeFromCart = (index) => {
  setCart(prev => prev.filter((_, i) => i !== index));
};

  const defaultBase = [
  "Lechuga",
  "Pimentón Asado",
  "Cebolla",
  "Salsa tomate",
  "Mayonesa",
  "Mostaza",
  "Queso mozzarella"
];

  const [baseIngredients, setBaseIngredients] = useState(defaultBase);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
  setToast({ message, type });

  setTimeout(() => {
    setToast(null);
  }, 2000);
};

  const getNextOrderNumber = async () => {
  const ref = doc(db, "counters", "orders");

  return await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);

    let current = 0;
    if (snap.exists()) current = snap.data().value || 0;

    const next = current + 1;

    transaction.set(ref, { value: next });

    return next;
  });
};

  // 🔥 LOGICA DE COSTOS
  const itemCost = (item, isProtein = false) => {
    const base = (item.price / item.units) * item.used;

    const isDoubleProtein = extras.some(e => e.name === "Doble proteína");

    if (isProtein && isDoubleProtein) {
      return base * 2;
    }

    return base;
  };

  const calculateCost = (items, isProtein = false) =>
    items.reduce((sum, i) => sum + itemCost(i, isProtein), 0);

  const sizeCost = size === "30" ? 3000 : 1500;

  const totalCost =
    sizeCost +
    calculateCost(proteins, true) +
    calculateCost(toppings) +
    calculateCost(extras);

  const salePrice = Math.round(totalCost * 1.75);

  // 🔁 TOGGLE
  const toggleItem = (item, list, setList) => {
  const exists = list.find(i => i.name === item.name);

  let newList;

  if (exists) {
    newList = list.filter(i => i.name !== item.name);
  } else {
    newList = [...list, item];
  }

  setList(newList);

  // 🔥 reset solo cuando el usuario edita manual
  setSelectedSuggestion(null);
};

  const applySuggestion = (suggestion) => {
  const selectedProteins = proteinsData.filter(p =>
    suggestion.proteins.includes(p.name)
  );

  setProteins(selectedProteins);
  setExtras([]);
  setSelectedSuggestion(suggestion.name); // 🔥 IMPORTANTE
};

  const toggleBase = (item) => {
  if (baseIngredients.includes(item)) {
    setBaseIngredients(baseIngredients.filter(i => i !== item));
  } else {
    setBaseIngredients([...baseIngredients, item]);
  }
};

  // 📦 ENVIAR PEDIDO
  const handleOrder = async () => {
    if (!clientName || !phone) {
      alert("Completa tus datos");
      return;
    }

    if (!proteins.length) {
      alert("Selecciona al menos una proteína");
      return;
    }
    
    const finalName = selectedSuggestion
      ? `${selectedSuggestion} ${size === "30" ? "Grande" : "Pequeño"}`
      : generateName(proteins, size);

    const order = {
      size,
      base: baseIngredients,
      proteins,
      toppings,
      extras,
      name: finalName, // 🔥 FIX REAL
      cost: totalCost,
      price: salePrice,
      status: "pendiente",
      source: "web"
    };

    setCart(prev => [...prev, order]);

      showToast("🥪 Sandwich agregado");

      // RESET (NO borrar cliente)
      setProteins([]);
      setToppings([]);
      setExtras([]);
  };

  const confirmOrder = async () => {
  if (!clientName || !phone) {
    showToast("⚠️ Completa tus datos", "error");
    return;
  }

  if (!cart.length) {
    showToast("🛒 Agrega al menos un sandwich", "error");
    return;
  }

  const orderNumber = await getNextOrderNumber();

  const finalOrder = {
    orderNumber,
    clientName,
    phone,
    items: cart,
    total: Math.round(cart.reduce((acc, i) => acc + i.price, 0)),
    status: "pendiente",
    date: serverTimestamp(),
    source: "web"
  };

  await addDoc(collection(db, "orders"), finalOrder);

  showToast("🚀 Pedido enviado");

  // WhatsApp
  let msg = `Pedido #${orderNumber}\n${clientName}\n📱 ${phone}\n\n`;

  cart.forEach((item, i) => {
  msg += `🍞 ${i + 1}. ${item.name}\n`;

  msg += `📏 ${item.size} cm\n`;

  if (item.base?.length) {
    msg += `🥬 Base:\n`;
    item.base.forEach(b => {
      msg += `- ${b}\n`;
    });
  }

  if (item.proteins?.length) {
    msg += `🥩 Proteínas:\n`;
    item.proteins.forEach(p => {
      msg += `- ${p.name}\n`;
    });
  }

  if (item.extras?.length) {
    msg += `🧀 Extras:\n`;
    item.extras.forEach(e => {
      msg += `- ${e.name === "Doble proteína" ? "🔥 Doble proteína" : e.name}\n`;
    });
  }

  msg += `💰 $${Math.round(item.price).toLocaleString()}\n\n`;
});

  msg += `TOTAL: $${finalOrder.total}`;

  window.open(`https://wa.me/573226278286?text=${encodeURIComponent(msg)}`);

  setCart([]);
};

  return (
        <div style={{
          display: "flex",
          gap: 40,
          padding: 40,
          background: "#020617",
          color: "white",
          minHeight: "100vh",
          maxWidth: 1200,
          margin: "0 auto"
        }}>
      {/* 🧾 FORMULARIO */}
      <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 20
          }}>
        <h3 style={{ marginBottom: 10 }}>👤 Tus datos</h3>
        <input
          placeholder="A nombre de quien será el pedido?"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #1e293b",
            background: "#020617",
            color: "white",
            marginBottom: 10
          }}
        />

        <input
          placeholder="Whatsapp(3123456789)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #1e293b",
            background: "#020617",
            color: "white"
          }}
        />

            {/* Recommended */}
          <div style={{
              background: "#0f172a",
              padding: 20,
              borderRadius: 16,
              border: "1px solid #1e293b"
            }}>
              <h3>🔥 Recomendados</h3>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                gap: 10,
                marginTop: 10
              }}>
                {suggestedSandwiches.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => applySuggestion(s) }
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: "none",
                      background: "#1e293b",
                      color: "white",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

          {/* BASE SANDWICH */}

          <div style={{
            background: "#0f172a",
            padding: 20,
            borderRadius: 16,
            border: "1px solid #1e293b"
          }}>
            <h3>🥖 Base del sandwich</h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 10,
              marginTop: 10
            }}>
              {defaultBase.map((item) => {
                const selected = baseIngredients.includes(item);

                return (
                  <button
                    key={item}
                    onClick={() => toggleBase(item)}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: "none",
                      background: selected ? "#22c55e" : "#1e293b",
                      color: "white",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{
            background: "#0f172a",
            padding: 20,
            borderRadius: 16,
            border: "1px solid #1e293b"
          }}>

        <Category
          title="📏 Tamaño"
          items={["15", "30"]}
          selected={size}
          setSelected={setSize}
          isSize
        />

        <Category
          title="🥩 Proteínas"
          items={proteinsData}
          selected={proteins}
          setSelected={setProteins}
          toggle={toggleItem}
        />

        {/* <Category
          title="🥬 Toppings"
          items={toppingsData}
          selected={toppings}
          setSelected={setToppings}
          toggle={toggleItem}
        /> */}

        <Category
          title="🧀 Extras"
          items={extrasData}
          selected={extras}
          setSelected={setExtras}
          toggle={toggleItem}
        />
            </div>
        <button
          onClick={handleOrder}
          style={{
                marginTop: 20,
                padding: 16,
                width: "100%",
                background: "#22c55e",
                border: "none",
                borderRadius: 12,
                fontWeight: "bold",
                fontSize: 16,
                cursor: "pointer",
                color: "white",
                boxShadow: "0 4px 14px rgba(34,197,94,0.4)"
              }}
        >
          ➕ Agregar sandwich
        </button>

        <button
          onClick={confirmOrder}
          style={{
            marginTop: 10,
            padding: 16,
            width: "100%",
            background: "#0ea5e9",
            border: "none",
            borderRadius: 12,
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          🚀 Enviar pedido completo
        </button>
      </div>

      {/* 📊 RESUMEN */}
      <div style={{
          width: 320,
          background: "#0f172a",
          padding: 20,
          borderRadius: 16,
          height: "fit-content",
          border: "1px solid #1e293b"
        }}>
          <h3>🧾 Tu pedido</h3>
          {baseIngredients.length > 0 && (
                <>
                  <p style={{ marginTop: 10, opacity: 0.7 }}>Base</p>
                  {baseIngredients.map(b => (
                    <p key={b}>• {b}</p>
                  ))}
                </>
              )}
          <p><strong style={{ color: "#fbbf24" }}>{generateName(proteins, size, selectedSuggestion)}</strong></p>
          {extras.some(e => e.name === "Doble proteína") && (
          <p style={{
            color: "#f59e0b",
            fontWeight: "bold",
            marginTop: 5
            }}>
            🔥 Proteína duplicada activada
            </p>
            )}

          <hr style={{ margin: "10px 0" }} />

          <p>📏 {size} cm</p>

          {proteins.length > 0 && (
            <>
              <p style={{ marginTop: 10, opacity: 0.7 }}>Proteínas</p>
              {proteins.map(p => <p key={p.name}>• {p.name}</p>)}
            </>
          )}

          {toppings.length > 0 && (
            <>
              <p style={{ marginTop: 10, opacity: 0.7 }}>Toppings</p>
              {toppings.map(t => <p key={t.name}>• {t.name}</p>)}
            </>
          )}

          {extras.length > 0 && (
          <>
            <p style={{ marginTop: 10, opacity: 0.7 }}>Extras</p>

            {extras.map(e => (
              <p key={e.name}>
                • {e.name === "Doble proteína"
                  ? "🔥 Doble proteína"
                  : e.name}
              </p>
            ))}
          </>
        )}

          <hr style={{ margin: "15px 0" }} />

          <p style={{ opacity: 0.7 }}>Este sandwich</p>

          <p style={{ fontSize: 12, opacity: 0.5 }}>
            (Se reinicia al agregarlo)
          </p>

          <p style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#22c55e",
          }}>
            ${Math.round(salePrice).toLocaleString()}
          </p>
          <hr style={{ margin: "15px 0" }} />

            <h3 style={{ marginTop: 10 }}>🛒 Pedido completo</h3>

            {cart.map((item, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 10,
                    padding: 10,
                    background: "#020617",
                    borderRadius: 10,
                    border: "1px solid #1e293b",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <p style={{ margin: 0 }}><strong>{item.name}</strong></p>
                    <p style={{ margin: 0, opacity: 0.7 }}>
                      ${Math.round(item.price).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(i)}
                    style={{
                      background: "#ef4444",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 10px",
                      color: "white",
                      cursor: "pointer"
                    }}
                  >
                    ❌
                  </button>
                </div>
              ))}
              <p style={{
                fontSize: 14,
                opacity: 0.7
              }}>
                🛒 Total pedido
              </p>

              <p style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#38bdf8" // 🔵 azul diferente
              }}>
                ${Math.round(cart.reduce((acc, i) => acc + i.price, 0)).toLocaleString()}
              </p>
        </div>
      </div>
  );
}