# CrewAI Role-Based AI Interviewer

An AI-powered mock interview simulator built with Streamlit, CrewAI, and GPT-4o-mini. It asks role-specific interview questions, analyzes candidate answers, and generates instant feedback plus a final performance summary.

## Features

- Role-specific interviews for Data Scientist, Web Developer, Product Manager, and UI/UX Designer
- Demo Mode that works without an API key
- Optional CrewAI + OpenAI feedback when `OPENAI_API_KEY` is configured
- Beginner, Intermediate, and Advanced interview tracks
- Dark Streamlit UI with progress tracking and scoring
- Answer analytics, final summary, and downloadable Markdown/JSON reports

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

If you only want to test the app, the normal requirements are enough. Keep **Demo Mode** enabled.

To enable CrewAI + GPT feedback, install the optional AI dependencies. If pip cannot find these packages, use Python 3.10 or 3.11 and make sure pip is using the public PyPI index.

```powershell
pip install -r requirements-ai.txt
```

Add your API key to `.env`:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

## Run

```powershell
streamlit run app.py
```

To use without an API key, keep **Demo Mode** enabled in the sidebar.

## Smoke Test

```powershell
python tests\smoke_test.py
```

## Project Structure

```text
.
├── app.py
├── docs/
│   └── PROJECT_PLAN.md
├── src/
│   ├── feedback_engine.py
│   ├── interview_data.py
│   ├── report_utils.py
│   └── styles.py
├── tests/
│   └── smoke_test.py
├── requirements-ai.txt
├── requirements.txt
├── .env.example
└── README.md
```
