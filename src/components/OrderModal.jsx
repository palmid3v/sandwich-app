import { sendWhatsApp } from "../utils/whatsapp";

export default function OrderModal({ selectedOrder, setSelectedOrder, downloadReceipt }) {
  if (!selectedOrder) return null;

  return (
    // 👉 pega aquí tu modal (SIN el {selectedOrder &&})
    
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
        <div 
        id="printable-client"
        style={{
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
            const printContent = document.getElementById("printable-client").innerHTML;
            const win = window.open("", "", "width=400,height=600");
            win.document.write(`
            <html>
              <head>
                <title>Recibo</title>
                <style>
                  body {
                    font-family: monospace;
                    padding: 20px;
                    background: white;
                    color: black;
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