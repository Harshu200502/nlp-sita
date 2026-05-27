def build_smart_prompt(text: str, user_type: str, task_type: str) -> dict:
    """
    Generates structured prompts based on user type and task type.
    """
    user_type = user_type.lower()
    task_type = task_type.lower()

    structure = []
    structured_instruction = ""
    detailed_prompt = ""
    ai_ready_prompt = ""

    if user_type == "student":
        if task_type in ["report", "assignment"]:
            structure = [
                "Abstract",
                "Introduction",
                "Literature Review",
                "Methodology",
                "System Design / Working",
                "Results and Analysis",
                "Conclusion",
                "Future Scope",
                "References"
            ]
            structured_instruction = "Prepare a detailed academic report including abstract, introduction, literature review, methodology, system design, results, conclusion, and future scope."
            detailed_prompt = f"Please write a comprehensive academic {task_type} about '{text}'. Please ensure it follows the standard academic structure."
            ai_ready_prompt = f"Act as an academic writer. Write a detailed academic {task_type} on the topic: '{text}'. Include the following sections: Abstract, Introduction, Literature Review, Methodology, System Design, Results, Conclusion, and Future Scope. Keep the tone formal and academic."
        elif task_type == "coding task":
            structure = ["Problem Statement", "Algorithm/Logic", "Code Implementation", "Test Cases", "Complexity Analysis"]
            structured_instruction = "Write a clear code implementation including algorithm, logic, and test cases."
            detailed_prompt = f"Solve the coding task: '{text}'. Include algorithm, implementation, and test cases."
            ai_ready_prompt = f"Act as a computer science expert. Solve the following coding task: '{text}'. Provide the problem statement, step-by-step algorithm, clean commented code, test cases, and time/space complexity analysis."
        else: # general or other
            structure = ["Introduction", "Main Body", "Conclusion"]
            structured_instruction = "Write a structured response with an introduction, main body, and conclusion."
            detailed_prompt = f"Complete the following task: '{text}'. Provide a clear and structured response."
            ai_ready_prompt = f"Help me with this task: '{text}'. Please organize your response clearly."

    elif user_type in ["working professional", "professional"]:
        if task_type == "email":
            structure = ["Subject", "Greeting", "Context", "Ask/Action Required", "Closing"]
            structured_instruction = "Draft a professional email with a clear subject, context, and call to action."
            detailed_prompt = f"Draft a professional email regarding: '{text}'."
            ai_ready_prompt = f"Act as a corporate communication expert. Draft a professional email for the following purpose: '{text}'. Include a clear subject line, a polite greeting, concise context, an explicit call to action, and an appropriate closing."
        elif task_type == "coding task":
            structure = ["Objective", "Architecture/Design", "Implementation Steps", "Review/Testing", "Deployment"]
            structured_instruction = "Action + Owner + Deadline + Expected Output for the code delivery."
            detailed_prompt = f"Provide a technical implementation plan for: '{text}'."
            ai_ready_prompt = f"Act as a Senior Software Engineer. Provide a detailed implementation plan for: '{text}'. Include the objective, architecture/design considerations, step-by-step implementation guide, testing strategy, and deployment steps."
        elif task_type == "meeting":
            structure = ["Meeting Objective", "Agenda Items", "Attendees", "Expected Deliverables/Next Steps"]
            structured_instruction = "Prepare a meeting agenda highlighting objectives and deliverables."
            detailed_prompt = f"Draft a meeting agenda for: '{text}'."
            ai_ready_prompt = f"Act as an effective project manager. Create a detailed meeting agenda for: '{text}'. Structure it to include the meeting objective, specific agenda items with timeboxing, required attendees, and clear deliverables or next steps."
        elif task_type == "report":
            structure = ["Executive Summary", "Background", "Data/Analysis", "Key Findings", "Recommendations"]
            structured_instruction = "Prepare a professional report including executive summary, key findings, and recommendations."
            detailed_prompt = f"Create a professional business report for: '{text}'."
            ai_ready_prompt = f"Act as a business analyst. Generate a comprehensive business report on the topic: '{text}'. Include an executive summary, background context, data analysis, key findings, and actionable recommendations."
        else: # general or other
            structure = ["Context", "Action", "Expected Outcome"]
            structured_instruction = f"Execute task: '{text}' (Action + Owner + Deadline + Expected Output)"
            detailed_prompt = f"Please complete the task: '{text}' in a professional manner."
            ai_ready_prompt = f"Act as a professional assistant. Help me complete this task: '{text}'. Structure your response with clear context, action items, and expected outcomes."

    return {
        "original_text": text,
        "user_type": user_type.title(),
        "task_type": task_type.title(),
        "structured_prompt": structured_instruction,
        "detailed_prompt": detailed_prompt,
        "ai_ready_prompt": ai_ready_prompt,
        "content_structure": structure
    }
