# Mobile Learning App — Product and Design Brief

**Owner:** CTO / Software Engineering Lead  
**Design kickoff:** August 10, 2026  
**MVP design v1 due:** August 14, 2026  
**Complete app design due:** August 31, 2026  
**Working title:** Habitutor (confirm before external use)

## 1. Purpose

Create a mobile learning application that helps learners build a consistent study habit, access structured learning
content, learn with others, and understand their progress. The product should connect daily action to visible progress
and make returning each day feel worthwhile.

### Product promise

> A personalized learning companion that turns a learner's goal into a clear daily practice, supported by content,
> community, live instruction, and AI guidance.

### Initial product outcomes

- Learners can quickly understand what to do today.
- Learners return consistently and maintain a streak.
- Learners can consume videos, attend live classes, and practice.
- Learners can find peer support through forums or study buddies.
- Learners can see progress and understand what to improve next.
- Learners can purchase a package, subscription, or one-time product.
- Learners receive useful, timely reminders rather than notification spam.

## 2. Audience and assumptions

The initial audience has not yet been finalized. Until user research confirms it, design for a mobile-first learner who:

- has a specific skill or learning goal;
- studies in short sessions;
- needs structure and motivation;
- may have inconsistent connectivity or limited attention;
- expects simple onboarding and clear pricing.

Do not present these assumptions as validated facts. The CTO should confirm the primary learner segment, subject area,
countries, languages, age range, and accessibility needs before visual design is locked.

## 3. Experience principles

1. **Today first:** the next useful action should be obvious on app launch.
2. **Progress over pressure:** streaks motivate without shaming users who miss a day.
3. **One system:** practice, video, live classes, community, and AI all contribute to the same learning progress.
4. **Trust before purchase:** clearly explain package contents, price, renewal, cancellation, and access duration.
5. **AI with boundaries:** identify AI-generated guidance, allow correction, and direct users to human help when needed.
6. **Accessible by default:** readable contrast, scalable text, captions/transcripts, large touch targets, and
   non-color status indicators.
7. **Notification restraint:** every notification must be relevant, controllable, and linked to a useful destination.

## 4. Feature scope and expected behavior

### 4.1 Daily practice and streaks

The home experience shows today's practice, estimated duration, current streak, and weekly progress. Completing the
defined daily learning goal advances the streak. The empty, first-day, completed, missed-day, recovery, offline, and
error states must be designed.

**MVP:** one daily practice plan, completion state, streak count, weekly summary, reminder preference.  
**Later options:** streak freezes, flexible goals, challenges, leagues, social streaks.

### 4.2 Video materials

Users can browse or follow assigned lessons, play video, resume progress, use captions/transcripts, and mark a lesson
complete.

**MVP:** course/module list, lesson detail, video player, progress, transcript/captions state.  
**Later options:** downloads, playback speed, notes, bookmarks, quizzes embedded in video.

### 4.3 Live classes

Users can discover scheduled classes, see local time and instructor details, reserve a place, join, and access a
recording or follow-up state.

**MVP:** schedule, class detail, registration, add-to-calendar, join state, completed/cancelled states.  
**Open dependency:** confirm whether video delivery is native or through a third-party provider.

### 4.4 Community engagement

Community should support learning, not become a generic social feed.

**MVP candidate:** topic forums with posts, replies, reactions, report/block, and moderation states.  
**Alternative MVP:** study-buddy matching and direct messaging.  
**Decision required:** choose forums or study buddies for MVP; shipping both creates significantly more design,
engineering, safety, and moderation scope.

### 4.5 Dashboard and progress tracking

Users can review completed lessons, practice consistency, skill or course progress, recent activity, and recommended
next steps. Metrics must be understandable and tied to actions.

**MVP:** course completion, weekly activity, streak history, recent achievements, recommended next action.

### 4.6 Commerce

Users can compare offers, understand entitlements, purchase, confirm payment, restore purchases, and manage access.

**MVP:** package catalogue, offer detail, checkout handoff, success/failure states, entitlement status.  
**Decision required:** confirm platforms and billing route. Apple and Google policies can restrict external payment
flows for digital content. The engineer must validate the payment architecture before checkout UI is finalized.

### 4.7 Personalized AI assistant

The assistant helps users understand material, generate explanations or practice, and decide what to study next. It
should use relevant learning context and explain its limitations.

**MVP:** assistant entry point, suggested prompts, chat, loading/error states, source or lesson context, feedback,
conversation history, and safety notice.  
**Not assumed:** autonomous grading, unrestricted web answers, or professional advice.

### 4.8 Push notifications

Notifications may cover daily practice, upcoming live classes, relevant community activity, purchase/access events,
and personalized learning reminders.

**MVP:** permission pre-prompt, system permission state, notification preferences by category, deep-link destination,
and quiet-hours concept. Ask for system permission only after explaining the value.

## 5. Priority model

### Must be represented in MVP design v1

- onboarding and learning-goal setup;
- sign in/sign up;
- home / today's practice;
- daily practice completion and streak;
- video course and lesson;
- progress dashboard;
- pricing/package comparison and purchase entry;
- AI assistant core chat;
- push-notification permission rationale;
- one community direction;
- live-class discovery and registration.

### Can follow after MVP design v1

- complete states and edge cases for every feature;
- account, settings, support, accessibility, legal, and notification preferences;
- advanced community, advanced streak mechanics, downloads, rich notes, and expanded AI tools.

## 6. Core journeys to map before polishing screens

1. New learner → onboarding → chooses goal → receives first daily plan → completes practice.
2. Returning learner → sees today's task → watches lesson → completes practice → streak updates.
3. Learner → discovers live class → registers → receives reminder → joins class.
4. Learner → asks AI about current lesson → receives contextual answer → continues learning.
5. Learner → opens community → asks or answers a learning question → handles report/block if needed.
6. Free learner → compares offers → purchases → entitlement activates → accesses paid content.
7. Learner → opens dashboard → identifies weak area → starts recommended next activity.
8. Notification → deep link → relevant in-app destination → user can adjust preferences.

## 7. Required design states

Each applicable feature needs: first-use, loading, empty, populated, success, validation, error, offline/poor
connection, permission denied, locked/paid, and accessibility behavior. Community also needs deleted, reported,
blocked, and moderation states. Commerce needs pending, failed, cancelled, restored, expired, and refunded states.

## 8. Deliverables and definition of done

### UI/UX Designer

- assumptions and open-question log;
- competitor/reference review with lessons, not copied screens;
- information architecture and navigation model;
- user flows for all core journeys;
- low-fidelity wireframes;
- reusable component inventory and design system;
- high-fidelity mobile screens and responsive/device guidance;
- complete interaction, state, error, and accessibility annotations;
- clickable prototype for critical journeys;
- handoff-ready source with named components, tokens, assets, and developer notes.

### Graphic Designer

- visual territory/moodboard options based on the same product principles;
- approved logo/wordmark system and usage rules;
- color, typography, illustration, iconography, and image-direction guidance;
- app icon and launch/splash artwork;
- reusable illustration and icon library for onboarding, empty states, achievements, streaks, AI, community, video,
  and live classes;
- store-listing graphics and marketing templates once UI screenshots stabilize;
- editable source files, export presets, naming rules, licenses, and an asset manifest.

### Done means

A deliverable is not done because it looks polished. It is done when it covers the agreed flow and states, follows
the shared system, has been reviewed by the other designer and CTO, includes implementation notes, and is placed in
the agreed source-of-truth location.

## 9. How UI/UX and graphic design work in parallel

The graphic designer does not need to wait for finished UI. Start with shared foundations, then integrate through
stable contracts.

### Parallel workstreams

**UI/UX starts with:** information architecture, user flows, wireframes, component inventory, content hierarchy, and
state coverage using neutral placeholders.

**Graphic design starts with:** brand attributes, visual territories, logo exploration, color/typography proposals,
illustration grammar, icon grid, motion principles, and asset production rules.

**They converge on:** design tokens, component visual direction, asset slots and dimensions, accessibility, naming,
and export specifications. The UI/UX designer owns placement and interaction; the graphic designer owns the visual
asset and brand consistency; the CTO resolves product or technical constraints.

### Communication cadence

- **Daily, 15 minutes:** blockers, decisions needed, and files changing today.
- **Monday planning, 30 minutes:** weekly outcomes, dependencies, and owners.
- **Wednesday design pairing, 45 minutes:** UI and brand integration in the same key screens.
- **Friday review, 45 minutes:** prototype walkthrough and acceptance against the brief.
- **Async:** all decisions recorded in ClickUp; design comments remain in the design file; no final approvals only in
  chat.

### Stable handoff contract

1. Use one design source of truth with separate `Foundations`, `Components`, `UX`, `Brand Assets`, and `Prototype`
   pages.
2. Maintain shared token names for color, typography, spacing, radius, icon size, and motion.
3. UI/UX creates an asset request before graphic work begins: purpose, placement, dimensions/aspect ratio, theme,
   content, accessibility requirement, format, deadline, and approver.
4. Graphic design provides editable source plus approved exports and records license/source.
5. UI/UX reviews assets in context; graphic design reviews final screens for brand consistency.
6. CTO approves scope, behavior, technical feasibility, and final milestone acceptance.
7. Changes after approval require a ClickUp change request with impact on screens, assets, engineering, and date.

## 10. Decision rights

- **CTO:** product scope, technical constraints, data/privacy constraints, acceptance, and conflict resolution.
- **UI/UX Designer:** user flows, information architecture, interaction model, component behavior, and usability.
- **Graphic Designer:** brand system, illustration/icon style, image direction, asset quality, and brand compliance.
- **Shared:** accessibility, design tokens, visual hierarchy, and final in-context quality.

## 11. Kickoff agenda

1. Product vision, learner problem, and success definition — 15 minutes.
2. Walk through features and clarify MVP versus later — 20 minutes.
3. Confirm audience assumptions and list research gaps — 15 minutes.
4. Review core journeys and technical constraints — 20 minutes.
5. Agree responsibilities, source of truth, file structure, and approval process — 15 minutes.
6. Review timeline, KPIs, ClickUp tasks, and next 48-hour outputs — 20 minutes.
7. Questions and decision log — 15 minutes.

## 12. Decisions required during kickoff

- Primary user segment, learning subject, age range, countries, languages, and platforms.
- Brand attributes and any existing brand constraints.
- Forum or study-buddy MVP direction.
- Definition of a completed daily practice and streak recovery policy.
- Content source, video hosting, and live-class provider.
- AI model/provider, allowed data context, retention, safeguards, and escalation.
- Subscription/package model and app-store billing approach.
- Accessibility target and supported device baseline.
- Analytics events and product success metrics.
- Final approval owner and revision limits.
