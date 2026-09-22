# Murafiq — Enterprise Roadmap & Deployment Milestones

> **Version:** 3.0  
> **Product Direction:** Enterprise Case & Resolution Management Platform  
> **Target Market:** Multi-Sector Organizations across Egypt (Education, Higher Ed, Government, Healthcare, Commercial)

---

## 1. Release Evolution

### Milestone 1: Core Lifecycle & Scaffolding (V1.0)
- Baseline Next.js 15 App Router architecture.
- Initial case intake, private grace period, and basic status transitions.
- Preliminary AI extraction and Puppeteer PDF generation.

### Milestone 2: Hardening & Compliance Scaffolding (V2.0)
- Decoupled 4-vector state engine (`lifecycle`, `moderation`, `dispute`, `safety`).
- Physical PII isolation in `case_sensitive_data` complying with Egyptian Law 151/2020.
- Append-only immutable `case_events` log with PostgreSQL triggers.
- Meta Cloud API (WhatsApp) transactional delivery.

### Milestone 3: 5-Sector Expansion & Statutory RAG (V2.3)
- Generic entity architecture supporting Schools, Higher Education, Government, Commercial, and Healthcare.
- Curated Egyptian statutory RAG indexing ministerial decrees and consumer protection laws.
- Dual AI architecture: Concierge Chatbot + Solution Advisor with sector scoping.

### Milestone 4: Full Enterprise Transformation (V3.0 — Current)
- **Multi-Tenant Foundation:** Database isolation, tenant partitioning, and dynamic tenant configuration.
- **Organization Admin Portal:** Control center for branding, custom departments, SLA policies, and staff RBAC (`ADMIN`, `OPS_LEAD`, `STAFF`, `OBSERVER`).
- **Enhanced Operations Workspace:** Full case detail page (`/portal/cases/[id]`), interactive action plan builder, protected internal notes, and chronological audit timelines.
- **Standalone Ticket Tracking:** Direct lookup via reference number (`/track`) with 5-stage progress indicator and in-app inquiry channels.
- **Egyptian Business Hours SLA Engine:** Automatic working hour calculations (Sun–Thu, 08:00–16:00, excluding weekends) and breach alerts.
- **Enterprise REST API v1:** Comprehensive endpoints for external ERP, SIS, HIS, and CRM integration (`/api/v1/*`).

---

## 2. Near-Term Roadmap (V3.1 – V3.3)

### Milestone 5: Institutional SSO & Identity Federation (V3.1)
- SAML 2.0 and OIDC identity provider integration for institutional active directories (Microsoft Azure AD / Entra ID, Google Workspace for Education).
- Automated role syncing from institutional directory groups.

### Milestone 6: Multi-Channel Automated Notifications (V3.2)
- Multi-provider notification dispatch (WhatsApp, SMS via local telcos, transactional email via Resend/SMTP).
- Configurable event notification templates per tenant.

### Milestone 7: Advanced Predictive Resolution Intelligence (V3.3)
- Real-time SLA breach risk prediction based on case complexity and department queue backlog.
- Semantic clustering of recurring complaints to provide automated root-cause suggestions for executive leadership.
