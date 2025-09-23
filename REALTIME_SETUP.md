# Real-time Blog Updates with Kafka

This document explains how to set up and use the real-time blog update system using Kafka and WebSockets.

## Overview

The real-time blog update system provides instant updates to admin users when blog posts are created, updated, deleted, or published. It uses:

- **Kafka**: For event streaming and message queuing
- **WebSockets**: For real-time communication between backend and frontend
- **NestJS**: Backend framework with Kafka integration
- **React**: Frontend with WebSocket client

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     Kafka       │
│   (React)       │    │   (NestJS)      │    │   (Broker)      │
│                 │    │                 │    │                 │
│ WebSocket Client◄────┤ WebSocket       │    │                 │
│                 │    │ Gateway         │    │                 │
│                 │    │                 │    │                 │
│                 │    │ Blog Service    ├────┤ Event Producer  │
│                 │    │                 │    │                 │
│                 │    │ Kafka Consumer  ├────┤ Event Consumer  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Setup Instructions

### 1. Start Kafka and Dependencies

```bash
# Start Kafka, Zookeeper, and MySQL using Docker Compose
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies (already done)
npm install

# Set up environment variables
cp .env.example .env

# Add Kafka configuration to .env
echo "KAFKA_BROKER=localhost:9092" >> .env
echo "FRONTEND_URL=http://localhost:3000" >> .env

# Start the backend server
npm run start:dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
npm install

# Start the frontend development server
npm run dev
```

### 4. Verify Setup

1. Open http://localhost:3000 in your browser
2. Login to the admin dashboard
3. Navigate to the blog management page
4. Open browser developer tools to see WebSocket connection logs
5. Create, update, or delete a blog post
6. Observe real-time updates without page refresh

## How It Works

### Backend Flow

1. **Blog Service**: When a blog post is created/updated/deleted, the service:
   - Saves changes to the database
   - Publishes an event to Kafka
   - Broadcasts the event via WebSocket

2. **Kafka Service**: Manages:
   - Event publishing to `blog-events` topic
   - Event consumption from the topic
   - Connection management and error handling

3. **WebSocket Gateway**: Handles:
   - Client connections with authentication
   - Broadcasting events to connected clients
   - Connection management and cleanup

### Frontend Flow

1. **WebSocket Service**: Manages:
   - Connection to backend WebSocket server
   - Event listening and handling
   - Automatic reconnection on connection loss

2. **Blog Context**: Integrates:
   - WebSocket events with React state
   - Real-time updates to blog post list
   - Connection status monitoring

## Event Types

The system handles these blog events:

- `blog-created`: New blog post created
- `blog-updated`: Existing blog post updated
- `blog-deleted`: Blog post deleted
- `blog-published`: Blog post publish status changed

## Configuration

### Environment Variables

**Backend (.env):**
```env
KAFKA_BROKER=localhost:9092
FRONTEND_URL=http://localhost:3000
```

**Frontend (config.ts):**
```typescript
export const config = {
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }
}
```

### Kafka Topics

- `blog-events`: Main topic for blog-related events
- Auto-created with 3 partitions and replication factor 1

## Monitoring

### Kafka UI
Access Kafka UI at http://localhost:8080 to:
- Monitor topics and messages
- View consumer groups
- Check broker health

### WebSocket Connection Status
The frontend displays WebSocket connection status in the blog context:
```typescript
const { isWebSocketConnected } = useBlog();
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend is running on correct port
   - Verify CORS settings in WebSocket gateway
   - Check authentication token validity

2. **Kafka Connection Issues**
   - Ensure Kafka is running: `docker-compose ps`
   - Check Kafka logs: `docker-compose logs kafka`
   - Verify broker address in environment variables

3. **Events Not Received**
   - Check browser console for WebSocket errors
   - Verify Kafka topic exists and has messages
   - Check backend logs for event publishing errors

### Debug Commands

```bash
# Check Kafka topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# View messages in blog-events topic
docker exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic blog-events --from-beginning

# Check WebSocket connections
# Open browser dev tools and look for WebSocket connection logs
```

## Development Notes

### Adding New Event Types

1. **Backend**: Add new event type to Kafka service
2. **Backend**: Add broadcast method to WebSocket gateway
3. **Frontend**: Add event handler to WebSocket service
4. **Frontend**: Update BlogContext to handle new events

### Performance Considerations

- Kafka is configured for development (single broker, no replication)
- WebSocket connections are limited to authenticated users
- Events are processed asynchronously to avoid blocking operations

### Security

- WebSocket connections require JWT authentication
- Kafka is only accessible from backend services
- CORS is configured for specific frontend URL

## Production Deployment

For production deployment:

1. **Kafka**: Use multi-broker cluster with replication
2. **Security**: Enable Kafka SSL/TLS encryption
3. **Monitoring**: Add proper logging and metrics
4. **Scaling**: Consider horizontal scaling of WebSocket connections

## Benefits

- **Real-time Updates**: No page refresh needed
- **Scalable**: Kafka handles high message throughput
- **Reliable**: Event-driven architecture with message persistence
- **User Experience**: Instant feedback for admin operations
- **Maintainable**: Clear separation of concerns between components
