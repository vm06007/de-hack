#!/usr/bin/env python3
"""
DeHack Platform - Lightweight Python Backend
Simple JSON-based API server
"""

import json
import os
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Data directory
DATA_DIR = "data"

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

def load_data(filename):
    """Load data from JSON file"""
    filepath = os.path.join(DATA_DIR, f"{filename}.json")
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return []

def save_data(filename, data):
    """Save data to JSON file"""
    filepath = os.path.join(DATA_DIR, f"{filename}.json")
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def get_next_id(data):
    """Get next ID for new items"""
    if not data:
        return 1
    return max(item.get('id', 0) for item in data) + 1

# Initialize with sample data if files don't exist
def init_sample_data():
    """Initialize with sample data"""
    
    # Users data
    if not os.path.exists(os.path.join(DATA_DIR, "users.json")):
        users = [
            {
                "id": 1,
                "email": "alex@hackathon.dev",
                "username": "alexchen_dev",
                "name": "Alex Chen",
                "avatar": "/images/avatars/1.png",
                "role": "hacker",
                "location": "San Francisco, CA",
                "reputation": 4.9,
                "totalEarnings": 125000,
                "participationCount": 23,
                "hackathonsWon": 8,
                "skills": ["Solidity", "React", "Node.js", "Web3"],
                "favoriteCategories": ["DeFi", "NFT", "Gaming"],
                "socialLinks": {
                    "github": "https://github.com/alexchen_dev",
                    "twitter": "https://twitter.com/alexchen_dev",
                    "linkedin": "https://linkedin.com/in/alexchen"
                },
                "joinDate": "2022-03-15T00:00:00Z",
                "lastActive": "2024-01-15T00:00:00Z",
                "createdAt": "2022-03-15T00:00:00Z",
                "updatedAt": "2024-01-15T00:00:00Z"
            },
            {
                "id": 2,
                "email": "sarah@blockchain.dev",
                "username": "sarah_kim_crypto",
                "name": "Sarah Kim",
                "avatar": "/images/avatars/2.png",
                "role": "hacker",
                "location": "Seoul, South Korea",
                "reputation": 4.8,
                "totalEarnings": 89000,
                "participationCount": 18,
                "hackathonsWon": 8,
                "skills": ["Rust", "Substrate", "Polkadot", "Smart Contracts"],
                "favoriteCategories": ["Infrastructure", "DeFi", "Privacy"],
                "socialLinks": {
                    "github": "https://github.com/sarah_kim",
                    "twitter": "https://twitter.com/sarah_kim_crypto",
                    "linkedin": "https://linkedin.com/in/sarahkim"
                },
                "joinDate": "2021-11-08T00:00:00Z",
                "lastActive": "2024-01-12T00:00:00Z",
                "createdAt": "2021-11-08T00:00:00Z",
                "updatedAt": "2024-01-12T00:00:00Z"
            }
        ]
        save_data("users", users)
    
    # Organizations data
    if not os.path.exists(os.path.join(DATA_DIR, "organizations.json")):
        organizations = [
            {
                "id": 1,
                "name": "ETHGlobal",
                "slug": "ethglobal",
                "description": "The world's largest Ethereum hackathon series",
                "logo": "/images/logos/ethglobal.png",
                "website": "https://ethglobal.com",
                "socialLinks": {
                    "twitter": "https://twitter.com/ETHGlobal",
                    "discord": "https://discord.gg/ethglobal"
                },
                "createdBy": 1,
                "createdAt": "2020-01-01T00:00:00Z",
                "updatedAt": "2024-01-01T00:00:00Z"
            },
            {
                "id": 2,
                "name": "Token2049",
                "slug": "token2049",
                "description": "The premier crypto and Web3 conference",
                "logo": "/images/logos/token2049.png",
                "website": "https://token2049.com",
                "socialLinks": {
                    "twitter": "https://twitter.com/Token2049",
                    "linkedin": "https://linkedin.com/company/token2049"
                },
                "createdBy": 1,
                "createdAt": "2020-01-01T00:00:00Z",
                "updatedAt": "2024-01-01T00:00:00Z"
            }
        ]
        save_data("organizations", organizations)
    
    # Hackathons data
    if not os.path.exists(os.path.join(DATA_DIR, "hackathons.json")):
        hackathons = [
            {
                "id": 1,
                "title": "ETHGlobal Online 2025",
                "description": "The biggest online Ethereum hackathon of the year",
                "image": "/images/products/lg-1.png",
                "category": "Online hackathon",
                "status": "active",
                "startDate": "2025-04-15T00:00:00Z",
                "endDate": "2025-04-29T23:59:59Z",
                "registrationDeadline": "2025-04-14T23:59:59Z",
                "totalPrizePool": "100000.00",
                "maxParticipants": 1000,
                "currentParticipants": 847,
                "requirements": ["Ethereum knowledge", "Web3 development experience"],
                "tags": ["Ethereum", "DeFi", "NFT", "Web3"],
                "isOnline": True,
                "location": None,
                "organizerId": 1,
                "createdBy": 1,
                "createdAt": "2024-01-01T00:00:00Z",
                "updatedAt": "2024-01-15T00:00:00Z"
            },
            {
                "id": 2,
                "title": "Unite DeFi 2025",
                "description": "Building the future of decentralized finance",
                "image": "/images/products/lg-2.png",
                "category": "Online hackathon",
                "status": "scheduled",
                "startDate": "2025-05-15T00:00:00Z",
                "endDate": "2025-05-29T23:59:59Z",
                "registrationDeadline": "2025-05-14T23:59:59Z",
                "totalPrizePool": "500000.00",
                "maxParticipants": 500,
                "currentParticipants": 0,
                "requirements": ["DeFi knowledge", "Smart contract development"],
                "tags": ["DeFi", "Yield Farming", "AMM", "Lending"],
                "isOnline": True,
                "location": None,
                "organizerId": 2,
                "createdBy": 1,
                "createdAt": "2024-01-01T00:00:00Z",
                "updatedAt": "2024-01-15T00:00:00Z"
            }
        ]
        save_data("hackathons", hackathons)
    
    # Applications data
    if not os.path.exists(os.path.join(DATA_DIR, "applications.json")):
        applications = [
            {
                "id": 1,
                "hackathonId": 1,
                "hackerId": 1,
                "status": "accepted",
                "motivation": "I want to build innovative DeFi solutions",
                "experience": "5 years of blockchain development",
                "portfolio": {
                    "github": "https://github.com/alexchen_dev",
                    "projects": ["DeFi Protocol", "NFT Marketplace"],
                    "resume": "https://alexchen.dev/resume.pdf"
                },
                "appliedAt": "2025-04-01T10:00:00Z",
                "reviewedAt": "2025-04-02T15:00:00Z",
                "reviewedBy": 1,
                "createdAt": "2025-04-01T10:00:00Z",
                "updatedAt": "2025-04-02T15:00:00Z"
            }
        ]
        save_data("applications", applications)
    
    # Analytics data
    if not os.path.exists(os.path.join(DATA_DIR, "analytics.json")):
        analytics = [
            {
                "id": 1,
                "entityType": "hackathon",
                "entityId": "1",
                "metric": "view",
                "value": 1250,
                "metadata": {"source": "web"},
                "createdAt": "2024-01-15T00:00:00Z"
            },
            {
                "id": 2,
                "entityType": "hackathon",
                "entityId": "1",
                "metric": "like",
                "value": 120,
                "metadata": {"source": "web"},
                "createdAt": "2024-01-15T00:00:00Z"
            }
        ]
        save_data("analytics", analytics)

# API Routes

@app.route('/')
def health():
    return jsonify({
        "message": "DeHack Platform API",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

# Hackathons API
@app.route('/api/hackathons', methods=['GET'])
def get_hackathons():
    hackathons = load_data('hackathons')
    status = request.args.get('status')
    category = request.args.get('category')
    is_online = request.args.get('isOnline')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    # Filter hackathons
    filtered_hackathons = hackathons
    if status:
        filtered_hackathons = [h for h in filtered_hackathons if h['status'] == status]
    if category:
        filtered_hackathons = [h for h in filtered_hackathons if h['category'] == category]
    if is_online is not None:
        is_online_bool = is_online.lower() == 'true'
        filtered_hackathons = [h for h in filtered_hackathons if h['isOnline'] == is_online_bool]
    
    # Pagination
    start = (page - 1) * limit
    end = start + limit
    paginated_hackathons = filtered_hackathons[start:end]
    
    return jsonify({
        "data": paginated_hackathons,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": len(filtered_hackathons),
            "pages": (len(filtered_hackathons) + limit - 1) // limit
        }
    })

@app.route('/api/hackathons/<int:hackathon_id>', methods=['GET'])
def get_hackathon(hackathon_id):
    hackathons = load_data('hackathons')
    hackathon = next((h for h in hackathons if h['id'] == hackathon_id), None)
    
    if not hackathon:
        return jsonify({"error": "Hackathon not found"}), 404
    
    # Get applications for this hackathon
    applications = load_data('applications')
    hackathon_applications = [a for a in applications if a['hackathonId'] == hackathon_id]
    
    hackathon['applicationsCount'] = len(hackathon_applications)
    hackathon['applications'] = hackathon_applications
    
    return jsonify(hackathon)

# Users API
@app.route('/api/users', methods=['GET'])
def get_users():
    users = load_data('users')
    role = request.args.get('role')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    search = request.args.get('search')
    
    # Filter users
    filtered_users = users
    if role:
        filtered_users = [u for u in filtered_users if u['role'] == role]
    if search:
        filtered_users = [u for u in filtered_users if search.lower() in u['name'].lower() or search.lower() in u['username'].lower()]
    
    # Pagination
    start = (page - 1) * limit
    end = start + limit
    paginated_users = filtered_users[start:end]
    
    return jsonify({
        "data": paginated_users,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": len(filtered_users),
            "pages": (len(filtered_users) + limit - 1) // limit
        }
    })

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    users = load_data('users')
    user = next((u for u in users if u['id'] == user_id), None)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Get user's applications
    applications = load_data('applications')
    user_applications = [a for a in applications if a['hackerId'] == user_id]
    user['applications'] = user_applications
    
    return jsonify(user)

@app.route('/api/users/top/hackers', methods=['GET'])
def get_top_hackers():
    users = load_data('users')
    hackers = [u for u in users if u['role'] == 'hacker']
    limit = int(request.args.get('limit', 10))
    
    # Sort by total earnings
    top_hackers = sorted(hackers, key=lambda x: x['totalEarnings'], reverse=True)[:limit]
    
    return jsonify(top_hackers)

# Organizations API
@app.route('/api/organizations', methods=['GET'])
def get_organizations():
    organizations = load_data('organizations')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    search = request.args.get('search')
    
    # Filter organizations
    filtered_organizations = organizations
    if search:
        filtered_organizations = [o for o in filtered_organizations if search.lower() in o['name'].lower()]
    
    # Pagination
    start = (page - 1) * limit
    end = start + limit
    paginated_organizations = filtered_organizations[start:end]
    
    return jsonify({
        "data": paginated_organizations,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": len(filtered_organizations),
            "pages": (len(filtered_organizations) + limit - 1) // limit
        }
    })

@app.route('/api/organizations/<int:org_id>', methods=['GET'])
def get_organization(org_id):
    organizations = load_data('organizations')
    organization = next((o for o in organizations if o['id'] == org_id), None)
    
    if not organization:
        return jsonify({"error": "Organization not found"}), 404
    
    # Get organization's hackathons
    hackathons = load_data('hackathons')
    org_hackathons = [h for h in hackathons if h['organizerId'] == org_id]
    organization['hackathons'] = org_hackathons
    
    return jsonify(organization)

# Analytics API
@app.route('/api/analytics/overview', methods=['GET'])
def get_analytics_overview():
    users = load_data('users')
    hackathons = load_data('hackathons')
    applications = load_data('applications')
    analytics = load_data('analytics')
    
    # Aggregate analytics by metric
    metrics = {}
    for item in analytics:
        metric = item['metric']
        if metric not in metrics:
            metrics[metric] = 0
        metrics[metric] += item['value']
    
    return jsonify({
        "totalUsers": len(users),
        "totalHackathons": len(hackathons),
        "totalApplications": len(applications),
        "metrics": metrics
    })

@app.route('/api/analytics/track', methods=['POST'])
def track_analytics():
    data = request.get_json()
    analytics = load_data('analytics')
    
    new_analytics = {
        "id": get_next_id(analytics),
        "entityType": data.get('entityType'),
        "entityId": data.get('entityId'),
        "metric": data.get('metric'),
        "value": data.get('value', 1),
        "metadata": data.get('metadata', {}),
        "createdAt": datetime.now().isoformat()
    }
    
    analytics.append(new_analytics)
    save_data('analytics', analytics)
    
    return jsonify(new_analytics), 201

if __name__ == '__main__':
    # Initialize sample data
    init_sample_data()
    
    print("🚀 Starting DeHack Python Backend...")
    print("📊 Sample data initialized")
    print("🌐 API available at: http://localhost:5000")
    print("📖 API docs: http://localhost:5000/api/hackathons")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
