#!/usr/bin/env python3
"""
DeHack Platform - Lightweight Python Backend
Simple JSON-based API server
"""

import json
import os
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory, Response
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["*"], supports_credentials=True)

# Add global CORS headers for all responses
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
    response.headers['Referrer-Policy'] = 'no-referrer'
    return response

# Configuration
PORT = int(os.getenv('PORT', 5000))
DEBUG = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'

def get_base_url():
    """Get the base URL based on the current request"""
    from flask import request
    
    # Check if we're in production first
    is_production = (os.getenv('KUBERNETES_SERVICE_HOST') or 
                    os.getenv('DOCKER_CONTAINER') or 
                    PORT == 8080)
    
    if is_production:
        print(f"Production detected, using HTTPS URL")
        return 'https://octopus-app-szca5.ondigitalocean.app'
    
    # For development, use request host if available
    if request and hasattr(request, 'host'):
        # Check for forwarded headers that indicate HTTPS
        if (request.headers.get('X-Forwarded-Proto') == 'https' or 
            request.headers.get('X-Forwarded-Ssl') == 'on' or
            request.is_secure):
            print(f"HTTPS detected via headers, using: https://{request.host}")
            return f"https://{request.host}"
        else:
            print(f"HTTP detected, using: http://{request.host}")
            return f"http://{request.host}"
    
    # Default to localhost for development
    print(f"Using default localhost URL")
    return 'http://localhost:5000'

# Log the configuration for debugging
print(f"Backend Configuration:")
print(f"  PORT: {PORT}")
print(f"  DEBUG: {DEBUG}")
print(f"  KUBERNETES_SERVICE_HOST: {os.getenv('KUBERNETES_SERVICE_HOST')}")
print(f"  DOCKER_CONTAINER: {os.getenv('DOCKER_CONTAINER')}")
print(f"  BASE_URL will be determined dynamically from requests")

# Data directory
DATA_DIR = "data"

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed image extensions
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

def is_allowed_image(filename):
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED_IMAGE_EXTENSIONS

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
        "charts", "judges", "sponsors", "productActivity", "pricing", "income", "payouts", "payoutStatistics", "statementStatistics", "transactions", "projects"
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

@app.route('/api/hackathons', methods=['POST'])
def create_hackathon():
    """Create a new hackathon. Supports multipart/form-data with optional image upload.

    Expected fields (form-data or JSON):
    - title (str) [required]
    - description (str) [required]
    - category (str) [optional]
    - status (str) [optional; defaults to 'scheduled']
    - startDate (ISO str) [optional]
    - endDate (ISO str) [optional]
    - registrationDeadline (ISO str) [optional]
    - totalPrizePool (str/number) [optional]
    - maxParticipants (int) [optional]
    - isOnline (bool) [optional]
    - location (str|null) [optional]
    - organizerId (int) [optional]
    - createdBy (int) [optional]
    - tags ([]string) [optional; comma-separated]
    - requirements ([]string) [optional; comma-separated]
    - image (file) [optional]
    """

    # Support both JSON and multipart/form-data
    is_json = request.is_json and request.mimetype == 'application/json'
    form = request.get_json() if is_json else request.form

    title = (form.get('title') or '').strip()
    description = (form.get('description') or '').strip()
    if not title or not description:
        return jsonify({"error": "'title' and 'description' are required"}), 400

    hackathons = load_data('hackathons')

    # Handle image upload if present
    image_path = None
    if not is_json:
        image_file = request.files.get('image')
        if image_file and image_file.filename:
            if not is_allowed_image(image_file.filename):
                return jsonify({"error": "Unsupported image type"}), 400
            safe_name = secure_filename(image_file.filename)
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S%f')
            filename = f"{timestamp}_{safe_name}"
            image_file.save(os.path.join(UPLOAD_DIR, filename))
            image_path = f"{get_base_url()}/uploads/{filename}"
    else:
        # JSON payload may include base64 image or direct URL/path
        import base64
        import re
        image_b64 = form.get('imageBase64') or form.get('image_base64')
        if image_b64:
            # Support data URLs or raw base64
            data_url_match = re.match(r'^data:image/(png|jpg|jpeg|gif|webp);base64,(.+)$', image_b64, re.IGNORECASE)
            if data_url_match:
                ext = data_url_match.group(1).lower()
                b64_payload = data_url_match.group(2)
            else:
                # Default extension if not specified; use png
                ext = 'png'
                b64_payload = image_b64
            try:
                binary = base64.b64decode(b64_payload)
            except Exception:
                return jsonify({"error": "Invalid base64 image"}), 400
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S%f')
            filename = f"{timestamp}_upload.{ext}"
            with open(os.path.join(UPLOAD_DIR, filename), 'wb') as f:
                f.write(binary)
            image_path = f"{get_base_url()}/uploads/{filename}"
        elif form.get('image'):
            image_path = form.get('image')

    def parse_bool(val, default=None):
        if val is None:
            return default
        if isinstance(val, bool):
            return val
        return str(val).lower() in ['1', 'true', 'yes', 'on']

    def parse_int(val, default=None):
        try:
            return int(val) if val is not None and str(val) != '' else default
        except ValueError:
            return default

    def parse_list(val):
        if val is None:
            return []
        if isinstance(val, list):
            return val
        return [x.strip() for x in str(val).split(',') if x.strip()]

    new_hackathon = {
        "id": get_next_id(hackathons),
        "title": title,
        "description": description,
        "image": image_path,
        "category": form.get('category') or None,
        "status": form.get('status') or 'scheduled',
        "startDate": form.get('startDate') or None,
        "endDate": form.get('endDate') or None,
        "registrationDeadline": form.get('registrationDeadline') or None,
        "totalPrizePool": str(form.get('totalPrizePool')) if form.get('totalPrizePool') is not None else None,
        "maxParticipants": parse_int(form.get('maxParticipants')),
        "currentParticipants": 0,
        "requirements": parse_list(form.get('requirements')),
        "tags": parse_list(form.get('tags')),
        "isOnline": parse_bool(form.get('isOnline'), default=True),
        "location": form.get('location') or (None if parse_bool(form.get('isOnline'), True) else ''),
        "organizerId": parse_int(form.get('organizerId')),
        "createdBy": parse_int(form.get('createdBy')),
        # Optional structured arrays
        "prizeTiers": form.get('prizeTiers') if is_json else (json.loads(form.get('prizeTiers')) if form.get('prizeTiers') else []),
        "sponsors": form.get('sponsors') if is_json else (json.loads(form.get('sponsors')) if form.get('sponsors') else []),
        "logoUrl": form.get('logoUrl'),
        # Sponsor settings
        "allowSponsors": parse_bool(form.get('allowSponsors')),
        "sponsorMinContribution": form.get('sponsorMinContribution'),
        "sponsorCurrency": form.get('sponsorCurrency'),
        # Staking settings
        "requireStaking": parse_bool(form.get('requireStaking')),
        "stakingAmount": form.get('stakingAmount'),
        "stakingCurrency": form.get('stakingCurrency'),
        # Judge settings
        "selectedJudges": form.get('selectedJudges') if is_json else (json.loads(form.get('selectedJudges')) if form.get('selectedJudges') else []),
        "judgingModel": form.get('judgingModel'),
        "allowAIDelegation": parse_bool(form.get('allowAIDelegation')),
        # Blockchain data
        "contractAddress": form.get('contractAddress'),
        "hackathonId": form.get('hackathonId'),
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }

    hackathons.append(new_hackathon)
    save_data('hackathons', hackathons)

    response = jsonify(new_hackathon)
    response.status_code = 201
    # Location header for easy redirect on frontend
    response.headers['Location'] = f"/api/hackathons/{new_hackathon['id']}"
    return response

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

# Serve uploaded files
@app.route('/uploads/<path:filename>', methods=['GET', 'OPTIONS'])
def serve_upload(filename):
    if request.method == 'OPTIONS':
        response = Response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
        response.headers['Referrer-Policy'] = 'no-referrer'
        return response
    
    response = send_from_directory(UPLOAD_DIR, filename)
    
    # Add CORS headers for image loading
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
    response.headers['Referrer-Policy'] = 'no-referrer'
    
    return response

# Generic upload endpoint – returns a URL for the uploaded image
@app.route('/api/uploads', methods=['POST'])
def upload_file():
    """Upload an image via multipart (file) or JSON (imageBase64) and return its URL."""
    try:
        # Multipart route
        if 'file' in request.files:
            image_file = request.files['file']
            if not image_file or not image_file.filename:
                return jsonify({"error": "No file provided"}), 400
            if not is_allowed_image(image_file.filename):
                return jsonify({"error": "Unsupported image type"}), 400
            safe_name = secure_filename(image_file.filename)
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S%f')
            filename = f"{timestamp}_{safe_name}"
            image_file.save(os.path.join(UPLOAD_DIR, filename))
            return jsonify({"url": f"{get_base_url()}/uploads/{filename}", "filename": filename}), 201

        # JSON with base64
        if request.is_json:
            import base64, re
            payload = request.get_json() or {}
            image_b64 = payload.get('imageBase64') or payload.get('image_base64')
            if not image_b64:
                return jsonify({"error": "imageBase64 required"}), 400
            data_url_match = re.match(r'^data:image/(png|jpg|jpeg|gif|webp);base64,(.+)$', image_b64, re.IGNORECASE)
            if data_url_match:
                ext = data_url_match.group(1).lower()
                b64_payload = data_url_match.group(2)
            else:
                ext = 'png'
                b64_payload = image_b64
            try:
                binary = base64.b64decode(b64_payload)
            except Exception:
                return jsonify({"error": "Invalid base64 image"}), 400
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S%f')
            filename = f"{timestamp}_upload.{ext}"
            with open(os.path.join(UPLOAD_DIR, filename), 'wb') as f:
                f.write(binary)
            return jsonify({"url": f"{get_base_url()}/uploads/{filename}", "filename": filename}), 201

        return jsonify({"error": "Unsupported upload format"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

# Sponsors API
@app.route('/api/sponsors', methods=['GET'])
def get_sponsors():
    """Get all sponsors, optionally filtered by hackathon ID"""
    sponsors = load_data('sponsors')
    hackathon_id = request.args.get('hackathonId')
    
    if hackathon_id:
        hackathon_id = int(hackathon_id)
        sponsors = [s for s in sponsors if s.get('hackathonId') == hackathon_id]
    
    return jsonify({
        "sponsors": sponsors,
        "total": len(sponsors)
    })

@app.route('/api/sponsors', methods=['POST'])
def create_sponsor():
    """Create a new sponsor application"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    required_fields = ['hackathonId', 'companyName', 'contributionAmount']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    sponsors = load_data('sponsors')
    
    new_sponsor = {
        "id": get_next_id(sponsors),
        "hackathonId": int(data['hackathonId']),
        "companyName": data['companyName'],
        "contributionAmount": data['contributionAmount'],
        "companyLogo": data.get('companyLogo'),
        "prizeDistribution": data.get('prizeDistribution', ''),
        "depositHook": data.get('depositHook', 'Plain Deposit'),
        "transactionHash": data.get('transactionHash'),
        "sponsorAddress": data.get('sponsorAddress'),
        "status": "approved",  # auto-approve for now
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    sponsors.append(new_sponsor)
    save_data('sponsors', sponsors)
    
    response = jsonify(new_sponsor)
    response.status_code = 201
    return response

@app.route('/api/sponsors/<int:sponsor_id>', methods=['GET'])
def get_sponsor(sponsor_id):
    """Get a specific sponsor by ID"""
    sponsors = load_data('sponsors')
    sponsor = next((s for s in sponsors if s['id'] == sponsor_id), None)
    
    if not sponsor:
        return jsonify({"error": "Sponsor not found"}), 404
    
    return jsonify(sponsor)

@app.route('/api/sponsors/<int:sponsor_id>', methods=['PUT'])
def update_sponsor(sponsor_id):
    """Update sponsor status (approve/reject)"""
    data = request.get_json()
    
    if not data or 'status' not in data:
        return jsonify({"error": "Status is required"}), 400
    
    sponsors = load_data('sponsors')
    sponsor = next((s for s in sponsors if s['id'] == sponsor_id), None)
    
    if not sponsor:
        return jsonify({"error": "Sponsor not found"}), 404
    
    sponsor['status'] = data['status']
    sponsor['updatedAt'] = datetime.now().isoformat()
    
    save_data('sponsors', sponsors)
    return jsonify(sponsor)

# Projects/Submissions API
@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Get all projects, optionally filtered by hackathon ID"""
    projects = load_data('projects')
    hackathon_id = request.args.get('hackathonId')
    status = request.args.get('status')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    # Filter projects
    filtered_projects = projects
    if hackathon_id:
        hackathon_id = int(hackathon_id)
        filtered_projects = [p for p in filtered_projects if p.get('hackathonId') == hackathon_id]
    if status:
        filtered_projects = [p for p in filtered_projects if p.get('status') == status]
    
    # Pagination
    start = (page - 1) * limit
    end = start + limit
    paginated_projects = filtered_projects[start:end]
    
    return jsonify({
        "data": paginated_projects,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": len(filtered_projects),
            "pages": (len(filtered_projects) + limit - 1) // limit
        }
    })

@app.route('/api/projects', methods=['POST'])
def create_project():
    """Create a new project submission"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    required_fields = ['hackathonId', 'title', 'description', 'teamMembers', 'selectedTracks']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    projects = load_data('projects')
    
    new_project = {
        "id": get_next_id(projects),
        "hackathonId": int(data['hackathonId']),
        "title": data['title'],
        "description": data['description'],
        "teamMembers": data['teamMembers'],  # Array of team member objects
        "selectedTracks": data['selectedTracks'],  # Array of selected track IDs
        "demoUrl": data.get('demoUrl'),
        "githubUrl": data.get('githubUrl'),
        "videoUrl": data.get('videoUrl'),
        "images": data.get('images', []),  # Array of image URLs
        "technologies": data.get('technologies', []),  # Array of technology strings
        "submittedBy": data.get('submittedBy'),  # User ID who submitted
        "submittedByName": data.get('submittedByName'),  # User name for display
        "status": "submitted",  # submitted, under_review, approved, rejected
        "judgeScores": {},  # Object with judgeId as key and score as value
        "totalScore": 0,
        "rank": None,
        "prize": None,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    projects.append(new_project)
    save_data('projects', projects)
    
    response = jsonify(new_project)
    response.status_code = 201
    return response

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Get a specific project by ID"""
    projects = load_data('projects')
    project = next((p for p in projects if p['id'] == project_id), None)
    
    if not project:
        return jsonify({"error": "Project not found"}), 404
    
    return jsonify(project)

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """Update project details or status"""
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    projects = load_data('projects')
    project = next((p for p in projects if p['id'] == project_id), None)
    
    if not project:
        return jsonify({"error": "Project not found"}), 404
    
    # Update allowed fields
    updatable_fields = [
        'title', 'description', 'teamMembers', 'selectedTracks', 'demoUrl', 
        'githubUrl', 'videoUrl', 'images', 'technologies', 'status', 
        'judgeScores', 'totalScore', 'rank', 'prize'
    ]
    
    for field in updatable_fields:
        if field in data:
            project[field] = data[field]
    
    project['updatedAt'] = datetime.now().isoformat()
    
    save_data('projects', projects)
    return jsonify(project)

@app.route('/api/projects/<int:project_id>/judge', methods=['POST'])
def judge_project(project_id):
    """Submit judge scores for a project"""
    data = request.get_json()
    
    if not data or 'judgeId' not in data or 'scores' not in data:
        return jsonify({"error": "judgeId and scores are required"}), 400
    
    projects = load_data('projects')
    project = next((p for p in projects if p['id'] == project_id), None)
    
    if not project:
        return jsonify({"error": "Project not found"}), 404
    
    judge_id = data['judgeId']
    scores = data['scores']  # Object with criteria as keys and scores as values
    
    # Store judge scores
    if 'judgeScores' not in project:
        project['judgeScores'] = {}
    
    project['judgeScores'][str(judge_id)] = {
        'scores': scores,
        'submittedAt': datetime.now().isoformat()
    }
    
    # Calculate total score (average of all judge scores)
    if project['judgeScores']:
        total_scores = []
        for judge_scores in project['judgeScores'].values():
            if isinstance(judge_scores, dict) and 'scores' in judge_scores:
                judge_total = sum(judge_scores['scores'].values())
                total_scores.append(judge_total)
        
        if total_scores:
            project['totalScore'] = sum(total_scores) / len(total_scores)
    
    project['updatedAt'] = datetime.now().isoformat()
    
    save_data('projects', projects)
    return jsonify(project)

@app.route('/api/hackathons/<int:hackathon_id>/projects', methods=['GET'])
def get_hackathon_projects(hackathon_id):
    """Get all projects for a specific hackathon"""
    projects = load_data('projects')
    hackathon_projects = [p for p in projects if p.get('hackathonId') == hackathon_id]
    
    # Sort by total score (highest first) if scores exist
    hackathon_projects.sort(key=lambda x: x.get('totalScore', 0), reverse=True)
    
    return jsonify({
        "hackathonId": hackathon_id,
        "projects": hackathon_projects,
        "total": len(hackathon_projects)
    })


if __name__ == '__main__':
    # Initialize sample data
    init_sample_data()

    print("Starting DeHack Python Backend...")
    print("Sample data initialized")
    print(f"API available at: http://0.0.0.0:{PORT}")
    print(f"API docs: http://0.0.0.0:{PORT}/api/hackathons")

    app.run(debug=DEBUG, host='0.0.0.0', port=PORT)
