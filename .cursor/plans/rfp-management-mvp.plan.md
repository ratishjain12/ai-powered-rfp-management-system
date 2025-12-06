<!-- 38e528c3-9946-4004-baf8-333cb4e416b9 3e44f131-5515-4b80-93c3-33b7ff0f19a0 -->
# AI-Powered RFP Management System - MVP Plan

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite with Prisma ORM
- **LLM**: Groq API for natural language processing
- **Email**: Resend for sending RFPs and receiving webhooks
- **UI**: shadcn/ui components with Tailwind CSS

## Database Schema (Prisma)

### Core Entities

1. **RFP** - Main RFP document

   - id, title, description, budget, deliveryTimeline, paymentTerms, warranty, status, createdAt, updatedAt
   - items (JSON array: name, quantity, specifications)

2. **Vendor** - Vendor information

   - id, name, email, notes, createdAt, updatedAt

3. **RFPVendor** - Junction table (many-to-many)

   - id, rfpId, vendorId, sentAt, status (pending/sent/responded)

4. **RawEmail** - Incoming vendor responses

   - id, rfpId, vendorId, subject, fromEmail, body, attachments (JSON), receivedAt

5. **Proposal** - Parsed vendor proposal

   - id, rawEmailId, rfpId, vendorId, totalCost, deliveryTerms, paymentTerms, warranty, lineItems (JSON), completenessScore, createdAt

## Implementation Structure

### 1. Database Setup

- **File**: `prisma/schema.prisma`
  - Define all entities with relationships
  - Configure SQLite provider
- **File**: `lib/prisma.ts`
  - Prisma client singleton for Next.js

### 2. Core Features Implementation

#### Feature 1: RFP Creation (Natural Language → Structured)

- **API Route**: `app/api/rfps/create/route.ts`
  - Accept natural language text
  - Call Groq API to extract structured data
  - Save to database
- **UI Component**: `app/rfps/new/page.tsx`
  - Form with textarea for natural language input
  - Display structured RFP preview before saving
  - Use shadcn Form, Textarea, Button components

#### Feature 2: Vendor Management

- **API Routes**:
  - `app/api/vendors/route.ts` (GET, POST)
  - `app/api/vendors/[id]/route.ts` (GET, PUT, DELETE)
- **UI Pages**:
  - `app/vendors/page.tsx` - List all vendors
  - `app/vendors/new/page.tsx` - Create vendor form
  - Use shadcn Table, Dialog, Form components

#### Feature 3: Send RFP via Email

- **API Route**: `app/api/rfps/[id]/send/route.ts`
  - Accept vendor IDs array
  - Generate email template from RFP data
  - Send via Resend API
  - Create RFPVendor records
- **UI**: Add "Send RFP" button in RFP detail view
  - Vendor selection dialog
  - Email preview

#### Feature 4: Receive Vendor Responses (Webhook)

- **API Route**: `app/api/webhooks/resend/route.ts`
  - Resend webhook endpoint
  - Parse incoming email
  - Create RawEmail record
  - Link to RFP and Vendor by email matching
- **Configuration**: Set up Resend webhook in Resend dashboard

#### Feature 5: AI Parsing of Vendor Responses

- **API Route**: `app/api/proposals/parse/route.ts`
  - Triggered after RawEmail creation
  - Call Groq API with email content
  - Extract structured proposal data
  - Create Proposal record
- **Background**: Can be triggered manually or via webhook

#### Feature 6: Proposal Comparison View

- **API Route**: `app/api/rfps/[id]/proposals/route.ts`
  - Get all proposals for an RFP
- **UI Page**: `app/rfps/[id]/compare/page.tsx`
  - Side-by-side comparison table
  - Highlight best values (lowest price, fastest delivery, etc.)
  - Use shadcn Table, Card components

#### Feature 7: AI-Assisted Recommendation

- **API Route**: `app/api/rfps/[id]/recommend/route.ts`
  - Call Groq API with all proposals
  - Generate recommendation with reasoning
  - Return structured response
- **UI**: Display recommendation card in comparison view
  - Show recommended vendor
  - Display AI reasoning

### 3. Supporting Infrastructure

#### Groq Integration

- **File**: `lib/groq.ts`
  - Groq client setup
  - Helper functions for RFP extraction and proposal parsing
  - Prompt templates

#### Resend Integration

- **File**: `lib/resend.ts`
  - Resend client setup
  - Email template generation
  - Webhook signature verification

#### Utility Functions

- **File**: `lib/ai-prompts.ts`
  - Prompt templates for RFP extraction
  - Prompt templates for proposal parsing
  - Prompt templates for recommendations

### 4. UI Components (shadcn/ui)

Required components to add:

- Form, Input, Textarea, Button, Card, Table, Dialog, Badge, Alert
- Custom components:
  - `components/rfp-form.tsx` - RFP creation form
  - `components/vendor-selector.tsx` - Multi-select vendor picker
  - `components/proposal-comparison.tsx` - Comparison table
  - `components/ai-recommendation.tsx` - Recommendation display

### 5. Navigation & Layout

- **File**: `app/layout.tsx`
  - Update with navigation sidebar/menu
  - Add metadata for app
- **File**: `components/nav.tsx`
  - Main navigation component
- **File**: `app/page.tsx`
  - Dashboard/home page showing recent RFPs

### 6. Environment Variables

- `.env.local`:
  - `GROQ_API_KEY`
  - `RESEND_API_KEY`
  - `RESEND_WEBHOOK_SECRET`
  - `DATABASE_URL` (for Prisma)

## File Structure

```
app/
  api/
    rfps/
      create/route.ts
      [id]/
        route.ts (GET, PUT, DELETE)
        send/route.ts
        proposals/route.ts
        recommend/route.ts
    vendors/
      route.ts
      [id]/route.ts
    proposals/
      parse/route.ts
    webhooks/
      resend/route.ts
  rfps/
    new/page.tsx
    [id]/
      page.tsx (detail view)
      compare/page.tsx
  vendors/
    page.tsx
    new/page.tsx
  page.tsx (dashboard)
lib/
  prisma.ts
  groq.ts
  resend.ts
  ai-prompts.ts
  utils.ts (existing)
prisma/
  schema.prisma
  migrations/
components/
  ui/ (shadcn components)
  nav.tsx
  rfp-form.tsx
  vendor-selector.tsx
  proposal-comparison.tsx
  ai-recommendation.tsx
```

## Dependencies to Add

- `@prisma/client`
- `prisma` (dev)
- `groq-sdk`
- `resend`
- `zod` (for validation)
- `react-hook-form` (for forms)
- Additional shadcn components as needed

## Implementation Order

1. Database schema and Prisma setup
2. Core API routes (RFP CRUD, Vendor CRUD)
3. Groq integration and RFP creation flow
4. Vendor management UI
5. Email sending with Resend
6. Webhook setup for receiving emails
7. AI parsing of responses
8. Comparison view UI
9. AI recommendation feature
10. Polish and error handling

### To-dos

- [ ] Set up Prisma with SQLite, create schema.prisma with all entities (RFP, Vendor, RFPVendor, RawEmail, Proposal), run migrations
- [ ] Create lib files: prisma.ts (client), groq.ts (client), resend.ts (client), ai-prompts.ts (prompt templates)
- [ ] Implement RFP API routes: create (with Groq parsing), get, update, delete, and send email endpoints
- [ ] Implement Vendor API routes: CRUD operations for vendor management
- [ ] Build RFP creation UI (app/rfps/new/page.tsx) with natural language input form and structured preview
- [ ] Build vendor management UI (list and create pages) with shadcn components
- [ ] Implement email sending functionality using Resend, create email templates, integrate with RFP send endpoint
- [ ] Create Resend webhook endpoint to receive vendor responses, parse and store as RawEmail records
- [ ] Implement AI parsing of vendor responses using Groq, create Proposal records from RawEmail data
- [ ] Build proposal comparison UI (app/rfps/[id]/compare/page.tsx) with side-by-side table and highlighting
- [ ] Implement AI recommendation feature using Groq to analyze proposals and generate vendor recommendation with reasoning
- [ ] Create main navigation component and dashboard home page showing recent RFPs and status overview