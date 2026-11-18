# Control map — GitHub Copilot in our organisation

Status: ✅ enforced · ⚠️ available but not set · ❓ unknown · 🔒 can't see (admin only)

Owners below are suggested roles, not confirmed assignments. Status reflects the local
repository inspection; organisation and device policies need confirmation by their owners.

| Layer | Control | Owner | Status |
|---|---|---|---|
| ① GitHub AI controls | Copilot features (chat, agents, cloud agent, code review) | GitHub organisation admin | ❓ Effective policies not verified |
| ① GitHub AI controls | Model availability + "Default availability" for new models | GitHub organisation admin; platform team + finance | ❓ Model policy and new-model default not verified |
| ① GitHub AI controls | MCP servers in Copilot policy | GitHub organisation admin / platform team | ❓ Policy not verified |
| ① GitHub AI controls | Content exclusion | GitHub organisation admin / security | ❓ Exclusions not verified |
| ① GitHub AI controls | Audit log (agent actions) | GitHub enterprise admin / security | ❓ Audit configuration and access not verified |
| ② Enterprise-managed settings | `permissions` / `sandbox` | Enterprise admin / platform team | ❓ Managed settings not verified |
| ② Enterprise-managed settings | Default `model` / `fusionTier` | Enterprise admin / platform team | ❓ Managed defaults not verified |
| ② Enterprise-managed settings | MCP allow / deny lists | Enterprise admin / platform team | ❓ Managed lists not verified |
| ③ VS Code device policies | ChatAgentMode · ChatToolsAutoApprove · ChatMCP | Endpoint management / platform team | ❓ Effective device policies not verified |
| Repository | preToolUse guardrail hook (`.github/hooks/`) — Step 4 | me (this lab) | ⚠️ Lab guardrail files are not present in the local `.github/hooks/`; live enforcement not verified |
| Repository | Branch ruleset on `main` — Step 5 | me (this lab) / repository admin | ❓ Remote ruleset not verified |
| Repository | CI check `Test` (`.github/workflows/ci.yml`) | Repository maintainers | ❓ Job is configured locally for pushes to `main` and pull requests; successful runs and required-check enforcement not verified |

## Follow-up

- Ask the GitHub and enterprise admins to confirm the AI policies, managed settings, audit access and actual owners.
- Run **Developer: Policy Diagnostics** in VS Code to check the effective device policies.
- Complete the lab guardrail and live denial test, then check the `main` ruleset and a `Test` run on GitHub.