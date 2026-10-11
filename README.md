# DevOps, System Design & SRE — Lesson-by-Lesson

> **Format per lesson:** Concept → Architecture → Guardrails → Python snippet → Takeaway + Interview Q
>
> **Phases:**
> - Phase 1 (1–8): DevOps Foundations
> - Phase 2 (9–18): System Design
> - Phase 3 (19–25): SRE
> - Phase 4 (26–30): Advanced & Production-Grade

---

## Table of Contents

### Phase 1 — DevOps Foundations
- [Lesson 1 — The DevOps Mindset](#lesson-1--the-devops-mindset)
- [Lesson 2 — Linux Fundamentals for DevOps](#lesson-2--linux-fundamentals-for-devops)
- [Lesson 3 — Git Workflows](#lesson-3--git-workflows)
- [Lesson 4 — Containers & Docker](#lesson-4--containers--docker)
- [Lesson 5 — Docker Compose](#lesson-5--docker-compose)
- [Lesson 6 — CI/CD Fundamentals](#lesson-6--cicd-fundamentals)
- [Lesson 7 — GitHub Actions In Depth](#lesson-7--github-actions-in-depth)
- [Lesson 8 — Infrastructure as Code (IaC)](#lesson-8--infrastructure-as-code-iac)

### Phase 2 — System Design
- [Lesson 9 — How Systems Fail](#lesson-9--how-systems-fail)
- [Lesson 10 — Scalability Patterns](#lesson-10--scalability-patterns)
- [Lesson 11 — Load Balancing](#lesson-11--load-balancing)
- [Lesson 12 — Caching Strategies](#lesson-12--caching-strategies)
- [Lesson 13 — Database Fundamentals](#lesson-13--database-fundamentals)
- [Lesson 14 — SQL vs NoSQL & CAP Theorem](#lesson-14--sql-vs-nosql--cap-theorem)
- [Lesson 15 — Message Queues & Event-Driven Architecture](#lesson-15--message-queues--event-driven-architecture)
- [Lesson 16 — API Design](#lesson-16--api-design)
- [Lesson 17 — Microservices vs Monolith](#lesson-17--microservices-vs-monolith)
- [Lesson 18 — Distributed System Guardrails](#lesson-18--distributed-system-guardrails)

### Phase 3 — SRE
- [Lesson 19 — The SRE Mindset](#lesson-19--the-sre-mindset)
- [Lesson 20 — SLIs, SLOs, and SLAs](#lesson-20--slis-slos-and-slas)
- [Lesson 21 — Observability: The Three Pillars](#lesson-21--observability-the-three-pillars)
- [Lesson 22 — Monitoring & Alerting](#lesson-22--monitoring--alerting)
- [Lesson 23 — Incident Response](#lesson-23--incident-response)
- [Lesson 24 — Chaos Engineering](#lesson-24--chaos-engineering)
- [Lesson 25 — Capacity Planning](#lesson-25--capacity-planning)

### Phase 4 — Advanced & Production-Grade
- [Lesson 26 — Kubernetes Architecture](#lesson-26--kubernetes-architecture)
- [Lesson 27 — Kubernetes In Practice](#lesson-27--kubernetes-in-practice)
- [Lesson 28 — GitOps](#lesson-28--gitops)
- [Lesson 29 — DevSecOps](#lesson-29--devsecops)
- [Lesson 30 — Multi-Region & Disaster Recovery](#lesson-30--multi-region--disaster-recovery)

---

## Phase 1 — DevOps Foundations

---

## Lesson 1 — The DevOps Mindset

> **Tags:** `culture` `CALMS` `feedback loops` `DevOps philosophy`

### Concept

DevOps is **not** a tool, a job title, or a department. It's a **culture and set of practices** that break down the wall between software **development** (Dev) and IT **operations** (Ops).

Historically, Dev teams wrote code and threw it "over the wall" to Ops teams to deploy and maintain. Each team had different goals, incentives, and metrics — devs wanted to ship fast; ops wanted stability. This misalignment caused slow releases, blame culture, and production fires.

DevOps says: **both teams share responsibility for the full software lifecycle** — from writing code to running it in production.

---

### The CALMS Framework

CALMS is the backbone of DevOps culture. If someone asks you "what is DevOps?" in an interview, you answer with CALMS.

| Letter | Pillar | What it means |
|--------|--------|---------------|
| **C** | Culture | Shared ownership, psychological safety, no blame |
| **A** | Automation | Eliminate manual, repetitive work. If you do it twice, automate it |
| **L** | Lean | Reduce waste, work in small batches, limit WIP (work in progress) |
| **M** | Measurement | You can't improve what you don't measure. Track everything |
| **S** | Sharing | Open knowledge, postmortems, runbooks, wikis — no hero culture |

---

### The Three Ways (Gene Kim's Principles)

From the book *The Phoenix Project* — the three foundational movements of DevOps:

```
1st Way — Systems Thinking (Flow)
  Code → Build → Test → Deploy → Operate → Monitor
  ──────────────────────────────────────────────────►
  Optimize the ENTIRE system, not individual silos.

2nd Way — Amplify Feedback Loops
  ◄──────────────────────────────────────────────────
  Fast feedback from production back to development.
  A bug found in production hours later costs 10x
  more to fix than one caught in a PR review.

3rd Way — Culture of Experimentation & Learning
  ✓  Run experiments safely (feature flags, canary deploys)
  ✓  Learn from failures (blameless postmortems)
  ✓  Repetition builds mastery (automate, rehearse runbooks)
```

---

### Architecture: The DevOps Infinity Loop

```
         Plan ──► Code ──► Build ──► Test
           ▲                              │
           │                              ▼
        Monitor ◄── Operate ◄── Deploy ◄── Release
```

This infinite loop represents continuous delivery and continuous feedback. The goal is to make this loop as **fast and safe as possible**.

Key properties of a healthy loop:
- **Small batches** — commit often, deploy often (not once a quarter)
- **Fast feedback** — tests run in minutes, not hours
- **Reversible deployments** — you can roll back in seconds
- **Visible state** — everyone can see what's deployed where

---

### Guardrails & Anti-Patterns

| Anti-Pattern | Why it breaks | Guardrail |
|---|---|---|
| "DevOps team" as a separate silo | Recreates the wall with a new name | Embed DevOps practices in every team |
| Manual deployments | Slow, error-prone, undocumented | Automate everything in a pipeline |
| Long-lived feature branches | Merge conflicts, integration nightmares | Trunk-based development + feature flags |
| Blame culture after incidents | People hide failures, no learning | Blameless postmortems |
| Deploy on Fridays | No one around to fix fires | Deployment freeze windows OR deploy small + monitor |
| Hero culture | Bus factor of 1, burnout | Document everything, share runbooks |

---

### Python Snippet — CALMS Self-Assessment Script

This script scores a team's DevOps maturity across CALMS dimensions. In real orgs, this is done via surveys. Here's a minimal version:

```python
# calms_assessment.py
# A simple CLI tool to assess DevOps maturity across CALMS pillars.

CALMS_QUESTIONS = {
    "Culture": [
        "Do devs and ops share on-call responsibility?",
        "Are postmortems blameless and published?",
        "Can any engineer deploy to production?",
    ],
    "Automation": [
        "Is every deployment automated (no manual SSH)?",
        "Are tests run automatically on every commit?",
        "Is infrastructure provisioned via code (IaC)?",
    ],
    "Lean": [
        "Are features deployed in small, incremental batches?",
        "Is work-in-progress (WIP) limited per engineer?",
        "Is technical debt tracked and prioritized?",
    ],
    "Measurement": [
        "Do you track deployment frequency?",
        "Do you measure mean time to recovery (MTTR)?",
        "Are service error rates and latency dashboarded?",
    ],
    "Sharing": [
        "Are runbooks written and kept up to date?",
        "Are postmortems shared across all teams?",
        "Is on-call knowledge distributed (no single hero)?",
    ],
}

def run_assessment():
    scores = {}
    print("\n=== CALMS DevOps Maturity Assessment ===\n")
    print("Answer each question: 1 (No) | 2 (Partially) | 3 (Yes)\n")

    for pillar, questions in CALMS_QUESTIONS.items():
        print(f"── {pillar} ──")
        pillar_scores = []
        for q in questions:
            while True:
                try:
                    score = int(input(f"  {q}\n  Score [1-3]: "))
                    if score in (1, 2, 3):
                        pillar_scores.append(score)
                        break
                    print("  Please enter 1, 2, or 3.")
                except ValueError:
                    print("  Invalid input.")
        pillar_avg = sum(pillar_scores) / len(pillar_scores)
        scores[pillar] = round(pillar_avg, 2)
        print()

    print("\n=== Results ===")
    total = 0
    for pillar, avg in scores.items():
        bar = "█" * int(avg * 10) + "░" * (30 - int(avg * 10))
        label = "Needs Work" if avg < 2 else ("Developing" if avg < 2.7 else "Strong")
        print(f"  {pillar:<12} {avg:.1f}/3.0  [{bar}]  {label}")
        total += avg

    overall = total / len(scores)
    print(f"\n  Overall Score: {overall:.2f}/3.0")
    if overall < 2.0:
        print("  → Focus: Start with automation and blameless culture.")
    elif overall < 2.7:
        print("  → Focus: Strengthen measurement and sharing practices.")
    else:
        print("  → Strong foundation. Now optimize for speed and reliability.")

if __name__ == "__main__":
    run_assessment()
```

**What this demonstrates:**
- The CALMS pillars as concrete, answerable questions
- How to translate culture into measurable signals
- This pattern (structured scoring + feedback) appears in DORA metrics tooling at companies like Google

---

### DORA Metrics — The 4 Key DevOps Measures

Google's DevOps Research and Assessment (DORA) team identified 4 metrics that predict high-performing teams:

| Metric | What it measures | Elite benchmark |
|---|---|---|
| **Deployment Frequency** | How often you ship to production | Multiple times/day |
| **Lead Time for Changes** | Commit → production time | Less than 1 hour |
| **Change Failure Rate** | % of deploys that cause incidents | 0–15% |
| **Mean Time to Recovery (MTTR)** | Time to restore after failure | Less than 1 hour |

> These are your north-star metrics for Phase 1. We'll track them as we build out the pipeline in later lessons.

---

### Key Takeaway

> DevOps is the practice of removing friction between building software and operating it. The CALMS framework gives it structure. The Three Ways give it direction. DORA metrics give it measurability.
>
> **The core insight:** Fast AND stable are not opposites. High-performing teams deploy more often *and* have fewer failures because small, frequent changes are easier to test, review, and roll back.

---

### Interview Question

**"How would you explain DevOps to a non-technical stakeholder?"**

> *Strong answer:* "DevOps is a set of practices that let engineering teams ship software faster and more reliably by breaking down silos between development and operations. Instead of big, risky quarterly releases, teams ship small changes continuously — which means faster features, faster bug fixes, and faster recovery when things go wrong. We measure success with four metrics: how often we deploy, how quickly code reaches production, how often deployments cause problems, and how fast we recover."*

---

*Next: **[Lesson 2 — Linux Fundamentals for DevOps](#lesson-2--linux-fundamentals-for-devops)***

---

## Lesson 2 — Linux Fundamentals for DevOps

> **Tags:** `linux` `cli` `processes` `networking` `permissions` `file system`

### Concept

Every production server you'll ever touch runs Linux. Containers are Linux. CI/CD runners are Linux. Cloud VMs are Linux. If you can't navigate a Linux system confidently, you'll be blocked the moment something breaks at 2 AM.

You don't need to memorize every command. You need to understand **five areas** well enough to diagnose and fix problems without a GUI.

---

### The Five Areas

#### 1. File System Layout

Linux uses a single tree rooted at `/`. Key directories every DevOps engineer must know:

```
/
├── bin/        → Essential binaries (ls, cat, grep)
├── etc/        → System-wide config files (nginx.conf, hosts, crontab)
├── var/        → Variable data: logs (/var/log), databases, caches
├── tmp/        → Temporary files (cleared on reboot)
├── home/       → User home directories (/home/alice)
├── proc/       → Virtual FS: live kernel & process info (/proc/cpuinfo)
├── sys/        → Virtual FS: kernel device/driver interface
├── usr/        → User programs and libraries (/usr/bin, /usr/lib)
└── opt/        → Optional/third-party software (Docker installs here)
```

> **Rule:** Config lives in `/etc`. Logs live in `/var/log`. If something is broken, start there.

---

#### 2. Permissions Model

Every file has three permission sets: **owner**, **group**, **others**. Each set has read (r=4), write (w=2), execute (x=1).

```
-rwxr-xr--  1  alice  devops  4096  Jun 7 deploy.sh
 ││││││││└── others: r-- = 4 (read only)
 │││││└───── group:  r-x = 5 (read + execute)
 ││└──────── owner:  rwx = 7 (full)
 │└───────── file type: - = regular file, d = directory, l = symlink
```

```bash
chmod 750 deploy.sh     # owner=rwx, group=rx, others=none
chmod +x deploy.sh      # add execute for all
chown alice:devops file  # change owner:group
```

> **Guardrail:** Never `chmod 777`. It gives the world write access. In a container, it means any process can overwrite your binary.

---

#### 3. Process Management

```bash
ps aux                  # all running processes (user, PID, CPU, MEM, command)
top / htop              # live process monitor (htop is friendlier)
kill -9 <PID>           # force-kill a process (SIGKILL — no cleanup)
kill -15 <PID>          # graceful shutdown (SIGTERM — let app clean up)
systemctl status nginx  # check if a service is running
systemctl restart nginx # restart a managed service
journalctl -u nginx -f  # follow logs for a systemd service
```

**Process signals cheat sheet:**

| Signal | Number | Meaning |
|--------|--------|---------|
| SIGTERM | 15 | "Please shut down gracefully" |
| SIGKILL | 9 | "Die immediately, no cleanup" |
| SIGHUP | 1 | "Reload config" (used by nginx, sshd) |
| SIGINT | 2 | Ctrl+C in terminal |

> **Guardrail:** Always try `SIGTERM` first. `SIGKILL` skips cleanup — open files, DB connections, and in-flight requests get dropped. In containers, your app **must** handle SIGTERM or your deployments will be dirty.

---

#### 4. Networking

```bash
curl -v https://api.example.com/health   # HTTP request + full headers
wget -O - http://localhost:8080/ready    # download to stdout
ss -tlnp                                  # listening TCP ports + owning process
netstat -tulnp                            # same (older systems)
ping 8.8.8.8                              # ICMP reachability check
traceroute 8.8.8.8                        # hop-by-hop path to destination
nslookup api.example.com                  # DNS lookup
dig api.example.com A                     # detailed DNS lookup
lsof -i :8080                             # which process owns port 8080?
iptables -L                               # list firewall rules
```

**Diagnosing a "can't connect" issue — the checklist:**
```
1. Is the process running?          → ps aux | grep myapp
2. Is it listening on the right port? → ss -tlnp | grep 8080
3. Is the firewall blocking it?     → iptables -L or ufw status
4. Is DNS resolving correctly?      → dig myapp.internal
5. Can you reach it locally?        → curl localhost:8080
6. Can you reach it remotely?       → curl <IP>:8080
```

---

#### 5. Essential One-Liners

```bash
# Find large files eating your disk
du -sh /* | sort -rh | head -20

# Follow logs in real time
tail -f /var/log/nginx/access.log

# Search logs for errors
grep -i "error\|exception\|fatal" /var/log/app.log

# Count occurrences
grep -c "500" /var/log/nginx/access.log

# Pipe: count unique IPs hitting your server
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# Find a file by name
find /etc -name "*.conf" -type f

# Check disk usage
df -h

# Check memory
free -h

# Environment variables
env | grep PATH
export MY_VAR=hello
echo $MY_VAR
```

---

### Guardrails & Anti-Patterns

| Anti-Pattern | Risk | Guardrail |
|---|---|---|
| Running apps as root | Any exploit = full system compromise | Create a dedicated low-privilege user |
| Hardcoding secrets in shell scripts | `ps aux` exposes them to all users | Use env vars from a secrets manager |
| `kill -9` as first resort | Dirty shutdown, data corruption | Always try `kill -15` first, wait 10s |
| Ignoring `/var/log` | You're flying blind | Set up log rotation, ship logs off-box |
| `chmod 777` | World-writable = security hole | Use the minimum permissions needed |
| `rm -rf /` (or typos that approximate it) | Destroys the entire filesystem | Never run destructive commands as root without double-checking |

---

### Python Snippet — System Health Check Script

A DevOps engineer's bread-and-butter: a script that checks system health and reports issues. This uses only the Python standard library — no external dependencies.

```python
# system_health.py
# Checks CPU, memory, disk, and open ports. Prints a health report.
# Runs on any Linux system with Python 3.6+.

import os
import shutil
import socket
import subprocess

# ── Thresholds ────────────────────────────────────────────────
CPU_WARN_PERCENT   = 80.0
MEM_WARN_PERCENT   = 80.0
DISK_WARN_PERCENT  = 85.0
PORTS_TO_CHECK     = [22, 80, 443, 8080]  # adjust for your stack
# ──────────────────────────────────────────────────────────────


def check_cpu():
    """Read CPU usage from /proc/stat (Linux only)."""
    with open("/proc/stat") as f:
        line = f.readline()  # e.g. "cpu  12345 0 6789 ..."
    fields = [float(x) for x in line.split()[1:]]
    idle = fields[3]
    total = sum(fields)
    used_pct = 100.0 * (1.0 - idle / total)
    return round(used_pct, 1)


def check_memory():
    """Parse /proc/meminfo to get memory usage percentage."""
    mem = {}
    with open("/proc/meminfo") as f:
        for line in f:
            key, val = line.split(":")
            mem[key.strip()] = int(val.split()[0])  # in kB

    total = mem["MemTotal"]
    available = mem["MemAvailable"]
    used_pct = 100.0 * (total - available) / total
    return round(used_pct, 1), total // 1024, (total - available) // 1024


def check_disk(path="/"):
    """Use shutil.disk_usage to check disk fill percentage."""
    total, used, free = shutil.disk_usage(path)
    used_pct = 100.0 * used / total
    return round(used_pct, 1), total // (1024**3), free // (1024**3)


def check_port(host="127.0.0.1", port=80, timeout=1.0):
    """Attempt a TCP connection to check if a port is open."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (ConnectionRefusedError, OSError):
        return False


def status_line(label, value, warn_threshold, unit="", extra=""):
    ok = value < warn_threshold
    icon = "✓" if ok else "✗"
    flag = "" if ok else "  ← WARN"
    print(f"  [{icon}] {label:<20} {value}{unit}{extra}{flag}")
    return ok


def main():
    print("\n====== System Health Report ======\n")
    all_ok = True

    # CPU
    cpu = check_cpu()
    all_ok &= status_line("CPU Usage", cpu, CPU_WARN_PERCENT, "%")

    # Memory
    mem_pct, mem_total_mb, mem_used_mb = check_memory()
    all_ok &= status_line(
        "Memory Usage", mem_pct, MEM_WARN_PERCENT, "%",
        f"  ({mem_used_mb} MB / {mem_total_mb} MB)"
    )

    # Disk
    disk_pct, disk_total_gb, disk_free_gb = check_disk("/")
    all_ok &= status_line(
        "Disk Usage (/)", disk_pct, DISK_WARN_PERCENT, "%",
        f"  ({disk_free_gb} GB free of {disk_total_gb} GB)"
    )

    # Ports
    print()
    for port in PORTS_TO_CHECK:
        open_ = check_port(port=port)
        icon = "✓" if open_ else "✗"
        state = "OPEN" if open_ else "CLOSED"
        print(f"  [{icon}] Port {port:<6} {state}")
        if not open_:
            all_ok = False

    # Summary
    print()
    if all_ok:
        print("  ✓ All checks passed. System healthy.")
    else:
        print("  ✗ Issues detected. Review warnings above.")
    print()


if __name__ == "__main__":
    main()
```

**What this demonstrates:**
- Reading Linux virtual filesystems (`/proc/stat`, `/proc/meminfo`) — the same source `top` and `htop` use
- TCP port probing — the same technique monitoring systems like Nagios use
- Clean threshold-based alerting logic

> Try running this on a Linux VM or WSL. To simulate high disk usage: `dd if=/dev/zero of=/tmp/bigfile bs=1M count=4000`

---

### Key Takeaway

> Linux mastery for DevOps is about **reading the system's state** and **diagnosing problems methodically**. The five areas — filesystem, permissions, processes, networking, and one-liners — cover 95% of what you need in an incident.
>
> **The core habit:** When something breaks, don't guess. Check logs (`/var/log`), check if the process is running (`ps aux`), check if it's listening (`ss -tlnp`), check if traffic can reach it (`curl`). Work from the inside out.

---

### Interview Question

**"Walk me through how you'd debug a web service that suddenly stopped responding."**

> *Strong answer:* "First I'd check if the process is running — `ps aux | grep myapp`. If it's running, I'd check if it's listening on the expected port with `ss -tlnp`. Then I'd check if there's a firewall rule blocking traffic with `iptables -L` or `ufw status`. I'd look at recent logs in `/var/log` or via `journalctl -u myapp -n 100`. I'd also check system resources — CPU, memory, and disk — to rule out resource exhaustion. Finally I'd try `curl localhost:<port>` to test locally before testing remotely, to isolate network from application issues."*

---

*Next: **[Lesson 3 — Git Workflows](#lesson-3--git-workflows)***

---

## Lesson 3 — Git Workflows

> **Tags:** `git` `branching` `trunk-based development` `PR hygiene` `merge strategies`

### Concept

Git is the source of truth for everything in DevOps — not just code, but infrastructure definitions, CI/CD pipelines, Kubernetes manifests, and configuration. How your team uses Git directly determines how fast and safely you can ship.

The critical insight: **your branching strategy is your deployment strategy**. Teams with long-lived branches ship slowly and break often. Teams with short-lived branches ship frequently and break rarely.

---

### The Three Main Strategies

#### Strategy 1 — Gitflow (the classic, often wrong choice)

```
main ────●───────────────────────────────────●──── (production)
          \                                  /
develop ───●────●────●────●────●────●────●──  (integration)
               /          \       /
feature/A ────●────●────●──       (weeks-long)
                         \
feature/B                 ●────●────●────●──  (weeks-long)
```

- Pros: Clear release structure, suits software with versioned releases (mobile apps, firmware)
- **Cons:** Long-lived branches = massive merge conflicts, slow feedback, dangerous big-bang releases
- **Use when:** You ship versioned, infrequent releases (e.g. a mobile SDK, not a web service)

---

#### Strategy 2 — GitHub Flow (simple, good for small teams)

```
main ────●──────────────────────●──── (always deployable)
          \                    /
feature/x  ●────●────●────────  (short, days not weeks)
                      ↑
                   PR + review + CI → merge → deploy
```

- Short-lived feature branches off `main`
- Open a PR when ready → CI runs → review → merge → deploy
- **Best for:** Small teams, SaaS products, continuous delivery
- **Cons:** Needs strong CI coverage; without feature flags, incomplete features ship

---

#### Strategy 3 — Trunk-Based Development (TBD, what elite teams use)

```
main/trunk ────●────●────●────●────●────●────  (commits land directly or via < 1-day PRs)
                     ↑         ↑
               feature flag  feature flag
               hides WIP      enables feature
```

- Everyone integrates to `main` at least once per day
- Features hidden behind **feature flags** until ready
- Zero long-lived branches
- **Best for:** High-frequency deployment (multiple times/day), large teams, microservices
- **This is what Google, Facebook, and Netflix use internally**

---

### Branching Naming Convention

```
feature/JIRA-123-add-oauth-login   # new capability
fix/JIRA-456-null-pointer-crash    # bug fix
chore/update-dependencies          # non-functional change
hotfix/critical-payment-bug        # emergency production fix
release/v2.4.0                     # (Gitflow only)
```

---

### PR Hygiene — What a Good Pull Request Looks Like

A PR is a unit of review, not a dump of a week's work.

**Size:** < 400 lines changed. If it's larger, split it. Big PRs get rubber-stamped.

**PR description template:**
```markdown
## What
One sentence: what does this change do?

## Why
Why is this needed? Link to ticket/issue.

## How
Brief explanation of the approach. Any alternatives considered?

## Testing
How was this tested? Any edge cases covered?

## Screenshots / logs
(if UI or output changes)
```

**Commit message format (Conventional Commits):**
```
<type>(<scope>): <short description>

feat(auth): add OAuth2 login via Google
fix(api): handle null user ID in /profile endpoint
chore(deps): upgrade boto3 to 1.34.0
docs(readme): add deployment instructions
refactor(db): extract connection pool to module
test(auth): add unit tests for token expiry
```

> **Why Conventional Commits?** CI tools can auto-generate changelogs, bump version numbers, and trigger release pipelines based on commit type. `feat` → minor bump, `fix` → patch bump, `feat!` (breaking) → major bump.

---

### Merge Strategies

| Strategy | Command | Result | Use when |
|---|---|---|---|
| **Merge commit** | `git merge` | Preserves full history + merge commit | Long-lived branches, need audit trail |
| **Squash merge** | `git merge --squash` | All PR commits → single commit on main | Feature branches, keep main history clean |
| **Rebase** | `git rebase` | Replays commits linearly, no merge commit | Clean linear history, small teams |

> **Guardrail:** Never rebase shared branches. `git rebase` rewrites history — if others have pulled that branch, their history diverges. Only rebase your own local commits before pushing.

---

### Git Commands Every DevOps Engineer Uses Daily

```bash
# Core workflow
git clone <url>
git checkout -b feature/my-feature
git add -p                          # stage changes interactively (patch mode)
git commit -m "feat(api): add /health endpoint"
git push origin feature/my-feature

# Inspection
git log --oneline --graph --all     # visual branch history
git diff HEAD~1                     # what changed in last commit
git show <commit-hash>              # full diff of a commit
git blame <file>                    # who wrote each line, and when

# Recovery
git stash                           # temporarily shelve changes
git stash pop                       # restore shelved changes
git reset --soft HEAD~1             # undo last commit, keep changes staged
git reset --hard HEAD~1             # undo last commit, DISCARD changes (destructive)
git revert <commit-hash>            # create a new commit that undoes a past one (safe)
git bisect start                    # binary-search commits to find which one broke something

# Cleanup
git branch -d feature/done          # delete local branch
git push origin --delete feature/done  # delete remote branch
git fetch --prune                   # remove remote-tracking refs for deleted branches
```

---

### Guardrails & Anti-Patterns

| Anti-Pattern | Risk | Guardrail |
|---|---|---|
| Long-lived feature branches (weeks) | Massive merge conflicts, integration hell | Merge to trunk daily; use feature flags |
| Committing secrets (API keys, passwords) | Permanent leak even after deletion | `git-secrets`, `.gitignore`, pre-commit hooks |
| Force-pushing to shared branches | Destroys teammates' history | Protect `main` branch; require PRs |
| `git reset --hard` on shared branches | Data loss | Use `git revert` to undo safely |
| Giant PRs (1000+ lines) | No one reviews carefully | Split into smaller PRs; pair program |
| No branch protection rules | Anyone can push bad code to main | Require: CI passing + 1 reviewer + no force-push |
| Merging without CI passing | Broken main = everyone blocked | Branch protection: require status checks |

---

### Python Snippet — Git Pre-Commit Hook (Secret Scanner)

Pre-commit hooks run before every `git commit`. This one blocks commits that contain common secret patterns — your last line of defense before secrets hit remote.

```python
#!/usr/bin/env python3
# .git/hooks/pre-commit
# Make executable: chmod +x .git/hooks/pre-commit
#
# Scans staged files for common secret patterns before allowing a commit.
# Blocks the commit if any matches are found.

import re
import subprocess
import sys

# ── Patterns that look like secrets ───────────────────────────────────────────
SECRET_PATTERNS = [
    (r"(?i)aws_access_key_id\s*=\s*['\"]?AKIA[0-9A-Z]{16}",  "AWS Access Key ID"),
    (r"(?i)aws_secret_access_key\s*=\s*['\"]?[A-Za-z0-9/+=]{40}", "AWS Secret Key"),
    (r"(?i)(password|passwd|pwd)\s*=\s*['\"][^'\"]{6,}['\"]", "Hardcoded password"),
    (r"(?i)(api_key|apikey|api-key)\s*=\s*['\"][^'\"]{10,}['\"]", "API Key"),
    (r"(?i)(secret|token)\s*=\s*['\"][^'\"]{10,}['\"]",        "Secret/Token"),
    (r"-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----",           "Private key"),
    (r"ghp_[0-9A-Za-z]{36}",                                    "GitHub Personal Access Token"),
]
# ──────────────────────────────────────────────────────────────────────────────

def get_staged_files():
    """Return list of staged file paths (added/modified, not deleted)."""
    result = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
        capture_output=True, text=True
    )
    return result.stdout.strip().splitlines()


def get_staged_content(filepath):
    """Return the staged (index) content of a file, not the working tree."""
    result = subprocess.run(
        ["git", "show", f":{filepath}"],
        capture_output=True, text=True
    )
    return result.stdout


def scan_file(filepath, content):
    """Scan file content for secret patterns. Returns list of (line_num, label, match)."""
    findings = []
    for line_num, line in enumerate(content.splitlines(), start=1):
        for pattern, label in SECRET_PATTERNS:
            if re.search(pattern, line):
                # Redact the actual value before printing
                redacted = re.sub(r"=\s*['\"]?([^'\"]{4}).*", r"= \1****", line.strip())
                findings.append((line_num, label, redacted))
    return findings


def main():
    staged = get_staged_files()
    if not staged:
        sys.exit(0)

    violations = []
    for filepath in staged:
        # Skip binary files and known safe patterns
        if any(filepath.endswith(ext) for ext in [".png", ".jpg", ".gif", ".pdf", ".zip"]):
            continue
        try:
            content = get_staged_content(filepath)
        except Exception:
            continue
        findings = scan_file(filepath, content)
        for line_num, label, redacted in findings:
            violations.append(f"  {filepath}:{line_num}  [{label}]  {redacted}")

    if violations:
        print("\n🚫 Pre-commit hook: Possible secrets detected!\n")
        for v in violations:
            print(v)
        print("\nRemove secrets before committing.")
        print("If this is a false positive, use: git commit --no-verify\n")
        sys.exit(1)  # Non-zero exit blocks the commit

    sys.exit(0)


if __name__ == "__main__":
    main()
```

**Installation:**
```bash
cp pre_commit_scan.py .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**What this demonstrates:**
- Git hook mechanics (`pre-commit` runs before every commit)
- Scanning staged content (not working tree) via `git show :filepath`
- The `sys.exit(1)` contract — non-zero exit aborts the commit
- In production, use [`pre-commit`](https://pre-commit.com/) + [`detect-secrets`](https://github.com/Yelp/detect-secrets) which handle edge cases, binary files, and team-wide config

---

### Key Takeaway

> Your branching strategy determines your deployment velocity. Short-lived branches + feature flags = fast, safe delivery. Long-lived branches = merge debt and big-bang risk.
>
> **The core habit:** Treat `main` as always deployable. Every commit that lands on `main` should be releasable to production. If it's not ready to ship, it's not ready to merge — hide it behind a feature flag.

---

### Interview Question

**"What branching strategy would you recommend for a team deploying a SaaS product 5+ times per day?"**

> *Strong answer:* "Trunk-based development. All engineers integrate to `main` at least once per day via short-lived branches or direct commits. Features that aren't ready for users are hidden behind feature flags — not in separate branches. This eliminates merge conflicts, keeps CI feedback fast, and means `main` is always in a releasable state. We'd pair it with branch protection rules requiring CI to pass and at least one review before merge, and a pre-commit hook to catch secrets before they hit the remote."*

---

*Next: **[Lesson 4 — Containers & Docker](#lesson-4--containers--docker)***

---

## Lesson 4 — Containers & Docker

> **Tags:** `docker` `containers` `images` `layers` `volumes` `networking` `OCI`

### Concept

A container is a **lightweight, isolated process** that packages your application with everything it needs to run — runtime, libraries, config — into a single portable unit.

Before containers, "it works on my machine" was a constant problem. Dev ran Python 3.9 on macOS. Staging ran Python 3.7 on Ubuntu. Production ran something else. Containers solve this by making the environment part of the artifact.

**Container vs Virtual Machine:**

```
┌──────────────────────────────┐   ┌──────────────────────────────┐
│         Virtual Machine       │   │          Container            │
├──────────────────────────────┤   ├──────────────────────────────┤
│     App A    │    App B       │   │  App A  │  App B  │  App C   │
├──────────────┼────────────── │   ├─────────┼─────────┼──────────┤
│  Guest OS    │  Guest OS     │   │  Libs   │  Libs   │  Libs    │
├──────────────┴───────────────┤   ├──────────────────────────────┤
│         Hypervisor           │   │         Docker Engine         │
├──────────────────────────────┤   ├──────────────────────────────┤
│          Host OS             │   │           Host OS             │
├──────────────────────────────┤   ├──────────────────────────────┤
│           Hardware           │   │           Hardware            │
└──────────────────────────────┘   └──────────────────────────────┘
  Full OS per VM = GBs of overhead   Shared kernel = MBs, starts in ms
```

Containers share the host OS kernel — they're just processes with namespace and cgroup isolation. This makes them:
- **Fast** — start in milliseconds, not minutes
- **Small** — MBs, not GBs
- **Portable** — build once, run anywhere with a container runtime

---

### Image Layers — How Docker Builds Work

A Docker image is a **stack of read-only layers**. Each instruction in a `Dockerfile` creates one layer.

```
┌─────────────────────────────┐  ← Layer 4: COPY app code (changes often)
├─────────────────────────────┤  ← Layer 3: RUN pip install (changes sometimes)
├─────────────────────────────┤  ← Layer 2: COPY requirements.txt
├─────────────────────────────┤  ← Layer 1: FROM python:3.12-slim (base image)
└─────────────────────────────┘
```

**Docker caches layers.** If layer N hasn't changed, it reuses the cache. This is why order matters — put things that change rarely at the top, things that change often at the bottom.

**Bad ordering (slow builds):**
```dockerfile
FROM python:3.12-slim
COPY . /app          # copies all source — cache busted on every code change
RUN pip install -r requirements.txt  # reinstalls every time!
```

**Good ordering (fast builds):**
```dockerfile
FROM python:3.12-slim
COPY requirements.txt /app/   # only changes when deps change
RUN pip install -r /app/requirements.txt  # cached until deps change
COPY . /app                   # source changes don't bust the pip layer
```

---

### Anatomy of a Production-Grade Dockerfile

```dockerfile
# ── Stage 1: Builder ─────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build tools only in builder stage (not in final image)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt

# ── Stage 2: Runtime ─────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Security: run as non-root user
RUN useradd --create-home --shell /bin/bash appuser

WORKDIR /app

# Copy only installed packages from builder (no gcc, no build tools)
COPY --from=builder /install /usr/local
COPY --chown=appuser:appuser . .

# Security: never run as root
USER appuser

# Document the port (doesn't actually publish — that's docker run -p)
EXPOSE 8080

# Prefer ENTRYPOINT + CMD over just CMD for proper signal handling
ENTRYPOINT ["python"]
CMD ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

**What makes this production-grade:**
- **Multi-stage build** — build tools (`gcc`) never ship in the final image (smaller, less attack surface)
- **Non-root user** — if the container is exploited, the attacker isn't root on the host
- **`--no-install-recommends`** — avoids pulling in hundreds of unused packages
- **`ENTRYPOINT` + `CMD`** — `ENTRYPOINT` sets the executable; `CMD` provides default args that can be overridden. Using both means `docker run myapp --workers 4` works cleanly
- **`--no-cache-dir`** — pip's cache wastes space in the image

---

### Essential Docker Commands

```bash
# Build
docker build -t myapp:latest .                   # build image from Dockerfile in cwd
docker build -t myapp:1.0.0 --target runtime .   # build specific stage

# Run
docker run -p 8080:8080 myapp:latest             # map host:container port
docker run -d myapp:latest                        # detached (background)
docker run -e DB_URL=postgres://... myapp:latest  # pass env vars
docker run --rm myapp:latest                      # auto-remove container on exit
docker run -v $(pwd)/data:/app/data myapp:latest  # mount host dir as volume

# Inspect
docker ps                                          # running containers
docker ps -a                                       # all containers (inc. stopped)
docker logs -f <container>                         # follow container logs
docker exec -it <container> bash                   # shell into running container
docker inspect <container>                         # full JSON metadata
docker stats                                       # live CPU/mem usage

# Images
docker images                                      # list local images
docker pull python:3.12-slim                       # pull from registry
docker push myregistry/myapp:1.0.0                 # push to registry
docker rmi myapp:old                               # delete image

# Cleanup
docker system prune -af                            # remove all unused images + containers
docker volume prune                                # remove unused volumes
```

---

### Volumes vs Bind Mounts vs tmpfs

| Type | Definition | Use case |
|---|---|---|
| **Volume** | Docker-managed storage on host (`/var/lib/docker/volumes/`) | Databases, persistent data — survives container restarts |
| **Bind mount** | Maps a specific host path into the container | Dev: live-reload code; scripts that need host files |
| **tmpfs** | In-memory only, never written to disk | Sensitive temp data (secrets, session tokens) |

```bash
docker run -v mydata:/app/data myapp          # named volume (Docker managed)
docker run -v $(pwd)/src:/app/src myapp       # bind mount (host path)
docker run --tmpfs /app/tmp myapp             # tmpfs
```

> **Guardrail:** Never store important data inside a container's writable layer. When the container is removed, that data is gone. Always use volumes for persistence.

---

### Container Networking

```
docker network ls               # list networks
docker network create mynet     # create a custom bridge network
docker run --network mynet myapp  # attach container to network
```

**Default networks:**

| Network | Behavior |
|---|---|
| `bridge` | Default; containers get their own IPs; isolated from host |
| `host` | Container shares host network stack — no isolation, max performance |
| `none` | No networking at all |

**How containers find each other:**

On a user-defined bridge network (`docker network create mynet`), containers can reach each other by **container name** as DNS:

```
Container "api" can reach Container "db" at: postgres://db:5432/mydb
```

This only works on user-defined networks — not the default `bridge` network. This is why Docker Compose creates its own network automatically.

---

### Guardrails & Anti-Patterns

| Anti-Pattern | Risk | Guardrail |
|---|---|---|
| Running as root inside container | Exploit → root on host | `USER nonroot` in Dockerfile |
| Storing secrets in ENV in Dockerfile | `docker inspect` exposes them | Inject at runtime via secrets manager |
| Using `:latest` tag in production | Non-deterministic — image can change silently | Pin to a specific SHA or semver tag |
| Huge images (1 GB+) | Slow pulls, large attack surface | Multi-stage builds, distroless or slim base images |
| Installing debug tools in production image | Larger surface area | Add them to a separate debug stage |
| No `.dockerignore` | `.git/`, `node_modules/`, secrets copied into image | Always add `.dockerignore` |
| One container, many processes | Breaks single-responsibility; hard to log/monitor | One process per container |

**.dockerignore (always include this):**
```
.git
.env
*.pyc
__pycache__/
node_modules/
*.log
.DS_Store
```

---

### Python Snippet — Docker SDK: Build, Run, and Health-Check a Container

The Docker SDK for Python lets you manage containers programmatically — useful for CI scripts, testing harnesses, and automation.

```python
# docker_manager.py
# Demonstrates: build image, run container, health-check, cleanup
# Install: pip install docker

import time
import docker
import tempfile
import textwrap
from pathlib import Path


def build_sample_app(tmp_dir: Path):
    """Write a minimal FastAPI app and Dockerfile for demonstration."""

    (tmp_dir / "app.py").write_text(textwrap.dedent("""\
        from fastapi import FastAPI
        app = FastAPI()

        @app.get("/health")
        def health():
            return {"status": "ok"}
    """))

    (tmp_dir / "requirements.txt").write_text("fastapi\nuvicorn\n")

    (tmp_dir / "Dockerfile").write_text(textwrap.dedent("""\
        FROM python:3.12-slim
        WORKDIR /app
        COPY requirements.txt .
        RUN pip install --no-cache-dir -r requirements.txt
        COPY app.py .
        EXPOSE 8080
        CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
    """))

    (tmp_dir / ".dockerignore").write_text("__pycache__\n*.pyc\n")


def main():
    client = docker.from_env()
    image_tag = "devops-lesson4-demo:latest"
    container = None

    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        build_sample_app(tmp_dir)

        # ── 1. Build ──────────────────────────────────────────────
        print(f"Building image: {image_tag}")
        image, build_logs = client.images.build(
            path=str(tmp_dir),
            tag=image_tag,
            rm=True,           # remove intermediate containers
            forcerm=True,
        )
        print(f"  Built: {image.short_id}  size: {image.attrs['Size'] // 1024 // 1024} MB")

        # ── 2. Run ────────────────────────────────────────────────
        print("\nStarting container...")
        container = client.containers.run(
            image_tag,
            detach=True,
            ports={"8080/tcp": 8080},     # host_port: container_port
            remove=False,
        )
        print(f"  Container ID: {container.short_id}")
        print(f"  Status: {container.status}")

        # ── 3. Health check — poll until the app responds ─────────
        import urllib.request
        print("\nWaiting for app to become healthy...")
        for attempt in range(10):
            try:
                with urllib.request.urlopen("http://localhost:8080/health", timeout=2) as r:
                    body = r.read().decode()
                print(f"  ✓ Healthy on attempt {attempt + 1}: {body}")
                break
            except Exception:
                time.sleep(1)
        else:
            print("  ✗ App did not become healthy in time")
            print("  Logs:", container.logs().decode())

        # ── 4. Inspect running container ─────────────────────────
        container.reload()
        meta = container.attrs
        print(f"\nContainer details:")
        print(f"  Image:   {meta['Config']['Image']}")
        print(f"  Status:  {meta['State']['Status']}")
        print(f"  PID:     {meta['State']['Pid']}")
        ip = meta["NetworkSettings"]["Networks"].get("bridge", {}).get("IPAddress", "N/A")
        print(f"  IP:      {ip}")

    # ── 5. Cleanup ────────────────────────────────────────────────
    if container:
        print("\nStopping and removing container...")
        container.stop(timeout=10)   # sends SIGTERM, waits 10s, then SIGKILL
        container.remove()
        print("  Removed.")

    client.images.remove(image_tag, force=True)
    print(f"  Image {image_tag} removed.")


if __name__ == "__main__":
    main()
```

**What this demonstrates:**
- Building images programmatically (`images.build`) — used in CI scripts
- Running with port mapping and detached mode
- Health-polling loop — the same pattern Kubernetes uses for readiness probes
- Proper cleanup: `stop(timeout=10)` sends `SIGTERM`, waits, then `SIGKILL` — mirrors how orchestrators handle graceful shutdown
- `container.logs()` — how you retrieve output from a detached container

---

### Key Takeaway

> A container is your application + its environment, packaged as an immutable artifact. The image is the blueprint; the container is the running instance. Build the smallest possible image, run as non-root, pin your tags, and never store state in the container's writable layer.
>
> **The core mental model:** Think of a container like a function call — it takes inputs (env vars, mounted volumes), does work, and exits. Side effects (data) should go to external storage, not inside the container.

---

### Interview Question

**"What's the difference between a Docker image and a container? And what's a layer?"**

> *Strong answer:* "An image is a read-only, immutable blueprint — a stack of filesystem layers built by each Dockerfile instruction. A container is a running instance of an image: it gets the read-only layers plus a thin writable layer on top for runtime changes. Layers are cached — Docker only rebuilds layers that have changed, which is why instruction order in a Dockerfile matters for build speed. You want stable, infrequently-changing instructions at the top and application code at the bottom."*

---

*Next: **[Lesson 5 — Docker Compose](#lesson-5--docker-compose)***

---

---

## Lesson 5 — Docker Compose

> **Tags:** `docker compose` `multi-service` `local stack` `orchestration` `depends_on` `networking`

### Concept

Docker Compose lets you define and run **multi-container applications** from a single YAML file. Instead of manually running three `docker run` commands with the right flags, ports, volumes, and network settings, you describe the entire stack once and bring it up with one command.

It's the standard tool for:
- **Local development** — your app + database + cache + reverse proxy, all in sync
- **Integration testing in CI** — spin up real dependencies (Postgres, Redis) for tests, then tear them down
- **Prototyping** — quickly wire services together before moving to Kubernetes

> **Compose is not a production orchestrator.** It runs on a single machine with no scheduling, autoscaling, or self-healing. For production, that's Kubernetes (Lesson 26–27). But every production architecture starts as a Compose file.

---

### Anatomy of a `docker-compose.yml`

```
project/
├── docker-compose.yml
├── docker-compose.override.yml   ← local overrides (gitignored)
├── .env                          ← env vars (gitignored)
├── api/
│   ├── Dockerfile
│   └── app.py
└── nginx/
    └── nginx.conf
```

---

### A Real-World Stack: API + Postgres + Redis + Nginx

```yaml
# docker-compose.yml
# Stack: FastAPI → PostgreSQL + Redis, behind Nginx reverse proxy

version: "3.9"

# ── Shared config via YAML anchors (DRY) ─────────────────────────
x-common-env: &common-env
  DB_URL: postgresql://appuser:${DB_PASSWORD}@db:5432/appdb
  REDIS_URL: redis://cache:6379/0
  LOG_LEVEL: ${LOG_LEVEL:-info}

services:

  # ── Reverse Proxy ───────────────────────────────────────────────
  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"           # only nginx exposes a port to the host
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      api:
        condition: service_healthy   # wait until api passes health check
    restart: unless-stopped

  # ── Application ─────────────────────────────────────────────────
  api:
    build:
      context: ./api
      target: runtime              # use the 'runtime' stage from multi-stage Dockerfile
    environment:
      <<: *common-env              # merge shared env vars
    expose:
      - "8080"                     # internal only — not published to host
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s            # give the app time to initialize before first check
    restart: unless-stopped

  # ── Database ─────────────────────────────────────────────────────
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: appdb
    volumes:
      - pgdata:/var/lib/postgresql/data    # named volume = persistent
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro  # run on first start
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped

  # ── Cache ─────────────────────────────────────────────────────────
  cache:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redisdata:/data
    restart: unless-stopped

volumes:
  pgdata:     # Docker-managed, persists across container restarts
  redisdata:

networks:
  default:
    name: myapp-network
```

**.env file (never commit this):**
```bash
DB_PASSWORD=supersecret
LOG_LEVEL=debug
```

---

### How `depends_on` Actually Works

`depends_on` controls **start order**, not **readiness**. Without `condition: service_healthy`, Compose starts the container but doesn't wait for it to be ready.

```yaml
# BAD — api starts as soon as db container starts, not when Postgres is ready
depends_on:
  - db

# GOOD — api waits until db passes its healthcheck
depends_on:
  db:
    condition: service_healthy
```

Three condition options:
| Condition | Meaning |
|---|---|
| `service_started` | Container is running (default) |
| `service_healthy` | Container passes its `healthcheck` |
| `service_completed_successfully` | Container exited with code 0 (for init jobs) |

---

### Essential Compose Commands

```bash
# Lifecycle
docker compose up -d                    # start all services, detached
docker compose up --build -d            # rebuild images before starting
docker compose down                     # stop + remove containers + networks
docker compose down -v                  # also remove volumes (wipes data!)
docker compose restart api              # restart one service

# Observation
docker compose ps                       # status of all services
docker compose logs -f api              # follow logs for one service
docker compose logs -f                  # follow all logs
docker compose top                      # processes running inside each container

# One-off commands
docker compose run --rm api pytest      # run tests inside the api container
docker compose exec db psql -U appuser  # shell into running db container

# Scaling (Compose only, not for stateful services)
docker compose up -d --scale api=3     # run 3 api replicas

# Config inspection
docker compose config                   # show merged, resolved config
```

---

### Override Files — Dev vs CI vs Prod Config

Compose automatically merges `docker-compose.yml` + `docker-compose.override.yml`. Use this to keep dev config separate from CI config:

```yaml
# docker-compose.override.yml  (local dev — gitignored)
services:
  api:
    build:
      target: development          # use dev stage with debugger
    volumes:
      - ./api:/app                 # live-reload: mount source into container
    environment:
      LOG_LEVEL: debug
    ports:
      - "5678:5678"                # expose debugger port locally

  db:
    ports:
      - "5432:5432"                # expose Postgres to host for GUI tools (TablePlus etc.)
```

```bash
# CI: use a specific override, not the default
docker compose -f docker-compose.yml -f docker-compose.ci.yml up -d
```

---

### Guardrails & Anti-Patterns

| Anti-Pattern | Risk | Guardrail |
|---|---|---|
| Committing `.env` with secrets | Secrets in Git history forever | Add `.env` to `.gitignore`; use `.env.example` instead |
| Using Compose in production (single host) | No HA, no autoscaling, no self-healing | Use Kubernetes or a managed container platform |
| `docker compose down -v` carelessly | Drops database volumes = data loss | Only use `-v` in CI or when you intend to wipe state |
| No healthchecks on dependencies | Race condition — app starts before DB is ready | Add `healthcheck` + `condition: service_healthy` |
| Hardcoding passwords in `docker-compose.yml` | Secrets in repo | Use `${VAR}` from `.env` or shell environment |
| Exposing DB port to host in production | Anyone on the machine can connect | Use `expose` (internal only) instead of `ports` for non-edge services |
| Building app image in Compose for CI | Slow, non-deterministic | Build once, push to registry, pull by tag in CI |

---

### Python Snippet — Integration Test Harness with Compose

This script starts your stack, waits for services to be healthy, runs your test suite, then tears everything down — even if tests fail. It's the pattern used in CI pipelines for real integration tests against live dependencies.

```python
# compose_test_harness.py
# Starts a Compose stack, waits for health, runs tests, always cleans up.
# Usage: python compose_test_harness.py
# Requires: docker compose v2 installed, pip install requests

import subprocess
import sys
import time
import urllib.request
from urllib.error import URLError

COMPOSE_FILE = "docker-compose.yml"
HEALTH_URL   = "http://localhost:80/health"   # via nginx
MAX_WAIT_SEC = 60
POLL_INTERVAL = 2


def run(cmd: list[str], check=True) -> subprocess.CompletedProcess:
    """Run a shell command, stream output, raise on failure."""
    print(f"\n$ {' '.join(cmd)}")
    result = subprocess.run(cmd, text=True)
    if check and result.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}")
    return result


def wait_for_healthy(url: str, timeout: int, interval: int) -> bool:
    """Poll a URL until it returns 200 or timeout is reached."""
    print(f"\nWaiting for stack to be healthy at {url} (timeout={timeout}s)...")
    deadline = time.monotonic() + timeout
    attempt = 0
    while time.monotonic() < deadline:
        attempt += 1
        try:
            with urllib.request.urlopen(url, timeout=3) as resp:
                if resp.status == 200:
                    print(f"  ✓ Healthy after {attempt} attempts.")
                    return True
        except (URLError, OSError):
            pass
        print(f"  [{attempt}] Not ready yet, retrying in {interval}s...")
        time.sleep(interval)
    return False


def run_tests() -> int:
    """Run the actual test suite. Returns exit code."""
    result = run(
        ["docker", "compose", "-f", COMPOSE_FILE, "exec", "-T", "api",
         "python", "-m", "pytest", "tests/", "-v", "--tb=short"],
        check=False
    )
    return result.returncode


def main():
    exit_code = 1
    try:
        # ── 1. Start the stack ────────────────────────────────────
        run(["docker", "compose", "-f", COMPOSE_FILE, "up", "--build", "-d"])

        # ── 2. Wait for healthy ───────────────────────────────────
        if not wait_for_healthy(HEALTH_URL, MAX_WAIT_SEC, POLL_INTERVAL):
            print("\n✗ Stack did not become healthy in time.")
            # Dump logs to help debug
            run(["docker", "compose", "-f", COMPOSE_FILE, "logs", "--tail=50"], check=False)
            sys.exit(1)

        # ── 3. Run tests ──────────────────────────────────────────
        print("\nRunning integration tests...")
        exit_code = run_tests()

        if exit_code == 0:
            print("\n✓ All tests passed.")
        else:
            print("\n✗ Tests failed.")

    except KeyboardInterrupt:
        print("\nInterrupted.")

    finally:
        # ── 4. Always tear down (even if tests crash) ─────────────
        print("\nTearing down stack...")
        run(["docker", "compose", "-f", COMPOSE_FILE, "down", "--remove-orphans"], check=False)

    sys.exit(exit_code)   # propagate test exit code to CI


if __name__ == "__main__":
    main()
```

**What this demonstrates:**
- `try/finally` ensures cleanup always runs — the container equivalent of a `teardown` in unit tests
- Polling with a deadline (`time.monotonic()`) instead of `time.sleep(big_number)` — responsive and bounded
- `exec -T` (no TTY) — required in CI environments where there's no terminal
- Propagating the test exit code with `sys.exit(exit_code)` — CI sees the real pass/fail signal
- This is the foundation of **contract testing** and **end-to-end testing** in a pipeline

---

### Key Takeaway

> Docker Compose is the local development and CI integration-testing standard. It's not a production tool — it's the stepping stone between "runs on my machine" and "runs in Kubernetes." Master Compose and you understand multi-service coordination, health checking, and dependency ordering — concepts that translate directly to Kubernetes Pod specs.
>
> **The core habit:** Your `docker-compose.yml` should be the single source of truth for how your services wire together. New engineer joins? `docker compose up -d` and they're running in 60 seconds.

---

### Interview Question

**"How do you handle service startup ordering in Docker Compose? What's the difference between `depends_on` and a healthcheck?"**

> *Strong answer:* "`depends_on` alone only controls start order — it makes Compose start the db container before the api container, but it doesn't wait for Postgres to actually accept connections. The correct approach is to add a `healthcheck` to the dependency (`pg_isready` for Postgres) and then use `condition: service_healthy` in `depends_on`. That way Compose polls the health check and only starts the dependent service once the dependency is genuinely ready. Without this, you get race conditions where your app crashes on startup because the database isn't accepting connections yet."*

---

*Next: **[Lesson 6 — CI/CD Fundamentals](#lesson-6--cicd-fundamentals)***

---

<!-- LESSONS 6–30 WILL BE ADDED HERE AS THE COURSE PROGRESSES -->
