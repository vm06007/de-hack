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
