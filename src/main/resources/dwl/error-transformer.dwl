// Transform error response
%dw 2.0
input payload any
var errorMessage = if (payload is String) payload else (payload.message default "Unknown error")
var errorCode = if (payload.errorCode?) payload.errorCode else "SYSTEM_ERROR"
var requestId = vars.requestId default "UNKNOWN"
var timestamp = now() as String {format: 'yyyy-MM-dd HH:mm:ss'}

output application/json

{
    errorCode: errorCode,
    errorMessage: errorMessage,
    timestamp: timestamp,
    requestId: requestId
}
