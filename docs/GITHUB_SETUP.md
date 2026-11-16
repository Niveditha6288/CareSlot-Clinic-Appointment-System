# GitHub Setup: Issues, Branches & Protection

## 1. Push the project to a new repository

```bash
cd clinic-scheduler
git init
git add .
git commit -m "Initial commit: clinic scheduling app"
git branch -M main
git remote add origin https://github.com/<your-username>/clinic-scheduler.git
git push -u origin main
```

## 2. Branching strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code only. Protected. |
| `feature/<name>` | New features, e.g. `feature/cancel-appointment` |
| `fix/<name>` | Bug fixes, e.g. `fix/slot-overlap-check` |

Flow: create a branch → commit → push → open a Pull Request → review → merge into `main`.

```bash
git checkout -b feature/cancel-appointment
# ...make changes...
git add .
git commit -m "Add cancel appointment button"
git push -u origin feature/cancel-appointment
```

## 3. Branch protection rules for `main`

On GitHub: **Settings → Branches → Add branch protection rule** → Branch name pattern: `main`

Tick:
- **Require a pull request before merging** (with at least 1 approval)
- **Require status checks to pass before merging** → select `Backend check` and `Frontend build` (they appear after the CI workflow has run once)
- **Require branches to be up to date before merging**
- **Do not allow bypassing the above settings**
- Leave **Allow force pushes** and **Allow deletions** unticked

> Branch protection is a repository setting on GitHub, so it can't be committed as a file. Set it once in the UI.

## 4. Issue tracker

Issue templates for **Bug report** and **Feature request** are already in `.github/ISSUE_TEMPLATE/`.

Suggested labels: `bug`, `enhancement`, `database`, `frontend`, `backend`, `good first issue`.

Reference issues in commits and PRs so they close automatically:

```
git commit -m "Fix overlapping booking check, closes #3"
```

### Sample starter issues
1. [BUG] Double booking possible when two users click the same slot together
2. [FEATURE] Add cancel appointment option
3. [FEATURE] Send confirmation email after booking
4. [FEATURE] Doctor login page to view their own schedule
