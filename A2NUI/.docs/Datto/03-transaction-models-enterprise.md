# Enterprise Transaction Models for SaaS / Agent-as-a-Service

> How DittoDatto should think about its transaction architecture — from first principles, through industry standards, to a concrete recommendation.

---

## 1. What Kind of Business Is DittoDatto?

From [product.md](file:///media/addinator/Mercury/Libraries/Nuxt/A2NUI/product.md) and [product-guidelines.md](file:///media/addinator/Mercury/Libraries/Nuxt/A2NUI/product-guidelines.md):

- **For users (Ditto side):** Free. Public access. Conversational search and booking. No subscription, no per-query fee. Revenue comes from the supply side.
- **For businesses (Datto side):** Paid. A business signs up, creates stores, lists services, and gets an AI agent (Datto) that handles availability, booking, and eventually marketing.
- **Transaction type:** Service bookings. A user books a time slot at a business. Payment goes to the business (via Vipps MobilePay). DittoDatto takes a cut.

This creates a **two-sided marketplace with an agent layer**. The closest analogues:

| Company                 | Model                                      | What They Charge                           |
| ----------------------- | ------------------------------------------ | ------------------------------------------ |
| **Booking.com**         | Commission per booking                     | 15-25% of booking value                    |
| **Square Appointments** | SaaS subscription + payment processing fee | Monthly fee + 2.6% + $0.10 per transaction |
| **Calendly (Teams)**    | SaaS subscription                          | Per-seat monthly                           |
| **Fresha**              | Free SaaS + payment processing margin      | 2.19% + $0.20 per card payment             |
| **Treatwell**           | Marketplace commission                     | 25-35% per marketplace booking             |
| **Vipps MobilePay**     | Transaction fee                            | 1.75% per payment (Norway standard)        |

---

## 2. The Three Models (Decomposed)

### Model A: Pure SaaS Subscription

The business pays a fixed monthly fee for access to the portal + Datto agent.

```
Business → NOK 499/mo → DittoDatto
User → Books → Business → Pays via Vipps → Business keeps 100%
```

| Pro                         | Con                                           |
| --------------------------- | --------------------------------------------- |
| Predictable revenue         | Revenue doesn't scale with transaction volume |
| Simple billing              | High churn risk for low-volume businesses     |
| No per-transaction friction | Price-sensitive Norwegian SMBs may resist     |

**Who uses this:** Calendly, most traditional SaaS.

### Model B: Commission (Marketplace Tax)

DittoDatto takes a percentage of each booking made through the platform.

```
User → Books → Pays NOK 450 via Vipps → DittoDatto keeps 10% (NOK 45) → Business gets NOK 405
```

| Pro                                                          | Con                                          |
| ------------------------------------------------------------ | -------------------------------------------- |
| Zero entry barrier for businesses                            | Revenue depends entirely on volume           |
| Aligns incentive: DittoDatto only earns when businesses earn | Businesses resent the "tax" as they grow     |
| Scales naturally with transaction value                      | Complex accounting (split payments, refunds) |

**Who uses this:** Booking.com, Treatwell, Uber.

### Model C: Hybrid (Freemium SaaS + Transaction Fee)

Free base tier (portal access, basic Datto) + premium tiers + small per-transaction fee.

```
Tier 0 (Free): Portal, manual booking, 1 store
Tier 1 (NOK 299/mo): Datto agent active, visual pings, analytics
Tier 2 (NOK 699/mo): Multi-store, priority support, API access

+ 2% per booking on all tiers (or 3% on free tier)
```

| Pro                                              | Con                                         |
| ------------------------------------------------ | ------------------------------------------- |
| Low barrier to entry (free tier)                 | Complex billing logic                       |
| Revenue from both subscription AND volume        | Must communicate value clearly at each tier |
| Scales with business growth                      | Two revenue streams to track and reconcile  |
| Free tier drives adoption, paid tier drives ARPU |                                             |

**Who uses this:** Fresha, Stripe (volume pricing + subscription), Toast.

---

## 3. The Agent-as-a-Service (AaaS) Dimension

DittoDatto is not just SaaS — Datto is an AI agent that performs work. This introduces **metered consumption** as a pricing dimension:

### What Can Be Metered

| Metric                 | Description                                          | Billing Model                     |
| ---------------------- | ---------------------------------------------------- | --------------------------------- |
| **Bookings processed** | Each completed booking through Datto                 | Per-transaction fee or commission |
| **AI interactions**    | Ditto conversations, Datto surface generations       | Per-interaction or bundled        |
| **Visual pings sent**  | Real-time notifications pushed to dashboard          | Included in tier                  |
| **A2A tasks handled**  | External agents booking through Datto's A2A endpoint | Per-task fee                      |
| **API calls**          | Third-party integrations hitting Datto's endpoints   | Metered or rate-limited by tier   |
| **Storage**            | Media uploads, booking history retention             | Included in tier                  |

### The Industry Standard for AaaS Billing (2025)

The current enterprise consensus, based on platforms like Anthropic, OpenAI, Stripe, and emerging agent platforms:

```
┌──────────────────────────────────────────────────────────┐
│                  HYBRID BILLING MODEL                     │
│                                                          │
│  ┌────────────────────────┐  ┌────────────────────────┐  │
│  │   PLATFORM FEE         │  │   USAGE-BASED          │  │
│  │   (subscription)       │  │   (metered)            │  │
│  │                        │  │                        │  │
│  │  • Portal access       │  │  • Per booking/task    │  │
│  │  • Agent activation    │  │  • Per API call        │  │
│  │  • Support tier        │  │  • Per token (AI)      │  │
│  │  • Feature gates       │  │  • Overage charges     │  │
│  └────────────────────────┘  └────────────────────────┘  │
│                                                          │
│  REVENUE = Platform Fee + Σ(usage × unit price)          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Key principles from enterprise practice:

1. **Transparent metering**: Customers must see their usage in real-time. No surprise bills. A usage dashboard is not optional.
2. **Committed use discounts**: Large customers commit to a minimum spend (e.g., 500 bookings/month) for a lower per-unit rate.
3. **Overage is not punitive**: When a customer exceeds their tier limit, the service degrades gracefully (rate-limited) or charges at a clear overage rate. Never cut off.
4. **Event-driven billing**: Every billable action is an immutable event. The billing system consumes an event stream and computes invoices.

---

## 4. Recommended Transaction Architecture for DittoDatto

### The Model: Freemium + Per-Booking Commission

Based on the product strategy ("Try for free", Norwegian SMB market, marketplace dynamics):

#### Tier Structure

| Tier              | Monthly Fee | Per-Booking Fee | Included                                                                               |
| ----------------- | ----------- | --------------- | -------------------------------------------------------------------------------------- |
| **Gratis** (Free) | NOK 0       | 4%              | 1 store, manual booking UI, basic Datto (static KPIs)                                  |
| **Profesjonell**  | NOK 399     | 2%              | 3 stores, full Datto (visual pings, AI dashboard), analytics                           |
| **Enterprise**    | NOK 999     | 1%              | Unlimited stores, A2A endpoint access, API keys, priority support, custom integrations |

#### Why This Works for DittoDatto

1. **Zero barrier**: Aligned with "Prøv gratis" (Try for free). A barber in Drammen can sign up, list haircuts, and start getting bookings without paying anything upfront.
2. **Revenue grows with success**: As the barber gets more bookings through the platform, DittoDatto earns more. Incentives are aligned.
3. **Upgrade path is natural**: When the barber opens a second location or wants the AI dashboard with visual pings, they upgrade to Profesjonell.
4. **Enterprise captures high-value clients**: Chains, clinics, large salons. They want the A2A endpoint so their own systems can integrate. They want API access for their custom apps.

#### The Vipps Integration

Norway's dominant payment rail is Vipps MobilePay. The transaction flow:

```
User → Books haircut (NOK 450) → Vipps payment initiated
  ↓
Vipps processes → settles to DittoDatto's merchant account
  ↓
DittoDatto splits:
  • Business receives: NOK 450 - (2% = NOK 9) - Vipps fee = ~NOK 433
  • DittoDatto keeps: NOK 9
  • Vipps keeps: ~NOK 8 (1.75%)
```

> [!IMPORTANT]
> The split settlement can be handled via Vipps' partner API (split payments) or via a settlement account where DittoDatto receives funds first and disburses nightly. The latter is simpler but requires a financial services registration in Norway (Finanstilsynet). The partner API avoids this.

---

## 5. The Billing Infrastructure

### Event-Driven Metering

Every billable action is a Firestore document in a `billing_events` collection:

```ts
interface BillingEvent {
  id: string;
  companyId: string;
  storeId: string;
  type: "booking_completed" | "a2a_task" | "api_call";
  amount?: number; // Transaction value (for commission calc)
  commission?: number; // Calculated commission
  timestamp: Timestamp;
  metadata: Record<string, any>;
}
```

### Monthly Invoice Generation

A Cloud Function runs on the 1st of each month:

1. Query all `billing_events` for the company in the previous month
2. Calculate: `total_commission = Σ(event.commission)`
3. Apply tier subscription fee
4. Generate invoice in `invoices` collection
5. Trigger email with invoice PDF

### Real-Time Usage Dashboard

The Business Portal shows a "Billing" page with:

- Current month usage (bookings count, total commission)
- Projected monthly cost
- Tier comparison ("You'd save NOK 200/mo on Profesjonell")
- Historical invoices

This page can be partially agent-generated — Datto renders a summary surface with KPIs about billing, and could even proactively suggest tier changes:

> _"You've processed 145 bookings this month. On the Profesjonell tier, you'd save NOK 290 in commission fees. Want me to show you the upgrade?"_

---

## 6. Enterprise Comparison: How the Big Players Do It

| Platform                  | Base Fee           | Transaction Fee            | Agent Component        | Billing Model                 |
| ------------------------- | ------------------ | -------------------------- | ---------------------- | ----------------------------- |
| **Salesforce Agentforce** | $50/user/mo        | $2/conversation            | AI agent conversations | Per-conversation metered      |
| **ServiceNow**            | Enterprise pricing | Per-interaction            | Virtual agent          | Hybrid subscription + metered |
| **Zendesk**               | $55-115/agent/mo   | $1.00/automated resolution | Answer Bot             | Per-resolution metered        |
| **Intercom**              | $74/seat/mo        | $0.99/resolution           | Fin AI Agent           | Hybrid                        |
| **Booking.com**           | None               | 15-25% commission          | N/A (no agent)         | Pure commission               |
| **DittoDatto** (proposed) | NOK 0-999/mo       | 1-4% commission            | Datto AI agent         | Hybrid freemium + commission  |

### Key Takeaway

The enterprise trend is away from pure per-seat licensing and toward **outcome-based billing**. Salesforce's Agentforce charges per _conversation_, not per user. Zendesk charges per _resolution_. The common thread: **you pay for what the agent does, not for having access to it.**

DittoDatto's per-booking commission is aligned with this trend. The business pays for **outcomes** (completed bookings), not for **access** (logging into the portal).

---

## 7. The A2A Monetization Opportunity

When external agents (Google's AI, Ditto, third-party apps) book through Datto's A2A endpoint, that's a transaction DittoDatto facilitated. This creates a new revenue channel:

```
External AI Agent → A2A → Datto → Booking confirmed
                                    ↓
                              DittoDatto earns commission
```

This is comparable to:

- **Stripe Connect**: Platform takes a fee for facilitating payments between third parties
- **Twilio**: Charges per API call/message regardless of who initiates it
- **Google Maps Platform**: Per-request pricing regardless of the calling application

The Enterprise tier's "A2A endpoint access" is not just a feature — it's a distribution channel. When Google's AI can book through Datto, the business gets discovered by Google's entire user base. DittoDatto's commission on those bookings is the monetization of that distribution.

---

## 8. Regulatory Considerations (Norway)

| Concern               | Status                 | Action Required                                                                                                                                        |
| --------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **GDPR**              | Applicable             | Shadow Demand data must be anonymized. Billing events contain company data (not personal).                                                             |
| **Finanstilsynet**    | Potentially applicable | If DittoDatto handles funds (receives and disburses), it may need a payment facilitator license. Using Vipps partner API (split payments) avoids this. |
| **Forbrukertilsynet** | Applicable             | Pricing must be transparent. No hidden fees. Commission rates must be clearly communicated.                                                            |
| **MVA (VAT)**         | 25% standard rate      | Subscription fees and commissions are subject to Norwegian VAT.                                                                                        |
| **Bookkeeping Act**   | Applicable             | All billing events must be retained for 5 years.                                                                                                       |

---

## 9. Key Decisions

| Decision                     | Options                                               | Recommendation                                                                                   |
| ---------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Primary revenue model        | Subscription / Commission / Hybrid                    | **Hybrid** (freemium subscription + per-booking commission)                                      |
| Free tier?                   | Yes / No                                              | **Yes** — critical for Norwegian SMB adoption ("Prøv gratis")                                    |
| Per-booking commission rate? | 1-5%                                                  | **4% free, 2% pro, 1% enterprise** — competitive with Fresha (2.19%)                             |
| Payment handling             | DittoDatto holds funds / Vipps split                  | **Vipps split payments** — avoids Finanstilsynet licensing                                       |
| A2A monetization             | Free / Commission                                     | **Same commission as direct bookings** — the business pays for the outcome regardless of channel |
| Billing infrastructure       | Custom / Third-party (Stripe Billing, Orb, Metronome) | **Custom initially** (Firestore events + Cloud Functions), migrate to Orb/Metronome at scale     |

---

_This report establishes a concrete, enterprise-aligned transaction model for DittoDatto. The hybrid freemium + per-booking commission model aligns with current AaaS industry standards, Norwegian market dynamics, and the product's "Try for free" positioning. Billing infrastructure should be event-driven from day one to support metered usage at scale._
