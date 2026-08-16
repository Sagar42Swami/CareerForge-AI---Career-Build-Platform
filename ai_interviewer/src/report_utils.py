import json
from datetime import datetime


def score_band(score: float) -> str:
    if score >= 8:
        return "Ready"
    if score >= 5:
        return "Practice"
    return "Needs work"


def build_json_report(report_data: dict) -> str:
    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "role": report_data["role"],
        "difficulty": report_data["difficulty"],
        "average_score": report_data["average"],
        "reviews": [
            {
                "question": question,
                "answer": answer,
                "feedback": feedback.to_dict(),
            }
            for question, answer, feedback in zip(
                report_data["questions"],
                report_data["answers"],
                report_data["feedback"],
            )
        ],
    }
    return json.dumps(payload, indent=2)


def build_markdown_report(report_data: dict) -> str:
    lines = [
        "# Mock Interview Report",
        "",
        f"- Role: {report_data['role']}",
        f"- Difficulty: {report_data['difficulty']}",
        f"- Average score: {report_data['average']}/10",
        f"- Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
    ]

    for index, (question, answer, feedback) in enumerate(
        zip(report_data["questions"], report_data["answers"], report_data["feedback"]),
        start=1,
    ):
        lines.extend(
            [
                f"## Question {index}",
                "",
                question,
                "",
                "### Answer",
                "",
                answer,
                "",
                f"### Feedback: {feedback.score}/10",
                "",
                "Strengths:",
                *[f"- {item}" for item in feedback.strengths],
                "",
                "Improvements:",
                *[f"- {item}" for item in feedback.improvements],
                "",
                "Suggested direction:",
                "",
                feedback.sample_answer,
                "",
            ]
        )

    return "\n".join(lines)
