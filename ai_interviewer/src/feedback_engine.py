import json
import os
import re
from dataclasses import asdict, dataclass
from typing import List


@dataclass
class Feedback:
    score: int
    strengths: List[str]
    improvements: List[str]
    sample_answer: str

    def to_dict(self) -> dict:
        return asdict(self)


def keyword_score(answer: str) -> int:
    words = re.findall(r"[a-zA-Z]{3,}", answer.lower())
    unique_words = len(set(words))
    length_score = min(len(words) // 18, 4)
    detail_score = min(unique_words // 18, 3)
    structure_score = 2 if any(token in answer.lower() for token in ["first", "then", "because", "for example"]) else 1
    outcome_score = 1 if any(token in answer.lower() for token in ["result", "impact", "metric", "measured", "improved"]) else 0
    return max(1, min(10, 1 + length_score + detail_score + structure_score + outcome_score))


def demo_feedback(role: str, difficulty: str, question: str, answer: str) -> Feedback:
    score = keyword_score(answer)
    lowered = answer.lower()
    word_count = len(answer.split())
    has_example = any(token in lowered for token in ["example", "project", "built", "used", "measured", "launched"])
    has_tradeoff = any(token in lowered for token in ["tradeoff", "trade-off", "however", "risk", "constraint"])
    has_outcome = any(token in lowered for token in ["result", "impact", "metric", "improved", "reduced", "increased"])

    strengths = ["You addressed the question directly."]
    if word_count >= 45:
        strengths.append("You gave enough detail for an interviewer to evaluate your thinking.")
    if has_example:
        strengths.append("You grounded the answer in a concrete example.")
    if has_tradeoff:
        strengths.append("You showed awareness of tradeoffs and constraints.")
    if has_outcome:
        strengths.append("You connected your approach to a result or measurable impact.")
    strengths.append(f"Your response is relevant for a {difficulty.lower()} {role} interview.")

    improvements = []
    if word_count < 45:
        improvements.append("Add more specifics about tools, steps, decisions, or impact.")
    if not has_example:
        improvements.append("Include one short real or hypothetical example.")
    if not has_tradeoff and difficulty != "Beginner":
        improvements.append("Mention tradeoffs, risks, or constraints to show stronger judgment.")
    if not has_outcome:
        improvements.append("Close with the result your approach would produce.")

    sample_answer = (
        f"For a {difficulty.lower()} {role} interview, I would structure this answer as: context, "
        "approach, tradeoff, and outcome. I would give one specific example, explain why I chose "
        "that approach, and finish with the measurable result or learning."
    )

    return Feedback(score, strengths[:3], improvements[:3], sample_answer)


def ai_feedback(role: str, difficulty: str, question: str, answer: str) -> Feedback:
    try:
        from crewai import Agent, Crew, Task
        from langchain_openai import ChatOpenAI
    except ModuleNotFoundError:
        return demo_feedback(role, difficulty, question, answer)

    model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    llm = ChatOpenAI(model=model_name, temperature=0.3)

    coach = Agent(
        role=f"{role} Interview Coach",
        goal="Evaluate mock interview answers and give concise, role-specific feedback.",
        backstory="You are a practical interview coach who understands hiring bars and candidate preparation.",
        llm=llm,
        verbose=False,
    )
    task = Task(
        description=(
            "Evaluate this mock interview answer.\n"
            f"Role: {role}\n"
            f"Difficulty: {difficulty}\n"
            f"Question: {question}\n"
            f"Answer: {answer}\n\n"
            "Return only valid JSON with keys: score, strengths, improvements, sample_answer. "
            "score is an integer from 1 to 10. strengths and improvements are arrays of 2-3 strings."
        ),
        expected_output="Valid JSON interview feedback.",
        agent=coach,
    )
    raw = str(Crew(agents=[coach], tasks=[task], verbose=False).kickoff())

    try:
        data = json.loads(raw[raw.find("{") : raw.rfind("}") + 1])
        return Feedback(
            score=max(1, min(10, int(data.get("score", 5)))),
            strengths=list(data.get("strengths", []))[:3],
            improvements=list(data.get("improvements", []))[:3],
            sample_answer=str(data.get("sample_answer", "")),
        )
    except Exception:
        return demo_feedback(role, difficulty, question, answer)
