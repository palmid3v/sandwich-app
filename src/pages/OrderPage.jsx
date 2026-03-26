import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
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

  // 🔥 LOGICA DE COSTOS
  const itemCost = (item, isProtein = false) => {
    const base = (item.price / item.units) * item.used;

    const isDoubleProtein = extras.some(e => e.name === "Doble proteína");

    if (isProtein && isDoubleProtein) {
      return base * 2 + base * 0.5;
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

  const salePrice = totalCost * 1.75;

  // 🔁 TOGGLE
  const toggleItem = (item, list, setList) => {
    const exists = list.find(i => i.name === item.name);
    exists
      ? setList(list.filter(i => i.name !== item.name))
      : setList([...list, item]);
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

    const order = {
      clientName,
      phone,
      size,
      proteins,
      toppings,
      extras,
      name: generateName(proteins, size),
      cost: totalCost,
      price: salePrice,
      margin: 0.75,
      date: new Date().toLocaleString(),
      source: "web",
    };

    await addDoc(collection(db, "orders"), order);

    alert("Pedido enviado 🎉");

    // RESET
    setProteins([]);
    setToppings([]);
    setExtras([]);
    setClientName("");
    setPhone("");
  };

  return (
        <div style={{
            display: "flex",
            gap: 30,
            padding: 30,
            background: "#020617",
            color: "white",
            minHeight: "100vh",
            maxWidth: 1200,
            margin: "0 auto"
          }}>
      {/* 🧾 FORMULARIO */}
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: 10 }}>👤 Datos del cliente</h3>
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
          placeholder="Wapp (573123456789)"
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

        <Category
          title="🥬 Toppings"
          items={toppingsData}
          selected={toppings}
          setSelected={setToppings}
          toggle={toggleItem}
        />

        <Category
          title="🧀 Extras"
          items={extrasData}
          selected={extras}
          setSelected={setExtras}
          toggle={toggleItem}
        />

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
            transition: "0.2s"
          }}
          onMouseEnter={(e) => e.target.style.opacity = 0.85}
          onMouseLeave={(e) => e.target.style.opacity = 1}
        >
          🚀 Confirmar y enviar pedido
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
          <p><strong>{generateName(proteins, size)}</strong></p>
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

          <p style={{ opacity: 0.7 }}>Total a pagar</p>

          <p style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#22c55e"
          }}>
            ${salePrice.toFixed(0)}
          </p>
        </div>
      </div>
  );
}