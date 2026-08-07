# ClickUp Setup for the Design Project

## Recommended hierarchy

- **Space:** Mobile App
- **Folder:** Design — August 2026
- **Lists:** Product Decisions, UX/UI, Brand & Graphics, Reviews & Handoff, Post-Milestone Revisions
- **Milestones:** MVP Design v1 — August 14; Complete App Design — August 31

## Statuses

Use a short shared workflow:

`Backlog → Ready → In Progress → Internal Review → Cross-Design Review → CTO Review → Changes Requested → Accepted`

Use `Blocked` only when the owner names the blocker and the person needed to resolve it. `Accepted` is the definition
of done; completing the production work alone does not close a task.

## Custom fields

- **Role:** CTO, UI/UX, Graphic Design, Shared
- **Deliverable type:** Decision, Flow, Wireframe, Screen, Component, Prototype, Asset, Research, Handoff
- **Milestone:** MVP v1, Complete Design, Revision
- **Feature:** Onboarding, Practice, Streak, Video, Live Class, Community, Progress, Commerce, AI, Notifications, System
- **Reviewers:** UI/UX, Graphic Design, CTO, Engineering
- **Source link:** direct link to the relevant design frame, prototype, brief section, or asset folder
- **Acceptance criteria:** task-specific observable completion requirements
- **Decision needed by:** deadline for a blocking product decision
- **Change type:** Defect, Clarification, Scope Change

## Task-writing template

**Outcome:** one sentence describing the user or team result.  
**Inputs:** links to brief, approved decisions, dependencies, and asset requests.  
**Deliverables:** exact frames, flows, assets, files, or records expected.  
**Acceptance criteria:** observable checks that allow the reviewer to accept or reject.  
**Reviewers:** cross-discipline reviewer first, CTO last where milestone acceptance is needed.  
**Dependencies:** linked ClickUp tasks, not dependency notes hidden in comments.

## Assignment rules

- Give every task one accountable owner, even when several people collaborate.
- Create separate UI/UX and graphic subtasks when one deliverable has different acceptance criteria.
- UI/UX owns flow, hierarchy, placement, interaction, and component behavior.
- Graphic Design owns visual identity, icon/illustration quality, image direction, and asset production.
- CTO owns product decisions, technical constraints, scope changes, and milestone acceptance.
- Require cross-design review before CTO review for any user-facing visual milestone.
- Do not use “design app” or “make graphics” as tasks; each task should produce a reviewable outcome.

## Recurring tasks

- **Daily design sync:** weekdays, 15 minutes; each person posts yesterday/today/blockers before the meeting.
- **Decision-log review:** weekdays, owned by CTO; close or date every open blocking decision.
- **Cross-design pairing:** Wednesdays, 45 minutes.
- **Milestone review:** Fridays, 45 minutes, plus final review on Monday, August 31.
- **KPI update:** Fridays after review; metrics are coaching and delivery signals, not a substitute for judgment.

## Handling revisions

After August 31, every request must be labelled:

- **Defect:** the output fails the approved brief or acceptance criteria.
- **Clarification:** implementation detail is missing but scope is unchanged.
- **Scope change:** new behavior, screen, feature, visual direction, or business rule.

Only defects and clarifications enter the revision list directly. Scope changes require CTO approval and documented
impact before assignment.

The companion `06-clickup-tasks.csv` provides the initial backlog. Check ClickUp's current CSV field-mapping screen
during import because custom field names and date parsing can vary by workspace configuration.
