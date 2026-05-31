// Transform support response to standard format
%dw 2.0
input payload object
var requestId = vars.requestId
var intent = vars.detectedIntent
var timestamp = now() as String {format: 'yyyy-MM-dd HH:mm:ss'}

output application/json

{
    requestId: requestId,
    intent: intent,
    message: payload.message,
    data: payload.data,
    timestamp: timestamp
}
