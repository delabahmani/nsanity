// In lib/email-templates/admin-notification.ts
export function generateAdminOrderNotificationEmail(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    color: string; // Keep this
    size: string; // Keep this
  }>;
}) {
  return {
    subject: `New Order Received - #${data.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Order Alert 🛒</h1>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
          <p><strong>Total:</strong> $${data.total.toFixed(2)}</p>
        </div>
        
        <h3>Items Ordered:</h3>
        <ul style="list-style-type: none; padding: 0;">
          ${data.orderItems
            .map(
              (item) => `
            <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
              <strong>${item.name}</strong><br>
              Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}<br>
              Price: $${item.price.toFixed(2)}
            </li>
          `
            )
            .join("")}
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://nsanity.shop/admin" 
             style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View in Admin Dashboard
          </a>
        </div>
      </div>
    `,
  };
}
