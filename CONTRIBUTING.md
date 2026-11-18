# Contributing to CodeAtlas AI

Thank you for your interest in contributing to **CodeAtlas AI**! We welcome community contributions, bug reports, and feature proposals.

---

## 🔒 Security & Secrets Policy
**CRITICAL**: Under no circumstances should any sensitive keys, personal access tokens, or `.env` files be committed to this repository.
- Ensure all secrets remain in your local `.env` file (which is gitignored).
- Never hardcode API keys in test files or client-side components.

---

## 🚀 Development Workflow

### 1. Clone & Setup
```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/codeatlas-ai.git
cd codeatlas-ai

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Configure Local Environment
Add your free Google Gemini API key to `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
*(Optional)* Add a GitHub Personal Access Token to raise unauthenticated API rate limits from 60 to 5,000 req/hr:
```env
GITHUB_TOKEN="your-github-token"
```

### 3. Run Locally
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the platform.

---

## 🧪 Testing & Quality Gates

Every Pull Request must pass our automated CI pipeline:

```bash
# 1. Type & Linter Verification
npm run lint

# 2. Automated Test Suite (Vitest)
npm test

# 3. Production Build & PWA Verification
npm run build
```

---

## 📋 Pull Request & Merge Policy

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. **Commit Changes**: Use clear, concise commit messages.
3. **Push to Your Fork**:
   ```bash
   git push origin feature/my-new-feature
   ```
4. **Open a Pull Request**:
   - Target the `main` branch.
   - Complete the Pull Request checklist in the template.
   - The GitHub Actions CI pipeline will automatically trigger and run all tests, linter checks, and build steps.
5. **Admin Review**:
   - The repository administrator reviews the test results and proposed changes.
   - Once all automated checks pass and the review is complete, the PR will be merged.
