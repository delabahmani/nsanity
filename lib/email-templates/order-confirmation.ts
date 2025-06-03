// In lib/email-templates/order-confirmation.ts
export function generateOrderConfirmationEmail(data: {
  customerName: string;
  orderId: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    color: string;
    size: string;
  }>;
  total: number;
  shippingAddress?: string;
}) {
  return {
    subject: `Order Confirmation - Order #${data.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Thank you for your order, ${data.customerName}!</h1>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #e9e9e9;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Size</th>
                <th style="padding: 10px; text-align: center;">Color</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${data.orderItems
                .map(
                  (item) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.size}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.color}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 20px;">
            <h3>Total: $${data.total.toFixed(2)}</h3>
          </div>
        </div>
        
        ${
          data.shippingAddress
            ? `
          <div style="margin: 20px 0;">
            <h3>Shipping Address</h3>
            <p>${data.shippingAddress}</p>
          </div>
        `
            : ""
        }
        
        <p>We'll send you a shipping confirmation once your order is on its way!</p>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; margin-top: 30px;">
          <p>Questions? Contact us at support@nsanity.shop</p>
        </div>
      </div>
    `,
  };
}
