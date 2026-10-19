<div align="center">

# Kajiou AI

### Never lose another lead. Every inquiry answered, scored and followed up automatically.

Autonomous lead capture, AI qualification and follow-up for **WhatsApp Cloud API** and **Gmail**, built for service businesses, agencies, real estate teams and consultancies.

`WhatsApp Cloud API` · `AI Lead Scoring` · `n8n Automation` · `PostgreSQL` · `React Dashboard` · `Docker`

</div>

---

## The Problem

If you sell high-value services, you probably recognize this:

| What happens today | What it costs you |
|---|---|
| Inquiries arrive on WhatsApp, email and forms, all in different places | Leads get missed or found too late |
| Replies depend on who is free | Slow responses, and the buyer goes to a competitor |
| Follow-ups live in someone's memory or notebook | Warm leads quietly go cold |
| Nobody knows which lead is serious and which is not | Your best people waste time on weak leads |
| No single view of the pipeline | You cannot forecast or see where deals are lost |

---

## The Solution

Kajiou sits between your customers and your team. It captures every inquiry, understands it, creates a clean lead record, and makes sure someone follows up at the right time.

```
Customer message (WhatsApp / Gmail)
        │
        ▼
 Secure webhook (HMAC signature verified, duplicates blocked)
        │
        ▼
 AI reads the message: intent, urgency, service interest, score
        │
        ▼
 Lead created or merged into the CRM record (no duplicates)
        │
        ▼
 Follow-up scheduled automatically, stops if the customer opts out
        │
        ▼
 Your team sees everything on the Kajiou Executive Dashboard
```

---

## Architecture

| Layer | Technology | Role |
|---|---|---|
| **Interface** | React 18, Vite, Tailwind CSS, Lucide | Executive dashboard, lead table, pipeline, and omnichannel inbox |
| **API** | Node.js, Express, TypeScript | Webhooks, AI analysis, CRM persistence, follow-ups |
| **Automation** | n8n Orchestrator | Webhook routing, LangChain integration, and cron cadence scheduling |
| **Database** | PostgreSQL + Prisma ORM | Customers, leads, messages, conversations, follow-ups, and audit trails |
| **Deployment** | Docker Compose | One-command orchestration for the complete stack |

---

## Key Capabilities

- **Instant Capture**: Receives WhatsApp messages through the official Meta WhatsApp Business Cloud API with replay protection (24-hour idempotency window).
- **AI Qualification**: Classifies inquiries into `SALES`, `URGENT_DEAL`, `SUPPORT`, or `GENERAL`, assigns priority, generates summaries, and prepares draft replies.
- **Deterministic Rule Fallback**: If OpenAI is unconfigured or rate-limited, built-in rule engines take over so lead intake never stops.
- **Smart Lead Handling**: One customer, one lead record. Repeat inquiries append to existing customer records with complete activity history.
- **Automated Follow-Up Cadence**: Follow-ups are scheduled automatically upon lead intake. A 15-minute cron sentinel dispatches due messages.
- **Compliance Built-In**: Customers can opt out by replying `STOP`, which immediately suppresses all future outbound messages.
- **Full Executive Interface**: Dark-themed dashboard with live telemetry, pipeline Kanban, lead operations, and conversation inbox.

---

## Quick Start (Docker)

**Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# 1. Create your environment settings file
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env

# 2. Build and start all services
docker compose up --build -d
```

| Service | Address |
|---|---|
| **Kajiou Dashboard** | [http://localhost:3000](http://localhost:3000) |
| **API Health Check** | [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health) |
| **n8n Automation Console** | [http://localhost:5678](http://localhost:5678) |
| **PostgreSQL Database** | `localhost:5432` (`kajiou_crm`) |

---

## Connecting the n8n Workflows (One Time)

1. Open [http://localhost:5678](http://localhost:5678) and create your owner account.
2. In the n8n sidebar, navigate to **Workflows → Import from File**.
3. Import the workflow files located in `n8n-workflows/`:
   - `01_whatsapp_incoming_webhook_orchestrator.json`
   - `05_followup_cadence_governor.json`
   - `kajiou_omnichannel_workflow.json`
4. Click **Activate** on each workflow.
5. In your `.env` or n8n environment, ensure `N8N_WEBHOOK_SECRET` matches `kajiou_internal_secret`.

---

## API Reference

### Health & Telemetry
- `GET /health` / `GET /api/v1/health`: Server status and mode.
- `GET /api/v1/leads/stats`: Telemetry metrics, conversion rates, and live activity stream.

### WhatsApp Cloud API Webhook
- `GET /api/v1/whatsapp/webhook`: Meta verification token handshake (`hub.challenge`).
- `POST /api/v1/whatsapp/webhook`: Inbound message receiver with HMAC verification.

### Leads & CRM Persistence
- `POST /api/v1/leads/upsert-auto`: Normalized intake endpoint for n8n and external webhooks.
- `GET /api/v1/leads`: Paginated list of leads with search, status, and channel filters.
- `GET /api/v1/leads/:id`: Detailed lead view with customer details and activity history.
- `PATCH /api/v1/leads/:id`: Update lead status, priority, or notes.

### AI Intelligence & Follow-Ups
- `POST /api/v1/ai/analyze`: Classifies inquiry content with intent, priority, and draft reply.
- `POST /api/v1/followups/trigger-due`: Executes pending cadence follow-ups.
- `GET /api/v1/followups`: Returns scheduled and dispatched follow-up tasks.

---

## Testing in Demo Mode (Without API Keys)

`DEMO_MODE=true` is enabled by default. Messages are simulated, AI operates via the deterministic rule engine, and no external API credentials are required.

### 1. Simulate an Inbound WhatsApp Lead
```bash
curl -X POST http://localhost:4000/api/v1/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"value":{"contacts":[{"profile":{"name":"Tariq Aziz"}}],"messages":[{"from":"923001234567","id":"wamid.test.001","text":{"body":"Need urgent pricing for enterprise AI logistics automation"}}]}}]}]}'
```

### 2. Simulate AI Intent Classification
```bash
curl -X POST http://localhost:4000/api/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -H "X-Kajiou-Secret: kajiou_internal_secret" \
  -d '{"content": "Need an urgent quote for software implementation", "senderName": "Zubair Khan"}'
```

### 3. Trigger Follow-Up Cadence Execution
```bash
curl -X POST http://localhost:4000/api/v1/followups/trigger-due \
  -H "X-Kajiou-Secret: kajiou_internal_secret"
```

Open [http://localhost:3000](http://localhost:3000) to view the updated leads, telemetry stats, and activity stream on the dashboard.

---

## Going Live with Meta WhatsApp Cloud API

1. In **Meta for Developers**, register a WhatsApp Business App.
2. Set Webhook Callback URL: `https://your-domain.com/api/v1/whatsapp/webhook`
3. Set Verify Token to match `WHATSAPP_VERIFY_TOKEN` in `.env` (default: `kajiou_verify_token`).
4. Subscribe to the `messages` field.
5. In `.env`, add `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, and `WHATSAPP_APP_SECRET`.
6. Set `DEMO_MODE=false`, add `AI_API_KEY` (OpenAI), and restart: `docker compose restart kajiou-backend`

---

## Project Structure

```
Hajiou/
├── docker-compose.yml             # Postgres, Backend, Frontend, and n8n stack
├── .env.example                   # Environment variable template
├── README.md                      # Comprehensive system guide
├── backend/
│   ├── Dockerfile                 # Multi-stage production container build
│   ├── package.json               # Backend dependencies
│   ├── prisma/
│   │   └── schema.prisma          # Unified PostgreSQL Prisma schema
│   └── src/
│       ├── index.ts               # Express API routes, health, and CRM endpoints
│       ├── config/index.ts        # Configuration manager
│       └── modules/
│           ├── ai/ai.service.ts               # OpenAI + rule fallback engine
│           ├── followups/followups.scheduler.ts # Follow-up cadence executor
│           └── whatsapp/
│               ├── whatsapp.controller.ts    # Webhook receiver & CRM persistence
│               └── whatsapp.security.ts      # HMAC verification & idempotency
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Tab navigation router
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Live telemetry & activity stream
│   │   │   ├── LeadsPage.tsx      # Leads table, search, filters & drawer
│   │   │   ├── PipelinePage.tsx   # Kanban revenue pipeline
│   │   │   └── InboxPage.tsx      # Omnichannel conversation threads
│   │   └── components/Sidebar.tsx # Navigation sidebar
│   └── package.json
└── n8n-workflows/
    ├── 01_whatsapp_incoming_webhook_orchestrator.json # WhatsApp webhook orchestrator
    ├── 05_followup_cadence_governor.json              # 15-minute cron sentinel
    └── kajiou_omnichannel_workflow.json               # WhatsApp + Gmail LangChain engine
```

---

<div align="center">Kajiou AI · Built so no inquiry goes unanswered</div>