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
import html2canvas from "html2canvas";

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

const generateName = (proteins, size) => {
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

export default function App() {
  const [size, setSize] = useState("15");
  const [proteins, setProteins] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [extras, setExtras] = useState([]);
  const [orders, setOrders] = useState([]);
  const [margin, setMargin] = useState(0.75);
  const [clientName, setClientName] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("sandwiches");

  const isDoubleProtein = extras.some(e => e.name === "Doble proteína");

  const downloadReceipt = async () => {
  const element = document.getElementById("printable");

  const canvas = await html2canvas(element, {
    scale: 2, // mejor calidad 🔥
    backgroundColor: "#ffffff",
  });

  const data = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = data;
  link.download = `pedido-${selectedOrder.orderNumber}.png`;
  link.click();
};

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

      const getMaxSandwiches = (item) => {
      return Math.floor(item.units / item.used);
      };

      const inventory = [
        ...proteinsData.map(i => ({ ...i, type: "Proteína" })),
        ...toppingsData.map(i => ({ ...i, type: "Topping" })),
        ...extrasData.map(i => ({ ...i, type: "Extra" })),
      ];

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
      name: generateName(proteins, size),
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

    {/* 🔥 TABS */}
    <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "center" }}>
      
      {["dashboard", "sandwiches", "inventario", "hamburguesas"].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: activeTab === tab ? "#22c55e" : "#1e293b",
            color: "white",
            fontWeight: "bold"
          }}
        >
          {tab.toUpperCase()}
        </button>
      ))}
      </div>

        {activeTab === "sandwiches" && (
          <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
          marginTop: 20,
          alignItems: "start",
            }}
            > 

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
        <div style={{
            background: "linear-gradient(160deg, #020617, #0f172a)",
            padding: 20,
            borderRadius: 20,
            border: "1px solid #1e293b",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            position: "sticky",
            top: 20,
          }}>
          <h2>🧾 Pedido</h2>

          <div style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>{generateName(proteins, size)}</h3>
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
      )}

      {/* HISTORIAL */}
      {activeTab === "sandwiches" && (
      <div style={{ marginTop: 40 }}>
      <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15
    }}>
    <h2>🕘 Historial de pedidos</h2>

    <span style={{
      background: "#022c22",
      color: "#22c55e",
      padding: "4px 10px",
      borderRadius: 10,
      fontSize: 12
    }}>
      {orders.length} pedidos
    </span>
  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: 15,
    }}
  >
          {orders.map(order => (
            <div
    key={order.id}
    onClick={() => setSelectedOrder(order)}
    style={{
      background: "#0f172a",
      padding: 16,
      borderRadius: 16,
      border: "1px solid #1e293b",
      cursor: "pointer",
      transition: "0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
  >

    <div style={{ fontSize: 12, color: "#94a3b8" }}>
      ORDEN #{order.orderNumber}
    </div>

    <p style={{ fontWeight: "bold", margin: "6px 0" }}>
      {order.clientName || "Cliente"}
    </p>

    <p style={{ fontSize: 12, opacity: 0.7 }}>
      {order.name}
    </p>

    <p style={{
      marginTop: 10,
      fontWeight: "bold",
      fontSize: 18,
      color: "#22c55e"
    }}>
      ${order.price?.toFixed(0)}
    </p>

  </div>
))}
        </div>
      </div>
      )}

{activeTab === "inventario" && (
  <div style={{ marginTop: 30 }}>

    <h2>📦 Inventario</h2>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: 15,
      marginTop: 15
    }}>
      {inventory.map((item, idx) => {
        const max = Math.floor(item.units / item.used);

        return (
          <div
            key={idx}
            style={{
              background: "#0f172a",
              padding: 16,
              borderRadius: 12,
              border: "1px solid #1e293b"
            }}
          >
            <p style={{ fontSize: 12, opacity: 0.6 }}>{item.type}</p>
            <h3>{item.name}</h3>
            <p>📦 Stock: {item.units}</p>
            <p>🥪 Uso: {item.used}</p>
            <p>👉 Máx: {max}</p>
          </div>
        );
      })}
    </div>

  </div>
)}

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
    overflowY: "auto",          // 🔥 permite scroll
    padding: 20,                // 🔥 espacio en móviles
  }}
>
      {/* CONTENEDOR */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 600,   // 🔥 evita que crezca demasiado
        }}
      >
      {/* 🧾 RECIBO */}
      <div
  id="printable"
  style={{
    display: "flex",
    gap: 20,
    background: "#000",
    padding: 20,
    borderRadius: 10,
    flexWrap: "wrap",     // 🔥 clave responsive
    justifyContent: "center",
    width: "100%",
  }}
>

  {/* 🧾 CLIENTE */}
        <div style={{
        width: "100%",
        maxWidth: 260,   // 🔥 límite elegante
      }}>
    <h3>🧾 Cliente</h3>

    <p>Orden #{selectedOrder.orderNumber}</p>
    <p>{selectedOrder.clientName}</p>
    <p style={{ fontSize: 12 }}>{selectedOrder.date}</p>

    <hr />

    <strong>{selectedOrder.name}</strong>

    {/* SIN PRECIOS */}
    {selectedOrder.proteins.map((i, idx) => (
      <div key={idx}>
        {i.name} x{selectedOrder.doubleProtein ? i.used * 2 : i.used}
      </div>
    ))}

    {selectedOrder.toppings.map((i, idx) => (
      <div key={idx}>{i.name} x{i.used}</div>
    ))}

    {selectedOrder.extras
      .filter(e => e.name !== "Doble proteína")
      .map((i, idx) => (
        <div key={idx}>{i.name} x{i.used}</div>
      ))}

    <hr />

    <p style={{ fontWeight: "bold" }}>
      TOTAL: ${selectedOrder.price.toFixed(0)}
    </p>
    <img src="/qr.png" style={{ width: "100%", marginTop: 10 }} />
  </div>

        {/* 💼 VENDEDOR */}
          <div style={{
          width: "100%",
          maxWidth: 260,   // 🔥 límite elegante
        }}>
    <h3>💼 Vendedor</h3>

    <strong>{selectedOrder.name}</strong>

    {selectedOrder.proteins.map((i, idx) => {
      const base = (i.price / i.units) * i.used;
      const total = selectedOrder.doubleProtein
        ? base * 2 + base * 0.5
        : base;

      return (
        <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{i.name}</span>
          <span>${total.toFixed(0)}</span>
        </div>
      );
    })}

    {[...selectedOrder.toppings, ...selectedOrder.extras.filter(e => e.name !== "Doble proteína")].map((i, idx) => {
      const cost = (i.price / i.units) * i.used;

      return (
        <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{i.name}</span>
          <span>${cost.toFixed(0)}</span>
        </div>
      );
    })}

    <hr />

    <p>Costo: ${selectedOrder.cost.toFixed(0)}</p>
    <p>Venta: ${selectedOrder.price.toFixed(0)}</p>
    <p style={{ fontWeight: "bold" }}>
      Ganancia: ${(selectedOrder.price - selectedOrder.cost).toFixed(0)}
    </p>
  </div>

</div>

      {/* BOTONES */}
      <div
            style={{
              marginTop: 15,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",        // 🔥 no se salen
              justifyContent: "center"
            }}
          >
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
        <button
        onClick={downloadReceipt}
        style={{
          padding: 10,
          background: "#3b82f6",
          border: "none",
          borderRadius: 8,
          color: "white",
          cursor: "pointer",
        }}
      >
        📲 Descargar Imagen
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