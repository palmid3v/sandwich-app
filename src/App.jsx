import { useState, useEffect } from "react";
import Category from "./components/Category";
import { generateName } from "./utils/generateName";
import { sendWhatsApp } from "./utils/whatsapp";
import OrderModal from "./components/OrderModal";
import OrdersHistory from "./components/OrdersHistory";
import Dashboard from "./components/Dashboard";
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
import Login from "./pages/Login";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

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

export default function App() {
  const [size, setSize] = useState("15");
  const [proteins, setProteins] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [extras, setExtras] = useState([]);
  const [orders, setOrders] = useState([]);
  const [margin, setMargin] = useState(0.75);
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("sandwiches");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
  await signOut(auth);
    };

  const isDoubleProtein = extras.some(e => e.name === "Doble proteína");

  const downloadReceipt = async () => {
  const element = document.getElementById("printable-client");

if (!element) {
  console.error("No se encontró el recibo");
  return;
}

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
    const q = query(collection(db, "orders"));

    onSnapshot(q, (snapshot) => {
  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  // 🔔 detectar nuevo pedido
  if (data.length > orders.length) {
    const audio = new Audio("/bell.mp3");
    audio.play().catch(() => {
      console.log("El navegador bloqueó el sonido");
    });
  }

  setOrders(data);
});

    return () => unsub();
  }, []);
  // LOGIN
      useEffect(() => {
  const unsub = onAuthStateChanged(auth, (u) => {
    setUser(u);
    setLoading(false);
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

    // const orderNumber = await getNextOrderNumber();

    const newOrder = {
      // orderNumber,
      clientName,
      phone,
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

    if (loading) return null;

    if (!user) {
      return <Login />;
    }

 return (
  <div style={{ padding: 20, background: "#020617", color: "white", minHeight: "100vh" }}>

    <h1 style={{ textAlign: "center", fontSize: 28 }}>🔥 Sandwichies</h1>

        <button
    onClick={handleLogout}
    style={{
      padding: "8px 12px",
      background: "#ef4444",
      border: "none",
      borderRadius: 8,
      color: "white",
      cursor: "pointer"
    }}
  >
    🔓 Cerrar sesión
  </button>

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
        {activeTab === "dashboard" && (
          <Dashboard orders={orders} />
          )}

        {/* BUILDER */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 15 }}>

          <div style={{ background: "#0f172a", padding: 15, borderRadius: 12 }}>
            <h3>👤 Cliente</h3>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nombre del cliente"
              style={{ width: "50%", padding: 8, borderRadius: 8, border: "none" }}
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="WhatsApp (ej: 573001234567)"
              style={{
                width: "50%",
                padding: 8,
                borderRadius: 8,
                border: "none",
                marginTop: 8
              }}
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

        {activeTab === "dashboard" && (
          <Dashboard orders={orders} />
        )}
        {activeTab === "sandwiches" && (
          <OrdersHistory
            orders={orders}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
          />
        )}
      <OrderModal
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        downloadReceipt={downloadReceipt}
      />

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
    </div>
  );
}