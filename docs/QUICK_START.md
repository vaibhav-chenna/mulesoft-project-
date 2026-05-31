# Quick Start Guide

## 5-Minute Setup

### 1. Prerequisites
- Java 11+
- Maven 3.6+
- Mule Runtime 4.8.0+ (optional for testing)

### 2. Clone Project
```bash
cd ai-support-api
```

### 3. Build
```bash
mvn clean package -DskipTests
```

### 4. Run (Local)
```bash
# Option A: Using Mule Maven Plugin
mvn mule:deploy

# Option B: Using Standalone Mule Runtime
# Copy jar to $MULE_HOME/apps/ and start Mule
```

### 5. Test
```bash
# Health check
curl http://localhost:8081/api/v1/support/health

# Test API
curl -X POST http://localhost:8081/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Where is my order?"}'
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/support/health` | Health check |
| POST | `/api/v1/support/query` | Submit support query |
| GET | `/api/v1/support/customer/{id}` | Get customer info |
| GET | `/api/v1/support/order/{id}` | Get order info |

---

## Sample Requests

### Health Check
```bash
curl http://localhost:8081/api/v1/support/health
```

### Query - Order Status
```bash
curl -X POST http://localhost:8081/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Where is my order?",
    "customerId": "CUST12345"
  }'
```

### Get Customer
```bash
curl http://localhost:8081/api/v1/support/customer/CUST12345
```

### Get Order
```bash
curl http://localhost:8081/api/v1/support/order/ORD123456
```

---

## Test Data

### Customers
- CUST12345 - John Doe (GOLD tier)
- CUST67890 - Jane Smith (SILVER tier)
- CUST11111 - Bob Johnson (BRONZE tier)

### Orders
- ORD123456 - SHIPPED (Premium Headphones)
- ORD654321 - DELIVERED (USB-C Cable)
- ORD999999 - PROCESSING (Multiple items)

---

## Next Steps

1. Read [README.md](README.md) for full documentation
2. Import [Postman Collection](AI-Support-API-Postman-Collection.json)
3. Review [Project Structure](PROJECT_STRUCTURE.md)
4. Check [AI Integration Guide](AI_INTEGRATION_GUIDE.md) for real AI setup
5. Follow [Deployment Guide](DEPLOYMENT_GUIDE.md) for CloudHub deployment

---

## Troubleshooting

**Q: Application won't start?**
- Check Java version: `java -version`
- Check Maven: `mvn -version`
- Check logs: `$MULE_HOME/logs/mule_ee.log`

**Q: API returns 404?**
- Verify port: Default is 8081
- Check URL path is correct
- Restart Mule runtime

**Q: How to use real AI?**
- See [AI Integration Guide](AI_INTEGRATION_GUIDE.md)
- Get OpenAI API key
- Update configuration

---

Happy testing! 🚀
# Dashboard and Chatbot Quick Start

For the React dashboard and local development API:

```bash
cd dashboard
npm install
npm run api
```

Open another terminal:

```bash
cd dashboard
npm start
```

Use `CUST-001` and `ORD-5521` as sample chatbot inputs. The local API seeds from `database/local-db.json` and stores runtime records in `dashboard/data/local-db.json`.

The public API discovery feature searches public API metadata only. It must not be used to scrape exposed API keys or secrets.
