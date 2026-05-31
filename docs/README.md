# AI-Powered Customer Support API - Documentation

## Table of Contents
1. Architecture Overview
2. API Endpoints
3. Sample Requests & Responses
4. Deployment Guide
5. Integration Guide
6. Troubleshooting

---

## 1. Architecture Overview

### API-Led Connectivity Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                       │
│         (Web, Mobile, Third-party Integrations)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              EXPERIENCE API (Facade Layer)                  │
│  - REST endpoints for clients                              │
│  - Request validation                                       │
│  - Response formatting                                      │
│  - Health checks                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PROCESS API (Orchestration Layer)              │
│  - Intent detection via AI                                 │
│  - Request routing based on intent                         │
│  - Response aggregation                                    │
│  - Business logic                                          │
└──────┬──────────────────────────────────────────┬──────────┘
       │                                          │
       ▼                                          ▼
┌──────────────────────┐              ┌──────────────────────┐
│ CUSTOMER SYSTEM API  │              │  ORDER SYSTEM API    │
│  - Mock Database     │              │  - Mock Database     │
│  - Customer Queries  │              │  - Order Queries     │
└──────────────────────┘              └──────────────────────┘
       │                                          │
       ▼                                          ▼
┌──────────────────────┐              ┌──────────────────────┐
│  Legacy System/DB    │              │  Backend System/DB   │
│  Customer Records    │              │  Order Records       │
└──────────────────────┘              └──────────────────────┘

External Integration:
┌──────────────────────┐
│   AI Service (OpenAI)│
│  - Intent Detection  │
│  - Response Gen      │
└──────────────────────┘
```

### Components

1. **Experience API**
   - Entry point for all client requests
   - REST endpoints: /health, /query, /customer/{id}, /order/{id}
   - Request validation and sanitization

2. **Process API**
   - Central orchestration layer
   - Calls AI service for intent detection
   - Routes requests to appropriate System APIs
   - Aggregates responses

3. **System APIs**
   - Customer System API: Fetches customer data
   - Order System API: Fetches order data
   - In this demo: Uses mock data from global functions
   - In production: Would connect to actual databases/systems

4. **AI Integration**
   - OpenAI/Azure OpenAI for intent classification
   - Mock implementation for demo purposes

---

## 2. API Endpoints

### Health Check Endpoint
**GET /api/v1/support/health**

Returns: `200 OK`
```json
{
  "status": "UP",
  "timestamp": "2026-05-25 13:30:00",
  "version": "1.0.0"
}
```

### Support Query Endpoint
**POST /api/v1/support/query**

Request:
```json
{
  "query": "Where is my order?",
  "customerId": "CUST12345",
  "context": "Regarding order placed on 2026-05-20"
}
```

Response:
```json
{
  "requestId": "REQ-2026-001234",
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

### Get Customer Endpoint
**GET /api/v1/support/customer/{customerId}**

Example: `GET /api/v1/support/customer/CUST12345`

Response:
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

### Get Order Endpoint
**GET /api/v1/support/order/{orderId}**

Example: `GET /api/v1/support/order/ORD123456`

Response:
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

---

## 3. Sample Requests & Responses

### Request 1: Order Status Query
```bash
curl -X POST http://localhost:8081/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Where is my order?",
    "customerId": "CUST12345"
  }'
```

### Request 2: Customer Information Query
```bash
curl -X POST http://localhost:8081/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is my loyalty tier?",
    "customerId": "CUST67890"
  }'
```

### Request 3: Complaint
```bash
curl -X POST http://localhost:8081/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I received a damaged package",
    "customerId": "CUST11111"
  }'
```

### Request 4: General Query
```bash
curl -X POST http://localhost:8081/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I track my shipment?"
  }'
```

---

## 4. Deployment Guide

### Prerequisites
- Mule Runtime 4.8.0 or higher
- Java 11 or higher
- Maven 3.6.0 or higher
- (Optional) CloudHub account for cloud deployment

### Local Deployment

1. **Clone/Download the project**
```bash
cd ai-support-api
```

2. **Build the project**
```bash
mvn clean package
```

3. **Deploy to local Mule Runtime**
```bash
mvn mule:deploy
```

4. **Verify deployment**
```bash
curl http://localhost:8081/api/v1/support/health
```

### CloudHub Deployment

1. **Set environment variables**
```bash
export CLOUDHUB_USERNAME=your-username
export CLOUDHUB_PASSWORD=your-password
export OPENAI_API_KEY=your-openai-key
```

2. **Deploy to CloudHub**
```bash
mvn clean package -DskipTests
mvn mule:deploy -Dmule.cloudHub.username=$CLOUDHUB_USERNAME \
                -Dmule.cloudHub.password=$CLOUDHUB_PASSWORD
```

3. **Verify deployment in Anypoint Platform**
   - Navigate to Runtime Manager
   - Check application status
   - View logs and metrics

### Configuration for CloudHub

The `pom.xml` includes CloudHub configuration:
- Application Name: `ai-support-api`
- Environment: `Production`
- Worker Type: `SMALL`
- Workers: `1`

Modify as needed for your deployment.

### Environment Variables (CloudHub)

```
OPENAI_API_KEY=sk-...
CLOUDHUB_USERNAME=username
CLOUDHUB_PASSWORD=password
DB_USER=db-user
DB_PASSWORD=db-password
API_KEY=api-key-for-security
```

---

## 5. Integration Guide

### OpenAI Integration

To integrate with real OpenAI API:

1. **Get API Key**
   - Sign up at https://platform.openai.com
   - Create API key in account settings

2. **Update Configuration**
   - In `application.properties`:
   ```
   ai.service.url=https://api.openai.com/v1/chat/completions
   ai.service.key=${OPENAI_API_KEY}
   ai.service.model=gpt-3.5-turbo
   ```

3. **Update HTTP Request in Flow**
   - In `experience-api.xml`, replace the mock response with actual HTTP request

### Azure OpenAI Integration

For Azure OpenAI:

1. **Update Configuration**
   ```
   ai.service.url=https://{resource}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions
   ai.service.api_version=2024-02-15-preview
   ai.service.key=${AZURE_OPENAI_KEY}
   ```

2. **Update HTTP Headers**
   - Add `api-key` header instead of `Authorization`

### Database Integration

Replace mock database calls with actual database:

**Option 1: Use Database Connector**
```xml
<db:select config-ref="Database_Config">
  <db:sql>SELECT * FROM customers WHERE id = :id</db:sql>
  <db:input-parameters>
    <db:input-parameter key="id">#[vars.customerId]</db:input-parameter>
  </db:input-parameters>
</db:select>
```

**Option 2: Use REST API**
```xml
<http:request method="GET" config-ref="HTTP_Request_config" 
             path="/customers/#[vars.customerId]"
             doc:name="Call Customer API"/>
```

---

## 6. Troubleshooting

### Issue: 404 Not Found for /health endpoint

**Solution:**
- Ensure the application is deployed correctly
- Check the exact URL path: `/api/v1/support/health`
- Verify HTTP port in configuration (default: 8081)

### Issue: AI Service Connection Fails

**Solution:**
- Verify OPENAI_API_KEY is set correctly
- Check network connectivity to api.openai.com
- Review HTTP Connector configuration
- Check Mule logs: `$MULE_HOME/logs`

### Issue: Mock Database Returns Null

**Solution:**
- Verify customer/order IDs match those in global functions
- Use predefined IDs: CUST12345, CUST67890, ORD123456, ORD654321
- Check Mule expression language configuration

### Issue: CloudHub Deployment Fails

**Solution:**
- Verify credentials in `pom.xml`
- Check Maven version (3.6.0+)
- Review deployment logs in Anypoint Platform
- Ensure all required environment variables are set

### Logs Location
- **Local:** `$MULE_HOME/logs/mule_ee.log`
- **CloudHub:** Runtime Manager > Logs tab

---

## Performance Considerations

1. **Caching**
   - Cache customer and order data for 1 hour (configurable)
   - Reduce database calls and AI service load

2. **Rate Limiting**
   - Implement rate limiting for AI service calls
   - Prevent API quota exhaustion

3. **Error Handling**
   - Graceful fallback for AI service failures
   - Return cached responses if available

4. **Monitoring**
   - Track API response times
   - Monitor AI service availability
   - Alert on error thresholds

---

## Security

### API Authentication
- Currently uses basic request validation
- To enable API security:
  1. Use APIKit with built-in security
  2. Configure OAuth/OpenID Connect
  3. Implement API key validation

### Data Protection
- Encrypt sensitive data in transit (HTTPS)
- Mask PII in logs
- Secure API keys in environment variables

### Network Security
- Deploy behind VPN/Private Link
- Use WAF (Web Application Firewall)
- Implement DDoS protection

---

## Support & Enhancement

For issues or enhancements:
1. Check logs
2. Review configuration
3. Test with provided sample requests
4. Contact support team

---

Version: 1.0.0  
Last Updated: 2026-05-25
