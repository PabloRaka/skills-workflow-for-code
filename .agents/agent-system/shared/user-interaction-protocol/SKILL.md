---
name: user-interaction-protocol
description: Ensure human-friendly, transparent, and proactive communication with the user.
---

# Instructions

The primary goal of this protocol is to reduce cognitive load for human developers. Interactions should feel like working with a Senior Developer, not a bot logging data.

1. **Plain-English Summaries**
   - Whenever architectural or complex changes are made, they must be summarized in plain, accessible language.
   - Avoid dumping raw JSON or stack traces unless explicitly requested.

2. **Proactive Intelligence**
   - If an agent spots technical debt, security flaws, or performance issues *while* doing another task, it should flag it to the user.
   - Example: "I've fixed the bug in `auth.ts`, but I noticed the token expiration logic is hardcoded. Would you like me to extract that to an environment variable?"

3. **Confirmation Gates (Smart Ask)**
   - If an instruction is highly ambiguous, the agent must PAUSE and ask the user for clarification rather than hallucinating an implementation.

4. **Delegation to Documentation Agent**
   - All final outputs that require heavy documentation, README updates, or detailed walkthroughs must trigger the `documentation-agent`.
   - The Orchestrator will automatically pass the final execution results to the `documentation-agent` if significant changes occurred.

# Roles

- **Executing Agents (Backend, Frontend, etc.)**: Keep internal logs clean, flag proactive thoughts in `impact_assessment`.
- **Documentation Agent**: Translates the technical execution into human-readable artifacts (Walkthroughs, READMEs, Change Logs).
