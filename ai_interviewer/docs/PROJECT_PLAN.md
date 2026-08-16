# Project Plan

## Goal

Build a role-based AI mock interview simulator that helps candidates practice interviews, receive instant feedback, and download a performance report.

## Current Scope

- Streamlit web app
- Demo Mode with local scoring
- Optional CrewAI and GPT-4o-mini feedback
- Role-specific question banks
- Beginner, Intermediate, and Advanced difficulty tracks
- Interview progress tracking
- Final summary with Markdown and JSON report downloads

## Suggested GitHub Issues

1. Add more roles such as DevOps Engineer, Business Analyst, and Cybersecurity Analyst.
2. Add voice input using browser speech recognition or an audio transcription API.
3. Store interview history locally with SQLite.
4. Add charts for score trends and answer length.
5. Add authentication for multi-user usage.
6. Deploy the app on Streamlit Community Cloud or Hugging Face Spaces.

## Suggested Notion Sections

- Problem statement
- Feature list
- Tech stack
- Architecture
- Setup instructions
- Demo checklist
- Future improvements

## Architecture

```text
Streamlit UI
    |
    |-- Demo Mode feedback engine
    |
    |-- CrewAI feedback engine
    |       |
    |       |-- OpenAI GPT-4o-mini
    |
    |-- Report generator
            |
            |-- Markdown download
            |-- JSON download
```
