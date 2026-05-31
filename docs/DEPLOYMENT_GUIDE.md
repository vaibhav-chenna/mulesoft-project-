# Deployment Guide - AI-Powered Customer Support API

## Prerequisites

### Local Development
- Mule Runtime 4.8.0+ installed
- Java 11+ JDK
- Maven 3.6.0+
- Git

### CloudHub Deployment
- Anypoint Platform account
- CloudHub credits/subscription
- OpenAI API key (if using real AI)

---

## Local Development Setup

### 1. Clone/Download Project
```bash
cd ai-support-api
```

### 2. Build Project
```bash
mvn clean compile
```

### 3. Test the Build
```bash
mvn test
# (Note: Tests not included in this demo)
```

### 4. Package for Deployment
```bash
mvn clean package -DskipTests
```

### 5. Deploy to Local Mule Runtime

#### Using Mule Maven Plugin
```bash
mvn mule:deploy -DmuleHome=/path/to/mule-ee-runtime-4.8.0
```

#### Using Manual Deployment
```bash
# Copy the JAR to Mule's apps directory
cp target/ai-support-api-1.0.0-SNAPSHOT-mule-application.jar $MULE_HOME/apps/

# Start Mule Runtime
cd $MULE_HOME/bin
./mule
```

### 6. Verify Local Deployment
```bash
# Test health endpoint
curl http://localhost:8081/api/v1/support/health

# Expected response:
{
  "status": "UP",
  "timestamp": "2026-05-25 13:30:00",
  "version": "1.0.0"
}
```

### 7. Test API Endpoints
```bash
# Test support query
curl -X POST http://localhost:8081/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Where is my order?", "customerId": "CUST12345"}'

# Test customer endpoint
curl http://localhost:8081/api/v1/support/customer/CUST12345
```

---

## CloudHub Deployment

### 1. Prepare CloudHub Environment

#### Create Mule Maven Settings
Edit `~/.m2/settings.xml`:
```xml
<settings>
    <servers>
        <server>
            <id>cloudhub-deployment</id>
            <username>your-username</username>
            <password>your-password</password>
        </server>
        <server>
            <id>anypoint-exchange-v2</id>
            <username>your-username</username>
            <password>your-password</password>
        </server>
    </servers>
</settings>
```

### 2. Set Environment Variables
```bash
# Linux/Mac
export CLOUDHUB_USERNAME="your-username"
export CLOUDHUB_PASSWORD="your-password"
export OPENAI_API_KEY="sk-your-key"

# Windows
set CLOUDHUB_USERNAME=your-username
set CLOUDHUB_PASSWORD=your-password
set OPENAI_API_KEY=sk-your-key
```

### 3. Deploy to CloudHub
```bash
mvn clean package -DskipTests
mvn deploy -Dmule.cloudHub.username=$CLOUDHUB_USERNAME \
           -Dmule.cloudHub.password=$CLOUDHUB_PASSWORD \
           -DskipTests
```

### 4. Verify CloudHub Deployment

#### Using Anypoint CLI
```bash
# Login
anypoint-cli-v4 account login

# Check deployment status
anypoint-cli-v4 runtime-mgr application describe ai-support-api
```

#### Using Anypoint Platform Web Console
1. Navigate to https://anypoint.mulesoft.com
2. Go to Runtime Manager
3. Find application "ai-support-api"
4. Check status (should be "STARTED")
5. Get CloudHub URL (e.g., https://ai-support-api.us-e1.cloudhub.io)

### 5. Test CloudHub Deployment
```bash
# Replace with your CloudHub domain
CLOUDHUB_URL="https://ai-support-api.us-e1.cloudhub.io"

# Test health endpoint
curl $CLOUDHUB_URL/api/v1/support/health

# Test support query
curl -X POST $CLOUDHUB_URL/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Where is my order?"}'
```

---

## Production Deployment Checklist

- [ ] Code reviewed and tested
- [ ] All environment variables configured
- [ ] API keys securely stored
- [ ] Database connections tested
- [ ] AI service integration verified
- [ ] Error handling tested
- [ ] Logging verified
- [ ] Performance testing completed
- [ ] Security review passed
- [ ] Backup strategy defined

---

## Environment Configuration

### CloudHub Environment Variables

In Anypoint Runtime Manager, set these properties:

#### AI Service Configuration
```
ai.service.url=https://api.openai.com/v1/chat/completions
ai.service.key=[Your OpenAI API Key]
ai.service.model=gpt-3.5-turbo
ai.service.temperature=0.7
```

#### Database Configuration (if using real DB)
```
db.host=[Your Database Host]
db.port=5432
db.name=customer_support
db.user=[Database User]
db.password=[Database Password]
```

#### Application Configuration
```
http.port=8081
app.environment=production
logging.level=INFO
cache.ttl=3600
```

#### Security Configuration
```
security.api.key=[Your API Key]
security.enable=true
```

### Update pom.xml for CloudHub

Edit `pom.xml` to configure your CloudHub deployment:

```xml
<cloudHubDeployment>
    <uri>https://anypoint.mulesoft.com</uri>
    <muleVersion>4.8.0</muleVersion>
    <username>${cloudhub.username}</username>
    <password>${cloudhub.password}</password>
    <applicationName>ai-support-api</applicationName>
    <environment>Production</environment>
    <workers>2</workers>
    <workerType>SMALL</workerType>
    <region>us-east-1</region>
    <properties>
        <env>prod</env>
        <http.port>8081</http.port>
        <ai.service.url>https://api.openai.com/v1/chat/completions</ai.service.url>
        <logging.level>INFO</logging.level>
    </properties>
</cloudHubDeployment>
```

---

## Scaling Configuration

### CloudHub Workers

```
Worker Configuration:
- Development: 1 Worker (SMALL)
- Staging: 1-2 Workers (SMALL)
- Production: 2-4 Workers (MEDIUM/LARGE)

Worker Types:
- SMALL: 0.1 vCore, 500MB RAM
- MEDIUM: 0.2 vCore, 1GB RAM
- LARGE: 1 vCore, 2GB RAM
```

### Auto-Scaling Policy (Optional)
```
If using Azure or AWS Auto-scaling:
- Trigger: CPU > 70% or Memory > 80%
- Scale Up: Add 1 worker
- Scale Down: Remove 1 worker (after 5 min of low load)
- Min Workers: 2
- Max Workers: 4
```

---

## Monitoring & Alerts

### CloudHub Monitoring

1. **In Anypoint Runtime Manager**
   - View real-time metrics
   - CPU, Memory, Thread usage
   - Message throughput
   - Error rates

2. **Set Up Alerts**
   - Alert on high error rates
   - Alert on high memory usage
   - Alert on API timeout
   - Alert on failed deployments

### Application Insights (Azure)

If deploying to Azure:
```bash
# Enable Application Insights
az monitor app-insights component create \
  --app ai-support-api \
  --location eastus \
  --resource-group ai-support-rg
```

### Logs

#### CloudHub Logs
- Location: Runtime Manager > Logs
- Log Levels: INFO, DEBUG, WARN, ERROR
- Retention: 30 days (configurable)

#### Local Logs
- Location: `$MULE_HOME/logs/mule_ee.log`
- Rotation: Daily or size-based
- Format: JSON or Plain text

---

## Rollback Procedure

### CloudHub Rollback

```bash
# List previous versions
anypoint-cli-v4 runtime-mgr application versions ai-support-api

# Deploy previous version
anypoint-cli-v4 runtime-mgr application deploy \
  --target cloudhub \
  --environment Production \
  --version [previous-version]
```

### Local Rollback

```bash
# Stop current Mule instance
cd $MULE_HOME/bin
./mule stop

# Deploy previous version
cp previous-version.jar $MULE_HOME/apps/

# Start Mule
./mule
```

---

## Troubleshooting Deployment

### Issue: Build Failure
```
Error: [ERROR] COMPILATION ERROR
Solution:
1. Ensure Java 11+ is installed
2. Clear Maven cache: mvn clean
3. Check MULE_HOME environment variable
4. Verify all dependencies are available
```

### Issue: CloudHub Deployment Fails
```
Error: Deployment failed: [Error message]
Solution:
1. Check credentials in settings.xml
2. Verify CloudHub account has available workers
3. Check application name is unique
4. Ensure environment variables are set correctly
```

### Issue: Application Won't Start
```
Error: Application failed to start
Solution:
1. Check logs: Runtime Manager > Logs
2. Verify XML syntax in flows
3. Check RAML file is valid
4. Verify all required connectors are installed
```

### Issue: API Returns 404
```
Error: GET /api/v1/support/health returns 404
Solution:
1. Check APIKit is properly configured
2. Verify RAML file path is correct
3. Check HTTP Listener is configured
4. Verify port matches configuration (8081)
```

### Issue: AI Service Returns 401
```
Error: OpenAI API returns 401 Unauthorized
Solution:
1. Check API key is correct
2. Verify Authorization header format
3. Check API key has required permissions
4. Ensure API key is not expired
```

---

## Performance Tuning

### JVM Tuning (Local/On-Premise)
```bash
# In wrapper.conf
wrapper.java.additional.1=-XX:+UseG1GC
wrapper.java.additional.2=-XX:MaxGCPauseMillis=200
wrapper.java.additional.3=-Xmx1024m
wrapper.java.additional.4=-Xms512m
```

### Connection Pooling
```xml
<http:request-config name="HTTP_Request_config">
    <http:request-connection host="httpbin.org"
                            connectionIdleTimeout="30000"
                            maxConnections="100"
                            usePersistentConnections="true"/>
</http:request-config>
```

### Caching Strategy
```
Cache for:
- Customer data: 1 hour TTL
- Order data: 30 minutes TTL
- Intent classification: 2 hours TTL

Use ObjectStore for distributed caching in CloudHub
```

---

## Security Best Practices

1. **Secrets Management**
   - Use CloudHub secure properties for API keys
   - Never commit secrets to Git
   - Rotate keys regularly

2. **Network Security**
   - Use HTTPS/TLS for all connections
   - Enable VPC/Private Link for CloudHub
   - Restrict IP access if possible

3. **API Security**
   - Implement API key authentication
   - Use OAuth for user authentication
   - Implement rate limiting

4. **Data Protection**
   - Encrypt sensitive data in transit and at rest
   - Mask PII in logs
   - Implement audit logging

5. **Compliance**
   - Ensure GDPR compliance for EU customers
   - Implement data retention policies
   - Regular security audits

---

## Support & Help

- **Mule Documentation**: https://docs.mulesoft.com
- **Anypoint Exchange**: https://anypoint.mulesoft.com/exchange
- **MuleSoft Community**: https://community.mulesoft.com
- **Anypoint Status**: https://status.mulesoft.com

---

Version: 1.0.0
Last Updated: 2026-05-25
