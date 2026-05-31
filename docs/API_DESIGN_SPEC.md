# API Design & Technical Specification

## API Overview

The AI-Powered Customer Support API is built on the MuleSoft Anypoint Platform using the API-led connectivity pattern. It provides a REST interface for customers to submit support queries and retrieve information about their accounts and orders.

### Design Principles

1. **RESTful Design**: Follows REST conventions for resource management
2. **API-Led Connectivity**: Separates concerns into Experience, Process, and System APIs
3. **Stateless Processing**: Each request is independent
4. **Content Negotiation**: All requests and responses use JSON
5. **Error Standardization**: Consistent error response format
6. **Scalability**: Stateless design enables horizontal scaling

---

## API Architecture

```
┌─────────────────────────────────────────────────────────┐
│             EXPERIENCE API (Facade)                     │
│  - Client-facing endpoints                            │
│  - Request validation                                 │
│  - Response formatting                                │
│  - Rate limiting                                      │
└─────────────┬───────────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────────┐
│             PROCESS API (Orchestration)                │
│  - Intent detection                                   │
│  - Business logic                                     │
│  - System API orchestration                           │
│  - Response aggregation                               │
└─────────────┬───────────────────────────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
┌───▼──────┐      ┌─────▼────┐
│ Customer │      │  Order   │
│ System   │      │ System   │
│  API     │      │  API     │
└──────────┘      └──────────┘
```

---

## Endpoint Specifications

### 1. Health Check Endpoint

**Purpose**: Verify API is running and healthy

**Endpoint**: `GET /api/v1/support/health`

**Authentication**: None

**Request Headers**:
```
GET /api/v1/support/health HTTP/1.1
Host: localhost:8081
```

**Success Response**:
- Status Code: `200 OK`
- Content-Type: `application/json`

**Response Body**:
```json
{
  "status": "UP",
  "timestamp": "2026-05-25 13:30:00",
  "version": "1.0.0"
}
```

**Status Field Values**:
- `UP`: Service is running normally
- `DOWN`: Service is unavailable
- `DEGRADED`: Service running with issues

**Use Cases**:
- Kubernetes liveness probe
- Load balancer health check
- Infrastructure monitoring

---

### 2. Support Query Endpoint

**Purpose**: Submit customer support query with AI processing

**Endpoint**: `POST /api/v1/support/query`

**Authentication**: API Key (optional, configurable)

**Request Headers**:
```
POST /api/v1/support/query HTTP/1.1
Host: localhost:8081
Content-Type: application/json
```

**Request Body**:
```json
{
  "query": "Where is my order?",
  "customerId": "CUST12345",
  "context": "Regarding order placed on 2026-05-20"
}
```

**Request Field Definitions**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| query | string | Yes | Customer's support query (1-1000 chars) |
| customerId | string | No | Customer ID for personalized responses |
| context | string | No | Additional context (max 500 chars) |

**Processing Flow**:
1. Validate input
2. Detect intent using AI
3. Route to appropriate handler
4. Fetch data from System APIs if needed
5. Generate response
6. Return formatted response

**Success Response**:
- Status Code: `200 OK`
- Content-Type: `application/json`

**Response Body** (Order Status Intent):
```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "intent": "order_status",
  "message": "Your order #ORD123456 is out for delivery and expected to arrive on May 25, 2026",
  "data": {
    "orderId": "ORD123456",
    "status": "SHIPPED",
    "estimatedDelivery": "2026-05-25",
    "trackingNumber": "TRK987654",
    "totalAmount": 299.99
  },
  "timestamp": "2026-05-25 13:30:00"
}
```

**Response Field Definitions**:

| Field | Type | Description |
|-------|------|-------------|
| requestId | UUID | Unique request identifier for tracking |
| intent | string | Detected user intent (order_status, customer_info, complaint, general) |
| message | string | Natural language response message |
| data | object | Additional data based on intent |
| timestamp | string | ISO 8601 timestamp of response |

**Intent Types**:

| Intent | Trigger Keywords | Action | Data Returned |
|--------|-----------------|--------|---------------|
| `order_status` | where, order, track, delivery, status | Fetch order details | Order info with tracking |
| `customer_info` | loyalty, tier, rewards, account, points | Fetch customer details | Customer info with tier |
| `complaint` | damaged, wrong, issue, problem | Create support ticket | Ticket details |
| `general` | anything else | Generate AI response | Generic helpful message |

**Error Response**:
- Status Code: `400 Bad Request`

**Error Response Body**:
```json
{
  "errorCode": "INVALID_INPUT",
  "errorMessage": "Query field is required and must be 1-1000 characters",
  "timestamp": "2026-05-25 13:30:00",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 3. Get Customer Endpoint

**Purpose**: Retrieve customer information

**Endpoint**: `GET /api/v1/support/customer/{customerId}`

**Path Parameters**:
- `customerId` (string, required): Unique customer identifier

**Example**: `GET /api/v1/support/customer/CUST12345`

**Request Headers**:
```
GET /api/v1/support/customer/CUST12345 HTTP/1.1
Host: localhost:8081
```

**Success Response**:
- Status Code: `200 OK`

**Response Body**:
```json
{
  "customerId": "CUST12345",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "loyaltyTier": "GOLD",
  "rewardPoints": 2500,
  "registrationDate": "2024-01-15"
}
```

**Response Field Definitions**:

| Field | Type | Description |
|-------|------|-------------|
| customerId | string | Unique customer identifier |
| name | string | Customer full name |
| email | string | Customer email address |
| phone | string | Customer phone number |
| loyaltyTier | string | Tier status (BRONZE, SILVER, GOLD, PLATINUM) |
| rewardPoints | integer | Current accumulated reward points |
| registrationDate | string | Customer registration date (YYYY-MM-DD) |

**Error Response** (404 Not Found):
- Status Code: `404 Not Found`

**Error Response Body**:
```json
{
  "errorCode": "CUSTOMER_NOT_FOUND",
  "errorMessage": "Customer with ID CUST12345 not found",
  "timestamp": "2026-05-25 13:30:00",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 4. Get Order Endpoint

**Purpose**: Retrieve order information

**Endpoint**: `GET /api/v1/support/order/{orderId}`

**Path Parameters**:
- `orderId` (string, required): Unique order identifier

**Example**: `GET /api/v1/support/order/ORD123456`

**Request Headers**:
```
GET /api/v1/support/order/ORD123456 HTTP/1.1
Host: localhost:8081
```

**Success Response**:
- Status Code: `200 OK`

**Response Body**:
```json
{
  "orderId": "ORD123456",
  "customerId": "CUST12345",
  "orderDate": "2026-05-20T10:00:00Z",
  "status": "SHIPPED",
  "estimatedDelivery": "2026-05-25",
  "totalAmount": 299.99,
  "trackingNumber": "TRK987654",
  "itemCount": 1,
  "items": [
    {
      "name": "Premium Headphones",
      "quantity": 1,
      "price": 299.99
    }
  ]
}
```

**Response Field Definitions**:

| Field | Type | Description |
|-------|------|-------------|
| orderId | string | Unique order identifier |
| customerId | string | Associated customer ID |
| orderDate | ISO 8601 | When the order was placed |
| status | string | Order status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED) |
| estimatedDelivery | date | Estimated delivery date |
| totalAmount | number | Total order amount |
| trackingNumber | string | Carrier tracking number |
| itemCount | integer | Number of items in order |
| items | array | Array of order items |

**Order Status Values**:
- `PENDING`: Order received, not yet processed
- `PROCESSING`: Order being prepared for shipment
- `SHIPPED`: Order sent to carrier
- `DELIVERED`: Order delivered to customer
- `CANCELLED`: Order cancelled by customer or system

**Error Response** (404 Not Found):
```json
{
  "errorCode": "ORDER_NOT_FOUND",
  "errorMessage": "Order with ID ORD123456 not found",
  "timestamp": "2026-05-25 13:30:00",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Error Handling

### Standard Error Response Format

All errors follow this format:

```json
{
  "errorCode": "ERROR_CODE",
  "errorMessage": "Human-readable error message",
  "timestamp": "2026-05-25 13:30:00",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input, missing required fields |
| 401 | Unauthorized | Missing/invalid API key |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | AI service or backend down |

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_INPUT | 400 | Required field missing or invalid format |
| INVALID_CUSTOMER_ID | 400 | Invalid customer ID format |
| INVALID_ORDER_ID | 400 | Invalid order ID format |
| CUSTOMER_NOT_FOUND | 404 | Customer doesn't exist |
| ORDER_NOT_FOUND | 404 | Order doesn't exist |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| AI_SERVICE_ERROR | 503 | AI service unavailable |
| DATABASE_ERROR | 500 | Database connection error |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

## Request/Response Examples

### Example 1: Successful Order Status Query

**Request**:
```bash
curl -X POST http://localhost:8081/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Can you tell me when my order will arrive?",
    "customerId": "CUST12345"
  }'
```

**Response** (200 OK):
```json
{
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "intent": "order_status",
  "message": "Your order #ORD123456 is out for delivery and expected to arrive on May 25, 2026",
  "data": {
    "orderId": "ORD123456",
    "status": "SHIPPED",
    "estimatedDelivery": "2026-05-25",
    "trackingNumber": "TRK987654"
  },
  "timestamp": "2026-05-25 13:30:00"
}
```

### Example 2: Complaint Query

**Request**:
```bash
curl -X POST http://localhost:8081/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "The package arrived damaged. The headphones are not working.",
    "customerId": "CUST12345"
  }'
```

**Response** (200 OK):
```json
{
  "requestId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "intent": "complaint",
  "message": "Thank you for reporting this issue. We have created support ticket TKT-b2c3d4e5-f6a7-8901-bcde-f12345678901 and our team will investigate within 24 hours.",
  "data": {
    "ticketId": "TKT-b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "status": "OPEN",
    "severity": "HIGH",
    "createdDate": "2026-05-25 13:30:00"
  },
  "timestamp": "2026-05-25 13:30:00"
}
```

### Example 3: Invalid Request

**Request**:
```bash
curl -X POST http://localhost:8081/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST12345"
  }'
```

**Response** (400 Bad Request):
```json
{
  "errorCode": "INVALID_INPUT",
  "errorMessage": "Query field is required and must be 1-1000 characters",
  "timestamp": "2026-05-25 13:30:00",
  "requestId": "c3d4e5f6-a7b8-9012-cdef-123456789012"
}
```

---

## Performance Considerations

### Response Time SLA

- Health Check: < 100ms
- Customer Query: < 2s (includes AI processing)
- Customer Lookup: < 500ms
- Order Lookup: < 500ms

### Rate Limiting

```
Default Rate Limits:
- Per IP: 1000 requests/hour
- Per API Key: 10000 requests/hour
- Per Customer: 100 requests/hour
```

### Caching Strategy

```
Cache TTL (Time To Live):
- Customer Data: 1 hour
- Order Data: 30 minutes
- Intent Classifications: 2 hours
- Health Check: Not cached
```

---

## Versioning

Current API version: `v1.0`

Path: `/api/v1/support/...`

Future versions will be under: `/api/v2/support/...`

Backward compatibility maintained for at least 2 major versions.

---

## Security

### Authentication Methods

1. **API Key** (currently used)
   - Header: `X-API-Key: your-api-key`

2. **OAuth 2.0** (future)
   - Bearer token in Authorization header

3. **JWT** (future)
   - JSON Web Token in Authorization header

### Data Protection

- All data encrypted in transit (HTTPS/TLS 1.3)
- PII masked in logs
- Sensitive fields not returned unless authenticated
- Database passwords stored in secure vaults

### CORS Configuration

```
Allowed Origins:
- http://localhost:3000
- https://yourdomain.com

Allowed Methods: GET, POST, OPTIONS
Allowed Headers: Content-Type, Authorization
```

---

## Monitoring & Observability

### Metrics

- Request count by endpoint
- Response time distribution
- Error rate by type
- AI service latency
- Database query time
- Cache hit rate

### Logging

- All requests logged with request ID
- All errors logged with stack trace
- Performance metrics logged
- AI service calls logged (without revealing prompts)

### Tracing

- Distributed tracing with request ID
- Trace shows path through Experience → Process → System APIs
- Request-response times per component

---

## Testing Strategy

### Unit Tests
- DataWeave transformation tests
- Expression language tests
- Error handler tests

### Integration Tests
- API endpoint tests
- System API integration tests
- Error handling tests

### End-to-End Tests
- Complete user journeys
- Multi-step workflows
- Error recovery scenarios

---

## Future Enhancements

1. **WebSocket Support**: Real-time chat interface
2. **Streaming Responses**: For long-running operations
3. **Batch Processing**: Handle multiple queries at once
4. **Webhooks**: Event notifications
5. **GraphQL API**: Alternative to REST
6. **Rate Limiting**: More granular control
7. **API Metrics**: Real-time usage analytics

---

Version: 1.0.0
Last Updated: 2026-05-25
