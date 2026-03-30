export default function Dashboard({ orders }) {

  const totalSales = orders.reduce(
    (sum, o) => sum + (o.total || 0),
    0
  );

  const totalCost = orders.reduce(
    (sum, o) =>
      sum +
      (o.items?.reduce((acc, i) => acc + (i.cost || 0), 0) || 0),
    0
  );
  const totalProfit = totalSales - totalCost;
  const avgTicket = orders.length ? totalSales / orders.length : 0;

  // 🔥 producto más vendido
  const productCount = {};

  orders.forEach(order => {
  order.items?.forEach(item => {
    const name = item.name || "Personalizado";
    productCount[name] = (productCount[name] || 0) + 1;
  });
});

  const topProduct = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <div style={{ marginTop: 30 }}>

      <h2>📊 Dashboard</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 15,
        marginTop: 20
      }}>

        <Card title="💰 Ventas" value={`$${totalSales.toFixed(0)}`} />
        <Card title="📉 Costos" value={`$${totalCost.toFixed(0)}`} />
        <Card title="📈 Ganancia" value={`$${totalProfit.toFixed(0)}`} />
        <Card title="🧾 Ticket Promedio" value={`$${avgTicket.toFixed(0)}`} />

      </div>

      <div style={{ marginTop: 30 }}>
        <h3>🔥 Más vendido</h3>

        {topProduct ? (
          <div style={{
            background: "#0f172a",
            padding: 15,
            borderRadius: 12,
            marginTop: 10
          }}>
            <strong>{topProduct[0]}</strong>
            <p>{topProduct[1]} pedidos</p>
          </div>
        ) : (
          <p>No hay datos aún</p>
        )}
      </div>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{
      background: "#0f172a",
      padding: 20,
      borderRadius: 12,
      border: "1px solid #1e293b"
    }}>
      <p style={{ opacity: 0.7 }}>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}