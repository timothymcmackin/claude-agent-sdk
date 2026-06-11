import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Use the docs MCP server to explain what sessions are in Claude Code. Then summarize how to manage sessions on Claude Agent SDK calls.",
  options: {
    mcpServers: {
      "claude-code-docs": {
        type: "http",
        url: "https://code.claude.com/docs/mcp"
      }
    },
    allowedTools: ["mcp__claude-code-docs__*"]
  }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}

/*
Based on the Claude Code docs, here's the explanation.

## What sessions are in Claude Code

A **session is a saved conversation tied to a project directory.** It contains your prompt, every tool call the agent made, every tool result, and every response. Claude Code writes it to disk continuously as you work, so the conversation persists even after you exit or run `/clear`.

Key properties:

- **Persistence** — Transcripts are stored locally as JSONL files at `~/.claude/projects/<project>/<session-id>.jsonl`, where `<project>` is derived from your working directory path. By default these are cleaned up after 30 days (`cleanupPeriodDays`).
- **Scoped to a directory** — Sessions are stored per project directory, which is why the working directory (`cwd`) matters when you resume one.
- **What's preserved** — Sessions persist the *conversation*, not the filesystem. Resuming restores full context (files read, analysis done, decisions made), but to snapshot/revert file changes you use checkpointing instead.
- **Continuity options** — You can **resume** a session (reopen it under the same ID and append to it) or **fork/branch** it (copy the history into a new session ID, leaving the original untouched).

In the interactive CLI you manage them with `claude --continue`, `claude --resume`, `claude --resume <name>`, `claude --from-pr <number>`, the `/resume` picker, `/rename`, and `/branch`.

---

## Managing sessions in Claude Agent SDK calls

In the SDK, **each `query()` call starts a fresh session by default** — no memory of prior calls — unless you opt into continuity. How much you need to do depends on your app's shape:

| What you're building | What to use |
|---|---|
| One-shot task (single prompt) | Nothing extra — one `query()` call |
| Multi-turn chat in one process | `ClaudeSDKClient` (Python) or `continue: true` (TypeScript) — SDK tracks the session, no ID handling |
| Pick up after a process restart | `continue_conversation=True` (Python) / `continue: true` (TS) — resumes the most recent session in the directory |
| Resume a *specific* past session | Capture the session ID and pass it to `resume` |
| Try an alternative approach | Fork the session |
| Stateless, nothing written to disk (TS only) | `persistSession: false` |

**The three core mechanisms** (all set as options on `query()`):

1. **Continue** — picks up the *most recent* session in the current directory. No ID to track. Good when running one conversation at a time.
2. **Resume** — takes a *specific* session ID. Required when you have multiple sessions (e.g., one per user) or want a session that isn't the most recent. Both continue and resume append to the existing session.
3. **Fork** — set `fork_session=True`/`forkSession: true` alongside `resume`. Creates a *new* session ID seeded with a copy of the original's history; the original stays unchanged. You end up with two independent sessions.

**Automatic session tracking (multi-turn in one process):**
- *Python:* use `ClaudeSDKClient` — each `client.query()` automatically continues the same session; IDs are handled internally. Use it as an async context manager.
- *TypeScript:* there's no client object — just pass `continue: true` on each subsequent `query()` call. (The experimental V2 `createSession()` API was removed in 0.3.142.)

**Capturing the session ID (needed for resume and fork):**
- Read `session_id` from the result message (`ResultMessage` in Python, `SDKResultMessage` in TS) — present on every result, success or error.
- In TypeScript it's also available earlier as a field on the init `SystemMessage`; in Python it's nested in `SystemMessage.data`.

**Common reasons to resume:** follow up on a completed task without re-reading files; recover from a limit (`error_max_turns`/`error_max_budget_usd`) by resuming with a higher limit; or restore a conversation after a process restart.

**Gotchas and cross-host concerns:**
- If a resume unexpectedly returns a *fresh* session, the usual cause is a **mismatched `cwd`** — sessions live under `~/.claude/projects/<encoded-cwd>/*.jsonl` (or `$CLAUDE_CONFIG_DIR/...`), where every non-alphanumeric char in the absolute path becomes `-`. Resuming from a different directory looks in the wrong place.
- Session files are **local to the machine** that created them. To resume across hosts (CI, containers, serverless): either move the JSONL file to the same path on the new host, or — often more robust — capture the results you need as application state and feed them into a fresh session's prompt. A `SessionStore` adapter can mirror transcripts to shared storage.
- **Forking branches the conversation, not the filesystem** — a forked agent's file edits are real and visible to other sessions in the same directory.

**Helper functions** (both SDKs) for building pickers, cleanup, or organization: `listSessions()`/`getSessionMessages()` and `getSessionInfo()`/`renameSession()`/`tagSession()` (TS), and the `snake_case` equivalents in Python.

One note connecting the two surfaces: sessions created via the SDK (or `claude -p`) **don't appear in the CLI `/resume` picker**, but you can still resume one from the CLI by passing its ID to `claude --resume <session-id>`.
*/