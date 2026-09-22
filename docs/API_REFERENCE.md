# Murafiq Enterprise REST API Reference (v1)

> **Base URL:** `https://your-domain.com/api/v1`  
> **Authentication:** Bearer Token (`Authorization: Bearer <TENANT_API_KEY>`) or Session JWT  
> **Format:** `application/json`  
> **Status Codes:** Standard HTTP semantics (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Rate Limited)

---

## 1. Authentication & Security

All requests to `/api/v1/*` must include an API key in the `Authorization` header:

```http
Authorization: Bearer mrf_sec_live_9a8b7c6d5e4f...
X-Tenant-ID: tenant_school_alex_01
```

If `X-Tenant-ID` is omitted, the tenant is resolved directly from the authenticated API key or session token.

---

## 2. Cases Endpoints

### 2.1 List Cases
Retrieve a paginated list of cases belonging to the tenant.

```http
GET /api/v1/cases?status=IN_PROGRESS&priority=HIGH&departmentId=dept_transport&page=1&limit=20
```

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "c7a8b9d0-1234-4567-89ab-cdef01234567",
      "referenceNumber": "MRF-EDU-892143",
      "title": "School bus delayed repeatedly on Route 14",
      "priority": "HIGH",
      "lifecycleStatus": "IN_PROGRESS",
      "departmentId": "dept_transport",
      "departmentName": "النقل والمواصلات",
      "assignedStaffId": "usr_9912",
      "slaTargetAt": "2026-09-24T12:00:00Z",
      "slaBreached": false,
      "createdAt": "2026-09-22T08:30:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### 2.2 Submit a New Case
Programmatically create a case on behalf of a beneficiary or from an external portal (CRM/SIS).

```http
POST /api/v1/cases
Content-Type: application/json

{
  "title": "Tuition refund dispute for cancelled semester course",
  "description": "Student dropped course within the statutory 14-day window but finance department deducted 100%.",
  "category": "FINANCIAL",
  "subcategory": "REFUND",
  "priority": "MEDIUM",
  "departmentId": "dept_finance",
  "beneficiary": {
    "name": "Ahmed Mansour",
    "phone": "+201012345678",
    "email": "ahmed.m@example.com"
  },
  "metadata": {
    "studentId": "STU-2024-991"
  }
}
```

#### Response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "e4f5a6b7-8901-2345-6789-0123456789ab",
    "referenceNumber": "MRF-UNI-449102",
    "trackingUrl": "https://your-domain.com/track?ref=MRF-UNI-449102",
    "lifecycleStatus": "SUBMITTED",
    "slaDeadline": "2026-09-25T14:00:00Z"
  }
}
```

---

### 2.3 Get Case Details
Retrieve full case status, approved action plan, milestones, and audit history.

```http
GET /api/v1/cases/:id
```

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "e4f5a6b7-8901-2345-6789-0123456789ab",
    "referenceNumber": "MRF-UNI-449102",
    "title": "Tuition refund dispute",
    "lifecycleStatus": "IN_PROGRESS",
    "priority": "MEDIUM",
    "department": {
      "id": "dept_finance",
      "name": "الشؤون المالية"
    },
    "actionPlan": {
      "id": "plan_991",
      "rqsScore": 92,
      "milestones": [
        {
          "index": 1,
          "title": "Audit registrar drop timestamp against refund matrix",
          "targetDate": "2026-09-23T16:00:00Z",
          "completed": true
        },
        {
          "index": 2,
          "title": "Issue adjusted bank credit voucher to student account",
          "targetDate": "2026-09-24T12:00:00Z",
          "completed": false
        }
      ]
    },
    "auditEvents": [
      {
        "timestamp": "2026-09-22T09:00:00Z",
        "actor": "Staff: Mona Youssef",
        "action": "ACTION_PLAN_COMMITTED"
      }
    ]
  }
}
```

---

### 2.4 Add Protected Internal Note
Add a staff-only internal discussion note to a case.

```http
POST /api/v1/cases/:id/notes
Content-Type: application/json

{
  "content": "Finance confirmed the registrar error occurred due to portal cache. Processing waiver.",
  "category": "CORRECTIVE_ACTION"
}
```

---

## 3. Departments Endpoints

### 3.1 List Departments
```http
GET /api/v1/departments
```

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "dept_students",
      "name": "شؤون الطلاب",
      "headOfDepartment": "د. هاني فهمي",
      "activeCasesCount": 14,
      "slaTargetHours": 48
    }
  ]
}
```

---

## 4. Executive Analytics Endpoints

### 4.1 Get Tenant SLA & Resolution Metrics
```http
GET /api/v1/analytics
```

#### Response:
```json
{
  "success": true,
  "data": {
    "totalCases": 128,
    "activeCases": 32,
    "resolvedCases": 96,
    "slaComplianceRate": 94.2,
    "averageResolutionHours": 38.5,
    "averageRqsScore": 91.4,
    "departmentBreakdown": [
      {
        "departmentId": "dept_transport",
        "name": "النقل والمواصلات",
        "compliance": 96.0,
        "volume": 25
      }
    ]
  }
}
```

---

## 5. Webhooks & Event Subscriptions

Enterprise customers can register HTTP endpoints to receive real-time JSON webhooks when:
- `case.created`: New case filed
- `case.assigned`: Department or staff member assigned
- `case.action_plan_approved`: Corrective plan committed
- `case.milestone_completed`: Progress reported
- `case.resolved`: Case ready for evaluation
- `case.evaluated`: Final beneficiary score received
- `sla.warning`: Case reached 75% of allowed time
- `sla.breached`: Case breached SLA target
