# AI-Powered Nutrition Logging Architecture

## 1. Overview

The AI-Powered Nutrition Logging feature allows users to log their meals using natural language descriptions (e.g., "arroz com feijão com um pouco de manteiga no preparo") or by uploading photos of their meals. The system leverages AI models to parse these inputs and return structured macronutrient data (calories, protein, carbs, fat).

To ensure cost-effectiveness and prevent runaway expenses, the architecture incorporates a robust caching layer, rate limiting, and spending caps. This document outlines the system design, database schema, API endpoints, and cost protection mechanisms.

## 2. Core Components

The architecture consists of the following key components:

1.  **Client Application**: The frontend interface where users input text or upload photos.
2.  **API Gateway (Supabase Edge Functions)**: The entry point for client requests, handling authentication, rate limiting, and routing.
3.  **Caching Layer (Supabase Database)**: A PostgreSQL database storing previously processed food descriptions and their corresponding macronutrient data.
4.  **AI Integration Layer**: The component responsible for communicating with external AI providers (OpenAI, Google Gemini) when a cache miss occurs.
5.  **Cost Protection Module**: A set of mechanisms to enforce rate limits, spending caps, and tier-based access control.

## 3. Workflow

### 3.1 Text-Based Logging

1.  **Input**: The user submits a natural language description of their meal.
2.  **Normalization**: The input is normalized (lowercased, stripped of punctuation and filler words) to improve cache hit rates.
3.  **Cache Lookup**: The system queries the database for an exact or semantically similar match using the normalized input.
4.  **Cache Hit**: If a match is found, the cached macronutrient data is returned immediately. No AI call is made.
5.  **Cache Miss**: If no match is found, the system checks the user's rate limits and spending caps.
6.  **AI Invocation**: If limits allow, the system calls the AI model (e.g., `gpt-4.1-nano`) with a structured prompt to parse the input.
7.  **Cache Update**: The AI's response is stored in the database alongside the normalized input for future use.
8.  **Response**: The structured macronutrient data is returned to the client.

### 3.2 Photo-Based Logging (Premium Feature)

1.  **Input**: The user uploads a photo of their meal.
2.  **Access Check**: The system verifies that the user has a premium subscription.
3.  **Rate Limiting**: The system checks the user's rate limits and spending caps for image processing.
4.  **AI Invocation**: If limits allow, the system calls the vision-capable AI model (e.g., `gemini-2.5-flash`) to analyze the image.
5.  **Response**: The detected food items and their estimated macronutrients are returned to the client. (Note: Photo results are generally not cached due to their unique nature).

## 4. Cost Protection Mechanisms

To prevent unexpected bills, the system implements multiple layers of cost protection:

### 4.1 Tier-Based Access Control

*   **Free Tier**: Users can use text-based logging but are limited to a strict daily quota of AI calls (e.g., 3 per day). Cache hits do not count against this quota. Photo logging is disabled.
*   **Premium Tier**: Users have a higher daily quota for text-based AI calls and access to photo logging, also subject to a daily quota.

### 4.2 Rate Limiting

Rate limits are enforced at the API Gateway level using Redis or Supabase's built-in rate limiting features. Limits are applied per user and per IP address to prevent abuse.

### 4.3 Spending Caps

A global monthly spending cap is configured for the AI provider accounts. If the cap is reached, the AI integration layer will automatically reject new requests and return an appropriate error message to the client.

### 4.4 Caching Strategy

The caching layer is the primary defense against high AI costs. By storing the results of previous queries, the system can serve the majority of requests without invoking the AI. The cache uses semantic similarity matching to maximize hit rates.

## 5. Database Schema

The database schema includes tables for caching food descriptions, tracking user quotas, and logging AI usage.

### 5.1 `food_nutrition_cache`

Stores the results of previous text-based queries.

*   `id` (UUID, Primary Key)
*   `normalized_query` (Text, Unique Index)
*   `original_query` (Text)
*   `calories` (Numeric)
*   `protein` (Numeric)
*   `carbs` (Numeric)
*   `fat` (Numeric)
*   `created_at` (Timestamp)

### 5.2 `user_ai_quotas`

Tracks the number of AI calls made by each user.

*   `user_id` (UUID, Primary Key, Foreign Key to `auth.users`)
*   `text_calls_today` (Integer)
*   `photo_calls_today` (Integer)
*   `last_reset_at` (Timestamp)

### 5.3 `ai_usage_logs`

Logs every AI invocation for auditing and cost analysis.

*   `id` (UUID, Primary Key)
*   `user_id` (UUID, Foreign Key to `auth.users`)
*   `model` (Text)
*   `input_tokens` (Integer)
*   `output_tokens` (Integer)
*   `cost` (Numeric)
*   `created_at` (Timestamp)

## 6. API Endpoints

### 6.1 `POST /functions/v1/log-food-text`

*   **Description**: Processes a natural language food description.
*   **Request Body**: `{ "query": "arroz com feijão" }`
*   **Response**: `{ "calories": 300, "protein": 10, "carbs": 50, "fat": 5, "source": "cache|ai" }`

### 6.2 `POST /functions/v1/log-food-photo`

*   **Description**: Processes a food photo (Premium only).
*   **Request Body**: `{ "image": "base64_encoded_string", "mimeType": "image/jpeg" }`
*   **Response**: `{ "foods": [ { "name": "arroz", "calories": 200, ... } ] }`

## 7. Conclusion

This architecture provides a scalable, cost-effective, and user-friendly solution for AI-powered nutrition logging. By combining a robust caching strategy with strict rate limiting and tier-based access control, the system ensures that AI costs remain predictable and manageable while delivering a premium experience to users.
