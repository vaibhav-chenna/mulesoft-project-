// Transform customer data for response
%dw 2.0
input payload object

output application/json

{
    customerId: payload.id,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    loyaltyTier: payload.loyaltyTier default "BRONZE",
    rewardPoints: payload.rewardPoints default 0,
    registrationDate: payload.registrationDate
}
