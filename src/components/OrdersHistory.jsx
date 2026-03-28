export default function OrdersHistory({ orders, selectedOrder, setSelectedOrder }) {
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

      {/* new add */}
      {selectedOrder && (
  <div
    onClick={() => setSelectedOrder(null)}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
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
        border: "1px solid #1e293b"
      }}
    >
      <h2>🧾 Pedido #{selectedOrder.orderNumber}</h2>

      <p><strong>{selectedOrder.clientName}</strong></p>
      <p>📱 {selectedOrder.phone}</p>

      <hr style={{ margin: "15px 0" }} />

      {selectedOrder.items?.map((item, i) => (
        <div key={i} style={{ marginBottom: 20 }}>

          <h3 style={{ color: "#fbbf24" }}>
            🍞 {item.name}
          </h3>

          <p>📏 {item.size} cm</p>

          {item.base?.length > 0 && (
            <>
              <p style={{ opacity: 0.7 }}>Base</p>
              {item.base.map((b, idx) => (
                <p key={idx}>• {b}</p>
              ))}
            </>
          )}

          {item.proteins?.length > 0 && (
            <>
              <p style={{ opacity: 0.7 }}>Proteínas</p>
              {item.proteins.map((p, idx) => (
                <p key={idx}>• {p.name}</p>
              ))}
            </>
          )}

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

          <p style={{
            marginTop: 10,
            fontWeight: "bold",
            color: "#22c55e"
          }}>
            💰 ${Math.round(item.price).toLocaleString()}
          </p>

        </div>
      ))}

      <hr />

      <h3>
        Total: ${Math.round(selectedOrder.total || 0).toLocaleString()}
      </h3>

    </div>
  </div>
)}
    </div>
  );
}