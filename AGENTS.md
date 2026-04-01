<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Secrets and Sensitive Data Policy (Always Apply)

- Never read, print, summarize, or quote contents of secret files such as `.env`, `.env.local`, `.env.*`, private key files, credential JSON files, or token dumps.
- Never request or expose raw cookies, auth/session headers, API keys, private keys, webhook secrets, or service-role tokens.
- If a task appears to require a secret file, ask the user to provide only the specific non-sensitive value needed, masked when possible.
- Prefer placeholder examples (e.g., `sk_live_***`) instead of real secret values in all responses.
