# AI Integration Guide

## Overview

This document provides detailed instructions for integrating AI services with the AI-Powered Customer Support API. The current implementation includes mock AI service responses for demonstration purposes, but can be easily updated to use real AI services.

## Supported AI Services

### 1. OpenAI (Recommended)

**API Endpoint:** https://api.openai.com/v1/chat/completions

**Models:**
- `gpt-4` - Most capable, recommended for complex tasks
- `gpt-3.5-turbo` - Faster, cost-effective, suitable for intent classification
- `gpt-4-turbo` - Balance between GPT-4 and speed

#### Setup OpenAI Integration

1. **Get API Key**
   ```bash
   # Sign up at https://platform.openai.com
   # Create API key in: Account Settings > API keys
   ```

2. **Update Experience API Flow**
   
   In `src/main/mule/experience-api.xml`, replace the mock AI service call:
   
   ```xml
   <http:request method="POST" config-ref="HTTP_Request_config" 
                path="/post" 
                doc:name="Call AI Service">
       <http:body><![CDATA[#[payload]]]></http:body>
       <http:headers>#[{'Content-Type': 'application/json', 'Authorization': 'Bearer ' ++ p('ai.service.key')}]</http:headers>
   </http:request>
   ```

3. **Update application.properties**
   ```properties
   ai.service.url=https://api.openai.com/v1/chat/completions
   ai.service.key=${OPENAI_API_KEY}
   ai.service.model=gpt-3.5-turbo
   ```

4. **Set Environment Variable**
   ```bash
   export OPENAI_API_KEY=sk-your-api-key-here
   ```

#### Request Format (OpenAI)

```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful customer support assistant..."
    },
    {
      "role": "user",
      "content": "Where is my order?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 200
}
```

#### Response Format (OpenAI)

```json
{
  "id": "chatcmpl-123456",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-3.5-turbo",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Your order is out for delivery..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 100,
    "total_tokens": 150
  }
}
```

### 2. Azure OpenAI

**API Endpoint:** https://{resource}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions

**Models:**
- Same as OpenAI (gpt-3.5-turbo, gpt-4, etc.)
- Deployed in your Azure subscription

#### Setup Azure OpenAI Integration

1. **Get Azure OpenAI Resource**
   - Create resource in Azure Portal
   - Deploy a model (e.g., gpt-3.5-turbo)
   - Get resource name and API key

2. **Update application.properties**
   ```properties
   ai.service.url=https://{resource}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions
   ai.service.api_version=2024-02-15-preview
   ai.service.key=${AZURE_OPENAI_KEY}
   ```

3. **Update HTTP Request in Flow**
   ```xml
   <http:request method="POST" config-ref="HTTP_Request_config" 
                path="/openai/deployments/{deployment-id}/chat/completions?api-version=2024-02-15-preview" 
                doc:name="Call Azure OpenAI">
       <http:body><![CDATA[#[payload]]]></http:body>
       <http:headers>#[{'Content-Type': 'application/json', 'api-key': p('ai.service.key')}]</http:headers>
   </http:request>
   ```

### 3. Anthropic Claude

**API Endpoint:** https://api.anthropic.com/v1/messages

**Models:**
- `claude-3-opus` - Most capable
- `claude-3-sonnet` - Balanced
- `claude-3-haiku` - Fastest

#### Setup Anthropic Integration

1. **Get API Key**
   ```bash
   # Sign up at https://console.anthropic.com
   # Create API key in: Account Settings
   ```

2. **Update HTTP Request**
   ```xml
   <http:request method="POST" config-ref="HTTP_Request_config" 
                path="/v1/messages" 
                doc:name="Call Claude API">
       <http:body><![CDATA[#[payload]]]></http:body>
       <http:headers>#[{'Content-Type': 'application/json', 'x-api-key': p('ai.service.key'), 'anthropic-version': '2023-06-01'}]</http:headers>
   </http:request>
   ```

3. **Update application.properties**
   ```properties
   ai.service.url=https://api.anthropic.com/v1/messages
   ai.service.key=${ANTHROPIC_API_KEY}
   ai.service.model=claude-3-sonnet
   ```

#### Request Format (Anthropic)

```json
{
  "model": "claude-3-sonnet-20240229",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "Where is my order?"
    }
  ]
}
```

## Intent Classification

### Current Implementation

The current implementation uses hardcoded intent detection. Intent is classified into:

1. **order_status** - Queries about order status, tracking, delivery
   - Keywords: "where", "order", "tracking", "delivery", "status"

2. **customer_info** - Queries about customer account, loyalty, rewards
   - Keywords: "loyalty", "tier", "rewards", "points", "account"

3. **complaint** - Complaints, issues, problems
   - Keywords: "damaged", "wrong", "issue", "problem", "complaint"

4. **general** - Other queries
   - Default fallback

### Improving Intent Detection with AI

To use AI for better intent detection, update the `detect-intent-ai-flow`:

```xml
<sub-flow name="detect-intent-ai-flow" doc:name="Detect Intent AI Flow">
    <logger level="INFO" message="Calling AI service for intent detection" doc:name="Log"/>
    
    <!-- Build AI request for intent classification -->
    <set-payload value="#[output application/json --- {
        'model': p('ai.service.model'),
        'messages': [
            {
                'role': 'system',
                'content': 'You are an intent classifier for customer support queries. Classify the query into exactly one of these categories: order_status, customer_info, complaint, general. Respond ONLY with valid JSON: {\"intent\": \"<intent>\", \"confidence\": <0-1>, \"reasoning\": \"<brief reason>\"}'
            },
            {
                'role': 'user',
                'content': payload.query
            }
        ],
        'temperature': 0.3,
        'max_tokens': 100
    }]" doc:name="Build AI Request"/>
    
    <!-- Call AI Service with proper URL and headers -->
    <http:request method="POST" 
                 config-ref="HTTP_Request_config" 
                 path="#[p('ai.service.url').substringAfterLast('/')]"
                 doc:name="Call AI Service">
        <http:body><![CDATA[#[payload]]]></http:body>
        <http:headers>#[{'Content-Type': 'application/json', 'Authorization': 'Bearer ' ++ p('ai.service.key')}]</http:headers>
    </http:request>
    
    <!-- Parse AI response -->
    <set-payload value="#[output application/json --- 
        {
            'intent': payload.choices[0].message.content as Object.intent,
            'confidence': payload.choices[0].message.content as Object.confidence,
            'reasoning': payload.choices[0].message.content as Object.reasoning,
            'originalQuery': vars.userQuery
        }
    ]" doc:name="Parse AI Response"/>
</sub-flow>
```

## API Response Generation

### Using AI for Natural Language Responses

Instead of hardcoded messages, use AI to generate responses:

```xml
<sub-flow name="generate-ai-response-flow" doc:name="Generate AI Response">
    <!-- Build context for response generation -->
    <set-payload value="#[output application/json --- {
        'model': p('ai.service.model'),
        'messages': [
            {
                'role': 'system',
                'content': 'You are a helpful customer support agent. Provide a natural, concise response based on the provided data.'
            },
            {
                'role': 'user',
                'content': 'Customer asked: ' ++ vars.userQuery ++ '. Here is the data: ' ++ (vars.systemData default 'No data available') ++ '. Please provide a helpful response.'
            }
        ],
        'temperature': 0.7,
        'max_tokens': 300
    }]" doc:name="Build Response Request"/>
    
    <!-- Call AI for response generation -->
    <http:request method="POST" config-ref="HTTP_Request_config" 
                 path="/v1/chat/completions" 
                 doc:name="Generate Response">
        <http:body><![CDATA[#[payload]]]></http:body>
        <http:headers>#[{'Content-Type': 'application/json', 'Authorization': 'Bearer ' ++ p('ai.service.key')}]</http:headers>
    </http:request>
    
    <!-- Extract response text -->
    <set-payload value="#[payload.choices[0].message.content]" doc:name="Extract Message"/>
</sub-flow>
```

## Cost Optimization

### Token Usage Monitoring

```
OpenAI Pricing (as of 2026):
- gpt-3.5-turbo: $0.50 / 1M input tokens, $1.50 / 1M output tokens
- gpt-4: $30 / 1M input tokens, $60 / 1M output tokens

Per Request Average:
- Intent Detection: ~150 tokens = $0.0003
- Response Generation: ~300 tokens = $0.0006
- Total per query: ~$0.001 (~0.1 cents)
```

### Cost Reduction Strategies

1. **Use gpt-3.5-turbo for intent detection** - Cheaper than GPT-4
2. **Implement caching** - Avoid repeated AI calls
3. **Batch processing** - Process multiple queries together
4. **Rate limiting** - Prevent excessive API calls

Example cache implementation:
```xml
<object-store-connector:store key="#[vars.requestHash]"
                             value-ref="#[payload]"
                             objectStore="CacheOS"
                             doc:name="Store in Cache"/>
```

## Error Handling

### AI Service Unavailable

```xml
<try>
    <flow-ref name="detect-intent-ai-flow"/>
    <error-handler>
        <on-error-continue type="CONNECTIVITY_ERROR,TIMEOUT,HTTP:NOT_FOUND">
            <logger level="WARN" message="AI service unavailable, using fallback"/>
            <set-payload value="#[{intent: 'general', confidence: 0, usesFallback: true}]"/>
        </on-error-continue>
    </error-handler>
</try>
```

### API Rate Limiting

```xml
<choice>
    <when expression="#[attributes.statusCode == 429]">
        <logger level="ERROR" message="AI API rate limit exceeded"/>
        <set-attribute attributeName="http.status" value="503"/>
        <set-payload value="#[{errorCode: 'SERVICE_TEMPORARILY_UNAVAILABLE', errorMessage: 'Please try again in a moment'}]"/>
    </when>
</choice>
```

## Testing AI Integration

### 1. Test Intent Detection

```bash
curl -X POST http://localhost:8081/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Where is my order?"}'
```

Expected response should include `"intent": "order_status"`

### 2. Test Response Generation

```bash
curl -X POST http://localhost:8081/api/v1/support/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How can you help me?"}'
```

Response should be AI-generated natural language.

### 3. Monitor API Usage

In Postman or logs:
- Track response times
- Monitor token usage
- Check error rates

## Production Checklist

- [ ] API keys stored in secure environment variables
- [ ] Error handling for AI service failures
- [ ] Rate limiting configured
- [ ] Logging enabled for debugging
- [ ] Caching implemented for cost reduction
- [ ] HTTPS enabled
- [ ] API security configured (API keys, OAuth)
- [ ] Monitor AI service costs
- [ ] Set up alerts for service failures
- [ ] Test with real AI service before going live

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check API key is correct
   - Verify key has sufficient permissions
   - Ensure header format is correct (Bearer token vs api-key)

2. **429 Too Many Requests**
   - Implement rate limiting
   - Increase time between requests
   - Use caching for similar queries

3. **Timeout**
   - Increase HTTP request timeout
   - Reduce max_tokens in request
   - Check network connectivity

4. **Invalid Response Format**
   - Verify AI model version
   - Check message format matches service requirements
   - Add error logging to parse step

---

For more information, visit:
- OpenAI: https://platform.openai.com/docs
- Azure OpenAI: https://learn.microsoft.com/en-us/azure/ai-services/openai/
- Anthropic: https://docs.anthropic.com
