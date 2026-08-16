import os

import streamlit as st

from src.feedback_engine import ai_feedback, demo_feedback
from src.interview_data import ROLES
from src.report_utils import build_json_report, build_markdown_report, score_band
from src.styles import apply_dark_theme

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    def load_dotenv() -> bool:
        return False


load_dotenv()


def init_state() -> None:
    defaults = {
        "role": "Data Scientist",
        "difficulty": "Intermediate",
        "question_index": 0,
        "answers": [],
        "feedback": [],
        "interview_started": False,
        "last_feedback": None,
    }
    for key, value in defaults.items():
        st.session_state.setdefault(key, value)


def reset_interview(role: str, difficulty: str) -> None:
    st.session_state.role = role
    st.session_state.difficulty = difficulty
    st.session_state.question_index = 0
    st.session_state.answers = []
    st.session_state.feedback = []
    st.session_state.interview_started = True
    st.session_state.last_feedback = None


def current_questions() -> list[str]:
    role = st.session_state.role if st.session_state.role in ROLES else "Data Scientist"
    difficulty = st.session_state.difficulty if st.session_state.difficulty in ROLES[role] else "Intermediate"
    st.session_state.role = role
    st.session_state.difficulty = difficulty
    return ROLES[role][difficulty]


def render_feedback(feedback) -> None:
    st.metric("Answer score", f"{feedback.score}/10", score_band(feedback.score))

    col_a, col_b = st.columns(2)
    with col_a:
        st.subheader("Strengths")
        for item in feedback.strengths:
            st.success(item)

    with col_b:
        st.subheader("Improve")
        for item in feedback.improvements:
            st.warning(item)

    st.subheader("Suggested answer direction")
    st.info(feedback.sample_answer)


def render_summary() -> None:
    questions = current_questions()
    feedback_items = st.session_state.feedback
    average = round(sum(item.score for item in feedback_items) / len(feedback_items), 1) if feedback_items else 0

    st.header("Interview summary")
    metric_a, metric_b, metric_c = st.columns(3)
    metric_a.metric("Average score", f"{average}/10", score_band(average))
    metric_b.metric("Questions answered", len(st.session_state.answers))
    metric_c.metric("Role", st.session_state.role)
    st.progress(min(average / 10, 1.0))

    if average >= 8:
        st.success("Strong interview readiness. Keep sharpening examples and measurable impact.")
    elif average >= 5:
        st.info("Good foundation. Add clearer structure, examples, tradeoffs, and outcomes.")
    else:
        st.warning("Practice concise answers using situation, action, result, and reflection.")

    st.subheader("Answer reviews")
    for index, (question, answer, feedback) in enumerate(
        zip(questions, st.session_state.answers, feedback_items),
        start=1,
    ):
        with st.expander(f"Question {index}: {feedback.score}/10"):
            st.write("**Question**")
            st.write(question)
            st.write("**Your answer**")
            st.write(answer)
            render_feedback(feedback)

    report_data = {
        "role": st.session_state.role,
        "difficulty": st.session_state.difficulty,
        "questions": questions,
        "answers": st.session_state.answers,
        "feedback": feedback_items,
        "average": average,
    }
    col_a, col_b = st.columns(2)
    col_a.download_button(
        "Download Markdown report",
        build_markdown_report(report_data),
        file_name="interview_report.md",
        mime="text/markdown",
        use_container_width=True,
    )
    col_b.download_button(
        "Download JSON report",
        build_json_report(report_data),
        file_name="interview_report.json",
        mime="application/json",
        use_container_width=True,
    )


def render_sidebar() -> None:
    with st.sidebar:
        st.title("Interview setup")
        role = st.selectbox("Role", list(ROLES.keys()), index=list(ROLES.keys()).index(st.session_state.role))
        difficulty_options = ["Beginner", "Intermediate", "Advanced"]
        current_difficulty = (
            st.session_state.difficulty
            if st.session_state.difficulty in difficulty_options
            else "Intermediate"
        )
        difficulty = st.radio(
            "Difficulty",
            difficulty_options,
            index=difficulty_options.index(current_difficulty),
            horizontal=True,
        )
        demo_default = not bool(os.getenv("OPENAI_API_KEY"))
        demo_mode = st.toggle("Demo Mode", value=demo_default)

        if not demo_mode and not os.getenv("OPENAI_API_KEY"):
            st.warning("Add OPENAI_API_KEY to .env or turn Demo Mode on.")

        if st.button("Start new interview", type="primary", use_container_width=True):
            reset_interview(role, difficulty)

        st.divider()
        total = len(ROLES[role][difficulty])
        answered = min(st.session_state.question_index, total)
        st.write("Progress")
        st.progress(answered / total)
        st.caption(f"{answered} of {total} questions answered")

        st.divider()
        st.caption("Demo Mode uses local scoring. CrewAI mode is optional.")

    return demo_mode


def main() -> None:
    st.set_page_config(page_title="CrewAI Role-Based AI Interviewer", page_icon="AI", layout="wide")
    init_state()
    apply_dark_theme()
    demo_mode = render_sidebar()

    st.title("CrewAI Role-Based AI Interviewer")
    st.caption("Practice role-specific interviews with instant feedback, progress tracking, and exportable reports.")

    if not st.session_state.interview_started:
        st.info("Choose a role and difficulty in the sidebar, then start your interview.")
        return

    questions = current_questions()
    index = st.session_state.question_index

    if index >= len(questions):
        render_summary()
        if st.button("Practice again"):
            reset_interview(st.session_state.role, st.session_state.difficulty)
            st.rerun()
        return

    question = questions[index]
    st.subheader(f"Question {index + 1} of {len(questions)}")
    st.markdown(f"### {question}")

    answer = st.text_area("Your answer", height=190, placeholder="Type your interview answer here...")
    word_count = len(answer.split())
    st.caption(f"Words: {word_count}")

    disabled = word_count < 12
    if st.button("Submit answer", disabled=disabled, type="primary"):
        with st.spinner("Reviewing your answer..."):
            if demo_mode or not os.getenv("OPENAI_API_KEY"):
                feedback = demo_feedback(st.session_state.role, st.session_state.difficulty, question, answer)
            else:
                feedback = ai_feedback(st.session_state.role, st.session_state.difficulty, question, answer)

        st.session_state.answers.append(answer)
        st.session_state.feedback.append(feedback)
        st.session_state.last_feedback = feedback
        st.session_state.question_index += 1
        st.rerun()

    if disabled:
        st.caption("Write at least 12 words before submitting.")

    if st.session_state.last_feedback:
        st.divider()
        st.subheader("Latest feedback")
        render_feedback(st.session_state.last_feedback)


if __name__ == "__main__":
    main()
