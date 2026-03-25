import { useState, useEffect } from "react";

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

  useEffect(() => {
    const saved = localStorage.getItem("orders");
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const toggleItem = (item, list, setList) => {
    const exists = list.find(i => i.name === item.name);
    if (exists) {
      setList(list.filter(i => i.name !== item.name));
    } else {
      setList([...list, item]);
    }
  };

  const isDoubleProtein = extras.some(e => e.name === "Doble proteína");

  const itemCost = (item, isProtein = false) => {
    const base = (item.price / item.units) * item.used;

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

  const salePrice = totalCost * (1 + margin);

  const saveOrder = () => {
    if (!proteins.length) return;

    const newOrder = {
      id: Date.now(),
      orderNumber: orders.length + 1,
      clientName,
      size,
      proteins,
      toppings,
      extras,
      cost: totalCost,
      price: salePrice,
      margin,
      name: generateName(proteins),
      date: new Date().toLocaleString(),
      doubleProtein: isDoubleProtein,
    };

    setOrders([newOrder, ...orders]);
    setProteins([]);
    setToppings([]);
    setExtras([]);
    setClientName("");
  };

  return (
    <div style={{ padding: 20, background: "#020617", color: "white", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", fontSize: 28 }}>🔥 Sandwich PRO Builder</h1>

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

          <button onClick={saveOrder} style={{ padding: 14, background: "#f59e0b", border: "none", borderRadius: 10, fontWeight: "bold" }}>
            📦 Guardar Pedido
          </button>
        </div>

        {/* PEDIDO */}
        <div style={{ flex: 1, background: "#0f172a", padding: 20, borderRadius: 12 }}>
          <h2>🧾 Pedido</h2>

          <p><strong>Cliente:</strong> {clientName || "-"}</p>
          <p><strong>Nombre:</strong> {generateName(proteins)}</p>

          <hr />

          <p>Tamaño: {size} cm - ${sizeCost}</p>

          {/* PROTEÍNAS */}
{proteins.map(i => (
  <div key={i.name} style={{ display: "flex", justifyContent: "space-between" }}>
    <span>{i.name}</span>
    <span>
      x{isDoubleProtein ? i.used * 2 : i.used} | $
      {itemCost(i, true).toFixed(0)}
    </span>
  </div>
))}

{/* INDICADOR */}
{isDoubleProtein && (
  <p style={{ color: "#f59e0b", fontWeight: "bold" }}>
    🔥 Doble proteína aplicada
  </p>
)}

{/* TOPPINGS + EXTRAS (SIN doble proteína) */}
{[...toppings, ...extras.filter(e => e.name !== "Doble proteína")].map(i => (
  <div key={i.name} style={{ display: "flex", justifyContent: "space-between" }}>
    <span>{i.name}</span>
    <span>${itemCost(i).toFixed(0)}</span>
  </div>
))}

          <hr />

          <p>💰 Costo: ${totalCost.toFixed(0)}</p>
          <p style={{ fontSize: 20, fontWeight: "bold" }}>💵 ${salePrice.toFixed(0)}</p>
        </div>
      </div>

      {/* HISTORIAL */}
      <div style={{ marginTop: 40 }}>
        <h2>📊 Historial</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 15 }}>
          {orders.map(order => (
            <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ background: "#0f172a", padding: 15, borderRadius: 10, cursor: "pointer" }}>
              <strong>Orden #{order.orderNumber}</strong>
              <p>{order.clientName}</p>
              <p>${order.price.toFixed(0)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center" }}>

          <div style={{ display: "flex", gap: 20 }}>

            <div style={{ background: "#fff", color: "#000", padding: 20, borderRadius: 10, fontFamily: "monospace" }}>
              <h3>🧾 Cliente</h3>
              <p>Orden #{selectedOrder.orderNumber}</p>
              <p>{selectedOrder.clientName}</p>
              <p>{selectedOrder.name}</p>

              {selectedOrder.proteins.map((i, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{i.name}</span>
                  <span>x{selectedOrder.doubleProtein ? i.used * 2 : i.used}</span>
                </div>
              ))}

              <hr />
              <p><strong>Total: ${selectedOrder.price.toFixed(0)}</strong></p>
            </div>

            <div style={{ background: "#fff", color: "#000", padding: 20, borderRadius: 10, fontFamily: "monospace" }}>
              <h3>💼 Vendedor</h3>

              {selectedOrder.proteins.map((i, idx) => {
                const base = (i.price / i.units) * i.used;
                const total = selectedOrder.doubleProtein ? base * 2 + base * 0.5 : base;

                return (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{i.name}</span>
                    <span>${total.toFixed(0)}</span>
                  </div>
                );
              })}

              <hr />
              <p>Costo: ${selectedOrder.cost.toFixed(0)}</p>
              <p><strong>Venta: ${selectedOrder.price.toFixed(0)}</strong></p>
            </div>

          </div>

          <button onClick={() => setSelectedOrder(null)} style={{ position: "absolute", top: 20, right: 20 }}>❌</button>
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
              key={i}
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