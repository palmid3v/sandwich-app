export const sendWhatsApp = (order) => {
  if (!order?.phone) {
    alert("Falta número de WhatsApp");
    return;
  }

  const message = `
Hola ${order.clientName || ""} 👋

🧾 *Tu pedido en Sandwichies*

📦 Orden #${order.orderNumber}
🥪 ${order.name}
💰 Total: $${order.price.toFixed(0)}

Gracias por tu compra 🙌
  `;

  const url = `https://wa.me/${order.phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
};