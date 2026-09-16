# Docs Index — Spare Parts E-commerce Platform

Shared planning artifacts for the Design, Backend, and Frontend agents building this project. Start here.

| Doc | Purpose | Primary audience |
|---|---|---|
| [PROJECT_PLAN.md](./PROJECT_PLAN.md) | 9-week sprint-by-sprint breakdown mapped to the 12 proposal modules, with owners and cross-team dependencies | All agents, PM |
| [API_CONTRACT.md](./API_CONTRACT.md) | REST API endpoint contract — resource, method, path, auth, request/response shape | Backend (implements), Frontend (consumes) |
| [DATA_MODEL.md](./DATA_MODEL.md) | Core entities, fields, and relationships | Backend (schema/migrations), Frontend (types) |
| [DESIGN_BRIEF.md](./DESIGN_BRIEF.md) | Screens needed, mobile-first breakpoints, brand tone, output format | Design (produces), Frontend (consumes) |
| [BACKLOG.md](./BACKLOG.md) | Flat, prioritized task list per team, mapped to the 12 proposal modules | Design, Backend, Frontend |

## How these fit together

1. **PROJECT_PLAN.md** sets the timeline and says who delivers what, when.
2. **DATA_MODEL.md** is frozen first (Week 1) — it's the shape of the database.
3. **API_CONTRACT.md** is frozen next (Week 2) — it's the shape of the HTTP layer built on that data model.
4. **DESIGN_BRIEF.md** governs what Design ships and in what format (HTML mockups + a design system doc, since there's no Figma access), so Frontend has something concrete to build from screen-by-screen.
5. **BACKLOG.md** turns all of the above into an actionable, prioritized task list per team.

Any change to a frozen contract (data model or API) after its freeze date must be logged in that document's own changelog/notes section, with the other affected agent(s) notified.
