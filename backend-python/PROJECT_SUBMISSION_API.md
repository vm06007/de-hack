# Project Submission API Documentation

This document describes the API endpoints for managing project submissions in the DeHack platform.

## Base URL
```
http://localhost:5000/api
```
**Note**: In production, this will be `https://octopus-app-szca5.ondigitalocean.app/api`

## Endpoints

### 1. Get All Projects
**GET** `/projects`

Get all projects with optional filtering and pagination.

**Query Parameters:**
- `hackathonId` (optional): Filter by hackathon ID
- `status` (optional): Filter by status (submitted, under_review, approved, rejected)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /api/projects?hackathonId=1&status=submitted&page=1&limit=10
```

**Example Response:**
```json
{
  "data": [
    {
      "id": 1,
      "hackathonId": 1,
      "title": "DeFi Yield Optimizer",
      "description": "An automated yield farming platform...",
      "teamMembers": [
        {
          "name": "Alice Johnson",
          "role": "Lead Developer",
          "email": "alice@example.com",
          "github": "alice-dev"
        }
      ],
      "selectedTracks": [1, 2],
      "demoUrl": "https://demo.defi-optimizer.com",
      "githubUrl": "https://github.com/team/defi-optimizer",
      "videoUrl": "https://youtube.com/watch?v=example",
      "images": ["https://example.com/screenshot1.png"],
      "technologies": ["Solidity", "React", "Web3.js"],
      "submittedBy": 1,
      "submittedByName": "Alice Johnson",
      "status": "submitted",
      "judgeScores": {},
      "totalScore": 0,
      "rank": null,
      "prize": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### 2. Create Project Submission
**POST** `/projects`

Create a new project submission.

**Required Fields:**
- `hackathonId`: ID of the hackathon
- `title`: Project title
- `description`: Project description
- `teamMembers`: Array of team member objects
- `selectedTracks`: Array of selected track IDs

**Optional Fields:**
- `demoUrl`: Demo URL
- `githubUrl`: GitHub repository URL
- `videoUrl`: Video presentation URL
- `images`: Array of image URLs
- `technologies`: Array of technology strings
- `submittedBy`: User ID who submitted
- `submittedByName`: User name for display

**Example Request:**
```json
{
  "hackathonId": 1,
  "title": "AI-Powered DeFi Analytics",
  "description": "A comprehensive analytics platform for DeFi protocols using machine learning to predict market trends and optimize trading strategies.",
  "teamMembers": [
    {
      "name": "John Doe",
      "role": "Lead Developer",
      "email": "john@example.com",
      "github": "john-doe"
    },
    {
      "name": "Jane Smith",
      "role": "AI/ML Engineer",
      "email": "jane@example.com",
      "github": "jane-smith"
    }
  ],
  "selectedTracks": [1, 2, 3],
  "demoUrl": "https://demo.defi-analytics.com",
  "githubUrl": "https://github.com/team/defi-analytics",
  "videoUrl": "https://youtube.com/watch?v=demo",
  "images": [
    "https://example.com/screenshot1.png",
    "https://example.com/screenshot2.png"
  ],
  "technologies": ["Python", "TensorFlow", "React", "Solidity"],
  "submittedBy": 5,
  "submittedByName": "John Doe"
}
```

**Example Response:**
```json
{
  "id": 4,
  "hackathonId": 1,
  "title": "AI-Powered DeFi Analytics",
  "description": "A comprehensive analytics platform...",
  "teamMembers": [...],
  "selectedTracks": [1, 2, 3],
  "demoUrl": "https://demo.defi-analytics.com",
  "githubUrl": "https://github.com/team/defi-analytics",
  "videoUrl": "https://youtube.com/watch?v=demo",
  "images": ["https://example.com/screenshot1.png"],
  "technologies": ["Python", "TensorFlow", "React", "Solidity"],
  "submittedBy": 5,
  "submittedByName": "John Doe",
  "status": "submitted",
  "judgeScores": {},
  "totalScore": 0,
  "rank": null,
  "prize": null,
  "createdAt": "2024-01-17T12:00:00Z",
  "updatedAt": "2024-01-17T12:00:00Z"
}
```

### 3. Get Project by ID
**GET** `/projects/{project_id}`

Get a specific project by its ID.

**Example Request:**
```
GET /api/projects/1
```

**Example Response:**
```json
{
  "id": 1,
  "hackathonId": 1,
  "title": "DeFi Yield Optimizer",
  "description": "An automated yield farming platform...",
  "teamMembers": [...],
  "selectedTracks": [1, 2],
  "demoUrl": "https://demo.defi-optimizer.com",
  "githubUrl": "https://github.com/team/defi-optimizer",
  "videoUrl": "https://youtube.com/watch?v=example",
  "images": ["https://example.com/screenshot1.png"],
  "technologies": ["Solidity", "React", "Web3.js"],
  "submittedBy": 1,
  "submittedByName": "Alice Johnson",
  "status": "submitted",
  "judgeScores": {},
  "totalScore": 0,
  "rank": null,
  "prize": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 4. Update Project
**PUT** `/projects/{project_id}`

Update project details or status.

**Updatable Fields:**
- `title`, `description`, `teamMembers`, `selectedTracks`
- `demoUrl`, `githubUrl`, `videoUrl`, `images`, `technologies`
- `status`, `judgeScores`, `totalScore`, `rank`, `prize`

**Example Request:**
```json
{
  "status": "under_review",
  "rank": 1,
  "prize": "First Place - $5000"
}
```

**Example Response:**
```json
{
  "id": 1,
  "hackathonId": 1,
  "title": "DeFi Yield Optimizer",
  "status": "under_review",
  "rank": 1,
  "prize": "First Place - $5000",
  "updatedAt": "2024-01-17T14:30:00Z"
}
```

### 5. Judge Project
**POST** `/projects/{project_id}/judge`

Submit judge scores for a project.

**Required Fields:**
- `judgeId`: ID of the judge
- `scores`: Object with criteria as keys and scores as values

**Example Request:**
```json
{
  "judgeId": 1,
  "scores": {
    "innovation": 9,
    "technical_quality": 8,
    "market_potential": 7,
    "presentation": 8,
    "execution": 9
  }
}
```

**Example Response:**
```json
{
  "id": 1,
  "judgeScores": {
    "1": {
      "scores": {
        "innovation": 9,
        "technical_quality": 8,
        "market_potential": 7,
        "presentation": 8,
        "execution": 9
      },
      "submittedAt": "2024-01-17T15:00:00Z"
    }
  },
  "totalScore": 8.2,
  "updatedAt": "2024-01-17T15:00:00Z"
}
```

### 6. Get Hackathon Projects
**GET** `/hackathons/{hackathon_id}/projects`

Get all projects for a specific hackathon, sorted by total score.

**Example Request:**
```
GET /api/hackathons/1/projects
```

**Example Response:**
```json
{
  "hackathonId": 1,
  "projects": [
    {
      "id": 2,
      "title": "NFT Marketplace with AI Curation",
      "totalScore": 8.0,
      "rank": 1,
      "prize": "First Place - $5000"
    },
    {
      "id": 1,
      "title": "DeFi Yield Optimizer",
      "totalScore": 7.5,
      "rank": 2,
      "prize": "Second Place - $3000"
    }
  ],
  "total": 2
}
```

## Data Models

### Project Object
```json
{
  "id": "integer",
  "hackathonId": "integer",
  "title": "string",
  "description": "string",
  "teamMembers": [
    {
      "name": "string",
      "role": "string",
      "email": "string",
      "github": "string"
    }
  ],
  "selectedTracks": ["integer"],
  "demoUrl": "string (optional)",
  "githubUrl": "string (optional)",
  "videoUrl": "string (optional)",
  "images": ["string"],
  "technologies": ["string"],
  "submittedBy": "integer",
  "submittedByName": "string",
  "status": "string (submitted|under_review|approved|rejected)",
  "judgeScores": {
    "judgeId": {
      "scores": {
        "criteria": "number"
      },
      "submittedAt": "ISO string"
    }
  },
  "totalScore": "number",
  "rank": "integer (optional)",
  "prize": "string (optional)",
  "createdAt": "ISO string",
  "updatedAt": "ISO string"
}
```

### Team Member Object
```json
{
  "name": "string",
  "role": "string",
  "email": "string",
  "github": "string"
}
```

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Error Responses

```json
{
  "error": "Error message description"
}
```

## Usage Examples

### Frontend Integration

```javascript
// Submit a new project
const submitProject = async (projectData) => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData)
  });

  if (!response.ok) {
    throw new Error('Failed to submit project');
  }

  return await response.json();
};

// Get projects for a hackathon
const getHackathonProjects = async (hackathonId) => {
  const response = await fetch(`/api/hackathons/${hackathonId}/projects`);
  return await response.json();
};

// Judge a project
const judgeProject = async (projectId, judgeId, scores) => {
  const response = await fetch(`/api/projects/${projectId}/judge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ judgeId, scores })
  });

  return await response.json();
};
```

## Notes

- All timestamps are in ISO 8601 format
- Judge scores are automatically calculated into a total score
- Projects are sorted by total score in descending order
- The API supports pagination for large datasets
- Image URLs should be publicly accessible
- Team member information is stored as an array of objects
