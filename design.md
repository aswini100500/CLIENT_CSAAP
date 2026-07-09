# Builder ERP CRM Design System

## 1. What This System Is

This is the product design system for Builder ERP's CRM surfaces.

It is not a generic Tailwind guide. It is an opinionated operating manual for building dense real-estate CRM screens that feel calm, premium, fast, and operationally useful.

The system is based on the current strongest screens:
- `LeadList.jsx`
- `LeadQueueTable.jsx`
- `LeadTabsDock.jsx`
- `SimpleCSVUpload.jsx`
- CRM modal patterns in the telemarketing lead flow
- **HRMS Reference Surfaces**: [AttendanceCloudsat.jsx](file:///d:/Saroj/builder/builder-erp/src/submodules/hrms/components/AttendanceCloudsat.jsx) (which embeds the standard tabs, synced page-level loaders, standardized modals, and static panels across [EmployeeAttendance.jsx](file:///d:/Saroj/builder/builder-erp/src/submodules/hrms/components/pages/EmployeeAttendance.jsx), [EmployeeAttendanceReview.jsx](file:///d:/Saroj/builder/builder-erp/src/submodules/hrms/components/pages/EmployeeAttendanceReview.jsx), and [Leaveofallemployee.jsx](file:///d:/Saroj/builder/builder-erp/src/submodules/hrms/components/Employee%20Management/Leaveofallemployee.jsx))

The product should feel like:
- a focused command desk for real-estate teams
- light, clean, and trustworthy
- compact enough for daily work
- polished through proportion, typography, and state design
- friendly without becoming playful
- premium without becoming decorative

The product should not feel like:
- a marketing landing page
- a generic admin template
- a loose collection of cards
- a color demo
- a dashboard full of oversized widgets
- a UI where every component invents its own visual language

---

## 2. Product Point Of View

### 2.1 The Interface Is A Workspace

Builder ERP CRM is used repeatedly during the day. The design must support scanning, filtering, calling, assigning, importing, reviewing, and correcting data.

Every page should answer:
- What is the current work queue?
- What needs attention first?
- What action can the user take now?
- What changed after the action?

If a visual choice does not help one of those questions, it should be quiet.

### 2.2 Calm, But Not Plain

The UI is calm because the work is busy.

Calm does not mean boring. The product gets character from:
- green brand confidence
- crisp white panels
- compact type hierarchy
- strong active states
- tactile buttons
- disciplined spacing
- clear row anatomy
- subtle entrance motion

Avoid adding excitement through unrelated gradients, decorative blobs, huge headers, or random illustrations.

### 2.3 Density Is A Feature

CRM users need to compare many leads and take repeated actions. A good page should show enough information without making the user feel buried.

Density should come from:
- compact page headers
- stable table rows
- tight section bars
- small metadata text
- predictable action placement
- restrained card count

Density should not come from:
- tiny unreadable text
- weak contrast
- collapsed padding
- unlabeled icon chaos
- mixing too many component shapes

---

## 3. Canonical Visual Direction

### 3.1 Current Theme

The current CRM language is a light green operational SaaS theme:

| Token | Value | Role |
| --- | --- | --- |
| `--bg-app` | `#f8faf8` | Main app canvas |
| `--bg-subtle` | `#f0fdf4` | Soft green-tinted secondary surface |
| `--bg-panel` | `rgba(255, 255, 255, 0.92)` | Slightly softened panel surface |
| `--bg-panel-strong` | `#ffffff` | Standard panel/table background |
| `--bg-elevated` | `rgba(255, 255, 255, 0.98)` | Floating layers, dropdowns, modals |
| `--border-soft` | `#e2f2e9` | Default panel/input/sidebar border |
| `--border-strong` | `#c6f1d6` | Hover, focus-adjacent, stronger separation |
| `--text-strong` | `#042f2e` | Page titles, primary labels, key row names |
| `--text-body` | `#1e293b` | Main readable copy |
| `--text-soft` | `#475569` | Secondary copy and labels |
| `--text-faint` | `#94a3b8` | Tertiary metadata and helper text |
| `--brand` | `#00a651` | Primary CRM action color |
| `--brand-strong` | `#008c44` | Hover/pressed brand color |
| `--brand-soft` | `#ecfdf5` | Soft brand badge/icon surface |
| `--brand-ring` | `rgba(0, 166, 81, 0.16)` | Focus ring |

### 3.2 Green Is The Brand, Not The Whole UI

Use green for:
- primary actions
- active navigation
- selected tabs
- focused inputs
- positive status
- icon accents on CRM-specific empty states

Do not wash every card, table, header, and button in green. The system works because most of the UI is white, slate, and quiet borders, with green used where it matters.

### 3.3 Accent Colors

Use accent colors as operational signals:

| Color Family | Use |
| --- | --- |
| Emerald/green | success, accepted, primary CRM action |
| Sky/blue | information, timeline, neutral contact metadata |
| Amber/orange | warning, edit, needs review |
| Rose/red | error, rejected, destructive action |
| Violet/teal | assignment and transfer actions when they need distinction |

Accent colors must stay localized to badges, icons, small tints, alerts, or hover states. They should not become full-page themes.

---

## 4. Typography

### 4.1 Typeface

Primary CRM typeface:
- `Manrope`

Fallbacks:
- `Inter`
- `Segoe UI`
- sans-serif

The type should feel modern, compact, and precise. It should not feel editorial, playful, or bureaucratic.

### 4.2 Type Is The Main Design Tool

Most hierarchy should come from:
- font weight
- size
- line height
- color
- spacing

Do not compensate for weak type hierarchy with loud surfaces, heavy shadows, or gradients.

### 4.3 Page Titles

Use `app-title` for inner page titles.

Rules:
- title size should feel important but never hero-sized
- max title width should usually be `max-w-3xl`
- title weight is strong, around `700-800`
- line-height should be tight
- subtitle sits directly below with `mt-1`
- page headers should be compact enough that the work surface appears in the first viewport

Good page title pattern:

```jsx
<div>
  <h1 className="app-title max-w-3xl">New Leads</h1>
  <p className="app-subtitle mt-1">
    Fresh unassigned leads waiting for ownership.
  </p>
</div>
```

Avoid:
- page titles bigger than the table content
- marketing-style hero sections
- long paragraphs under page titles
- decorative badges above every page title

### 4.4 Section Headings

Use `app-heading` inside panels and section bars.

Rules:
- section headings are usually `16px`
- keep them short
- pair with small support text only when it improves comprehension
- do not create a large title hierarchy inside compact panels

### 4.5 Labels And Metadata

Labels should be small, strong, and calm.

Use:
- `app-label` for filters and field labels outside modals
- `modal-label` for modal forms
- `text-[11px]` to `text-[12px]` for tiny metadata

Uppercase is allowed for table headers and very small metadata only when it improves scanning.

Default product copy uses sentence case.

---

## 5. Page Layout

### 5.1 Dashboard Shell

All dashboard pages live inside the fixed sidebar plus navbar layout.

The content area already has top separation from the navbar through the layout shell. Inner pages should continue the rhythm:

```jsx
<div className="app-shell p-4">
  <div className="max-w-7xl mx-auto space-y-6">
    ...
  </div>
</div>
```

Rules:
- use `p-4` for standard inner pages
- use `max-w-7xl mx-auto` for dense queue/list pages
- use `space-y-6` between major page regions
- use `space-y-5` inside table/workflow components
- keep page content visually dropped into the workspace, not glued to the navbar

### 5.2 Page Widths

| Page Type | Width |
| --- | --- |
| Lead queues and data tables | `max-w-7xl` |
| Upload/review workflows | `max-w-7xl` |
| Settings forms | `max-w-5xl` or `max-w-6xl` |
| Detail-heavy record pages | `max-w-6xl` |
| Narrow wizard steps | `max-w-3xl` |

Do not stretch every form to the full dashboard width. Width should match the task.

### 5.3 Inner Page Anatomy

Standard data page order:

1. Optional sticky tab dock
2. Compact page header with actions
3. Filter/search panel
4. Main data panel
5. Pagination or footer controls
6. Modals rendered through portals

Standard workflow page order:

1. Compact page header
2. Primary workflow panel
3. Side checklist/helper panel
4. Preview/review panel
5. Result alert or invalid-row action

### 5.4 No Card Pyramids

Do not put cards inside cards for page layout. Panels may contain rows, sections, or repeated cards only when those items are real content units.

Acceptable:
- a table panel with a section bar and rows
- a modal body containing two small detail panels
- an upload page with one main panel and one checklist panel

Avoid:
- a page section styled as a card that contains three cards that contain mini cards
- every piece of text sitting inside its own bordered box
- decorative cards just to fill space

---

## 6. Surfaces

### 6.1 App Canvas

The app background is `--bg-app`.

It should feel fresh and slightly tinted, but almost flat. Avoid strong page gradients, background images, or ornamental patterns on CRM workflow pages.

### 6.2 Panels

Use `app-panel` for:
- tables
- filter bars
- upload areas
- checklist containers
- modal detail sections
- quick-action panels

Panel rules:
- background is white
- border is `--border-soft`
- radius is usually `16px`
- shadow is subtle and secondary
- panel padding is usually `16px`

Panels should feel crisp, not puffy.

### 6.3 Section Bars

Use `app-section-bar` at the top of framed data panels.

Rules:
- section bars are compact: usually `px-4 py-3`
- background is a light mix of white and `--bg-subtle`
- bottom border separates it from content
- section title uses `app-heading`
- actions inside section bars must be small links or compact buttons

Do not use heavy colored headers for table panels.

### 6.4 Floating Surfaces

Dropdowns, tooltips, and popovers use `app-floating`.

Rules:
- render through portals when clipping is possible
- use white elevated background
- use `--shadow-float`
- keep radius aligned with the rest of the system
- menu rows use compact text and icon alignment

---

## 7. Buttons And Actions

### 7.1 Primary Buttons

Use `app-btn-primary` for one main action per local context.

Examples:
- Add lead
- Import leads
- Save
- Assign lead
- Log interaction

Rules:
- include a lucide icon when the action benefits from quick recognition
- use `min-height: 44px` for main buttons
- use green gradient only for primary buttons and active navigation/tabs
- use active press feedback: `active:scale-[0.98]`
- disabled primary buttons turn muted slate, not pale green

### 7.2 Secondary Buttons

Use `app-btn-secondary` for supporting actions.

Examples:
- Export
- Download template
- Previous
- Next
- Cancel

Rules:
- white surface
- visible border
- same height family as primary buttons
- never look like plain links unless the action is truly low weight

### 7.3 Icon Buttons

Use `app-icon-button` for dense action clusters.

Rules:
- icon-only buttons need a stable square hit area
- use lucide icons
- add `aria-label` or `title`
- keep table action buttons in a single row when possible
- use semantic hover color for high-risk actions

Table action language:

| Action | Color Treatment |
| --- | --- |
| Assign | violet text, violet hover tint |
| Delete | red text, red hover tint |
| Log interaction | emerald text, emerald hover tint |
| Transfer | teal text, teal hover tint |
| View details | neutral text, green hover text |
| Timeline | neutral text, strong text hover |

Do not use full text buttons inside dense table action cells.

---

## 8. Tables

### 8.1 Table Philosophy

Tables are the heart of the CRM. They should feel stable, scannable, and action-ready.

Optimize for:
- reading names quickly
- comparing dates and status
- seeing assignment state
- taking row actions without hunting
- preserving column alignment

### 8.2 Table Shell

Every major table should be inside:

```jsx
<div className="app-panel overflow-hidden">
  <div className="app-section-bar px-4 py-3">
    <h3 className="app-heading">New Leads (42 leads)</h3>
  </div>
  <div className="overflow-x-auto">
    <table className="min-w-full">...</table>
  </div>
</div>
```

Rules:
- never render major tables directly on the page canvas
- use `overflow-hidden` on the panel
- use `overflow-x-auto` around the table
- table backgrounds stay white
- row separators use `divide-(--bg-subtle)`

### 8.3 Table Headers

Column headers:
- `text-[11px]`
- `font-extrabold`
- `uppercase`
- `tracking-widest`
- `text-(--text-soft)`
- `px-4 py-2.5`

Headers are scan labels, not brand elements.

Avoid:
- large table headers
- green table header backgrounds
- centered labels except for genuinely centered numeric/action columns

### 8.4 Table Rows

Standard row rhythm:
- `px-4 py-3`
- hover: `hover:bg-(--bg-subtle)/70`
- transition: `duration-200`
- row height should be compact but comfortable

The first cell should usually carry identity:
- avatar/icon block at `size-8`
- rounded square, usually `rounded-xl`
- primary text `text-[14px] font-bold`
- secondary metadata `text-[12px] font-medium text-(--text-faint)`

### 8.5 Cell Hierarchy

Use this hierarchy inside rows:

| Content | Style |
| --- | --- |
| Primary name/title | `text-[14px] font-bold text-(--text-strong)` |
| Secondary metadata | `text-[12px] font-medium text-(--text-faint)` |
| Phone/owner important values | `text-[13px] font-semibold text-(--text-body)` |
| Dates and normal values | `text-[13px] font-medium text-(--text-body)` |
| Status badge | `text-[11px] font-medium px-2 py-0.5 rounded` |
| Missing value | `NA`, `Unassigned`, or `No email` in faint/soft tone |

### 8.6 Empty Table State

Empty table states should be simple:
- one icon
- one title
- one supporting line
- no illustration
- no oversized panel

Example:

```jsx
<td colSpan="7" className="px-4 py-10 text-center">
  <SearchX className="size-8 mx-auto mb-3 text-(--text-faint)" />
  <p className="text-[14px] font-medium text-(--text-strong)">No leads found</p>
  <p className="text-[13px] mt-1 text-(--text-soft)">
    Try another tab or create a new lead.
  </p>
</td>
```

---

## 9. KPI Cards

### 9.1 KPI Purpose

KPI cards are not decoration. They should summarize operational state and guide attention.

Use KPI cards for:
- total leads
- new leads
- assigned leads
- follow-ups due
- accepted/rejected leads
- import success/rejection counts
- conversion rates
- revenue or booking metrics

Do not use KPI cards just to fill the top of every page.

### 9.2 KPI Layout

Preferred KPI card:
- `app-panel p-4`
- compact top label
- large numeric value
- small status/change row
- optional icon tile on the right

KPI card anatomy:

```jsx
<div className="app-panel p-4">
  <div className="flex items-start justify-between gap-3">
    <div>
      <p className="text-[12px] font-bold text-(--text-soft)">Follow-ups due</p>
      <div className="mt-2 text-[28px] font-extrabold leading-none text-(--text-strong)">
        18
      </div>
      <p className="mt-2 text-[12px] font-medium text-(--text-faint)">
        6 overdue today
      </p>
    </div>
    <div className="size-10 rounded-2xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center">
      <CalendarClock className="size-5 text-(--brand)" />
    </div>
  </div>
</div>
```

### 9.3 KPI Rules

Rules:
- grid is usually `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- gap is usually `gap-4`
- number is the visual anchor
- labels are short
- helper copy explains context, not mechanics
- use semantic accent only for the icon or tiny trend text

Avoid:
- gradient KPI cards
- huge card heights
- decorative charts inside every KPI
- more than 4-5 KPI cards above a table
- making KPI cards louder than the action queue

---

## 10. Tabs And Queue Docks

### 10.1 Sticky Queue Tabs

Use sticky tabs for queue-like pages where switching stage changes the whole work surface.

Pattern:
- sticky at top of page content
- full-width across page padding using `-mx-4 px-4`
- subtle bottom border
- background uses `color-mix(in srgb, var(--bg-app) 94%, white)`
- horizontal scroll on mobile

### 10.2 Tab Buttons

Inactive tabs:
- white or near-white
- `border-(--border-soft)`
- `text-(--text-body)`
- hover stronger border

Active tabs:
- green brand gradient
- white text
- shadow with green brand color
- count badge inside the tab

Rules:
- tab labels should be short
- counts are always shown when they help queue awareness
- active state must be unmistakable
- tabs should not wrap onto multiple lines inside the button

---

## 11. Forms And Inputs

### 11.1 Input Character

Inputs should feel precise and centered.

Use `app-input` for:
- search
- filters
- modal text fields
- select-like controls when native select styling is acceptable

Rules:
- white or nearly white background
- border is visible
- radius around `12px`
- focus ring uses `--brand-ring`
- placeholder uses `--text-faint`
- icons are vertically centered

### 11.2 Search Panels

Search is usually in its own `app-panel p-4` above the data panel.

Pattern:

```jsx
<div className="app-panel p-4">
  <label className="app-label block mb-1.5">Search</label>
  <div className="relative max-w-xl">
    <input className="app-input w-full pl-9 pr-3 py-2 text-[13px]" />
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) size-3.5" />
  </div>
</div>
```

Rules:
- keep global search compact
- do not add large filter builders unless the page needs them
- filters should be close to the data they affect

### 11.3 Modal Forms

Modal field stack:
- `modal-label`
- input/select
- optional `modal-helper`

Rules:
- labels use sentence case
- helper text is short and faint
- required fields should be clear through copy or validation
- avoid two unrelated fields on the same line on small modals

---

## 12. Upload And Import Workflows

### 12.1 Upload Page Structure

Upload workflows should feel procedural and reassuring.

Recommended layout:
- header
- two-column grid on desktop
- main upload panel on the left
- checklist/help panel on the right
- review table below when preview rows exist

Use:
- `grid grid-cols-1 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)] gap-6`
- `app-panel p-4`
- checklist cards inside the side panel only when they are genuine checklist items

### 12.2 File Selection Row

File selection should show:
- file icon
- file name or "No file selected"
- file size or helper line
- import button on the right

Rules:
- upload actions stay near file status
- invalid file state appears immediately
- import button disables when validation errors exist

### 12.3 Validation And Results

Use alert panels for upload result states:

| State | Treatment |
| --- | --- |
| Success | emerald tint, check icon |
| Warning | amber tint, alert icon |
| Error | rose tint, alert icon |
| Info | blue tint, alert icon |

Rules:
- show the main message first
- list only the first few row errors inline
- provide "Download invalid rows" for larger correction work
- keep error copy direct and repair-oriented

### 12.4 Preview Tables

Import previews use the same table system as lead queues.

Rules:
- show a review table only after valid preview rows exist
- first cell carries lead identity
- footer uses section-bar styling
- pagination buttons use secondary buttons
- current page indicator uses brand fill

---

## 13. Modals

### 13.1 Modal Backdrop

All modals use:
- portal rendering
- `app-modal-backdrop`
- centered layout
- `p-4`
- backdrop blur

Rules:
- modals should not be clipped by page containers
- modal content should max at `90vh`
- body scroll lives inside the modal, not the page behind it

### 13.2 Modal Shell

Use `app-modal`.

Common sizes:

| Modal Type | Width |
| --- | --- |
| Simple form | `max-w-lg` |
| Assignment or transfer | `max-w-xl` |
| Lead details | `max-w-2xl` |
| Timeline/history | `max-w-3xl` |

### 13.3 Modal Header

Header anatomy:
- white header
- bottom border
- optional icon tile
- compact title
- subtitle/status row when needed
- close icon at top-right

Rules:
- modal title uses `modal-title`
- icon tile is usually `size-11 rounded-2xl`
- close button uses `app-icon-button`
- title should truncate when necessary

### 13.4 Modal Body

Modal body rules:
- padding usually `p-5`
- vertical rhythm `space-y-4`
- use `custom-scrollbar`
- group details into panels only when they improve scanning
- prefer compact detail rows over bulky form-like read-only layouts

### 13.5 Modal Footer

Footer rules:
- border top
- white or near-white
- primary action on the right
- secondary action before it
- disabled saving states must be visible

Do not use heavy tinted footer bars.

---

## 14. Detail Views

### 14.1 Detail Panels

Record detail views inside modals should use grouped panels:
- contact/details
- last interaction
- quick actions
- metadata footer

Detail rows:
- icon left
- label small and faint
- value strong and right-aligned when row is compact
- use dividers for scannability

### 14.2 Quick Actions

Quick action panels are acceptable when they are real next steps.

Rules:
- use `app-panel`
- left icon tile
- title `text-[13px] font-medium`
- helper `text-[11px]`
- hover shifts background to `--bg-subtle`
- press feedback is subtle

Do not create more than 2-4 quick actions in a modal unless the record truly has many workflows.

---

## 15. Navigation

### 15.1 Sidebar

The sidebar is a stable workspace rail.

Rules:
- width: `w-64` expanded, `w-16` collapsed
- fixed left, full height
- background is a mix of white and `--bg-subtle`
- border-right uses `--border-soft`
- active item uses brand gradient and white text
- parent active item can use white background and brand text
- collapsed state uses portal tooltips

Do not turn the sidebar into a branded billboard.

### 15.2 Top Navbar

The navbar frames the workspace.

Rules:
- height `h-16`
- subtle bottom border
- background is a white/subtle mix
- global search is compact
- notification/user controls use icon button language
- mobile menu should stay functional and light

Navbar should never compete with page content.

---

## 16. Status, Badges, And Alerts

### 16.1 Status Badges

Badges should be small and readable:
- `inline-flex`
- `px-2 py-0.5`
- `rounded`
- `text-[11px]`
- `font-medium`

Use semantic colors from `leadUtils` or a shared status helper.

Rules:
- badges describe state, not decoration
- keep label copy short
- do not mix multiple badge shapes on one page

### 16.2 Alerts

Alerts should be compact, bordered, and useful.

Alert anatomy:
- icon
- strong short title when needed
- direct body copy
- optional compact action

Avoid:
- toast-like full panels inside a page
- vague copy like "Something went wrong"
- long explanatory paragraphs

---

## 17. Empty, Loading, And Error States

### 17.1 Loading

Loading should preserve the eventual layout.

Rules:
- use skeletons for table pages
- skeleton rows should match table row density
- shimmer should be slow and subtle
- avoid spinners as the only loading state for large data pages

### 17.2 Empty States

Empty states should help the user recover:
- icon
- title
- one support line
- optional primary action only when obvious

No decorative illustrations for operational CRM tables.

### 17.3 Error States

Errors should be local to the failing surface when possible.

For page-level data failure:
- red/rose tinted panel
- alert icon
- short title
- actual error message if safe

---

## 18. Motion

### 18.1 Page Reveal

Current page reveal pattern:
- initial opacity 0
- slight blur
- slight downward translate
- reveal after about `40ms`
- transition duration around `400ms`

Use this for major CRM pages where the first render benefits from polish.

### 18.2 Interaction Motion

Allowed:
- hover color transitions
- focus ring transitions
- active button scale
- modal fade/zoom
- dropdown fade/slide
- table row hover

Timing:
- most UI transitions: `180ms` to `220ms`
- page reveal: around `400ms`

Avoid:
- bouncy motion
- large transforms
- staggered animation on every table row
- decorative motion that delays work

---

## 19. Responsive Rules

### 19.1 Desktop

Desktop CRM pages prioritize density:
- actions align to the right of headers
- upload pages can use two columns
- tables can scroll horizontally
- sticky tab docks stay visible

### 19.2 Tablet And Mobile

Rules:
- header actions wrap below title
- tab docks scroll horizontally
- tables keep horizontal scroll instead of crushing columns
- upload workflow stacks into one column
- modal widths become full width with `p-4` gutters

Do not hide critical table actions on mobile unless there is a clear alternate action menu.

---

## 20. Implementation Contract

### 20.1 Required CRM Classes

These classes are canonical for CRM pages:

| Class | Role |
| --- | --- |
| `app-shell` | CRM page/background shell |
| `app-panel` | Standard white bordered surface |
| `app-panel-muted` | Muted secondary panel |
| `app-section-bar` | Compact panel header/footer bar |
| `app-title` | Inner page title |
| `app-heading` | Section/panel heading |
| `app-subtitle` | Page supporting copy |
| `app-label` | Small field/filter label |
| `app-input` | Inputs and search fields |
| `app-btn-primary` | Primary actions |
| `app-btn-secondary` | Secondary actions |
| `app-icon-button` | Icon-only actions |
| `app-floating` | Dropdowns, tooltips, popovers |
| `app-modal-backdrop` | Modal overlay/backdrop |
| `app-modal` | Modal shell |
| `modal-title` | Modal title |
| `modal-subtitle` | Modal support copy |
| `modal-label` | Modal form label |
| `modal-helper` | Modal helper text |
| `modal-section-title` | Small modal section title |

### 20.2 Source Of Truth

Current global tokens, layout components, and utility classes live in:

```text
src/index.css
```

Future pages across all submodules (including CRM and HRMS) should extend this global stylesheet instead of defining one-off component styling systems.

### 20.3 Preferred Component Ingredients

Use:
- lucide-react icons
- Tailwind utility classes for local layout
- shared CRM classes for surface, type, and controls
- React portals for modals and clipped floating layers
- semantic status helpers for badges

Avoid:
- inline colors except for rare `color-mix` shell treatments
- repeated hard-coded card styles
- page-specific button systems
- arbitrary gradients outside primary/active states
- new fonts inside CRM screens

---

## 21. Page Recipes

### 21.1 Lead Queue Page

Use when the user manages a queue of records.

Recipe:
- sticky stage tab dock with counts
- compact header for active queue
- right-aligned Export and Add buttons
- search panel
- table panel
- modal actions

This is the canonical pattern from the current lead list.

### 21.2 Import Page

Use when the user uploads, validates, and reviews data.

Recipe:
- header
- main upload panel
- helper/checklist panel
- inline result alert
- preview table
- invalid rows download action

This is the canonical pattern from the current CSV upload page.

### 21.3 Record Detail Modal

Use when a row opens into a focused record.

Recipe:
- modal header with icon tile, title, status
- detail panel
- latest activity panel
- quick actions
- small metadata footer

This is the canonical pattern from the lead details modal.

### 21.4 Dashboard Overview Page

Use when the user needs a summary before drilling into work.

Recipe:
- compact title and subtitle
- 3-5 KPI cards
- one primary chart or trend panel
- one queue/table preview
- one attention panel for overdue or blocked items

Rules:
- the queue/table should remain the most useful region
- charts should explain work, not decorate the page
- avoid more than two chart panels in the first viewport

---

## 22. Quality Checklist

Before shipping a CRM page, check:

- Does the page start with useful work, not a hero?
- Is the page width appropriate for the task?
- Are primary actions obvious but not oversized?
- Are tables inside `app-panel` with `app-section-bar`?
- Do rows have clear primary and secondary text?
- Are table actions icon-based and stable?
- Are empty, loading, and error states handled?
- Are modals rendered through portals?
- Are modal headers consistent with the CRM modal language?
- Are green accents used deliberately?
- Is there only one primary action per local context?
- Does mobile stack without text collisions?
- Are colors coming from CRM tokens or semantic status helpers?
- Are gradients limited to primary/active states?

---

## 23. Final Direction

When uncertain, default to this:

- light green-tinted app canvas
- white panels with soft green borders
- compact page headers
- table-first workflow design
- sticky queue tabs for stage-based lists
- green only for primary and active states
- semantic colors for operational meaning
- strong row identity cells
- small uppercase table headers
- icon-only table actions
- compact modals with consistent headers
- useful loading and empty states
- restrained motion

The best Builder ERP CRM page should feel like a clean control room: quiet, structured, fast, and ready for the next action.
