## Core Features (MVP Scope)

This section outlines the core features implemented as part of the AI-Powered RFP Management System.
The focus is on a clean, end-to-end single-user workflow, as per the assignment requirements.

---

### 1. RFP Creation (Natural Language → Structured)

**Goal:** Convert free-form procurement requirements into a reusable structured RFP.

**Features**

- Input procurement needs in natural language
- LLM converts text into a structured RFP schema
- Extracted fields include:
  - Items (name, quantity, specifications)
  - Budget
  - Delivery timeline
  - Payment terms
  - Warranty / special conditions
- Structured RFP is persisted in the database

**MVP Completion Criteria**

- User enters text → system displays a structured RFP and saves it

---

### 2. Vendor Management

**Goal:** Maintain a simple list of vendors to send RFPs to.

**Features**

- Create and view vendors
  - Vendor name
  - Contact email
  - Optional notes
- Select one or more vendors for a given RFP

**Out of Scope**

- Vendor onboarding workflows
- Role-based access
- Advanced vendor metadata

**MVP Completion Criteria**

- User can select vendors and associate them with an RFP

---

### 3. Send RFP via Email

**Goal:** Distribute RFPs to selected vendors through real email.

**Features**

- Generate an RFP email from the structured RFP data
- Send RFPs via an email service (SMTP / API-based)
- Email includes:
  - RFP summary
  - Line items and requirements
  - Request for proposal submission

**MVP Completion Criteria**

- Selected vendors receive a readable RFP email

---

### 4. Receive Vendor Responses

**Goal:** Capture vendor replies without manual data entry.

**Features**

- Support inbound vendor responses via:
  - Email inbox listener (IMAP / webhook)
  - or controlled/manual ingestion for demo purposes
- Store:
  - Raw email content
  - Metadata (sender, timestamp)
  - Attachments (optional)

**MVP Completion Criteria**

- At least one vendor response is ingested and visible in the system

---

### 5. AI Parsing of Vendor Responses

**Goal:** Automatically extract structured data from unstructured vendor replies.

**Features**

- LLM parses email body (and attachment text if available)
- Extracted proposal data includes:
  - Line-item pricing
  - Total cost
  - Delivery terms
  - Payment terms
  - Warranty details
- Flag missing or unclear fields
- Preserve raw text for traceability

**MVP Completion Criteria**

- Vendor response → structured proposal auto-generated

---

### 6. Proposal Comparison View

**Goal:** Enable easy comparison across multiple vendor proposals.

**Features**

- Side-by-side comparison of vendors
- Comparison fields include:
  - Total price
  - Delivery timeline
  - Payment terms
  - Warranty
  - Completeness of response
- Highlight best values per dimension

**MVP Completion Criteria**

- User can visually compare proposals for an RFP

---

### 7. AI-Assisted Recommendation

**Goal:** Help the user decide which vendor to choose and understand why.

**Features**

- AI-generated summaries per vendor
- Final recommended vendor with reasoning
- Combination of:
  - Rule-based scoring (price, delivery, completeness)
  - AI-driven narrative explanation

**MVP Completion Criteria**

- System provides a clear vendor recommendation with explanation

---

## Core Entity Model

| Feature Area         | Entity                        |
| -------------------- | ----------------------------- |
| RFP creation         | RFP                           |
| Vendor management    | Vendor                        |
| RFP distribution     | RFPVendor                     |
| Vendor responses     | RawEmail                      |
| Parsed proposals     | Proposal                      |
| Comparison & scoring | Derived view                  |
| Recommendation       | AI output (non-authoritative) |

---

## Explicitly Out of Scope

The following features are intentionally not implemented:

- Authentication and authorization
- Multi-user or multi-tenant support
- Approval workflows and versioning
- Real-time collaboration
- Email tracking (opens, clicks)
- Advanced analytics dashboards
