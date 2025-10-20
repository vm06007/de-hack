# 🐍 DeHack Python Backend

Ultra-lightweight Python backend using JSON files as database.

## ✨ Features

- **No Database Required**: Uses JSON files for data storage
- **Minimal Setup**: Just Python + Flask
- **CORS Enabled**: Works with frontend out of the box
- **Sample Data**: Pre-loaded with hackathons, users, organizations
- **RESTful API**: Standard HTTP endpoints

## 🚀 Quick Start

```bash
# From project root
bun run serve:backend

# Or manually
cd backend-python
./start.sh
```

## 📊 API Endpoints

### Hackathons
- `GET /api/hackathons` - List hackathons with filters
- `GET /api/hackathons/:id` - Get specific hackathon
- `POST /api/hackathons` - Create a new hackathon (JSON or multipart with image)

#### Create Hackathon

You can create a hackathon using either JSON or `multipart/form-data` (to upload an image). Uploaded images are saved to `uploads/` and can be accessed at `/uploads/<filename>`.

Minimal required fields: `title`, `description`.

Example (JSON):

```bash
curl -X POST http://localhost:5000/api/hackathons \
    -H 'Content-Type: application/json' \
    -d '{
        "title": "My New Hackathon",
        "description": "Build the future of Web3.",
        "status": "scheduled",
        "isOnline": true,
        "tags": ["Web3", "Solidity"],
        "requirements": ["EVM", "Frontend"],
        "startDate": "2025-06-01T00:00:00Z",
        "endDate": "2025-06-07T23:59:59Z",
        "registrationDeadline": "2025-05-31T23:59:59Z",
        "totalPrizePool": "10000",
        "maxParticipants": 200,
        "organizerId": 1,
        "createdBy": 1,
        "imageBase64": "data:image/png;base64,iVBORw0KGgo..."  # optional
    }'
```

Example (multipart with image):

```bash
curl -X POST http://localhost:5000/api/hackathons \
    -H 'Accept: application/json' \
    -F title='My New Hackathon' \
    -F description='Build the future of Web3.' \
    -F status='scheduled' \
    -F isOnline='true' \
    -F tags='Web3,Solidity' \
    -F requirements='EVM,Frontend' \
    -F image=@./path/to/banner.png
```

Response:

```json
{
    "id": 9,
    "title": "My New Hackathon",
    "description": "Build the future of Web3.",
    "image": "/uploads/20250101T000000_banner.png",
    "status": "scheduled",
    "isOnline": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "currentParticipants": 0,
    "tags": ["Web3", "Solidity"],
    "requirements": ["EVM", "Frontend"]
}
```

The response includes a `Location` header pointing to `/api/hackathons/:id` to facilitate frontend redirects.

Allowed image types: `png`, `jpg`, `jpeg`, `gif`, `webp`.

### Users  
- `GET /api/users` - List users with filters
- `GET /api/users/:id` - Get user profile
- `GET /api/users/top/hackers` - Get top hackers

### Organizations
- `GET /api/organizations` - List organizations
- `GET /api/organizations/:id` - Get organization

### Analytics
- `GET /api/analytics/overview` - Platform overview
- `POST /api/analytics/track` - Track events

## 📁 Data Storage

All data is stored in JSON files in the `data/` directory:

```
data/
├── users.json          # User profiles
├── organizations.json  # Hackathon organizers
├── hackathons.json     # Hackathon events
├── applications.json   # User applications
└── analytics.json      # Engagement tracking
```

## 🔧 Development

```bash
# Install dependencies
pip3 install -r requirements.txt

# Run server
python3 app.py
```

## 📈 Sample Data Included

- **2 Users**: Alex Chen, Sarah Kim (hackers)
- **2 Organizations**: ETHGlobal, Token2049
- **2 Hackathons**: ETHGlobal Online 2025, Unite DeFi 2025
- **1 Application**: Sample hackathon application
- **Analytics Data**: Views, likes tracking

## 🌐 Usage

The API will be available at `http://localhost:5000`

Test it:
```bash
curl http://localhost:5000/api/hackathons
curl http://localhost:5000/api/users
curl http://localhost:5000/api/analytics/overview
```

## 🎯 Benefits

- **Zero Configuration**: No database setup required
- **Fast Development**: Start coding immediately
- **Easy Debugging**: JSON files are human-readable
- **Portable**: Works anywhere Python runs
- **Lightweight**: Minimal dependencies
