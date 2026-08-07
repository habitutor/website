# Mobile App Design Timeline

**Period:** August 10–31, 2026  
**Milestone 1:** MVP design v1 by Friday, August 14  
**Milestone 2:** Complete app design by Monday, August 31  
**After August 31:** revisions, usability fixes, and engineering clarifications only

## Delivery interpretation

This schedule is achievable only with a strict definition of each milestone:

- **MVP design v1** means a reviewable, high-fidelity direction and clickable prototype for the critical happy paths,
  supported by mapped flows and a starter component system. It is not production-final coverage of every edge case.
- **Complete app design** means all agreed screens, states, reusable components, assets, annotations, and critical
  prototypes are ready for engineering handoff.
- New features requested after kickoff move to the backlog unless the CTO explicitly trades out equivalent scope.

The full feature set is large for three weeks. The CTO must answer open questions quickly, choose one community model
for MVP, and prevent late scope expansion.

## Phase 1 — Kickoff and MVP design v1

### Monday, August 10 — Alignment and foundations

**Shared**

- Run the kickoff using the product brief.
- Confirm primary audience, platforms, MVP boundaries, forum versus study-buddy direction, and approval owner.
- Agree on design file structure, naming, asset-request format, review cadence, and decision log.
- Review technical constraints for authentication, video, live classes, AI, notifications, analytics, and payments.

**UI/UX Designer**

- Draft information architecture and navigation.
- Map the eight core journeys at a high level.
- Create the screen and state inventory.

**Graphic Designer**

- Translate agreed brand attributes into two or three visual territories.
- Start typography, color, imagery, illustration, and icon references.
- Audit existing brand assets and identify missing rights or source files.

**Gate:** CTO approves audience assumption, MVP boundary, navigation hypothesis, brand attributes, and technical
constraints before the team finishes for the day.

### Tuesday, August 11 — Flow and visual direction

**UI/UX Designer**

- Complete detailed flows for onboarding, today's practice, streak, video lesson, dashboard, purchase, and AI.
- Create low-fidelity wireframes for the critical journeys.
- Define content hierarchy and neutral asset slots.

**Graphic Designer**

- Present visual territories with rationale and accessibility considerations.
- Propose initial type, color, icon, illustration, and motion principles.
- Draft app-icon concepts.

**Shared**

- Review wireframes and visual territories together.
- Select one visual direction and record decisions.

**Gate:** CTO selects the direction by end of day; unresolved preference changes cannot delay Wednesday integration.

### Wednesday, August 12 — System and high-fidelity build

**UI/UX Designer**

- Establish component foundations and tokens with the Graphic Designer.
- Produce high-fidelity onboarding, home/today, daily practice, streak, video lesson, and dashboard screens.
- Include loading, empty, completion, locked, and error examples on key patterns.

**Graphic Designer**

- Refine the approved visual direction into usable foundations.
- Produce first priority assets for onboarding, streak/achievement, AI, and empty states.
- Define icon grid, illustration grammar, export formats, and naming rules.

**Shared pairing**

- Integrate real assets into key screens.
- Test contrast, text scaling assumptions, visual hierarchy, and asset cropping.

### Thursday, August 13 — MVP prototype and quality pass

**UI/UX Designer**

- Add live-class discovery/registration, selected community model, offer comparison/purchase entry, AI chat, and
  notification rationale.
- Connect the MVP v1 prototype.
- Run a structured internal walkthrough and fix task blockers.

**Graphic Designer**

- Complete MVP-priority assets and app-icon direction.
- Review all prototype screens for brand consistency.
- Correct asset specifications and accessibility issues.

**Shared**

- Perform pre-review against milestone acceptance criteria.
- Submit unresolved decisions to the CTO before noon.

### Friday, August 14 — MVP design v1 milestone

- Conduct a prototype walkthrough of every critical happy path.
- Review scope coverage, visual direction, component reuse, accessibility, and technical feasibility.
- Capture feedback as severity-ranked ClickUp tasks; do not resolve feedback live in the meeting.
- CTO accepts, conditionally accepts with named corrections, or rejects with explicit unmet criteria.
- Freeze the approved navigation, visual direction, and core component foundations.

**MVP v1 acceptance criteria**

- Core flows are mapped.
- Critical happy paths are present in a clickable prototype.
- The visual direction is coherent in real screens.
- Starter tokens and reusable components exist.
- Priority graphic assets are integrated in context.
- No known blocker prevents engineering from estimating implementation.

## Phase 2 — Complete product coverage

### Monday–Tuesday, August 17–18 — Remaining feature depth

**UI/UX:** finish complete flows and screen coverage for live classes, the selected community model, commerce,
AI assistant, notifications, profile, and settings.  
**Graphic:** refine logo/wordmark if in scope, complete core icon and illustration families, and prepare launch/splash
artwork.  
**Shared:** pair daily on newly integrated screens and record system changes.

### Wednesday–Friday, August 19–21 — States, safety, and first full review

**UI/UX:** add empty, loading, offline, error, permission, locked, payment, moderation, account, and accessibility
states. Expand the design system and responsive/device notes.  
**Graphic:** complete state illustrations, achievement/streak assets, class/video/community/AI iconography, and asset
manifest entries.  
**Friday gate:** first complete screen inventory review; every missing item receives an owner and due date.

## Phase 3 — Validation and handoff readiness

### Monday–Tuesday, August 24–25 — Prototype and usability validation

- Connect critical end-to-end prototypes.
- Run usability sessions with at least five representative learners when available.
- If representative learners are unavailable, run a structured internal test and mark the evidence as provisional.
- Prioritize task blockers, irreversible-error risks, trust issues, and accessibility defects.
- Avoid polishing low-risk details while critical defects remain.

### Wednesday–Thursday, August 26–27 — Fixes and engineering review

**UI/UX**

- Resolve critical and high-priority findings.
- Complete component variants, tokens, interaction notes, copy states, and analytics-event annotations.
- Walk engineering through complex behavior and confirm feasible patterns.

**Graphic**

- Resolve in-context asset issues.
- Complete source/export packages, safe areas, dark/light variants where required, licensing, and usage guidance.
- Prepare store-listing templates using stable approved UI frames.

### Friday, August 28 — Handoff candidate

- Lock feature scope and submit the handoff candidate.
- Audit screen/state inventory, component reuse, asset links, prototype links, specifications, accessibility, and
  licenses.
- Engineering performs an implementability review.
- All remaining blockers must have an owner and a due date no later than August 31.

### Monday, August 31 — Complete app design milestone

- Resolve handoff blockers only.
- Run the final design, brand, accessibility, and engineering acceptance review.
- CTO signs off on the complete design baseline.
- Version and archive the approved design; create a revision branch/page for later changes.
- Move incomplete enhancements to the post-MVP backlog instead of silently extending the milestone.

## After August 31 — Revision-only period

Allowed work:

- corrections from usability findings;
- accessibility fixes;
- engineering clarifications and feasibility adjustments;
- copy corrections;
- asset export fixes;
- defects against the approved brief.

Not revision work:

- a new feature;
- a new navigation model;
- a new brand direction;
- replacing the selected community model;
- changing the business model or purchase architecture.

Those items require change control: requester, reason, impact, owner, priority, screens/assets affected, engineering
impact, and revised date.

## Working rhythm

- Daily 15-minute design sync.
- Same-day CTO response target for milestone-blocking decisions.
- Wednesday integration pairing.
- Friday formal review and acceptance.
- ClickUp contains assignments, due dates, dependencies, decisions, and acceptance.
- The design tool contains design discussion and in-context comments.
- Chat is for coordination, not final decisions or approvals.
