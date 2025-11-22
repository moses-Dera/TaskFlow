# Backend Requirements - Language Agnostic

## 🎯 Core Models/Entities

### User Model
```
id: integer (primary key)
name: string (required)
email: string (unique, required)
password: string (hashed, required)
role: enum ['admin', 'manager', 'employee'] (default: 'employee')
created_at: timestamp
updated_at: timestamp
```

### Task Model
```
id: integer (primary key)
title: string (required)
description: text (optional)
status: enum ['pending', 'in-progress', 'completed', 'overdue'] (default: 'pending')
priority: enum ['low', 'medium', 'high'] (default: 'medium')
due_date: date (optional)
assigned_to: integer (foreign key -> users.id)
created_by: integer (foreign key -> users.id)
created_at: timestamp
updated_at: timestamp
```

### Message Model
```
id: integer (primary key)
sender_id: integer (foreign key -> users.id, required)
recipient_id: integer (foreign key -> users.id, optional for group messages)
message: text (required)
created_at: timestamp
```

### Notification Model
```
id: integer (primary key)
user_id: integer (foreign key -> users.id, required)
title: string (required)
message: text (required)
type: enum ['task', 'message', 'reminder', 'system']
read: boolean (default: false)
created_at: timestamp
```

### TaskFile Model (optional)
```
id: integer (primary key)
task_id: integer (foreign key -> tasks.id, required)
filename: string (required)
file_path: string (required)
file_size: integer
uploaded_by: integer (foreign key -> users.id)
created_at: timestamp
```

## 🔗 Required API Endpoints

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout (optional)
GET  /api/auth/me (get current user)
```

### User Endpoints
```
GET  /api/users/profile
PUT  /api/users/profile
```

### Task Endpoints
```
GET  /api/tasks (with query params: ?status=pending&tab=today)
POST /api/tasks
GET  /api/tasks/:id
PUT  /api/tasks/:id
DELETE /api/tasks/:id (optional)
POST /api/tasks/:id/files (file upload)
GET  /api/tasks/:id/files
```

### Team Endpoints (Manager/Admin only)
```
GET  /api/team/employees
GET  /api/team/performance
POST /api/team/assign-task
```

### Chat Endpoints
```
GET  /api/chat/messages
POST /api/chat/messages
GET  /api/chat/conversations (optional)
```

### Notification Endpoints
```
GET  /api/notifications
PUT  /api/notifications/:id/read
POST /api/notifications (system notifications)
```

## 📋 Request/Response Examples

### POST /api/auth/login
**Request:**
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@company.com",
    "role": "employee"
  }
}
```

### GET /api/tasks
**Query Params:** `?status=pending&tab=today`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Complete Q4 Report",
      "description": "Analyze sales data",
      "status": "pending",
      "priority": "high",
      "due_date": "2024-01-15",
      "assigned_to": {
        "id": 2,
        "name": "John Doe"
      },
      "created_by": {
        "id": 1,
        "name": "Manager Name"
      },
      "created_at": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### POST /api/tasks
**Request:**
```json
{
  "title": "Complete Q4 Report",
  "description": "Analyze sales data",
  "due_date": "2024-01-15",
  "assigned_to": 2,
  "priority": "high"
}
```

### GET /api/team/employees (Manager/Admin only)
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Alice Johnson",
      "email": "alice@company.com",
      "role": "employee",
      "tasks_assigned": 12,
      "tasks_completed": 10,
      "performance_score": "A"
    }
  ]
}
```

## 🔐 Authentication Requirements

### JWT Token
- Include in header: `Authorization: Bearer <token>`
- Token should contain: `userId`, `email`, `role`
- Expire after 24 hours

### Password Security
- Hash passwords using bcrypt or similar
- Minimum 6 characters

### Role-Based Access
- **Admin**: Access to all endpoints
- **Manager**: Access to team endpoints + own tasks
- **Employee**: Access to own tasks and profile only

## 📊 Database Relationships

```
users (1) -> (many) tasks [assigned_to]
users (1) -> (many) tasks [created_by]
users (1) -> (many) messages [sender_id]
users (1) -> (many) messages [recipient_id]
users (1) -> (many) notifications [user_id]
tasks (1) -> (many) task_files [task_id]
```

## 🚀 Implementation Priority

### Phase 1 (MVP)
1. User authentication (login/signup)
2. Basic task CRUD
3. User profile management

### Phase 2
4. Team management (for managers)
5. File uploads
6. Notifications

### Phase 3
7. Real-time chat
8. Advanced analytics
9. Performance tracking

## 🛠 Technology Suggestions

### Node.js/Express
- Fast setup
- Good documentation
- npm packages available

### Python/Django or FastAPI
- Clean syntax
- Built-in admin panel (Django)
- Good for beginners

### PHP/Laravel
- Easy deployment
- Built-in authentication
- Good documentation

### Java/Spring Boot
- Enterprise-ready
- Strong typing
- Good for large teams

### C#/.NET
- Microsoft ecosystem
- Strong typing
- Good tooling

## 📝 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "code": 400
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## 🧪 Testing Checklist

### Authentication
- [ ] User can register
- [ ] User can login
- [ ] JWT token works
- [ ] Protected routes require auth

### Tasks
- [ ] User can create tasks
- [ ] User can view their tasks
- [ ] User can update task status
- [ ] Managers can assign tasks

### File Upload
- [ ] Files can be uploaded
- [ ] Files are stored securely
- [ ] File size limits work

The frontend is ready to consume these APIs - implement them in any language you prefer!