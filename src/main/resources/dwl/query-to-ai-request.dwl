// Transform incoming query to AI service format
%dw 2.0
input payload object
output application/json

{
    model: "gpt-3.5-turbo",
    messages: [
        {
            role: "system",
            content: "You are a helpful customer support assistant. Your job is to understand customer queries and provide accurate information."
        },
        {
            role: "user",
            content: payload.query
        }
    ],
    temperature: 0.7,
    max_tokens: 500
}
