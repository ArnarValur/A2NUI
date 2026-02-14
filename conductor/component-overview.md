# A2NUI Component Overview

Component transformation status grouped by [Nuxt UI categories](<./Nuxt%20UI%20(4.4.0)/Components/>).

**Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Done | ➖ Not Planned

**Last Updated:** 2026-02-14

---

## 🔥 Priority Components

These are the components most critical for DittoDatto's agentic AI interfaces:

| Component        | Category | Status | Track | Notes                          |
| ---------------- | -------- | ------ | ----- | ------------------------------ |
| ChatMessage      | AI Chat  | ⬜     | —     | Agent conversation bubbles     |
| ChatMessages     | AI Chat  | ⬜     | —     | Chat container with streaming  |
| ChatPrompt       | AI Chat  | ⬜     | —     | User input for chat            |
| ChatPromptSubmit | AI Chat  | ⬜     | —     | Submit button for chat         |
| Table            | Data     | ⬜     | —     | Data display and management    |
| Form             | Form     | ⬜     | —     | Form container with validation |
| FormField        | Form     | ⬜     | —     | Field wrapper with label/error |
| Input            | Form     | ⬜     | —     | Text input                     |
| Textarea         | Form     | ⬜     | —     | Multi-line text input          |
| Select           | Form     | ⬜     | —     | Dropdown selection             |
| SelectMenu       | Form     | ⬜     | —     | Searchable select with menu    |
| Button           | Element  | ⬜     | —     | Action triggers                |

---

## Layout

| Component | Status | Track | Notes                            |
| --------- | ------ | ----- | -------------------------------- |
| App       | ➖     | —     | Shell component, unlikely needed |
| Container | ⬜     | —     |                                  |
| Main      | ➖     | —     |                                  |
| Header    | ⬜     | —     |                                  |
| Footer    | ➖     | —     |                                  |

## Element

| Component   | Status | Track | Notes       |
| ----------- | ------ | ----- | ----------- |
| Avatar      | ⬜     | —     |             |
| AvatarGroup | ⬜     | —     |             |
| Badge       | ⬜     | —     |             |
| Button      | ⬜     | —     | 🔥 Priority |
| Chip        | ⬜     | —     |             |
| Icon        | ⬜     | —     |             |
| Kbd         | ➖     | —     |             |
| Link        | ⬜     | —     |             |
| Separator   | ⬜     | —     |             |
| Skeleton    | ⬜     | —     |             |

## Form

| Component     | Status | Track | Notes       |
| ------------- | ------ | ----- | ----------- |
| Checkbox      | ⬜     | —     |             |
| CheckboxGroup | ⬜     | —     |             |
| ColorPicker   | ➖     | —     |             |
| FileUpload    | ⬜     | —     |             |
| Form          | ⬜     | —     | 🔥 Priority |
| FormField     | ⬜     | —     | 🔥 Priority |
| Input         | ⬜     | —     | 🔥 Priority |
| InputDate     | ⬜     | —     |             |
| InputMenu     | ⬜     | —     |             |
| InputNumber   | ⬜     | —     |             |
| InputTags     | ⬜     | —     |             |
| InputTime     | ⬜     | —     |             |
| PinInput      | ➖     | —     |             |
| RadioGroup    | ⬜     | —     |             |
| Select        | ⬜     | —     | 🔥 Priority |
| SelectMenu    | ⬜     | —     | 🔥 Priority |
| Slider        | ⬜     | —     |             |
| Switch        | ⬜     | —     |             |
| Textarea      | ⬜     | —     | 🔥 Priority |

## Data

| Component | Status | Track | Notes       |
| --------- | ------ | ----- | ----------- |
| Accordion | ⬜     | —     |             |
| Calendar  | ⬜     | —     |             |
| Carousel  | ➖     | —     |             |
| Table     | ⬜     | —     | 🔥 Priority |
| Timeline  | ⬜     | —     |             |
| Tree      | ⬜     | —     |             |
| User      | ⬜     | —     |             |

## A2UI Standard Catalog

| Component     | Status | Track   | Notes                             |
| ------------- | ------ | ------- | --------------------------------- |
| Text          | ✅     | —       | h1-h5, body, caption variants     |
| Image         | ✅     | —       | URL + fit + variant sizing        |
| Icon          | ✅     | —       | A2UI icon → Lucide mapping        |
| Video         | ✅     | Phase 1 | Native `<video>` with controls    |
| AudioPlayer   | ✅     | Phase 1 | Native `<audio>` with description |
| Row           | ✅     | —       | Flex row with gap/justify/align   |
| Column        | ✅     | —       | Flex col with gap/justify/align   |
| List          | ✅     | Phase 1 | Scrollable flex container         |
| Card          | ✅     | —       | UCard wrapper                     |
| Tabs          | ✅     | —       | UTabs with child nodes            |
| Modal         | ✅     | Phase 1 | UModal with trigger/content       |
| Divider       | ✅     | —       | USeparator                        |
| Button        | ✅     | —       | UButton with variant mapping      |
| TextField     | ✅     | —       | UInput / UTextarea                |
| CheckBox      | ✅     | —       | UCheckbox                         |
| ChoicePicker  | ✅     | Phase 1 | URadioGroup / UCheckbox list      |
| Slider        | ✅     | Phase 1 | USlider with label                |
| DateTimeInput | ✅     | Phase 1 | Native date/time/datetime-local   |

## Navigation

| Component      | Status | Track | Notes |
| -------------- | ------ | ----- | ----- |
| Breadcrumb     | ⬜     | —     |       |
| CommandPalette | ⬜     | —     |       |
| NavigationMenu | ⬜     | —     |       |
| Pagination     | ⬜     | —     |       |
| Stepper        | ⬜     | —     |       |
| Tabs           | ⬜     | —     |       |

## Overlay

| Component   | Status | Track | Notes |
| ----------- | ------ | ----- | ----- |
| ContextMenu | ➖     | —     |       |
| Drawer      | ⬜     | —     |       |
| Modal       | ⬜     | —     |       |
| Popover     | ⬜     | —     |       |
| Slideover   | ⬜     | —     |       |
| Toast       | ⬜     | —     |       |
| Tooltip     | ⬜     | —     |       |

## Dashboard

| Component                | Status | Track | Notes |
| ------------------------ | ------ | ----- | ----- |
| DashboardGroup           | ⬜     | —     |       |
| DashboardNavbar          | ⬜     | —     |       |
| DashboardPanel           | ⬜     | —     |       |
| DashboardResizeHandle    | ➖     | —     |       |
| DashboardSearchButton    | ⬜     | —     |       |
| DashboardSearch          | ⬜     | —     |       |
| DashboardSidebar         | ⬜     | —     |       |
| DashboardSidebarCollapse | ⬜     | —     |       |
| DashboardSidebarToggle   | ⬜     | —     |       |
| DashboardToolbar         | ⬜     | —     |       |

## AI Chat

| Component        | Status | Track | Notes       |
| ---------------- | ------ | ----- | ----------- |
| ChatMessage      | ⬜     | —     | 🔥 Priority |
| ChatMessages     | ⬜     | —     | 🔥 Priority |
| ChatPalette      | ⬜     | —     |             |
| ChatPrompt       | ⬜     | —     | 🔥 Priority |
| ChatPromptSubmit | ⬜     | —     | 🔥 Priority |

## Editor

| Component            | Status | Track | Notes |
| -------------------- | ------ | ----- | ----- |
| Editor               | ⬜     | —     |       |
| EditorDragHandle     | ➖     | —     |       |
| EditorEmojiMenu      | ➖     | —     |       |
| EditorMentionMenu    | ⬜     | —     |       |
| EditorSuggestionMenu | ⬜     | —     |       |
| EditorToolbar        | ⬜     | —     |       |

## Page

| Component   | Status | Track | Notes                            |
| ----------- | ------ | ----- | -------------------------------- |
| Page\*      | ➖     | —     | Marketing components, not needed |
| PricingPlan | ➖     | —     |                                  |
| BlogPost    | ➖     | —     |                                  |

## Content

| Component         | Status | Track | Notes |
| ----------------- | ------ | ----- | ----- |
| ContentNavigation | ➖     | —     |       |
| ContentSearch     | ➖     | —     |       |
| ContentToc        | ➖     | —     |       |

## Color Mode / i18n

| Component    | Status | Track | Notes                  |
| ------------ | ------ | ----- | ---------------------- |
| ColorMode\*  | ➖     | —     | Integration components |
| LocaleSelect | ➖     | —     |                        |

---

> **Docs Reference:** `Nuxt UI (4.4.0)/Components/{category}/{ComponentName}.md`
> **Source Reference:** `Nuxt UI Repo/src/runtime/components/{ComponentName}.vue` (while available)
