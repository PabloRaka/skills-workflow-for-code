# Example: Microservices Architecture (Production)

## Input
Design scalable fintech platform

## Architecture

- API Gateway
- Auth Service
- Payment Service
- Notification Service

## Flow

Client → API Gateway → Service → Database

## Decisions
- Use microservices for scalability
- Event-driven communication (Kafka)
- Docker + Kubernetes deployment

## Trade-offs
- Complexity vs scalability
- Network latency