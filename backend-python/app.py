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

# Initialize data files if they don't exist
def init_sample_data():
    """Initialize data files with empty arrays if they don't exist"""
    required_files = [
        "users", "organizations", "hackathons", "applications", "analytics",
        "timeSlots", "countries", "faqs", "comments", "messages",
        "notifications", "compatibility", "affiliateCenter", "slider",
        "charts", "judges", "sponsors", "productActivity", "pricing", "income", "payouts", "payoutStatistics", "statementStatistics", "transactions"
    ]

    for filename in required_files:
        filepath = os.path.join(DATA_DIR, f"{filename}.json")
        if not os.path.exists(filepath):
            save_data(filename, [])


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

# Additional API endpoints for new data

# Time slots API
@app.route('/api/time-slots', methods=['GET'])
def get_time_slots():
    time_slots = load_data('timeSlots')
    return jsonify(time_slots)

# Countries API
@app.route('/api/countries', methods=['GET'])
def get_countries():
    countries = load_data('countries')
    return jsonify(countries)

# FAQs API
@app.route('/api/faqs', methods=['GET'])
def get_faqs():
    faqs = load_data('faqs')
    return jsonify(faqs)

# Comments API
@app.route('/api/comments', methods=['GET'])
def get_comments():
    comments = load_data('comments')
    return jsonify(comments)

@app.route('/api/comments', methods=['POST'])
def create_comment():
    data = request.get_json()
    comments = load_data('comments')

    new_comment = {
        "id": get_next_id(comments),
        "author": data.get('author'),
        "avatar": data.get('avatar'),
        "content": data.get('content'),
        "timestamp": datetime.now().isoformat(),
        "likes": 0,
        "replies": []
    }

    comments.append(new_comment)
    save_data('comments', comments)

    return jsonify(new_comment), 201

# Messages API
@app.route('/api/messages', methods=['GET'])
def get_messages():
    messages = load_data('messages')
    return jsonify(messages)

@app.route('/api/messages', methods=['POST'])
def create_message():
    data = request.get_json()
    messages = load_data('messages')

    new_message = {
        "id": get_next_id(messages),
        "sender": data.get('sender'),
        "avatar": data.get('avatar'),
        "content": data.get('content'),
        "timestamp": datetime.now().isoformat(),
        "unread": True
    }

    messages.append(new_message)
    save_data('messages', messages)

    return jsonify(new_message), 201

# Notifications API
@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    notifications = load_data('notifications')
    return jsonify(notifications)

@app.route('/api/notifications', methods=['POST'])
def create_notification():
    data = request.get_json()
    notifications = load_data('notifications')

    new_notification = {
        "id": get_next_id(notifications),
        "type": data.get('type'),
        "title": data.get('title'),
        "content": data.get('content'),
        "timestamp": datetime.now().isoformat(),
        "unread": True
    }

    notifications.append(new_notification)
    save_data('notifications', notifications)

    return jsonify(new_notification), 201

# Compatibility API
@app.route('/api/compatibility', methods=['GET'])
def get_compatibility():
    compatibility = load_data('compatibility')
    return jsonify(compatibility)

# Slider API
@app.route('/api/slider', methods=['GET'])
def get_slider():
    slider_data = load_data('slider')
    return jsonify(slider_data)

# Overview API - Returns active hackathons for overview page
@app.route('/api/overview', methods=['GET'])
def get_overview():
    hackathons = load_data('hackathons')
    # Filter for active hackathons
    active_hackathons = [h for h in hackathons if h.get('status') == 'active']
    return jsonify(active_hackathons)

# Charts API
@app.route('/api/charts', methods=['GET'])
def get_charts():
    charts = load_data('charts')
    return jsonify(charts)

@app.route('/api/charts/<chart_id>', methods=['GET'])
def get_chart(chart_id):
    charts = load_data('charts')
    chart = next((c for c in charts if c.get('id') == chart_id), None)
    if not chart:
        return jsonify({"error": "Chart not found"}), 404
    return jsonify(chart)

# Judges API
@app.route('/api/judges', methods=['GET'])
def get_judges():
    judges = load_data('judges')
    return jsonify(judges)

@app.route('/api/judges/<int:judge_id>', methods=['GET'])
def get_judge(judge_id):
    judges = load_data('judges')
    judge = next((j for j in judges if j['id'] == judge_id), None)
    if not judge:
        return jsonify({"error": "Judge not found"}), 404
    return jsonify(judge)

# Sponsors API
@app.route('/api/sponsors', methods=['GET'])
def get_sponsors():
    sponsors = load_data('sponsors')
    return jsonify(sponsors)

@app.route('/api/sponsors/<int:sponsor_id>', methods=['GET'])
def get_sponsor(sponsor_id):
    sponsors = load_data('sponsors')
    sponsor = next((s for s in sponsors if s['id'] == sponsor_id), None)
    if not sponsor:
        return jsonify({"error": "Sponsor not found"}), 404
    return jsonify(sponsor)

# Product Activity API
@app.route('/api/product-activity', methods=['GET'])
def get_product_activity():
    activity = load_data('productActivity')
    return jsonify(activity)

# Pricing API
@app.route('/api/pricing', methods=['GET'])
def get_pricing():
    pricing = load_data('pricing')
    return jsonify(pricing)

# Income API
@app.route('/api/income', methods=['GET'])
def get_income():
    income = load_data('income')
    return jsonify(income)

# Payouts API
@app.route('/api/payouts', methods=['GET'])
def get_payouts():
    payouts = load_data('payouts')
    return jsonify(payouts)

# Payout Statistics API
@app.route('/api/payout-statistics', methods=['GET'])
def get_payout_statistics():
    statistics = load_data('payoutStatistics')
    return jsonify(statistics)

# Statement Statistics API
@app.route('/api/statement-statistics', methods=['GET'])
def get_statement_statistics():
    statistics = load_data('statementStatistics')
    return jsonify(statistics)

# Transactions API
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    transactions = load_data('transactions')
    return jsonify(transactions)

# Hackers API (alias for users)
@app.route('/api/hackers', methods=['GET'])
def get_hackers():
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


if __name__ == '__main__':
    # Initialize sample data
    init_sample_data()

    print("Starting DeHack Python Backend...")
    print("Sample data initialized")
    print("API available at: http://localhost:5000")
    print("API docs: http://localhost:5000/api/hackathons")

    app.run(debug=True, host='0.0.0.0', port=5000)
