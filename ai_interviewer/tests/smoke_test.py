import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from src.feedback_engine import demo_feedback
from src.interview_data import ROLES
from src.report_utils import build_json_report, build_markdown_report


def test_demo_feedback_and_reports() -> None:
    role = "Data Scientist"
    difficulty = "Intermediate"
    question = ROLES[role][difficulty][0]
    answer = (
        "First I would inspect class distribution and choose metrics such as precision, recall, "
        "F1 score, and PR AUC because accuracy can hide poor minority class performance. "
        "For example, in a project I would tune thresholds and measure impact on false positives."
    )

    feedback = demo_feedback(role, difficulty, question, answer)
    assert 1 <= feedback.score <= 10
    assert feedback.strengths
    assert feedback.improvements

    report_data = {
        "role": role,
        "difficulty": difficulty,
        "questions": [question],
        "answers": [answer],
        "feedback": [feedback],
        "average": feedback.score,
    }
    assert "Mock Interview Report" in build_markdown_report(report_data)
    assert '"role": "Data Scientist"' in build_json_report(report_data)


if __name__ == "__main__":
    test_demo_feedback_and_reports()
    print("Smoke test passed")
