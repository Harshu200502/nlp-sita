"""
app/nlp/content_suggester.py — Context-Aware Content Generation
===============================================================
Infers the type of task (report, email, code, meeting, etc.) based on keywords,
and provides structured content suggestions (title, description, sections).
"""

from typing import Dict, Any

def generate_content_suggestion(text: str) -> Dict[str, Any]:
    """
    Classify task type based on keywords and return content generation logic.
    """
    lower_text = text.lower()
    
    # Default matching
    result = {
        "type": "General task",
        "title": "General Task Action",
        "description": "Standard action item requiring completion.",
        "sections": ["Context", "Action Items", "Follow-up"]
    }
    
    if "report" in lower_text or "analysis" in lower_text or "dashboard" in lower_text or "summary" in lower_text:
        result["type"] = "Report"
        # Determine specific title if possible
        title = "Performance Report"
        if "weekly" in lower_text:
            title = "Weekly Performance Report"
        elif "analysis" in lower_text:
            title = "Data Analysis Report"
        elif "dashboard" in lower_text:
            title = "Dashboard Update Report"
            
        result["title"] = title
        result["description"] = "A structured document outlining key metrics, analysis, and conclusions."
        result["sections"] = ["Introduction", "Key Metrics", "Analysis", "Conclusion"]
        
    elif "deploy" in lower_text or "code" in lower_text or "push" in lower_text or "commit" in lower_text or "merge" in lower_text:
        result["type"] = "Code task"
        title = "Code Deployment Task"
        if "commit" in lower_text:
            title = "Code Commit Task"
            
        result["title"] = title
        result["description"] = "A standardized software engineering lifecycle task."
        result["sections"] = ["Pull latest code", "Test locally", "Deploy to server"]
        
    elif "meeting" in lower_text or "schedule" in lower_text:
        result["type"] = "Meeting"
        result["title"] = "Project Alignment Meeting"
        result["description"] = "A synchronized discussion to review progress and blockages."
        result["sections"] = ["Introductions", "Progress Updates", "Blockers", "Next Steps"]
        
    elif "email" in lower_text or "send" in lower_text or "share" in lower_text:
        # Check if it was purely sending a report/analysis first
        if "report" not in lower_text and "analysis" not in lower_text:
            result["type"] = "Email"
            result["title"] = "[Subject Line] Important Update"
            result["description"] = "Formal email communication providing an update."
            result["sections"] = ["Greeting", "Main Context", "Action Required", "Sign-off"]
            
    return result
