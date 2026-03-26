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
      gap: 20,
      padding: 20,
      background: "#020617",
      color: "white",
      minHeight: "100vh"
    }}>

      {/* 🧾 FORMULARIO */}
      <div style={{ flex: 1 }}>
        <h1>🥪 Haz tu pedido</h1>

        <input
          placeholder="Tu nombre"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          placeholder="WhatsApp (573001234567)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 20 }}
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
            padding: 15,
            width: "100%",
            background: "#22c55e",
            border: "none",
            borderRadius: 10,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          📦 Confirmar pedido
        </button>
      </div>

      {/* 📊 RESUMEN */}
      <div style={{
        width: 300,
        background: "#0f172a",
        padding: 20,
        borderRadius: 12,
        height: "fit-content"
      }}>
        <h3>🧾 Tu pedido</h3>

        <p><strong>{generateName(proteins, size)}</strong></p>

        <hr />

        <p>📏 {size} cm</p>

        {proteins.map(p => <p key={p.name}>+ {p.name}</p>)}
        {toppings.map(t => <p key={t.name}>+ {t.name}</p>)}
        {extras.map(e => <p key={e.name}>+ {e.name}</p>)}

        <hr />

        <p>💰 Total:</p>
        <p style={{ fontSize: 22, fontWeight: "bold" }}>
          ${salePrice.toFixed(0)}
        </p>
      </div>

    </div>
  );
}