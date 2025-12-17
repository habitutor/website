# 📋 Rancangan Dashboard Admin

**Tanggal Dibuat:** 16 Desember 2025  
**Tanggal Selesai:** 17 Desember 2025  
**Branch:** `admin/frontend`  
**Status:** ✅ COMPLETED (Core Features)

---

## 🎉 SUMMARY - IMPLEMENTASI SELESAI!

**Admin Dashboard telah selesai diimplementasikan dengan fitur:**

✅ **Authentication & Authorization**
- Role-based login redirect (admin → `/admin/dashboard`, user → `/dashboard`)
- Protected admin routes dengan middleware
- Admin-only sidebar navigation

✅ **Practice Pack Management**
- List, Create, Edit, Delete practice packs
- Search & filter functionality
- Practice pack detail page
- Clickable navigation dari list ke detail

✅ **Question Management**
- Create questions inline dalam practice pack
- Edit questions dengan dedicated page
- Questions Bank untuk browse semua questions
- Usage tracking ("Used in X packs")
- Smart delete warnings

✅ **Question-Pack Relationships**
- Add existing questions ke pack (modal dengan search)
- Remove questions dari pack
- Display questions dengan order badges
- Create & add questions simultaneously

✅ **Answer Options Management**
- 4 answer options (A-D) per question
- Edit answer content & mark correct
- Validation: minimal 1 correct answer
- Simultaneous update all answers

✅ **User Experience**
- Toast notifications untuk feedback
- Loading states dengan skeletons
- Empty states yang informatif
- Confirmation dialogs untuk destructive actions
- Auto-redirect setelah success operations
- Query invalidation untuk data consistency

**Total Files Created/Modified:** 15+ files
**Total Backend Endpoints:** 16 endpoints (all working)
**Lines of Code:** ~2000+ lines

---

## ⚠️ PENTING: BACA SEBELUM CODING

**WAJIB dilakukan sebelum menulis kode:**

1. **Pelajari Codebase Terlebih Dahulu**
   - Baca dan pahami struktur file yang ada
   - Perhatikan pola penulisan kode yang sudah ada
   - Lihat bagaimana component, route, dan API client digunakan
   - Ikuti konvensi penamaan yang sudah diterapkan

2. **Konsistensi dengan Existing Code**
   - Ikuti pattern yang sama dengan code yang sudah ada
   - Gunakan component yang sudah tersedia di `apps/web/src/components/ui/`
   - Ikuti struktur import yang konsisten
   - Gunakan utility function yang sudah ada (contoh: `cn()` dari `@/lib/utils`)

3. **Larangan Mutlak**
   - ❌ JANGAN gunakan emoji dalam kode
   - ❌ JANGAN menulis komentar yang tidak profesional
   - ❌ JANGAN membuat component baru jika sudah ada yang serupa
   - ❌ JANGAN mengubah design system yang sudah ada

4. **Aturan Komentar**
   - Komentar harus profesional dan ringkas
   - Hanya tulis komentar untuk logika yang kompleks
   - Gunakan JSDoc untuk function/component yang kompleks
   - Hindari komentar yang redundan atau jelas dari kodenya

5. **Penamaan yang Profesional**
   - Gunakan camelCase untuk variable dan function
   - Gunakan PascalCase untuk component dan type
   - Gunakan SCREAMING_SNAKE_CASE untuk constant
   - Nama harus deskriptif dan jelas tanpa singkatan ambigu

---

## 🎯 Tujuan

Membuat dashboard admin untuk mengelola:
- Practice Packs (paket latihan soal)
- Questions (soal-soal)
- Answer Options (pilihan jawaban)
- Hubungan antara Questions dan Practice Packs

---

## 📊 Analisis Situasi

### ✅ Yang Sudah Ada

1. **Database Schema**
   - Tabel `user` dengan field `role` (default: "user")
   - Support untuk multi-role authentication

2. **Backend API** (DONE ✅)
   - Middleware `requireAdmin` di `packages/api/src/middlewares/rbac.ts`
   - Instance `admin` yang sudah ter-protect
   - Semua endpoint admin di `packages/api/src/routers/admin/practice-pack.ts`:
     - Practice Pack CRUD
     - Question CRUD
     - Question-Pack Relationship
     - Answer Options CRUD

3. **Frontend Structure**
   - Route `_auth` untuk login/register
   - Route `_authenticated` untuk user dashboard
   - Auth client dengan session management
   - **✅ Route `_admin` dengan protection (DONE)**
   - **✅ Role-based redirect di login (DONE)**

### ✅ Yang Sudah Dibuat (Latest: 17 Desember 2025)

1. **Admin Authentication Flow** ✅
   - Login dengan role-based redirect
   - Admin → `/admin/dashboard`
   - User → `/dashboard`

2. **Admin Layout & Protection** ✅
   - `_admin.tsx` layout route
   - Redirect ke `/login` jika tidak login
   - Redirect ke `/dashboard` jika bukan admin

3. **Admin Sidebar Component** ✅
   - Navigation menu (Dashboard, Practice Packs, Questions, Users)
   - Logout functionality dengan confirmation dialog
   - Active state highlighting

4. **Admin Dashboard Landing** ✅
   - `/admin/dashboard` route
   - Stat cards (Total Users, Practice Packs, Questions, Active Sessions)
   - Layout dengan sidebar

5. **Practice Pack Management** ✅
   - List practice packs dengan search & delete
   - Create practice pack form
   - Practice pack detail page
   - Edit pack info (inline toggle form)
   - Navigate dari list ke detail (clickable cards)

6. **Question Management dalam Pack** ✅
   - Create question inline form (dengan 4 answer options A-D)
   - Display questions list dalam pack (dengan order badges)
   - Remove question dari pack (dengan confirmation)
   - Add existing question ke pack (modal dengan search)
   - Edit button pada setiap question card

7. **Question Edit Page** ✅
   - Edit question content & discussion
   - Manage 4 answer options (A-D)
   - Mark correct answers
   - Success feedback dengan toast & redirect
   - Query invalidation untuk data consistency

8. **Questions Bank Page** ✅
   - List all questions dengan search
   - Usage badge ("Used in X packs" atau "Unused")
   - Edit & delete buttons
   - Smart delete warning (jika question dipakai di pack)
   - Empty states untuk no questions & search results

9. **Backend Enhancements** ✅
   - `getPackQuestions` - GET questions dalam specific pack
   - `listAllQuestions` - GET all questions dengan pack count
   - `getQuestionDetail` - GET question + answer options
   - All endpoints properly exported dan tested

### ❌ Yang Belum Ada

1. UI untuk user management belum ada (future feature)

---

## 🚀 Strategi Implementasi

### **Opsi Dipilih: Single Login Point** ⭐

**Alur Authentication:**
```
User Login
    ↓
Check Role
    ├─→ role = "admin" → Redirect ke /admin/dashboard
    └─→ role = "user"  → Redirect ke /dashboard
```

**Keuntungan:**
- User experience lebih baik (satu login untuk semua)
- Maintenance lebih mudah
- Admin tidak perlu URL khusus

---

## 📁 Struktur File yang Akan Dibuat

### User Flow Terpilih ⭐

**Primary Flow: Practice Pack Detail → Create Question Langsung**
```
/admin/practice-packs → Klik Card → /admin/practice-packs/{id}
└── Di halaman detail pack:
    ├── Info practice pack (title, description, edit)
    ├── List questions dalam pack (dengan order)
    ├── Button "Create New Question" → Form inline/modal
    │   └── Setelah submit → langsung add ke pack + buat answers
    └── Button "Add Existing Question" → Modal search existing questions
```

**Secondary Flow: Questions Bank untuk Management**
```
/admin/questions
└── Bank soal untuk:
    ├── Search/filter semua questions
    ├── Lihat usage: "Used in X packs" atau "Unused"
    ├── Edit question (affects all packs using it)
    └── Delete question (dengan warning jika dipakai)
```

### File Structure

```
apps/web/src/routes/_admin/admin/
├── dashboard.tsx                        # ✅ Dashboard admin landing
│
├── practice-packs/
│   ├── index.tsx                        # ✅ List practice packs
│   ├── create.tsx                       # ✅ Create practice pack form
│   └── $id.tsx                          # ✅ Detail pack + manage questions
│       └── -components/
│           ├── create-question-form.tsx # ✅ Inline create question
│           ├── edit-pack-form.tsx       # ✅ Edit pack info
│           └── add-existing-modal.tsx   # ✅ Search & add existing question
│
├── questions/
│   ├── index.tsx                        # ✅ Bank soal (all questions)
│   └── $id.tsx                          # ✅ Edit question + manage answers
│
└── users/
    └── index.tsx                        # ⬜ User management (future)

apps/web/src/components/admin/
└── sidebar.tsx                          # ✅ Admin sidebar navigation
```

**Legend:**
- ⬜ Belum dibuat (future features)
- ✅ Sudah selesai dan tested
- 🚧 Sedang dikerjakan

---

## 🔐 Security & Protection

### Frontend Protection

**File:** `apps/web/src/routes/_admin.tsx`
```typescript
beforeLoad: async () => {
  const session = await getUser();
  
  // Redirect jika bukan admin
  if (!session || session.user.role !== 'admin') {
    throw redirect({ to: '/dashboard' });
  }
  
  return { session };
}
```

### Backend Protection (Already Done ✅)

**File:** `packages/api/src/middlewares/rbac.ts`
```typescript
export const requireAdmin = o.middleware(async ({ context, next }) => {
  if (context.session?.user.role !== "admin") 
    throw new ORPCError("UNAUTHORIZED");
  return next();
});
```

---

## 🎨 Fitur Dashboard Admin

### Database Schema Understanding

**Tables:**
- `practice_pack`: id, title, description
- `question`: id, content, discussion
- `question_answer_option`: id, questionId, code (A/B/C/D), content, isCorrect
- `practice_pack_questions`: practicePackId, questionId, order (relationship table)

**Key Constraints:**
- Answer option `code` is unique per question (A, B, C, D)
- Practice pack questions use composite primary key (packId + questionId)
- Cascade delete: Delete pack → deletes all pack-question relations
- Cascade delete: Delete question → deletes all answer options

### API Endpoints Reference

**Practice Pack CRUD:**
```typescript
orpc.admin.practicePack.listPacks()           // GET /admin/practice-packs
orpc.admin.practicePack.createPack()          // POST /admin/practice-packs
orpc.admin.practicePack.updatePack()          // PUT /admin/practice-packs/{id}
orpc.admin.practicePack.deletePack()          // DELETE /admin/practice-packs/{id}
```

**Question CRUD:**
```typescript
orpc.admin.practicePack.createQuestion()      // POST /admin/questions
orpc.admin.practicePack.updateQuestion()      // PUT /admin/questions/{id}
orpc.admin.practicePack.deleteQuestion()      // DELETE /admin/questions/{id}
orpc.admin.practicePack.listAllQuestions()    // GET /admin/questions (with packCount)
orpc.admin.practicePack.getQuestionDetail()   // GET /admin/questions/{id} (with answers)
```

**Question-Pack Relationship:**
```typescript
orpc.admin.practicePack.getPackQuestions()    // GET questions in specific pack (with order)
orpc.admin.practicePack.addQuestionToPack()   // POST /admin/practice-packs/{packId}/questions
orpc.admin.practicePack.removeQuestionFromPack() // DELETE /admin/practice-packs/{packId}/questions/{qId}
orpc.admin.practicePack.updateQuestionOrder() // PATCH /admin/practice-packs/{packId}/questions/{qId}
```

**Answer Options CRUD:**
```typescript
orpc.admin.practicePack.createAnswerOption()  // POST /admin/questions/{qId}/answers
orpc.admin.practicePack.updateAnswerOption()  // PUT /admin/answers/{id}
orpc.admin.practicePack.deleteAnswerOption()  // DELETE /admin/answers/{id}
```

### 1. Practice Pack Management ✅ COMPLETED

**Halaman:** `/admin/practice-packs`

**Fitur:**
- ✅ List semua practice packs (card view dengan hover effects)
- ✅ Search/filter practice packs
- ✅ Button "Create New Pack"
- ✅ Clickable cards navigate ke detail page
- ✅ Delete button dengan confirmation dialog
- ✅ Edit pack info di detail page (inline toggle form)
- ✅ Empty state handling

**API Endpoints:**
- ✅ `GET /admin/practice-packs` - List packs
- ✅ `POST /admin/practice-packs` - Create pack
- ✅ `PUT /admin/practice-packs/{id}` - Update pack
- ✅ `DELETE /admin/practice-packs/{id}` - Delete pack

---

### 2. Question Management ✅ COMPLETED

**Halaman:** `/admin/questions` (Questions Bank)

**Fitur:**
- ✅ List semua questions (card view)
- ✅ Search questions by content
- ✅ Usage badge ("Used in X packs" atau "Unused")
- ✅ Create question (inline dalam practice pack detail)
- ✅ Edit question (dedicated edit page)
- ✅ Delete question dengan confirmation
- ✅ Smart delete warning jika question dipakai di pack
- ✅ Preview question content & discussion
- ✅ Empty states untuk no questions & search results

**API Endpoints:**
- ✅ `POST /admin/questions` - Create question
- ✅ `PUT /admin/questions/{id}` - Update question
- ✅ `DELETE /admin/questions/{id}` - Delete question
- ✅ `GET /admin/questions` - List all questions with pack count
- ✅ `GET /admin/questions/{id}` - Get question detail with answers

---

### 3. Question-Pack Relationship ✅ COMPLETED

**Halaman:** `/admin/practice-packs/{id}` (Practice Pack Detail)

**Fitur:**
- ✅ List questions dalam pack (dengan order badges)
- ✅ Add existing question ke pack (modal dengan search)
- ✅ Remove question dari pack (dengan confirmation)
- ✅ Create new question inline (langsung add ke pack)
- ✅ Show preview setiap question (content & discussion)
- ✅ Edit button pada setiap question → navigate ke edit page
- ⬜ Drag-and-drop untuk reorder questions (future enhancement)

**API Endpoints:**
- ✅ `GET /admin/practice-packs/{id}/questions` - Get pack questions with order
- ✅ `POST /admin/practice-packs/{practicePackId}/questions` - Add question to pack
- ✅ `DELETE /admin/practice-packs/{practicePackId}/questions/{questionId}` - Remove from pack
- ✅ `PATCH /admin/practice-packs/{practicePackId}/questions/{questionId}` - Update order (available, not used in UI yet)

---

### 4. Answer Options Management ✅ COMPLETED

**Halaman:** `/admin/questions/{id}` (Question Edit Page)

**Fitur:**
- ✅ Display 4 answer options (A, B, C, D)
- ✅ Edit content untuk setiap answer option
- ✅ Edit answer option content
- ✅ Mark as correct answer (checkbox)
- ✅ Validation: minimal 1 correct answer required
- ✅ Update all answers simultaneously
- ✅ Success feedback dengan toast & redirect

**API Endpoints:**
- ✅ `POST /admin/questions/{questionId}/answers` - Create answer (used in create question flow)
- ✅ `PUT /admin/answers/{id}` - Update answer
- ⬜ `DELETE /admin/answers/{id}` - Delete answer (not exposed in UI, answers fixed at 4)

---

### 5. Admin Dashboard Landing ✅ BASIC COMPLETED

**Halaman:** `/admin/dashboard`

**Fitur:**
- ✅ Basic dashboard layout dengan sidebar
- ✅ Statistics cards (placeholder):
  - Total practice packs
  - Total questions
  - Total users
  - Active sessions
- ⬜ Real statistics (future: connect ke actual data)
- ⬜ Quick actions (future enhancement)
- ⬜ Recent activities (future enhancement)
  - Create new pack
  - Create new question
- [ ] Recent created/updated items

---

## 🎨 Design System & Color Palette

### Referensi Design

Berdasarkan UI Figma dashboard user yang sudah ada, kita akan menggunakan design system yang konsisten.

### Color Palette (Dari CSS Variables)

**Primary Colors:**
- `--primary`: oklch(0.35 0.1 267.96) - Warna ungu/biru tua utama
- `--primary-foreground`: oklch(0.985 0 0) - Putih untuk text di atas primary
- `--primary-support`: oklch(0.88 0.05 229.77) - Light blue untuk background support

**Secondary Colors:**
- `--secondary`: oklch(0.91 0.11 91.55) - Kuning/lime untuk accent
- `--secondary-foreground`: var(--primary) - Text color untuk secondary background
- `--tertiary`: oklch(0.43 0.1 154.12) - Hijau untuk success/tertiary actions

**Neutral Colors:**
- `--background`: oklch(0.98 0.01 242.83) - Background utama (light blue-ish)
- `--foreground`: oklch(0.32 0 0) - Text color utama
- `--muted`: oklch(0.97 0 0) - Background muted
- `--muted-foreground`: oklch(0.556 0 0) - Text muted
- `--neutral`: oklch(0.99 0.01 84.58) - Neutral background

**Functional Colors:**
- `--destructive`: oklch(0.577 0.245 27.325) - Red untuk delete/danger
- `--border`: oklch(0.922 0 0) - Border color
- `--card`: oklch(1 0 0) - White untuk card background

### Component Patterns (Dari Referensi Figma)

#### 1. Navigation Tabs (Header)
```
Lokasi: Top navigation (Dashboard, Kelas, Tryout, Premium)
Style: 
  - Background: transparent
  - Active state: bg-primary-support (light blue)
  - Text: text-foreground
  - Border radius: rounded-sm
  - Padding: px-6 py-2
```

**Implementasi:**
- Gunakan component `Button` dengan variant `navbar`
- Atau buat custom navigation sesuai pattern yang ada

#### 2. Cards

**Large Feature Cards** (seperti "300 Materi dipelajari", "720 Tryout terakhir"):
```tsx
<Card className="rounded-xl border-none shadow-sm">
  <CardContent className="p-6">
    {/* Content with mascot illustration */}
  </CardContent>
</Card>
```

**Stat Cards** (seperti card streak flashcard):
```
Background: bg-primary (dark blue)
Text: text-primary-foreground (white)
Border radius: rounded-xl
Shadow: shadow-sm
Illustration: Mascot character di sisi kanan
```

**Color Variations:**
- Blue card: `bg-primary` (Progress/Stats)
- Green card: `bg-tertiary` (Success/Completion)
- Light blue card: `bg-primary-support` (Info/Support)
- Yellow card: `bg-secondary` (Highlight/Warning)

#### 3. Buttons

**Primary Button** (dari "Join Discord", "Join Whatsapp"):
```
Variant: default atau custom
Background: bg-primary (Discord) / bg-tertiary (WhatsApp)
Text: text-primary-foreground
Border radius: rounded-md
Padding: px-6 py-2
Icon: Dengan icon di kiri
Shadow: shadow-xs
```

**Secondary Buttons** (dari "Video Materi", "Catatan Materi", "Quiz"):
```
Colors:
  - Video: bg-primary (blue)
  - Notes: bg-secondary (yellow)  
  - Quiz: bg-primary-support (light blue)
Border radius: rounded-md
Icon: Dengan icon
Font weight: font-medium
```

**Implementasi:**
- Gunakan component `Button` yang sudah ada
- Variants tersedia: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Sizes tersedia: `sm`, `default`, `lg`, `icon`

#### 4. Avatar/Profile

```
Component: Avatar
Size: size-8 atau custom
Border radius: rounded-md (bukan rounded-full)
Background fallback: bg-secondary
```

#### 5. Alert/Banner

Seperti "Download Aplikasi Sekarang!" banner:
```
Background: bg-secondary (yellow)
Text: text-secondary-foreground
Border radius: rounded-md
Padding: p-4
Icon/Illustration: Mascot di kanan
Close button: X button di kanan atas
```

#### 6. Typography

**Font Family:** Plus Jakarta Sans Variable (sudah di-import di `apps/web/src/index.css`)

**Headings (dari referensi Figma):**
```
H1 (Page Title): text-3xl font-bold
  Contoh: "Halo, Melinda!" 

H2 (Section Title): text-2xl font-semibold
  Contoh: "Progress Kamu!"

H3 (Card Title/Stats): text-xl font-semibold
  Contoh: "300 Materi dipelajari"

Body (Regular Text): text-base font-normal
  Contoh: "Yuk lanjutkan perjalanan hariammu!"

Small (Muted/Secondary): text-sm font-normal
  Contoh: "Subtest", badge text

Button Text: text-sm font-medium
  Semua button menggunakan font-medium
```

**Text Colors:**
- Primary text: `text-foreground` (oklch(0.32 0 0) - Dark gray/black)
- Muted text: `text-muted-foreground` (oklch(0.556 0 0) - Medium gray)
- Accent text: `text-primary` (oklch(0.35 0.1 267.96) - Dark blue)
- On colored backgrounds: `text-primary-foreground` atau `text-secondary-foreground`

**Font Weights:**
- Headings: `font-bold` (700) atau `font-semibold` (600)
- Body: `font-normal` (400)
- Buttons/CTAs: `font-medium` (500)

### Admin-Specific Design Decisions

**Dashboard Admin akan menggunakan:**

1. **Layout:**
   - Sidebar navigation (berbeda dari user dashboard yang pake top nav)
   - White/light background untuk content area
   - Cards untuk grouping content

2. **Color Usage:**
   - Primary (blue) untuk navigation active state
   - Secondary (yellow) untuk highlight/warning
   - Tertiary (green) untuk success messages
   - Destructive (red) untuk delete actions
   - Neutral untuk backgrounds

3. **Components to Reuse:**
   - ✅ `Button` - Untuk semua button actions
   - ✅ `Card` - Untuk grouping content
   - ✅ `Input` - Untuk form fields
   - ✅ `Label` - Untuk form labels
   - ✅ `Avatar` - Untuk user profile
   - ✅ `AlertDialog` - Untuk confirmations
   - ✅ `DropdownMenu` - Untuk action menus
   - ✅ `Skeleton` - Untuk loading states
   - ⚠️  Table - Perlu dicek apakah sudah ada, jika tidak buat yang konsisten

4. **Spacing System:**
   - Gunakan Tailwind spacing: 2, 4, 6, 8, 12, 16, 24
   - Gap between elements: gap-4 atau gap-6
   - Padding cards: p-6
   - Container padding: px-6 atau px-8

5. **Border & Shadows:**
   - Border radius: `rounded-md` (default) atau `rounded-xl` (cards)
   - Borders: `border` dengan `border-border` color
   - Shadows: `shadow-xs` atau `shadow-sm`

### Design Consistency Checklist

Sebelum membuat component baru, pastikan:
- [ ] Sudah cek apakah ada component serupa di `apps/web/src/components/ui/`
- [ ] Menggunakan CSS variables yang sudah ada (jangan hardcode colors)
- [ ] Menggunakan Tailwind classes yang konsisten
- [ ] Border radius mengikuti design system
- [ ] Spacing mengikuti pattern yang ada
- [ ] Font menggunakan Plus Jakarta Sans
- [ ] Hover/focus states mengikuti pattern yang ada

### ✅ Validasi Design System dengan Figma

**Status:** SESUAI ✅

**Verifikasi:**
1. **Typography** ✅
   - Font: Plus Jakarta Sans Variable (sudah di-import)
   - Sizes dan weights sesuai dengan UI Figma
   - Hierarchy jelas (H1, H2, H3, Body, Small)

2. **Color Palette** ✅
   - Primary (dark blue): Terlihat di buttons dan cards - MATCH
   - Secondary (yellow): Terlihat di banner dan accent buttons - MATCH
   - Tertiary (green): Terlihat di success elements - MATCH
   - Primary Support (light blue): Terlihat di info cards - MATCH
   - Background: Light blue-ish white - MATCH
   - Semua warna menggunakan CSS variables yang sudah ada

3. **Component Styling** ✅
   - Border radius: `rounded-md` dan `rounded-xl` - MATCH
   - Shadows: `shadow-xs` dan `shadow-sm` - MATCH
   - Spacing: Consistent dengan Tailwind scale - MATCH
   - Avatar: `rounded-md` (bukan circle) - MATCH

4. **Button Variants** ✅
   - Primary: bg-primary dengan icon - MATCH
   - Secondary: bg-secondary (yellow) - MATCH
   - Tertiary: bg-tertiary (green) - MATCH
   - Outline: border dengan bg transparent - Available

**Kesimpulan:** 
Design system yang sudah didefinisikan 100% sesuai dengan referensi Figma. 
Tidak perlu perubahan CSS variables. Lanjutkan implementasi dengan guidelines ini.

---

### Layout Structure

```
┌─────────────────────────────────────────┐
│  Header (Admin Dashboard)               │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │  Main Content Area           │
│          │                              │
│ - Dash   │  [Page Content]              │
│ - Packs  │                              │
│ - Quest  │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Sidebar Navigation

```
📊 Dashboard
📦 Practice Packs
  ├─ All Packs
  └─ Create New
❓ Questions
  ├─ All Questions
  └─ Create New
```

### Component Reusability

- Gunakan UI components yang sudah ada di `apps/web/src/components/ui/`
- Buat admin-specific components di `apps/web/src/components/admin/`
- Reuse form patterns untuk consistency

### Design Principles

1. **Consistency** - Gunakan design pattern yang sama untuk semua CRUD operations
2. **Feedback** - Toast notifications untuk setiap action (success/error)
3. **Confirmation** - Dialog confirmation untuk destructive actions (delete)
4. **Validation** - Client-side validation sebelum submit
5. **Loading States** - Show loading indicators saat fetch/submit data

---

## 📝 Detail Implementasi

### Step 1: Modifikasi Login Flow

**File:** `apps/web/src/routes/_auth/login.tsx`

**Perubahan:**
```typescript
// Setelah successful login, cek role
onSuccess: async () => {
  const session = await authClient.getSession();
  
  if (session?.user?.role === 'admin') {
    navigate({ to: '/admin/dashboard' });
  } else {
    navigate({ to: '/dashboard' });
  }
}
```

---

### Step 2: Buat Admin Layout

**File:** `apps/web/src/routes/_admin.tsx`

**Fitur:**
- Admin header (berbeda dari user header)
- Sidebar navigation
- Role checking di `beforeLoad`
- Redirect non-admin ke `/dashboard`

---

### Step 3: Buat Admin Pages

**Priority Order:**
1. ✅ Admin Dashboard Landing (`/admin/dashboard`)
2. ✅ Practice Packs List (`/admin/practice-packs`)
3. ✅ Create Practice Pack (`/admin/practice-packs/create`)
4. ✅ Questions List (`/admin/questions`)
5. ✅ Create Question (`/admin/questions/create`)
6. ✅ Edit Practice Pack (`/admin/practice-packs/{id}`)
7. ✅ Manage Pack Questions (`/admin/practice-packs/{id}/questions`)
8. ✅ Edit Question & Answers (`/admin/questions/{id}`)

---

## � Coding Standards & Best Practices

### File Organization

```
Component Structure:
1. Imports (grouped: external, internal, types)
2. Types/Interfaces (jika diperlukan)
3. Constants (jika ada)
4. Main component
5. Helper components (jika ada)
6. Exports
```

**Contoh:**
```typescript
// External imports
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

// Internal imports - UI components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Internal imports - utilities
import { cn } from "@/lib/utils";

// Types
interface AdminDashboardProps {
  userId: string;
}

// Component
export function AdminDashboard({ userId }: AdminDashboardProps) {
  // ... implementation
}
```

### Naming Conventions

**Files:**
- Components: `kebab-case.tsx` (contoh: `practice-pack-form.tsx`)
- Routes: `kebab-case.tsx` atau `$param.tsx` untuk dynamic routes
- Utils: `kebab-case.ts`

**Code:**
- Components: `PascalCase` (contoh: `PracticePackForm`)
- Functions: `camelCase` (contoh: `handleSubmit`, `fetchPracticePacks`)
- Variables: `camelCase` (contoh: `practicePackId`, `isLoading`)
- Constants: `SCREAMING_SNAKE_CASE` (contoh: `MAX_QUESTIONS_PER_PACK`)
- Types/Interfaces: `PascalCase` (contoh: `PracticePack`, `QuestionFormData`)

### Component Guidelines

**1. Prefer Function Components**
```typescript
// Good
export function PracticePackList() {
  return <div>...</div>;
}

// Avoid
export const PracticePackList = () => {
  return <div>...</div>;
};
```

**2. Props Destructuring**
```typescript
// Good
function PracticePackCard({ title, description, questionCount }: PracticePackCardProps) {
  // ...
}

// Avoid
function PracticePackCard(props: PracticePackCardProps) {
  const { title, description, questionCount } = props;
  // ...
}
```

**3. Conditional Rendering**
```typescript
// Good - untuk simple conditions
{isLoading && <Loader />}
{!isLoading && <Content />}

// Good - untuk complex conditions
{isLoading ? (
  <Loader />
) : error ? (
  <ErrorMessage />
) : (
  <Content />
)}
```

### State Management

**1. Use TanStack Query untuk server state**
```typescript
const { data, isLoading, error } = orpc.admin.practicePacks.listPacks.useQuery();
```

**2. Use useState untuk local UI state**
```typescript
const [isDialogOpen, setIsDialogOpen] = useState(false);
```

**3. Use TanStack Form untuk form state**
```typescript
const form = useForm({
  defaultValues: { title: "", description: "" },
  onSubmit: async ({ value }) => {
    // handle submit
  },
});
```

### Error Handling

**1. User-facing errors gunakan toast**
```typescript
import { toast } from "sonner";

toast.error("Gagal menghapus practice pack");
toast.success("Practice pack berhasil dibuat");
```

**2. Handle loading states**
```typescript
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage message={error.message} />;
return <Content data={data} />;
```

### Comments & Documentation

**1. JSDoc untuk component yang kompleks**
```typescript
/**
 * Form component untuk create/edit practice pack
 * @param practicePackId - ID untuk edit mode, undefined untuk create mode
 * @param onSuccess - Callback setelah berhasil submit
 */
export function PracticePackForm({ 
  practicePackId, 
  onSuccess 
}: PracticePackFormProps) {
  // ...
}
```

**2. Inline comments untuk logika kompleks**
```typescript
// Reorder questions menggunakan optimistic update
// untuk UX yang lebih responsif
const reorderMutation = useMutation({
  // ...
});
```

**3. Hindari comments yang redundan**
```typescript
// Bad
// Set loading to true
setIsLoading(true);

// Good (no comment needed, code is self-explanatory)
setIsLoading(true);
```

### Styling Guidelines

**1. Gunakan Tailwind utility classes**
```typescript
<div className="flex items-center gap-4 rounded-md bg-card p-6">
```

**2. Gunakan cn() untuk conditional classes**
```typescript
import { cn } from "@/lib/utils";

<Button className={cn(
  "w-full",
  isActive && "bg-primary",
  isDisabled && "opacity-50"
)} />
```

**3. Jangan hardcode colors - gunakan CSS variables**
```typescript
// Good
<div className="bg-primary text-primary-foreground">

// Bad
<div className="bg-blue-600 text-white">
```

### Import Organization

**Order:**
1. External packages (React, libraries)
2. Internal UI components
3. Internal utilities/hooks
4. Types
5. Relative imports

**Example:**
```typescript
// 1. External
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

// 2. UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 3. Utilities
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

// 4. Types
import type { PracticePack } from "@/types/practice-pack";

// 5. Relative
import { AdminSidebar } from "./sidebar";
```

### Type Safety

**1. Define interfaces untuk data structures**
```typescript
interface PracticePack {
  id: number;
  title: string;
  description?: string;
  questionCount: number;
}
```

**2. Type component props**
```typescript
interface PracticePackCardProps {
  practicePack: PracticePack;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}
```

**3. Use type inference when obvious**
```typescript
// Good - type is inferred
const [count, setCount] = useState(0);

// Unnecessary - type is obvious
const [count, setCount] = useState<number>(0);
```

### Performance Considerations

**1. Memoize expensive computations**
```typescript
import { useMemo } from "react";

const sortedQuestions = useMemo(
  () => questions.sort((a, b) => a.order - b.order),
  [questions]
);
```

**2. Use React.memo untuk component yang sering re-render**
```typescript
export const QuestionCard = memo(function QuestionCard({ question }: Props) {
  // ...
});
```

**3. Lazy load routes jika diperlukan**
```typescript
// Hanya jika route sangat berat
const AdminDashboard = lazy(() => import("./admin-dashboard"));
```

### Accessibility

**1. Semantic HTML**
```typescript
<button type="button" onClick={handleClick}>
  Click me
</button>

// Bukan
<div onClick={handleClick}>Click me</div>
```

**2. Labels untuk form inputs**
```typescript
<Label htmlFor="title">Title</Label>
<Input id="title" name="title" />
```

**3. Alt text untuk images**
```typescript
<img src={src} alt="Practice pack illustration" />
```

### Testing Mindset

Walaupun tidak ada automated tests, tulis kode yang mudah di-test:
- Functions harus pure ketika memungkinkan
- Separate business logic dari UI
- Component harus punya single responsibility

---

## �📚 Tech Stack

**Frontend:**
- React + TypeScript
- TanStack Router (routing)
- TanStack Query (data fetching)
- TanStack Form (form handling)
- Tailwind CSS (styling)
- Shadcn/ui (component library)
- ORPC (API client)

**Backend:**
- ORPC (API framework)
- Drizzle ORM
- PostgreSQL
- Better Auth (authentication)

---

## 🔄 Workflow Development

1. **Start:** Create branch dari `main` (sudah ada: `admin/frontend`)

2. **Sebelum Coding:**
   - Baca file terkait di codebase
   - Identifikasi component yang bisa di-reuse
   - Plan struktur file yang akan dibuat
   - Review design system dan color palette

3. **Development:**
   - Buat file/component satu per satu
   - Follow coding standards yang sudah didefinisikan
   - Gunakan existing components sebanyak mungkin
   - Test setiap fitur di browser sebelum lanjut
   - Commit frequently dengan clear messages

4. **Commit Message Format:**
   ```
   feat(admin): add practice pack list page
   fix(admin): correct delete confirmation dialog
   style(admin): adjust card spacing
   refactor(admin): extract reusable form component
   ```

5. **Testing:** 
   - Manual testing untuk setiap fitur
   - Test di browser (responsive check)
   - Test error states
   - Test loading states
   - Test edge cases

6. **Review:** 
   - Self-review code sebelum merge
   - Check consistency dengan existing code
   - Verify design system compliance
   - Check for console errors/warnings

7. **Merge:** 
   - Merge ke `main` setelah semua selesai dan tested

---

## 📋 Implementation Checklist

### Pre-Development ✅ COMPLETED
- [x] Baca semua file di `apps/web/src/routes/_authenticated/`
- [x] Baca semua component di `apps/web/src/components/ui/`
- [x] Review design system di dokumentasi ini
- [x] Understand API structure di `packages/api/src/routers/admin/`
- [x] Setup local database dengan user role admin

### Phase 1: Foundation ✅ COMPLETED
- [x] Modifikasi login flow dengan role checking
- [x] Buat `_admin.tsx` layout dengan protection
- [x] Buat admin sidebar component
- [x] Test authentication flow
- [x] Admin dashboard landing page

### Phase 2: Core Pages ✅ COMPLETED
- [x] Practice packs list page
- [x] Practice packs create page
- [x] Practice pack detail page
- [x] Questions bank page
- [x] Question edit page
- [x] Test navigation between pages

### Phase 3: CRUD Operations ✅ COMPLETED
- [x] Create practice pack form
- [x] Edit practice pack form (inline toggle)
- [x] Delete practice pack with confirmation
- [x] Create question form (inline dalam pack)
- [x] Edit question form (dedicated page)
- [x] Delete question with confirmation & usage warning
- [x] Test all CRUD operations

### Phase 4: Relationships ✅ COMPLETED
- [x] Manage questions in pack page (pack detail)
- [x] Add existing question to pack functionality (modal search)
- [x] Remove question from pack (dengan confirmation)
- [x] Display questions dengan order badges
- [x] Backend endpoint untuk update question order (available, not used in UI)
- [x] Test relationship operations

### Phase 5: Polish ✅ COMPLETED
- [x] Answer options management (4 options A-D)
- [x] Loading states everywhere (Skeleton components)
- [x] Error handling everywhere (try-catch + toast)
- [x] Toast notifications (success & error)
- [x] Empty states (no data, no search results)
- [x] Query invalidation untuk data consistency
- [x] Auto-redirect setelah success operations
- [x] Responsive design check
- [x] Final testing

### Phase 6: Future Enhancements (OPTIONAL)
- [ ] User management page
- [ ] Drag-and-drop reorder questions
- [ ] Real-time statistics di dashboard
- [ ] Bulk operations (delete multiple, add multiple)
- [ ] Export/import questions
- [ ] Question categories/tags
- [ ] Practice pack visibility settings (draft/published)

---

## ✅ Progress Tracking

### 16 Desember 2025 (Day 1)
- ✅ Setup admin layout structure
- ✅ Implement login role checking
- ✅ Create admin dashboard landing
- ✅ Practice packs list & create pages
- ✅ Practice pack detail page foundation

### 17 Desember 2025 (Day 2)
- ✅ Complete practice pack detail page
- ✅ Create question inline form
- ✅ Display questions list dalam pack
- ✅ Edit pack info form
- ✅ Add existing question modal
- ✅ Question edit page
- ✅ Questions bank page
- ✅ All backend endpoints
- ✅ Complete testing & polish

**Status:** 🎉 **ALL CORE FEATURES COMPLETED!**

---


## 📖 References

- [TanStack Router Docs](https://tanstack.com/router)
- [ORPC Docs](https://orpc.unnoq.com/)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Better Auth Docs](https://www.better-auth.com/)

---

**Last Updated:** 17 Desember 2025  
**Status:** ✅ Core implementation completed  
**Next Steps:** Test dengan real data, kemudian merge ke main
