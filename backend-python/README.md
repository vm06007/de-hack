# 🐍 DeHack Backend - Python API Server

A lightweight Python Flask API server for the DeHack platform with JSON-based data storage.

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

The API will be available at `http://localhost:5000`

### Docker Deployment
```bash
# Build and run with Docker
docker build -t dehack-backend .
docker run -p 8080:8080 dehack-backend

# Or use docker-compose
docker-compose up -d
```

### Kubernetes Deployment
```bash
# Deploy to Kubernetes
kubectl apply -f k8s-deployment.yaml

# Check deployment status
kubectl get pods -l app=dehack-backend
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 5000 for local, 8080 for production)
- `FLASK_DEBUG`: Enable debug mode (default: true for local, false for production)

### Production vs Development
- **Development**: Uses Flask development server on port 5000
- **Production**: Uses Gunicorn WSGI server on port 8080 with 4 workers

## 📚 API Endpoints

### Core Endpoints
- `GET /` - Health check
- `GET /api/hackathons` - List hackathons
- `POST /api/hackathons` - Create hackathon
- `GET /api/hackathons/{id}` - Get specific hackathon
- `GET /api/users` - List users
- `GET /api/organizations` - List organizations

### Additional Endpoints
- `GET /api/projects` - List projects/submissions
- `POST /api/projects` - Submit project
- `GET /api/sponsors` - List sponsors
- `POST /api/sponsors` - Create sponsor
- `GET /api/judges` - List judges
- `POST /api/uploads` - Upload images

## 🏗️ Architecture

### Data Storage
- JSON files in `data/` directory
- File-based storage for simplicity
- Easy to migrate to database later

### File Structure
```
backend-python/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── k8s-deployment.yaml   # Kubernetes deployment
├── deploy.sh            # Deployment script
├── data/                # JSON data files
└── uploads/             # Uploaded files
```

## 🐳 Docker Configuration

### Dockerfile Features
- Python 3.11 slim base image
- Multi-stage build for optimization
- Health checks with curl
- Gunicorn WSGI server for production
- Proper signal handling

### Docker Compose
- Volume mounts for data persistence
- Health checks
- Port mapping (8080:8080)

## ☸️ Kubernetes Configuration

### Deployment Features
- 2 replicas for high availability
- Resource limits and requests
- Liveness and readiness probes
- Persistent volumes for data
- Service and Ingress configuration

### Health Checks
- **Liveness Probe**: Checks if container is running
- **Readiness Probe**: Checks if container is ready to serve traffic
- Both use HTTP GET on `/` endpoint

## 🔍 Troubleshooting

### Common Issues

#### Port Mismatch
**Problem**: Health checks fail with "connection refused"
**Solution**: Ensure your deployment uses port 8080, not 5000

#### Container Won't Start
**Problem**: Container exits immediately
**Solution**: Check logs with `docker logs <container_id>`

#### Health Check Failures
**Problem**: Kubernetes reports unhealthy pods
**Solution**: 
1. Check if curl is installed in container
2. Verify the `/` endpoint returns 200 OK
3. Check resource limits

### Debug Commands
```bash
# Check container logs
docker logs <container_id>

# Check Kubernetes pods
kubectl get pods -l app=dehack-backend

# Check pod logs
kubectl logs -l app=dehack-backend

# Describe pod for events
kubectl describe pod <pod_name>

# Test health endpoint
curl http://localhost:8080/
```

## 📊 Monitoring

### Health Endpoint
The `/` endpoint returns:
```json
{
    "message": "DeHack Platform API",
    "version": "1.0.0",
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Logs
- Application logs are written to stdout
- Use `kubectl logs` or `docker logs` to view
- Structured logging with timestamps

## 🚀 Deployment Script

Use the included `deploy.sh` script for automated deployment:

```bash
./deploy.sh
```

This script will:
1. Build Docker image
2. Test container locally
3. Deploy to Kubernetes (if kubectl available)
4. Verify deployment health

## 🔄 Updates

To update the deployment:
1. Make code changes
2. Rebuild Docker image: `docker build -t dehack-backend .`
3. Update Kubernetes: `kubectl rollout restart deployment/dehack-backend`
4. Monitor rollout: `kubectl rollout status deployment/dehack-backend`

## 📞 Support

For issues or questions:
- Check the logs first
- Verify health endpoint responds
- Ensure port configuration matches deployment
- Check resource limits and availability