---
description: Audit codebase for async readiness — ensure all I/O, file system, and blocking operations use async/await
---

Audit the entire codebase for async correctness. For every file:

1. **Async-worthy functions** — Identify functions that perform I/O, filesystem ops, network requests, database queries, timers, or any blocking operation. Ensure they are `async` and use `await` properly.

2. **Missing async** — Flag any function that should be async but isn't (e.g., using callbacks, raw promises without await, sync fs methods, etc.).

3. **Improper async patterns** — Detect:
   - `async` functions that don't `await` anything (unnecessary async)
   - Forgotten `await` before promise-returning calls
   - `.then()` / `.catch()` chains that could be `await`
   - `return await` patterns that can be simplified
   - Fire-and-forget promises without error handling

4. **Propagation** — Ensure async propagates correctly through the call chain (callers of async functions should themselves be async or handle the promise).

5. **Top-level await** — Check if top-level await is needed/used correctly.

Be thorough: scan every `.js`, `.ts`, `.mjs`, `.cjs`, `.py`, and any other relevant source files. Provide a summary of findings and file-by-file recommendations.
