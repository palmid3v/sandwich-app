import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";

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

const generateName = (proteins) => {
  const names = proteins.map(p => p.name);
  if (names.includes("Chorizo") && names.includes("Pepperoni")) return "🔥 Explosivo";
  if (names.includes("Jamón serrano") && names.includes("Jamón asado")) return "🥓 Doble Jamón";
  if (names.length >= 3) return "💪 Full Protein";
  return "🥪 Personalizado";
};

export default function App() {
  const [size, setSize] = useState("15");
  const [proteins, setProteins] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [extras, setExtras] = useState([]);
  const [orders, setOrders] = useState([]);
  const [margin, setMargin] = useState(0.75);
  const [clientName, setClientName] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const isDoubleProtein = extras.some(e => e.name === "Doble proteína");

  // 🔥 TIEMPO REAL
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("orderNumber", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    });

    return () => unsub();
  }, []);

  // 🔢 CONTADOR GLOBAL
  const getNextOrderNumber = async () => {
    const ref = doc(db, "counters", "orders");

    return await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);

      let current = 0;
      if (snap.exists()) current = Number(snap.data().value) || 0;

      const newValue = current + 1;
      transaction.set(ref, { value: newValue });

      return newValue;
    });
  };

  const toggleItem = (item, list, setList) => {
    const exists = list.find(i => i.name === item.name);
    exists
      ? setList(list.filter(i => i.name !== item.name))
      : setList([...list, item]);
  };

  const itemCost = (item, isProtein = false) => {
    const base = (item.price / item.units) * item.used;
    if (isProtein && isDoubleProtein) return base * 2 + base * 0.5;
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

  const salePrice = totalCost * (1 + margin);
  const hasOrder = proteins.length || toppings.length || extras.length;

  const saveOrder = async () => {
    if (!proteins.length) return;

    const orderNumber = await getNextOrderNumber();

    const newOrder = {
      orderNumber,
      clientName,
      size,
      proteins,
      toppings,
      extras,
      cost: totalCost,
      price: salePrice,
      margin,
      name: generateName(proteins),
      doubleProtein: isDoubleProtein,
      date: new Date().toLocaleString(),
    };

    await addDoc(collection(db, "orders"), newOrder);

    setProteins([]);
    setToppings([]);
    setExtras([]);
    setClientName("");
  };

  return (
    <div style={{ padding: 20, background: "#020617", color: "white", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", fontSize: 28 }}>🔥 Sandwichies</h1>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>

        {/* BUILDER */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 15 }}>

          <div style={{ background: "#0f172a", padding: 15, borderRadius: 12 }}>
            <h3>👤 Cliente</h3>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nombre del cliente"
              style={{ width: "100%", padding: 8, borderRadius: 8, border: "none" }}
            />
          </div>

          <Category title="📏 Tamaño" items={["15", "30"]} selected={size} setSelected={setSize} isSize />
          <Category title="🥩 Proteínas" items={proteinsData} selected={proteins} setSelected={setProteins} toggle={toggleItem} color="#ef4444" />
          <Category title="🥬 Toppings" items={toppingsData} selected={toppings} setSelected={setToppings} toggle={toggleItem} color="#22c55e" />
          <Category title="🧀 Extras" items={extrasData} selected={extras} setSelected={setExtras} toggle={toggleItem} color="#f59e0b" />

          <button
  onClick={saveOrder}
  disabled={!hasOrder}
  style={{
    padding: 16,
    background: hasOrder ? "#22c55e" : "#475569",
    border: "none",
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 16,
    cursor: hasOrder ? "pointer" : "not-allowed",
    transition: "0.2s",
  }}
>
  🚀 Crear Pedido
</button>
        </div>

        {/* PEDIDO */}
        <div style={{ flex: 1, background: "#0f172a", padding: 20, borderRadius: 12 }}>
          <h2>🧾 Pedido</h2>

          <div style={{ marginBottom: 10 }}>
  <h3 style={{ margin: 0 }}>{generateName(proteins)}</h3>
  <small style={{ color: "#94a3b8" }}>
    Cliente: {clientName || "General"}
  </small>
</div>

          <hr style={{ borderColor: "#1e293b" }} />

          <p>Tamaño: {size} cm - ${sizeCost}</p>

          {proteins.map(i => (
            <div key={i.name} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{i.name}</span>
              <span>
                x{isDoubleProtein ? i.used * 2 : i.used} | ${itemCost(i, true).toFixed(0)}
              </span>
            </div>
          ))}

          {isDoubleProtein && (
            <p style={{ color: "#f59e0b", fontWeight: "bold" }}>
              🔥 Doble proteína aplicada
            </p>
          )}

          {[...toppings, ...extras.filter(e => e.name !== "Doble proteína")].map(i => (
            <div key={i.name} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{i.name}</span>
              <span>${itemCost(i).toFixed(0)}</span>
            </div>
          ))}

          <hr style={{ borderColor: "#1e293b" }} />

          <p>💰 Costo: ${totalCost.toFixed(0)}</p>
          <p style={{ fontSize: 32, fontWeight: "bold", color: "#22c55e" }}>💵 ${salePrice.toFixed(0)}</p>
        </div>
      </div>

      {/* HISTORIAL */}
      <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginTop: 20,
  }}
>
        <h2>📊 Historial</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 15 }}>
          {orders.map(order => (
            <div key={order.id} onClick={() => setSelectedOrder(order)} style={{
  background: "#0f172a",
  padding: 15,
  borderRadius: 12,
  cursor: "pointer",
  border: "1px solid #1e293b",
  transition: "all 0.2s ease",
}}
onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <strong>Orden #{order.orderNumber}</strong>
              <p>{order.clientName}</p>
              <p>${order.price?.toFixed(0)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedOrder && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    }}
  >
    {/* CONTENEDOR */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* 🧾 RECIBO */}
      <div
        id="printable"
        style={{
          background: "#fff",
          color: "#000",
          padding: 20,
          width: 280,
          borderRadius: 10,
          fontFamily: "monospace",
        }}
      >
        <h2 style={{ textAlign: "center" }}>🔥 SANDWICHIES</h2>

        <p>Orden #{selectedOrder.orderNumber}</p>
        <p>Cliente: {selectedOrder.clientName || "N/A"}</p>
        <p style={{ fontSize: 12 }}>{selectedOrder.date}</p>

        <hr style={{ borderColor: "#1e293b" }} />

        <p><strong>{selectedOrder.name}</strong></p>

        {/* ITEMS */}
        {selectedOrder.proteins.map((i, idx) => {
          const base = (i.price / i.units) * i.used;
          const total = selectedOrder.doubleProtein
            ? base * 2 + base * 0.5
            : base;

          return (
            <div key={`${i.name}-${idx}`} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{i.name}</span>
              <span>${total.toFixed(0)}</span>
            </div>
          );
        })}

        {[...selectedOrder.toppings, ...selectedOrder.extras.filter(e => e.name !== "Doble proteína")].map((i, idx) => {
          const cost = (i.price / i.units) * i.used;

          return (
            <div key={`${i.name}-extra-${idx}`} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{i.name}</span>
              <span>${cost.toFixed(0)}</span>
            </div>
          );
        })}

        <hr style={{ borderColor: "#1e293b" }} />

        <p style={{ fontWeight: "bold", fontSize: 18 }}>
          TOTAL: ${selectedOrder.price.toFixed(0)}
        </p>

        <hr style={{ borderColor: "#1e293b" }} />

        <p style={{ textAlign: "center" }}>💳 Paga aquí</p>

        <img
          src="/qr.png"
          alt="QR Pago"
          style={{ width: "100%", marginTop: 10 }}
        />

        <p style={{ textAlign: "center", marginTop: 10 }}>
          🙌 Gracias por tu compra
        </p>
      </div>

      {/* BOTONES */}
      <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
        <button
          onClick={() => {
            const printContent = document.getElementById("printable").innerHTML;
            const win = window.open("", "", "width=400,height=600");
            win.document.write(`
              <html>
                <head>
                  <title>Recibo</title>
                  <style>
                    body {
                      font-family: monospace;
                      padding: 20px;
                    }
                  </style>
                </head>
                <body>
                  ${printContent}
                </body>
              </html>
            `);
            win.document.close();
            win.print();
          }}
          style={{
            padding: 10,
            background: "#22c55e",
            border: "none",
            borderRadius: 8,
            color: "white",
            cursor: "pointer",
          }}
        >
          🖨️ Imprimir
        </button>

        <button
          onClick={() => setSelectedOrder(null)}
          style={{
            padding: 10,
            background: "#ef4444",
            border: "none",
            borderRadius: 8,
            color: "white",
            cursor: "pointer",
          }}
        >
          ❌ Cerrar
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

function Category({ title, items, selected, setSelected, toggle, color, isSize }) {
  return (
    <div style={{ background: "#0f172a", padding: 15, borderRadius: 12 }}>
      <h3>{title}</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        {items.map((item, i) => {
          const isSelected = isSize
            ? selected === item
            : selected.some(s => s.name === item.name);

          return (
            <button
              key={isSize ? item : item.name}
              onClick={() =>
                isSize
                  ? setSelected(item)
                  : toggle(item, selected, setSelected)
              }
              style={{
                padding: 12,
                borderRadius: 10,
                border: "none",
                background: isSelected ? color || "#22c55e" : "#1e293b",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {isSize ? `${item} cm` : item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}