from typing import Dict, List


ROLES: Dict[str, Dict[str, List[str]]] = {
    "Data Scientist": {
        "Beginner": [
            "What is the difference between supervised and unsupervised learning?",
            "How would you handle missing values in a dataset?",
            "Explain overfitting in simple terms.",
            "What metrics would you use for a classification model?",
            "How would you explain a model result to a business stakeholder?",
        ],
        "Intermediate": [
            "How would you evaluate a classification model for an imbalanced dataset?",
            "Describe a machine learning project where your insights influenced a business decision.",
            "What is the difference between correlation and causation?",
            "How would you design a feature engineering workflow?",
            "How would you monitor a production model after deployment?",
        ],
        "Advanced": [
            "How would you investigate model drift in a high-volume production system?",
            "Design an experiment to measure whether a recommendation model improves retention.",
            "How would you balance explainability and predictive performance for a regulated use case?",
            "What tradeoffs would you consider when choosing between batch and real-time inference?",
            "How would you debug a sudden drop in model precision after a data pipeline change?",
        ],
    },
    "Web Developer": {
        "Beginner": [
            "What happens when a user enters a URL in the browser?",
            "Explain the difference between HTML, CSS, and JavaScript.",
            "How do you make a form accessible?",
            "What is responsive design?",
            "How would you debug a broken button on a web page?",
        ],
        "Intermediate": [
            "How do you optimize the performance of a slow web application?",
            "Explain server-side rendering versus client-side rendering.",
            "How would you secure a login form in a production app?",
            "Describe your approach to debugging a frontend issue across browsers.",
            "What makes an API integration reliable and maintainable?",
        ],
        "Advanced": [
            "How would you design caching for a dashboard with frequently changing data?",
            "How would you investigate memory leaks in a long-running frontend app?",
            "Explain how you would structure authentication and authorization in a full-stack app.",
            "How would you migrate a large legacy frontend without stopping feature delivery?",
            "What tradeoffs would you consider when choosing a rendering strategy for a content-heavy site?",
        ],
    },
    "Product Manager": {
        "Beginner": [
            "What makes a good product requirement?",
            "How do you decide which user problem to solve first?",
            "What product metric would you track for a new feature?",
            "How do you collect useful user feedback?",
            "How would you explain a roadmap decision to a stakeholder?",
        ],
        "Intermediate": [
            "How do you prioritize features when engineering capacity is limited?",
            "Describe a product metric you would track after launching a new feature.",
            "How would you handle disagreement between design, engineering, and business teams?",
            "How would you validate a product idea before building it?",
            "How do you define success for a user onboarding flow?",
        ],
        "Advanced": [
            "How would you decide whether to sunset a feature with loyal but low-volume usage?",
            "Design an experiment to validate a pricing change.",
            "How would you recover from a launch that missed its success metrics?",
            "How do you manage roadmap tradeoffs across enterprise and self-serve customers?",
            "How would you identify whether growth is constrained by acquisition, activation, retention, or monetization?",
        ],
    },
    "UI/UX Designer": {
        "Beginner": [
            "What is the difference between UI and UX?",
            "How do you start designing a new screen?",
            "What does accessibility mean in product design?",
            "How do you use user feedback in your design process?",
            "What makes a wireframe useful?",
        ],
        "Intermediate": [
            "How do you turn user research into design decisions?",
            "Describe your process for improving a confusing user flow.",
            "How do you balance accessibility, aesthetics, and business goals?",
            "What would you include in a usability test for a mobile app?",
            "How do you handle feedback that conflicts with your design direction?",
        ],
        "Advanced": [
            "How would you redesign a high-traffic checkout flow without harming conversion?",
            "How do you measure whether a design system is improving product quality?",
            "How would you resolve conflicting research signals from qualitative and quantitative sources?",
            "How do you design for accessibility when brand guidelines create constraints?",
            "How would you lead design strategy for a complex multi-role product?",
        ],
    },
}
