#!/bin/bash

echo "🚀 DeHack Backend Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if kubectl is installed (optional)
if ! command -v kubectl &> /dev/null; then
    print_warning "kubectl is not installed. Kubernetes deployment will be skipped."
    K8S_AVAILABLE=false
else
    K8S_AVAILABLE=true
fi

# Build Docker image
print_status "Building Docker image..."
docker build -t dehack-backend:latest .

if [ $? -eq 0 ]; then
    print_status "Docker image built successfully!"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Test the container locally
print_status "Testing container locally..."
docker run -d --name dehack-backend-test -p 8080:8080 dehack-backend:latest

# Wait for container to start
sleep 5

# Test health endpoint
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    print_status "Container is healthy and responding!"
else
    print_error "Container health check failed"
    docker logs dehack-backend-test
    docker stop dehack-backend-test
    docker rm dehack-backend-test
    exit 1
fi

# Stop test container
docker stop dehack-backend-test
docker rm dehack-backend-test

# Deploy to Kubernetes if available
if [ "$K8S_AVAILABLE" = true ]; then
    print_status "Deploying to Kubernetes..."
    kubectl apply -f k8s-deployment.yaml
    
    if [ $? -eq 0 ]; then
        print_status "Kubernetes deployment successful!"
        echo ""
        echo "To check deployment status:"
        echo "  kubectl get pods -l app=dehack-backend"
        echo "  kubectl get services -l app=dehack-backend"
        echo ""
        echo "To view logs:"
        echo "  kubectl logs -l app=dehack-backend"
    else
        print_error "Kubernetes deployment failed"
        exit 1
    fi
else
    print_warning "Skipping Kubernetes deployment (kubectl not available)"
    echo ""
    echo "To deploy manually:"
    echo "  kubectl apply -f k8s-deployment.yaml"
fi

echo ""
print_status "Deployment completed successfully!"
echo ""
echo "🔗 Access your API at:"
echo "  Local: http://localhost:8080"
echo "  Kubernetes: http://api.dehack.local (if ingress is configured)"
echo ""
echo "📚 API Documentation:"
echo "  http://localhost:8080/api/hackathons"
echo ""
echo "🛠️  Useful commands:"
echo "  docker-compose up -d          # Run with docker-compose"
echo "  kubectl get pods               # Check pod status"
echo "  kubectl logs -l app=dehack-backend  # View logs"
