# Claude Reference Guide (Examples & Output Formats)

*This file is referenced from CLAUDE.md v3.1. Consult when detailed examples or output format templates are needed.*

---

## MODE DISTINCTION GUIDE

### V-REFACTOR vs DEEP AUDIT — When to Use Which?

| Aspect | V-REFACTOR | DEEP AUDIT |
|--------|-----------|------------|
| **Scope** | Code structure, patterns, data flow | Vulnerabilities, bottlenecks, production readiness |
| **Focus** | Architecture improvement | Security & performance verification |
| **Output** | Before/After with reasoning | 🔴 Critical / ⚠️ Warnings with fixes |

---

## TRIGGER EXAMPLES PER MODE

### QUICK MODE
✅ "Fix typo in heading" · "Change button color" · "Add console.log" · "Update text content"
❌ Anything involving DB, API, multi-file changes, or architectural decisions

### V-UX MODE (Agent B)
✅ "Create a dashboard with cards" · "Make this form modern" · "Add hover effects" · "Design responsive nav"
❌ "Fix button text typo" (QUICK MODE) · "Change hex color" (QUICK MODE)

### V-DATA MODE (Agent D)
✅ "Design user auth schema with RLS" · "Type-safe queries for posts" · "RLS for multi-tenant" · "Optimize slow query"
❌ "Fetch user from existing API" (existing patterns) · "Add Zod to form" (V-UX handles)

### V-REFACTOR MODE (Agent A)
✅ "useEffect chains fetching data" · "Props drilled through 4 levels" · "Can this be RSC?" · "Use composition pattern"
❌ "Add a new feature" (normal implementation) · "Fix a bug" (QUICK MODE or DEEP AUDIT)

### V-PERF MODE (Agent P)
✅ "Page loads in 3s, optimize" · "Lighthouse score 60/100" · "Dashboard feels laggy" · "INP is 400ms"
❌ "Add a component" (no perf issue) · "Create new feature" (optimize after it exists)

### V-TEST MODE (Agent C)
✅ "Write tests for Button" · "Add test coverage for auth" · "Test this form submission"
❌ "Does this code work?" (run it) · "Explain how testing works" (MENTOR MODE)

### DEEP AUDIT MODE (Agent C)
✅ "Review for security issues" · "Is this Server Action secure?" · "Check for bottlenecks" · "Audit before deploy"
❌ "How does this work?" (MENTOR) · "Refactor this component" (V-REFACTOR)

### MENTOR MODE (Agent T)
✅ "Why does this run on server?" · "Explain Suspense" · "What does await do here?" · "How do RSC work?"
❌ "Just fix it" (QUICK MODE) · "Make it faster" (V-PERF)

---

## OUTPUT FORMAT TEMPLATES

### V-UX MODE Output
```
1. Full Component code (TypeScript, Tailwind v4)
2. @theme block (if custom CSS needed)
3. UX Pattern reasoning ("Why Skeleton over Spinner: ...")
```

### V-DATA MODE Output
```
1. SQL migration code (CREATE TABLE, RLS policies, indexes)
2. TypeScript/Zod schema integration
3. UX benefit explanation ("This index reduces fetch by 40ms...")
```

### V-REFACTOR MODE Output
```
1. Before structure (brief)
2. After structure (full refactored code)
3. Performance gain ("Removed 15kb client JS by moving to RSC")
```

### V-TEST MODE Output
```
1. Full .test.tsx file content
2. MSW handler setup for the test case
3. Strategy reasoning ("Why we mocked the network here")
```

### DEEP AUDIT MODE Output
```
🔴 Critical Issues: Security risks, app-breaking patterns
⚠️ Warnings: Performance bottlenecks, waterfalls
Refactoring: Secured/optimized code block (direct fix)
```

### V-PERF MODE Output
```
1. Bottleneck Analysis (what blocks main thread?)
2. Quick Wins ("Add priority to Hero Image")
3. Deep Dive (architectural changes needed)
```

### MENTOR MODE Output
```
1. Big Picture: 1-sentence summary
2. Line-by-Line Breakdown (focus on tricky parts)
3. "Try This": Small experiment for the user
4. Docs Link: Direct link to relevant Next.js/React docs
```

---

## AGENT O — CONFLICT RESOLUTION EXAMPLES

### Multi-Trigger Scenarios

**Scenario 1: "Create a form that saves to Supabase"**
- Detected: V-UX + V-DATA
- Agent O Decision: V-DATA leads (Security > UX)
- Flow: Agent D designs schema/RLS → Agent B builds the form UI → Agent C validates Zod boundaries

**Scenario 2: "This dashboard is slow and ugly"**
- Detected: V-PERF + V-UX
- Agent O Decision: V-PERF leads (Performance > UX)
- Flow: Agent P identifies bottlenecks → Agent B polishes UI after perf fixes

**Scenario 3: "Refactor this useEffect that fetches user data from Supabase"**
- Detected: V-REFACTOR + V-DATA
- Agent O Decision: V-DATA leads (Security first — ensure RLS/types correct)
- Flow: Agent D validates data layer → Agent A restructures component

**Scenario 4: "Write tests for this Server Action that mutates user data"**
- Detected: V-TEST + V-DATA + DEEP AUDIT
- Agent O Decision: DEEP AUDIT leads (Security highest priority)
- Flow: Agent C audits security first → then writes tests → Agent D validates RLS

**Scenario 5: "I don't understand why this component re-renders. Also make it faster."**
- Detected: MENTOR + V-PERF
- Agent O Decision: Both active (Mentor is always concurrent)
- Flow: Agent T explains the re-render cause → Agent P optimizes

---

## PHASE PIPELINE REFERENCE

| Request Type | Phases | Example |
|-------------|--------|---------|
| Trivial | Phase 2 only | "Fix typo", "Change color" |
| Standard UI | Phase 1 → 2 | "Create a card component" |
| Data + UI | Phase 1 → 2 → 3 | "Build user profile with Supabase" |
| Security-critical | Phase 1 → 2 → 3 (mandatory) | "Server Action for payments" |
| Learning | Phase 2 → 4 | "Create X and explain how it works" |
| Full complex | Phase 1 → 2 → 3 → 4 | "Build auth system, explain everything" |

---

*Referenced by CLAUDE.md v3.1 · Last Updated: 2026-03-11 · Version: REF-3.1*
