# AI-Powered Customer Support API - Project Structure

## Directory Structure

```
ai-support-api/
├── src/
│   ├── main/
│   │   ├── mule/
│   │   │   ├── experience-api.xml          # Main Experience API flow
│   │   │   ├── system-apis.xml             # Customer and Order System APIs
│   │   │   └── global-config.xml           # Global configuration and error handlers
│   │   └── resources/
│   │       ├── api/
│   │       │   └── support-experience-api.raml   # RAML API definition
│   │       ├── config/
│   │       │   └── [Configuration files]
│   │       ├── dwl/
│   │       │   ├── query-to-ai-request.dwl       # Transform query to AI format
│   │       │   ├── response-transformer.dwl      # Transform responses
│   │       │   ├── error-transformer.dwl         # Transform errors
│   │       │   ├── order-transformer.dwl         # Order data transformation
│   │       │   └── customer-transformer.dwl      # Customer data transformation
│   │       ├── application.properties            # Application configuration
│   │       ├── application-dev.properties        # Development config
│   │       └── application-prod.properties       # Production config
│   └── test/
│       └── resources/
│           └── [Test resources]
├── docs/
│   ├── README.md                           # Main documentation
│   ├── AI_INTEGRATION_GUIDE.md             # AI service integration guide
│   ├── PROJECT_STRUCTURE.md                # This file
│   ├── DEPLOYMENT_GUIDE.md                 # Detailed deployment instructions
│   └── AI-Support-API-Postman-Collection.json  # Postman collection for testing
├── pom.xml                                 # Maven build configuration
├── mule-artifact.json                      # Mule artifact configuration
└── .gitignore                              # Git ignore file
```

## File Descriptions

### Core Mule Flows

| File | Purpose |
|------|---------|
| `experience-api.xml` | Main API entry point, routes requests to appropriate handlers |
| `system-apis.xml` | Integrates with backend systems (Customer/Order data) |
| `global-config.xml` | Global error handlers, HTTP configs, APIKit setup |

### RAML API Definition

| File | Purpose |
|------|---------|
| `support-experience-api.raml` | REST API contract defining all endpoints, types, and schemas |

### DataWeave Transformations

| File | Purpose |
|------|---------|
| `query-to-ai-request.dwl` | Formats customer query for AI service consumption |
| `response-transformer.dwl` | Formats final response back to client |
| `error-transformer.dwl` | Standardizes error responses |
| `order-transformer.dwl` | Enriches order data for client response |
| `customer-transformer.dwl` | Enriches customer data for client response |

### Configuration Files

| File | Purpose |
|------|---------|
| `application.properties` | Default/base configuration properties |
| `application-dev.properties` | Development environment overrides |
| `application-prod.properties` | Production environment overrides |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Main documentation with architecture, endpoints, deployment |
| `AI_INTEGRATION_GUIDE.md` | Detailed guide for OpenAI, Azure OpenAI, Anthropic integration |
| `PROJECT_STRUCTURE.md` | This file - explains project organization |
| `DEPLOYMENT_GUIDE.md` | Step-by-step deployment instructions |
| `AI-Support-API-Postman-Collection.json` | Pre-configured Postman requests for testing |

### Build Configuration

| File | Purpose |
|------|---------|
| `pom.xml` | Maven POM with dependencies and build configuration |
| `mule-artifact.json` | Mule Runtime metadata |

## Data Flow

### Request Flow
```
Client Request
    ↓
Experience API (Main Handler)
    ├─→ Health Check
    ├─→ Support Query
    │   ├─→ Validate Input
    │   ├─→ Detect Intent (AI)
    │   ├─→ Route by Intent
    │   │   ├─→ Order Status → System APIs → Return Order Data
    │   │   ├─→ Customer Info → System APIs → Return Customer Data
    │   │   ├─→ Complaint → Create Ticket
    │   │   └─→ General → Generate Response
    │   └─→ Transform Response
    ├─→ Get Customer
    │   └─→ System API → Return Customer
    └─→ Get Order
        └─→ System API → Return Order
```

## Intent Classification

```
User Query
    ↓
AI Intent Detector
    ├─→ order_status: "Where is my order?"
    │              "Track my package"
    │              "When will it arrive?"
    │
    ├─→ customer_info: "What's my loyalty tier?"
    │                 "How many points do I have?"
    │                 "Tell me about my account"
    │
    ├─→ complaint: "I received a damaged package"
    │             "Wrong item sent"
    │             "I have an issue"
    │
    └─→ general: Everything else
```

## Backend System Integration Points

### Current Implementation (Mock)
- Customer data: Global functions in `system-apis.xml`
- Order data: Global functions in `system-apis.xml`

### Production Implementation Options

**Option 1: Database Connector**
```
Experience API → Process API → Database Connector → SQL Database
```

**Option 2: REST API**
```
Experience API → Process API → HTTP Request → Backend REST API
```

**Option 3: JMS/Message Queue**
```
Experience API → Process API → JMS Connector → Message Queue → Backend System
```

**Option 4: Salesforce/Netsuite Connectors**
```
Experience API → Process API → SFDC/NetSuite Connector → Cloud System
```

## Cache Strategy

```
Request → Check Cache (1 hour TTL)
    ├─→ HIT: Return cached response
    └─→ MISS: Fetch from system → Cache → Return response
```

## Security Layers

```
Client Request
    ↓
Network Security (HTTPS, VPN, WAF)
    ↓
API Security (API Key, OAuth, JWT)
    ↓
Input Validation
    ↓
Rate Limiting
    ↓
Business Logic
    ↓
Data Protection (Encryption, PII Masking)
    ↓
Response Formatting
    ↓
Audit Logging
```

## Error Handling Strategy

```
Request Processing
    ├─→ Validation Error (400)
    │   └─→ Error Handler → Format Error Response
    ├─→ Not Found Error (404)
    │   └─→ Error Handler → Format Error Response
    ├─→ AI Service Error (5xx)
    │   └─→ Error Handler → Fallback Response
    └─→ System Error (500)
        └─→ Error Handler → Generic Error Response
```

## Monitoring & Logging

```
Application
├─→ DEBUG Logs: Detailed execution flow
├─→ INFO Logs: Business events
├─→ WARN Logs: Potential issues
├─→ ERROR Logs: Errors requiring attention
└─→ Metrics
    ├─→ Response times
    ├─→ Error rates
    ├─→ AI service usage
    └─→ Cache hit rates
```

## Deployment Environments

### Local Development
- Port: 8081
- Logging: DEBUG
- Cache: Disabled
- AI: Mock responses

### CloudHub Production
- Workers: 1-3 (scalable)
- Port: 8081
- Logging: INFO
- Cache: 1 hour TTL
- AI: Real OpenAI/Azure OpenAI
- Security: API Key + OAuth

## Extension Points

1. **Add new intent types**: Update `detect-intent-ai-flow`
2. **Add new System APIs**: Create new `sub-flow` in `system-apis.xml`
3. **Add authentication**: Update `global-config.xml`
4. **Add database**: Use Database Connector in System APIs
5. **Add caching**: Use ObjectStore module
6. **Add messaging**: Use Event Hubs/Service Bus

## Key Technologies

- **Mule Runtime 4.8.0** - Integration platform
- **APIKit 1.8.0** - API management
- **DataWeave 2.0** - Data transformation
- **HTTP Connector 1.8.0** - REST integration
- **Maven 3.6** - Build tool
- **OpenAI/Azure OpenAI** - AI services
- **Postman** - API testing

---

For detailed information, see:
- Main README: [README.md](README.md)
- AI Integration: [AI_INTEGRATION_GUIDE.md](AI_INTEGRATION_GUIDE.md)
- Deployment: Check README.md deployment section
