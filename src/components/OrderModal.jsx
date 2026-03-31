import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function OrderModal({ selectedOrder, setSelectedOrder }) {
  if (!selectedOrder) return null;

  // 🔥 Soporte cliente + admin
  const item = selectedOrder.items?.[0] || selectedOrder;

  const totalCost =
    selectedOrder.cost ??
    selectedOrder.items?.reduce((acc, i) => acc + (i.cost || 0), 0) ??
    0;

  const totalPrice =
    selectedOrder.price ??
    selectedOrder.total ??
    selectedOrder.items?.reduce((acc, i) => acc + (i.price || 0), 0) ??
    0;

  const profit = totalPrice - totalCost;

  // 🔥 Estados
  const updateStatus = async (newStatus) => {
    try {
      const ref = doc(db, "orders", selectedOrder.id);
      await updateDoc(ref, { status: newStatus });
    } catch (err) {
      console.error("Error actualizando estado:", err);
    }
  };

  return (
    <div
      onClick={() => setSelectedOrder(null)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#020617",
          padding: 30,
          borderRadius: 16,
          width: 400,
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid #1e293b",
        }}
      >
        {/* HEADER */}
        <h2 style={{ textAlign: "center" }}>
          🧾 Pedido #{selectedOrder.orderNumber}
        </h2>

        <p style={{ textAlign: "center", fontWeight: "bold" }}>
          {selectedOrder.clientName}
        </p>

        <p style={{ textAlign: "center", fontSize: 12 }}>
          📱 {selectedOrder.phone}
        </p>

        <hr style={{ margin: "15px 0" }} />

        {/* PRODUCTO */}
        <h3 style={{ color: "#fbbf24" }}>
          🍞 {selectedOrder.name}
        </h3>

        <p>📏 {item.size} cm</p>

        {/* BASE */}
        {item.base?.length > 0 && (
          <>
            <p style={{ opacity: 0.7 }}>Base</p>
            {item.base.map((b, idx) => (
              <p key={idx}>• {b}</p>
            ))}
          </>
        )}

        {/* PROTEÍNAS */}
        {item.proteins?.length > 0 && (
          <>
            <p style={{ opacity: 0.7 }}>Proteínas</p>
            {item.proteins.map((p, idx) => {
              const isDouble = item.extras?.some(
                (e) => e.name === "Doble proteína"
              );

              const qty = isDouble ? p.used * 2 : p.used;

              return (
                <p key={idx}>
                  • {p.name} x{qty}
                </p>
              );
            })}
          </>
        )}

        {/* EXTRAS */}
        {item.extras?.length > 0 && (
          <>
            <p style={{ opacity: 0.7 }}>Extras</p>
            {item.extras.map((e, idx) => (
              <p key={idx}>
                • {e.name === "Doble proteína"
                  ? "🔥 Doble proteína"
                  : e.name}
              </p>
            ))}
          </>
        )}

        <hr />

        {/* 💰 TOTAL CLIENTE */}
        <h3 style={{ textAlign: "center" }}>
          Total: ${Math.round(totalPrice).toLocaleString("es-CO")}
        </h3>

        {/* 💸 NEGOCIO */}
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid #1e293b",
          }}
        >
          <p style={{ fontSize: 13, opacity: 0.8 }}>
            💸 Tu costo: ${Math.round(totalCost).toLocaleString("es-CO")}
          </p>

          <p style={{ fontSize: 13, opacity: 0.8 }}>
            💵 Precio cliente: ${Math.round(totalPrice).toLocaleString("es-CO")}
          </p>

          <p
            style={{
              fontWeight: "bold",
              color: "#22c55e",
              marginTop: 5,
            }}
          >
            📈 Ganancia: ${Math.round(profit).toLocaleString("es-CO")}
          </p>
        </div>

        {/* 🔄 ESTADOS */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={() => updateStatus("pendiente")}
            style={{
              flex: 1,
              padding: 10,
              background: "#fbbf24",
              border: "none",
              borderRadius: 10,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🟡 Pendiente
          </button>

          <button
            onClick={() => updateStatus("preparando")}
            style={{
              flex: 1,
              padding: 10,
              background: "#f97316",
              border: "none",
              borderRadius: 10,
              fontWeight: "bold",
              cursor: "pointer",
              color: "white",
            }}
          >
            🟠 Preparando
          </button>

          <button
            onClick={() => updateStatus("listo")}
            style={{
              flex: 1,
              padding: 10,
              background: "#22c55e",
              border: "none",
              borderRadius: 10,
              fontWeight: "bold",
              cursor: "pointer",
              color: "white",
            }}
          >
            🟢 Listo
          </button>
        </div>
      </div>
    </div>
  );
}