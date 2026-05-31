// Transform order data for response
%dw 2.0
input payload object

output application/json

{
    orderId: payload.orderId,
    status: payload.status,
    orderDate: payload.orderDate,
    estimatedDelivery: payload.estimatedDelivery,
    totalAmount: payload.totalAmount,
    trackingNumber: payload.trackingNumber,
    itemCount: (payload.items default []) | length,
    items: (payload.items default []) map {
        name: $.name,
        quantity: $.quantity,
        price: $.unitPrice
    }
}
