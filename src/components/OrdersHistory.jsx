import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import OrderModal from "./OrderModal";

export default function OrdersHistory({ orders, selectedOrder, setSelectedOrder }) {

  const updateStatus = async (id, newStatus) => {
  try {
    const ref = doc(db, "orders", id);
    await updateDoc(ref, { status: newStatus });
  } catch (err) {
    console.error("Error actualizando estado:", err);
  }
};

  return (
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
              fontSize: 12,
              fontWeight: "bold",
              marginTop: 5,
              color:
                order.status === "listo"
                  ? "#22c55e"
                  : order.status === "preparando"
                  ? "#f97316"
                  : "#fbbf24"
            }}>
              {order.status?.toUpperCase() || "PENDIENTE"}
            </p>

            <p style={{
              marginTop: 10,
              fontWeight: "bold",
              fontSize: 18,
              color: "#22c55e"
            }}>
              ${(order.price || order.total || 0).toFixed(0)}
            </p>

          </div>
        ))}
      </div>

      {/* new add */}
      <OrderModal
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
      />
    </div>
    );
}