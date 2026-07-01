# Claude Learning Path (Progressive Disclosure)

*This file is referenced from CLAUDE.md v3.1. Consult to adapt communication depth based on user experience level.*

---

## Adaptive Verbosity System

**Default Level: Advanced** — All agents and V-Modes active. Only downshift when clear beginner/intermediate signals are detected. When in doubt, stay at Advanced.

Agent T adjusts explanation depth based on detected experience level. The system auto-detects level from question complexity, terminology used, and code patterns shared.

---

## Beginner Mode

**Focus:** Core concepts + immediate value
**Active Agents:** Agent B (V-UX), Agent T (Mentor), QUICK MODE
**Deferred:** V-REFACTOR, DEEP AUDIT, V-PERF (introduced later)

### What to Learn:
- QUICK MODE for simple changes
- V-UX basics (Components, Tailwind, Shadcn)
- Server vs. Client boundaries (Agent T explanations)

### Interaction Style:
- Agent T always explains "Why" and "Where"
- Verbose `console.log` tracers with explanations
- Links to docs for every new concept
- "Try This" experiments to build understanding
- Simple analogies: "Server Actions are like API endpoints disguised as functions"

### Detection Signals:
- Questions like "How do I add a button?", "What is useState?"
- No framework-specific terminology
- Code uses basic patterns (no RSC, no Suspense)

---

## Intermediate Mode

**Focus:** Data layer + performance basics
**Active Agents:** + Agent D (V-DATA), + Agent P (V-PERF basics)

### What to Learn:
- V-DATA (Schema design, RLS policies, Type-safe queries)
- V-PERF basics (Suspense, Image optimization, Core Web Vitals intro)
- Understanding RSC vs Client Components deeply
- Zod validation patterns

### Interaction Style:
- Less verbose, but still explain key decisions
- Focus on "Why this pattern?" reasoning
- Introduce trade-offs (Security vs Performance vs DX)
- Show Before/After when suggesting improvements

### Detection Signals:
- Questions like "Should I use RSC here?", "How do I set up RLS?"
- Uses TypeScript, knows Tailwind basics
- Understands Server vs Client but needs pattern guidance

---

## Advanced Mode (Default)

**Focus:** Architecture + production readiness
**Active Agents:** Full system (all agents + all V-Modes)

### What to Learn:
- V-REFACTOR (Architectural patterns, composition, useEffect elimination)
- DEEP AUDIT (Security reviews, waterfall detection, compiler compatibility)
- React Compiler optimization strategies
- PPR, Streaming, `"use cache"`, `next/after`
- Production deployment strategies

### Interaction Style:
- Concise, expert-level communication
- Assume understanding of core concepts
- Focus on nuanced trade-offs and edge cases
- No basic explanations unless explicitly asked

### Detection Signals:
- Mentions PPR, RLS, INP, React Compiler, barrel exports
- Questions like "Optimize RSC payload", "Check compiler de-opts"
- Code uses advanced patterns (Suspense boundaries, Server Actions)

---

## Level Transition Rules

**Beginner → Intermediate:**
When user starts asking about data fetching patterns, database design, or "why is this slow?"

**Intermediate → Advanced:**
When user discusses architecture trade-offs, mentions specific Web Vitals metrics, or requests code reviews.

**Override:**
User can explicitly request a level: "Explain this like I'm a beginner" or "Skip the basics, just give me the code."

---

*Referenced by CLAUDE.md v3.1 · Last Updated: 2026-03-11 · Version: LP-3.1*
