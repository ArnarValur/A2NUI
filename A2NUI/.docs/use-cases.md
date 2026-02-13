# Use Cases

## 1. AI-Powered Form Builder

**Scenario**: A business owner needs a custom intake form for their service but doesn't want to use a form builder tool.

**How it works**:

1. Owner opens the business portal and tells Ditto: _"I need a booking form for haircut appointments. Ask for name, phone, preferred stylist, and date."_
2. Ditto generates A2UI JSONL defining a `Column` with `TextField` inputs, a `MultipleChoice` for stylist selection, a `DateTimeInput`, and a `Button`.
3. The A2UI renderer displays a native Nuxt UI form — styled, validated, and ready to use.
4. The form submissions feed back to the agent, which can create bookings in Firestore.

**A2UI components used**: `Column`, `Text` (h2), `TextField`, `MultipleChoice`, `DateTimeInput`, `Button`, `Divider`

**Example JSONL**:

```jsonl
{"version":"v0.10","createSurface":{"surfaceId":"booking-form","catalogId":"standard"}}
{"version":"v0.10","updateComponents":{"surfaceId":"booking-form","components":[
  {"id":"root","component":"Column","children":["title","name","phone","stylist","date","divider","submit"]},
  {"id":"title","component":"Text","text":"Book a Haircut","variant":"h2"},
  {"id":"name","component":"TextField","label":"Your Name","placeholder":"Jane Doe"},
  {"id":"phone","component":"TextField","label":"Phone Number","placeholder":"+31 6 1234 5678"},
  {"id":"stylist","component":"TextField","label":"Preferred Stylist","placeholder":"Any available"},
  {"id":"date","component":"TextField","label":"Preferred Date","placeholder":"Tomorrow afternoon"},
  {"id":"divider","component":"Divider"},
  {"id":"submit","component":"Button","label":"Book Appointment","variant":"primary"}
]}}
```

---

## 2. Live KPI Dashboard

**Scenario**: A business owner wants to see their daily performance metrics at a glance.

**How it works**:

1. Datto (the data agent) queries Firestore for today's metrics: bookings, revenue, new customers, cancellations.
2. It generates an A2UI surface with Cards displaying KPIs, a summary Row with key numbers, and a breakdown Table (when supported).
3. The surface updates in real-time via `updateDataModel` as new bookings come in — no page refresh needed.
4. If a metric crosses a threshold (e.g., 3 cancellations in a row), the agent pushes a new surface with an alert Card.

**A2UI components used**: `Column`, `Row`, `Card`, `Text` (h1, h3, body, caption), `Icon`, `Divider`, `Button`

**Example JSONL**:

```jsonl
{"version":"v0.10","createSurface":{"surfaceId":"daily-kpis","catalogId":"standard"}}
{"version":"v0.10","updateComponents":{"surfaceId":"daily-kpis","components":[
  {"id":"root","component":"Column","children":["header","metrics","divider","actions"]},
  {"id":"header","component":"Text","text":"Today's Performance","variant":"h2"},
  {"id":"metrics","component":"Row","children":["bookings","revenue","customers"]},
  {"id":"bookings","component":"Card","title":"Bookings","children":["bookings-count"]},
  {"id":"bookings-count","component":"Text","text":"23","variant":"h1"},
  {"id":"revenue","component":"Card","title":"Revenue","children":["revenue-amount"]},
  {"id":"revenue-amount","component":"Text","text":"€1,240","variant":"h1"},
  {"id":"customers","component":"Card","title":"New Customers","children":["customer-count"]},
  {"id":"customer-count","component":"Text","text":"7","variant":"h1"},
  {"id":"divider","component":"Divider"},
  {"id":"actions","component":"Row","children":["view-details","export"]},
  {"id":"view-details","component":"Button","label":"View Details","variant":"outline"},
  {"id":"export","component":"Button","label":"Export Report","variant":"outline"}
]}}
```

---

## 3. Interactive Staff Onboarding Wizard

**Scenario**: A business owner adds a new staff member and wants the agent to guide them through setup.

**How it works**:

1. Owner tells Ditto: _"I'm adding a new stylist named Maria."_
2. Ditto generates a multi-step wizard as A2UI surfaces:
   - **Step 1**: Basic info form (name, email, role)
   - **Step 2**: Service assignments (which services can Maria perform?)
   - **Step 3**: Schedule setup (weekly availability)
   - **Step 4**: Confirmation summary
3. Each step is a separate `updateComponents` that replaces the previous surface content.
4. The agent validates input at each step and provides contextual suggestions (e.g., "Most stylists work Tue-Sat, 9-18. Want to use that?").

**A2UI components used**: `Column`, `Card`, `Text`, `TextField`, `CheckBox`, `Row`, `Button`, `Tabs`, `Divider`

**Example JSONL (Step 1)**:

```jsonl
{"version":"v0.10","createSurface":{"surfaceId":"onboarding","catalogId":"standard"}}
{"version":"v0.10","updateComponents":{"surfaceId":"onboarding","components":[
  {"id":"root","component":"Column","children":["progress","card"]},
  {"id":"progress","component":"Text","text":"Step 1 of 4 — Basic Information","variant":"caption"},
  {"id":"card","component":"Card","title":"New Staff Member","children":["form","actions"]},
  {"id":"form","component":"Column","children":["name","email","role"]},
  {"id":"name","component":"TextField","label":"Full Name","placeholder":"Maria Rodriguez"},
  {"id":"email","component":"TextField","label":"Email Address","placeholder":"maria@salon.com"},
  {"id":"role","component":"TextField","label":"Role","placeholder":"Stylist"},
  {"id":"actions","component":"Row","children":["next"]},
  {"id":"next","component":"Button","label":"Next: Assign Services →","variant":"primary"}
]}}
```

**Example JSONL (Step 2 — replaces same surface)**:

```jsonl
{
  "version": "v0.10",
  "updateComponents": {
    "surfaceId": "onboarding",
    "components": [
      {
        "id": "root",
        "component": "Column",
        "children": [
          "progress",
          "card"
        ]
      },
      {
        "id": "progress",
        "component": "Text",
        "text": "Step 2 of 4 — Service Assignments",
        "variant": "caption"
      },
      {
        "id": "card",
        "component": "Card",
        "title": "What can Maria do?",
        "children": [
          "services",
          "actions"
        ]
      },
      {
        "id": "services",
        "component": "Column",
        "children": [
          "s1",
          "s2",
          "s3",
          "s4"
        ]
      },
      {
        "id": "s1",
        "component": "CheckBox",
        "label": "Haircut — €35",
        "value": true
      },
      {
        "id": "s2",
        "component": "CheckBox",
        "label": "Coloring — €65",
        "value": false
      },
      {
        "id": "s3",
        "component": "CheckBox",
        "label": "Blowout — €25",
        "value": true
      },
      {
        "id": "s4",
        "component": "CheckBox",
        "label": "Extensions — €120",
        "value": false
      },
      {
        "id": "actions",
        "component": "Row",
        "children": [
          "back",
          "next"
        ]
      },
      {
        "id": "back",
        "component": "Button",
        "label": "← Back",
        "variant": "outline"
      },
      {
        "id": "next",
        "component": "Button",
        "label": "Next: Schedule →",
        "variant": "primary"
      }
    ]
  }
}
```
