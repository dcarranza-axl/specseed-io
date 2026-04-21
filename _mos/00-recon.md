# 00-recon.md — SpecSeed.io Box Inventory

**Generated:** 2026-04-21 13:30 UTC
**Orchestrator:** Claude Code Opus 4.7 (1M ctx)
**Callsign:** CC-OPS-SPECSEED
**Box hostname:** `lalord`
**Operator:** dcarr0074@gmail.com

---

## Box state

Fresh Ubuntu 24.04 droplet. No prior web deploy. `/var/www` did not exist before this session — created.

| Item | State |
|------|-------|
| Kernel | `Linux lalord 6.8.0-110-generic`, Ubuntu 24.04.x |
| User | `sudo-claude` (uid 1000, `sudo` group, passwordless sudo OK) |
| CPU | 1 vCPU |
| RAM | 1.9 GiB physical + **2 GiB swap** (added this session, `/swapfile`) |
| Disk | 48 GiB total, 3.4 GiB used, 44 GiB free |
| Working dir | `/var/www/specseed-io/` (created this session, owned by sudo-claude) |

## Network / DNS

- `specseed.io` → `68.183.201.209` (resolves — droplet is the A record target)
- HTTP/HTTPS ports not yet bound (nginx default site not enabled)
- No certbot cert yet for specseed.io

## Toolchain

Installed this session via apt (NodeSource for Node):

| Tool | Version |
|------|---------|
| Node.js | 20.20.2 (NodeSource `node_20.x` repo) |
| npm | 10.8.2 |
| nginx | 1.24.0 (Ubuntu 2ubuntu7.6) |
| certbot | 2.9.0 + `python3-certbot-nginx` |
| jq | 1.7 |
| curl | 8.5.0 |
| tar | 1.35 |
| sha256sum | coreutils 9.4 |

## Fleet template — PRESENT

One-time token from MOTHER burned at `2026-04-21T13:28Z`. Bundle delivered as expected.

- Download: `/tmp/fleet-template.tar.gz` (10,217 bytes)
- Expected SHA256: `4344cfef4f2c03e6eb528a5f0f537e7f5c404ee2fa84383f82f05416d412b4cc`
- Actual SHA256: **VERIFIED OK** (`sha256sum -c -`)
- Extracted to: `/opt/fleet-template/`
- Version: `v0.1.0`, maintained by MOTHER (38.143.209.70)
- Pre-flight SHA endpoint was queried first (non-burning) — match confirmed before token burn

## Fleet template contents

```
/opt/fleet-template/
├── manifest.json                (palette JSON)
├── README.md                    (onboarding)
├── bin/fetch.sh                 (rsync updater — needs SSH key to MOTHER, not used this session)
├── claude-code/
│   ├── CLAUDE.md                (fleet-wide conventions)
│   ├── settings.json            (allow/deny permissions template)
│   └── memory/
│       ├── MEMORY.md
│       ├── user_operator.md     (template, empty)
│       ├── reference_box.md     (template, empty)
│       ├── feedback_consent.md
│       └── feedback_antivirus_vigilance.md
└── design/
    ├── palette.css              (concrete + crimson — THE theme)
    └── components/
        ├── buttons.css
        ├── cards.css
        ├── forms.css
        └── navigation.css
```

## Theme ref decision — **ADAPTED**

MOS Phase 0 says: *"Check for theme reference file `_theme/theme-ref.json`. If missing, halt and report to operator."*

Operator directive this session: *"Adapt."* The fleet template delivers the canonical AXL design system (brutalist concrete + crimson) inline. Fetching a separate `theme-ref.json` from `theme.axlprotocol.org` would be redundant and adds a network hop + bearer token the fleet bundle has already obviated.

**Decision:** Treat `/opt/fleet-template/design/` as the authoritative theme source. Skip `theme-ref.json` fetch. This supersedes MOS Section 3's gradient/gold/cyan fallback palette entirely. See `_theme/applied-theme.md` for the token map.

Fleet CSS staged to `/var/www/specseed-io/_theme/` for Phase 4 consumption.

## Repo state

```
/var/www/specseed-io/
├── _mos/               (this file)
├── _theme/             (fleet palette + components staged here)
│   ├── palette.css
│   └── components/{buttons,cards,forms,navigation}.css
├── docs/               (empty — Phase 8 fills)
├── public/             (empty — Phase 8 fills robots/sitemap)
├── .claude/agents/     (empty — Phase 4 Build Group D fills)
└── .codex/agents/      (empty — Phase 4 Build Group D fills)
```

No `package.json`, no `node_modules`, no `src/`, no prior Next.js state. Clean slate.

## Blockers

**None.** Green light for Phase 1.

## Consent + destruct rules on file

Per `/opt/fleet-template/claude-code/CLAUDE.md` (fleet-wide):
- `apt install` — already used this session for toolchain (Node, nginx, certbot) under broad operator authorization for the SpecSeed build
- `systemctl stop/restart` — BLOCKED; nginx reload is fine, restart is not
- `ufw` / `iptables` — BLOCKED without explicit destruct checkpoint
- `rm -rf` — BLOCKED without explicit destruct checkpoint
- DNS changes — out of scope (specseed.io already points here)
- Contact escalation: PROTO, not COMMAND (COMMAND is operationally degraded)

Going forward I will checkpoint before: enabling the nginx site (writes to `/etc/nginx/sites-enabled/`), running `certbot --nginx` (modifies nginx config + runs systemctl reload + requests cert), touching ufw/firewall.

---

*CC-OPS-SPECSEED*
