import { sendWhatsApp } from "../utils/whatsapp";

export default function OrderModal({ selectedOrder, setSelectedOrder }) {
  if (!selectedOrder) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
        overflowY: "auto",
        padding: 20,
      }}
    >
      {/* CONTENEDOR */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 600,
        }}
      >
        {/* 🧾 RECIBO */}
        <div
          style={{
            display: "flex",
            gap: 20,
            background: "#000",
            padding: 20,
            borderRadius: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {/* 🧾 CLIENTE */}
          <div
            style={{
              width: "100%",
              maxWidth: 260,
            }}
          >
            <h3>🧾 Cliente</h3>

            <p>Orden #{selectedOrder.orderNumber}</p>
            <p>{selectedOrder.clientName}</p>
            <p style={{ fontSize: 12 }}>
              {selectedOrder.date?.toDate?.().toLocaleString?.() || ""}
            </p>

            <hr />

            <strong>{selectedOrder.name}</strong>

            {/* 🥖 BASE */}
            <p style={{ marginTop: 10 }}>🥖 Base:</p>
            {selectedOrder.base?.map((b, i) => (
              <div key={i}>• {b}</div>
            ))}

            {/* 🥩 PROTEÍNAS */}
            {selectedOrder.proteins?.map((i, idx) => {
              const isDouble = selectedOrder.extras?.some(
                e => e.name === "Doble proteína"
              );

              const qty = isDouble ? i.used * 2 : i.used;

              return (
                <div key={idx}>
                  • {i.name} x{qty}
                </div>
              );
            })}

            {/* 🥬 TOPPINGS */}
            {selectedOrder.toppings?.map((i, idx) => (
              <div key={idx}>• {i.name}</div>
            ))}

            {/* 🧀 EXTRAS */}
            {selectedOrder.extras?.map((i, idx) => (
              <div key={idx}>
                • {i.name === "Doble proteína"
                  ? "🔥 Doble proteína"
                  : i.name}
              </div>
            ))}

            <hr />

            <p style={{ fontWeight: "bold" }}>
              TOTAL: ${selectedOrder.price?.toFixed(0)}
            </p>
          </div>

          {/* 💼 VENDEDOR */}
          <div
            style={{
              width: "100%",
              maxWidth: 260,
            }}
          >
            <h3>💼 Vendedor</h3>

            {/* 🥖 BASE */}
            <p>🥖 Base:</p>
            {selectedOrder.base?.map((b, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{b}</span>
                <span>$--</span>
              </div>
            ))}

            <strong>{selectedOrder.name}</strong>

            {/* 🥩 PROTEÍNAS */}
            {selectedOrder.proteins?.map((i, idx) => {
              const isDouble = selectedOrder.extras?.some(
                e => e.name === "Doble proteína"
              );

              const base = (i.price / i.units) * i.used;

              const total = isDouble
                ? base * 2 + base * 0.5
                : base;

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{i.name}</span>
                  <span>${total.toFixed(0)}</span>
                </div>
              );
            })}

            {/* 🥬 + 🧀 */}
            {[
              ...(selectedOrder.toppings || []),
              ...(selectedOrder.extras || []).filter(
                (e) => e.name !== "Doble proteína"
              ),
            ].map((i, idx) => {
              const cost = (i.price / i.units) * i.used;

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{i.name}</span>
                  <span>${cost.toFixed(0)}</span>
                </div>
              );
            })}

            <hr />

            <p>Costo: ${selectedOrder.cost?.toFixed(0)}</p>
            <p>Venta: ${selectedOrder.price?.toFixed(0)}</p>

            <p style={{ fontWeight: "bold" }}>
              Ganancia: $
              {(selectedOrder.price - selectedOrder.cost)?.toFixed(0)}
            </p>
          </div>
        </div>

        {/* BOTONES */}
        <div
          style={{
            marginTop: 15,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
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
            onClick={() => sendWhatsApp(selectedOrder)}
            style={{
              padding: 10,
              background: "#25D366",
              border: "none",
              borderRadius: 8,
              color: "white",
              cursor: "pointer",
            }}
          >
            💬 WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}