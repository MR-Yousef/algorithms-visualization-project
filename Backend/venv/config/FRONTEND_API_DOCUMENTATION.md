# 🚀 Algorithm Visualization Platform API Guide

---

# 🌐 Base URL

http://localhost:8000/api/v1/

---

# 🧠 Overview

هذا النظام مبني باستخدام Django REST Framework ويعتمد على:

- JWT Authentication
- Role-Based Access Control
- Request/Approval Workflow
- Pagination + Filtering + Search
- DRF Spectacular (Swagger)

---

# 🔐 Authentication System

## 📌 Authentication Type
JWT (Access + Refresh Tokens)

### 📌 Required Header (for protected routes)



---

## 📝 Register

### Endpoint

Authorization: Bearer <access_token>


---

## 📝 Register

### Endpoint

POST /accounts/register/


### Request Body

```json
{
  "username": "ahmad",
  "email": "ahmad@test.com",
  "password": "123456"
}

Response

{
  "status": "success",
  "message": "Account created successfully"
}

Login
Endpoint
POST /accounts/login/

Request
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "access": "JWT_ACCESS_TOKEN",
    "refresh": "JWT_REFRESH_TOKEN",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "USER"
    }
  }
}

Refresh Token
POST /accounts/refresh/

Get Current User
GET /accounts/me/

Logout
POST /accounts/logout/

Users System (Admin Only)

Get Users
GET /accounts/users/

Query Params
?page=1
?search=name
?role=USER

Promote User
POST /accounts/users/{id}/promote/

Demote User
POST /accounts/users/{id}/demote/

Delete User
DELETE /accounts/users/{id}/delete/

Algorithms System

Get Algorithms
GET /algorithms/

Query Params
?search=binary
?page=1

Get Algorithm Details
GET /algorithms/{id}/

Create Algorithm Request
POST /algorithms/requests/create/

Request Body
{
  "request_type": "CREATE",
  "title": "Binary Search",
  "description": "Search algorithm",
  "code": "print('hello')",
  "topic": 1
}

Requests System (Core Business Logic)

My Requests
GET /algorithms/requests/my/

Admin Requests
GET /algorithms/requests/admin/

Approve Request
POST /algorithms/requests/{id}/approve/

Reject Request
POST /algorithms/requests/{id}/reject/

Request Lifecycle
PENDING → APPROVED → REJECTED

Documentation System

Get Documentation
GET /algorithms/documentation/

Update Documentation (Admin/Super Admin)
PATCH /algorithms/documentation/{id}/

Pagination Format
{
  "status": "success",
  "data": [],
  "pagination": {
    "count": 100,
    "next": null,
    "previous": null,
    "page_size": 10
  }
}

Filtering & Search

Supported globally:
?search=
?page=
?role=
?status=
?topic=

Roles & Permissions
Role	        Permissions
USER	        Read + create requests
CONTRIBUTOR 	Submit requests
ADMIN	        Approve/Reject + manage users
SUPER_ADMIN	    Full access

Business Logic Flows

Algorithm Flow
User creates request
→ PENDING
→ Admin approves
→ Algorithm becomes public

Promotion Flow
User sends promotion request
→ Admin reviews
→ Approved → role updated

Error Format
{
  "status": "error",
  "message": "Error description",
  "errors": {}
}

HTTP Status Codes
Code	Meaning
200	    Success
201	    Created
400	    Bad Request
401	    Unauthorized
403	    Forbidden
404	    Not Found
500	    Server Error

Frontend Rules
Always use /api/v1/
Always attach JWT token
Always check status
Always use data wrapper
Always handle pagination object

Notes for Frontend Team
Swagger is for reference only
This document is the official contract
Backend responses will NOT change shape
Any update will be versioned (/v2 in future)




-----------------------------------------------------


# Algorithm Visualization Platform
## Frontend API Guide
Version: v1

---

# Base URL

http://localhost:8000/api/v1/

---

# Authentication

Authentication Type:

Bearer JWT

Protected endpoints require:

Authorization: Bearer <access_token>

---

# User Roles

## USER

Can:

- View public content
- Create promotion requests
- Create algorithm requests

Cannot:

- Manage users
- Approve requests

---

## CONTRIBUTOR

Can:

- Everything USER can do

Additional permissions depend on future business rules.

---

## ADMIN

Can:

- Review promotion requests
- Approve promotion requests
- Reject promotion requests
- Manage users

---

## SUPER_ADMIN

Can:

- Full system access

---

# Authentication APIs

---

## Register

POST /accounts/register/

### Request

```json
{
  "username": "ahmad",
  "email": "ahmad@example.com",
  "password": "123456"
}
```

### Success Response

```json
{
  "status": "success",
  "message": "Account created successfully"
}
```

---

## Login

POST /accounts/login/

### Request

```json
{
  "email": "ahmad@example.com",
  "password": "123456"
}
```

### Success Response

```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

---

## Refresh Token

POST /accounts/refresh/

### Request

```json
{
  "refresh": "refresh_token"
}
```

### Response

```json
{
  "access": "new_access_token"
}
```

---

## Current User

GET /accounts/me/

Authentication Required

### Response

```json
{
  "id": 1,
  "username": "ahmad",
  "email": "ahmad@example.com",
  "role": "USER",
  "bio": "",
  "avatar": null,
  "created_at": "2026-06-09T12:00:00Z"
}
```

---

## Logout

POST /accounts/logout/

Authentication Required

### Request

```json
{
  "refresh": "refresh_token"
}
```

### Response

```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

# Promotion Request APIs

---

## Create Promotion Request

POST /accounts/promotion/create/

Authentication Required

### Request

```json
{
  "requested_role": "CONTRIBUTOR",
  "reason": "I want to contribute algorithms."
}
```

### Response

```json
{
  "status": "success"
}
```

---

## My Promotion Requests

GET /accounts/promotion/my/

Authentication Required

### Response

```json
[
  {
    "id": 1,
    "requested_role": "CONTRIBUTOR",
    "status": "PENDING"
  }
]
```

---

## Admin - List Promotion Requests

GET /accounts/promotion/admin/

Authentication Required

Role:

ADMIN or SUPER_ADMIN

---

## Approve Promotion Request

POST /accounts/promotion/admin/{id}/approve/

Authentication Required

Role:

ADMIN or SUPER_ADMIN

---

## Reject Promotion Request

POST /accounts/promotion/admin/{id}/reject/

Authentication Required

Role:

ADMIN or SUPER_ADMIN

### Request

```json
{
  "rejection_reason": "Insufficient information"
}
```

---

# User Management APIs

---

## Get Users

GET /accounts/users/

Authentication Required

Role:

ADMIN or SUPER_ADMIN

### Query Parameters

```text
?page=1
?search=ahmad
?role=USER
```

---

## Promote User

POST /accounts/users/{id}/promote/

Authentication Required

Role:

ADMIN or SUPER_ADMIN

---

## Demote User

POST /accounts/users/{id}/demote/

Authentication Required

Role:

ADMIN or SUPER_ADMIN

---

## Delete User

DELETE /accounts/users/{id}/delete/

Authentication Required

Role:

ADMIN or SUPER_ADMIN

---

## Promote User To Admin

POST /accounts/admin/{id}/promote/

Authentication Required

Role:

SUPER_ADMIN

---

## Demote Admin

POST /accounts/admin/{id}/demote/

Authentication Required

Role:

SUPER_ADMIN

---

# Common Error Format

```json
{
  "status": "error",
  "message": "Error message"
}
```

---

# Common Status Codes

200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

500 Internal Server Error

---

# Pagination

If endpoint supports pagination:

```json
{
  "count": 100,
  "next": "...",
  "previous": "...",
  "results": []
}
```

or according to custom backend pagination response.

---

# Notes For Frontend Team

1. Use JWT Authentication.
2. Store access token securely.
3. Use refresh token when access token expires.
4. Handle 401 responses by refreshing token.
5. Respect role-based permissions.
6. Do not assume hidden permissions on frontend; backend remains source of truth.

---

# APIs Requiring Verification

Before production handoff verify existence of:

- Algorithms APIs
- Documentation APIs
- Saved Algorithms APIs
- Interaction APIs
- Algorithm Request APIs

against:

algorithms/api/urls.py

and

algorithms/api/views.py

to ensure documentation exactly matches implementation.


-----------------------------------------------------


# Algorithm Visualization Platform

## Frontend API Guide

Version: v1.0

---

# Base URL

http://localhost:8000/api/v1/

---

# Authentication

Authentication Type:

Bearer JWT

For protected endpoints:

Authorization: Bearer <access_token>

---

# User Roles

## USER

Permissions:

* View algorithms
* View documentation
* Save algorithms
* Create promotion requests

---

## CONTRIBUTOR

Permissions:

* Everything USER can do
* Create algorithm requests
* View own requests

---

## ADMIN

Permissions:

* Review algorithm requests
* Approve requests
* Reject requests
* Manage users
* Manage topics
* Manage documentation

---

## SUPER_ADMIN

Permissions:

* Full access
* Promote admins
* Demote admins

---

# Authentication APIs

## Register

POST /accounts/register/

Request:

```json
{
  "username": "ahmad",
  "email": "ahmad@example.com",
  "password": "123456"
}
```

---

## Login

POST /accounts/login/

Request:

```json
{
  "email": "ahmad@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

---

## Refresh Token

POST /accounts/refresh/

Request:

```json
{
  "refresh": "refresh_token"
}
```

---

## Current User

GET /accounts/me/

Authentication Required

---

## Logout

POST /accounts/logout/

Authentication Required

Request:

```json
{
  "refresh": "refresh_token"
}
```

---

# Promotion Request APIs

## Create Promotion Request

POST /accounts/promotion/create/

Authentication Required

---

## My Promotion Requests

GET /accounts/promotion/my/

Authentication Required

---

## Admin Promotion Requests

GET /accounts/promotion/admin/

Role:

ADMIN or SUPER_ADMIN

---

## Approve Promotion Request

POST /accounts/promotion/admin/{id}/approve/

Role:

ADMIN or SUPER_ADMIN

---

## Reject Promotion Request

POST /accounts/promotion/admin/{id}/reject/

Role:

ADMIN or SUPER_ADMIN

Request:

```json
{
  "reason": "Insufficient information"
}
```

---

# User Management APIs

## Get Users

GET /accounts/users/

Role:

ADMIN or SUPER_ADMIN

Query Parameters:

?page=1

?search=username

?role=USER

?role=CONTRIBUTOR

?role=ADMIN

---

## Promote User

POST /accounts/users/{id}/promote/

---

## Demote User

POST /accounts/users/{id}/demote/

---

## Delete User

DELETE /accounts/users/{id}/delete/

---

## Promote User To Admin

POST /accounts/admin/{id}/promote/

Role:

SUPER_ADMIN

---

## Demote Admin

POST /accounts/admin/{id}/demote/

Role:

SUPER_ADMIN

---

# Algorithms APIs

## List Algorithms

GET /algorithms/

Authentication Required

Query Parameters:

?search=binary

Response:

List of algorithms

---

## Algorithm Details

GET /algorithms/{id}/

Behavior:

* Increments view_count automatically

---

# Algorithm Requests

## Create Request

POST /algorithms/requests/create/

Role:

CONTRIBUTOR

Request Types:

CREATE

UPDATE

DELETE

---

## My Requests

GET /algorithms/requests/my/

Role:

CONTRIBUTOR

---

## Request Details

GET /algorithms/requests/{id}/

Role:

CONTRIBUTOR

---

## All Requests

GET /algorithms/requests/

Role:

ADMIN

Filter:

?status=PENDING

?status=APPROVED

?status=REJECTED

---

## Pending Requests

GET /algorithms/admin/pending-requests/

Role:

ADMIN

---

## Approve Request

POST /algorithms/admin/requests/{id}/approve/

Role:

ADMIN

Behavior:

CREATE:
Creates Algorithm

UPDATE:
Updates Existing Algorithm

DELETE:
Archives Algorithm

---

## Reject Request

POST /algorithms/admin/requests/{id}/reject/

Role:

ADMIN

Request:

```json
{
  "reason": "Not enough details"
}
```

---

# Saved Algorithms APIs

## Save Algorithm

POST /algorithms/{algorithm_id}/save/

Authentication Required

---

## Unsave Algorithm

DELETE /algorithms/{algorithm_id}/unsave/

Authentication Required

---

## My Saved Algorithms

GET /algorithms/saved/

Authentication Required

---

# Topics APIs

## List Topics

GET /algorithms/topics/

Public Read

---

## Create Topic

POST /algorithms/topics/create/

Role:

ADMIN

---

## Update Topic

PUT /algorithms/topics/{id}/update/

Role:

ADMIN

---

## Delete Topic

DELETE /algorithms/topics/{id}/delete/

Role:

ADMIN

---

# Documentation APIs

## List Documentation Sections

GET /algorithms/documentation/

Authentication Required

---

## Documentation Details

GET /algorithms/documentation/{id}/

Authentication Required

Behavior:

* Increments view_count automatically

---

## Create Documentation Section

POST /algorithms/documentation/create/

Role:

ADMIN

---

## Update Documentation Section

PUT /algorithms/documentation/{id}/update/

Role:

ADMIN

---

## Delete Documentation Section

DELETE /algorithms/documentation/{id}/delete/

Role:

ADMIN

---

# Standard Error Format

```json
{
  "status": "error",
  "message": "Error message"
}
```

---

# HTTP Status Codes

200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

500 Internal Server Error

---

# Frontend Notes

1. Use JWT Authentication.
2. Store access token securely.
3. Refresh token when access token expires.
4. Handle 401 responses globally.
5. Use role-based UI rendering.
6. Backend permissions are the source of truth.
7. Use Swagger for live testing:
   /api/docs/

---

# Project Workflow

User
→ Register
→ Login
→ Browse Algorithms

Contributor
→ Create Algorithm Request

Admin
→ Review Request
→ Approve / Reject

Approved
→ Algorithm Published

Users
→ Save Algorithms
→ Read Documentation

Admins
→ Manage Topics
→ Manage Documentation
→ Manage Users

Super Admin
→ Full Control

---

END OF DOCUMENT
