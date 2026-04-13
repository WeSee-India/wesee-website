import os
import datetime
from typing import TypedDict, Annotated, List, Union
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage, ToolMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from config import settings
from utils.prompts import SYSTEM_VOICE, SENTIMENT_PROMPT
from utils.ai_tools import check_calendar_availability, book_appointment, get_lead_score
from database import SessionLocal
from models import Activity, Contact
import json

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    user_id: int
    contact_id: int
    client_id: int
    owner_id: int
    sentiment: str
    context_snapshot: str
    escalation_flag: bool

tools_map = {
    "check_calendar_availability": check_calendar_availability,
    "book_appointment": book_appointment,
    "get_lead_score": get_lead_score
}
tools = list(tools_map.values())

llm = ChatGoogleGenerativeAI(
    model="gemini-3-flash-preview", 
    google_api_key=settings.GOOGLE_API_KEY
)

def sentiment_analyzer(state: AgentState):
    """Analyzes the vibe and checks for escalation triggers."""
    messages = state["messages"]
    last_human_message = [m for m in messages if isinstance(m, HumanMessage)][-1].content
    
    human_keywords = ["human", "representative", "dhruv", "person", "real agent"]
    wants_human = any(kw in last_human_message.lower() for kw in human_keywords)
    response = llm.invoke([
        SystemMessage(content=SENTIMENT_PROMPT),
        HumanMessage(content=last_human_message)
    ])
    
    sentiment = response.content
    if isinstance(sentiment, list):
        sentiment = "".join([p.get("text", "") if isinstance(p, dict) else str(p) for p in sentiment])
    
    sentiment = sentiment.strip()
    escalation = wants_human or "Frustrated" in sentiment
    
    return {"sentiment": sentiment, "escalation_flag": escalation}

def escalation_node(state: AgentState):
    """Handles handover to a human representative."""
    print(f"\n🚨 URGENT: HITL ESCALATION TRIGGERED FOR USER_ID {state['user_id']} 🚨")
    print(f"REASON: Sentiment {state['sentiment']} or direct human request.\n")
    
    msg = AIMessage(content="I want to make sure you get exactly what you need. I'm pinging Dhruv right now to jump into this chat.")
    return {"messages": [msg]}

def context_retriever(state: AgentState):
    """Fetches full chronological timeline for the lead."""
    db = SessionLocal()
    try:
        activities = db.query(Activity).filter(
            Activity.contact_id == state["contact_id"]
        ).order_by(Activity.created_at.desc()).limit(10).all()
        
        if not activities:
            return {"context_snapshot": "No previous activity found."}
            
        timeline = []
        for act in reversed(activities):
            timeline.append(f"[{act.created_at.strftime('%Y-%m-%d %H:%M')}] {act.activity_type}: {act.notes}")
            
        return {"context_snapshot": "\n".join(timeline)}
    finally:
        db.close()

def call_model(state: AgentState):
    """Main intelligence node."""
    messages = state.get("messages", [])
    if not messages:
        messages = [HumanMessage(content="Hello")]
        
    now = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    
    enriched_system = f"""
    {SYSTEM_VOICE}
    
    CURRENT_TIME: {now}
    
    CURRENT CONTEXT (Last 10 Events):
    {state['context_snapshot']}
    LEAD SENTIMENT (Inner Monologue): {state['sentiment']}
    ADJUSTMENT: {'Be extra patient and helpful.' if state['sentiment'] == 'Frustrated' else 'Maintain high momentum.'}
    OPERATIONAL DATA:
    - Internal User ID: {state['user_id']}
    - Lead Contact ID: {state['contact_id']}
    """
    prompt = [SystemMessage(content=enriched_system)] + messages
    model_with_tools = llm.bind_tools(tools)
    response = model_with_tools.invoke(prompt)   
    return {"messages": [response]}

def custom_tool_node(state: AgentState):
    """Executes tools with global error catching."""
    last_message = state["messages"][-1]
    new_messages = []
    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        try:
            tool_func = tools_map.get(tool_name)
            if not tool_func:
                raise ValueError(f"Tool {tool_name} not found.")
            
            # Inject Multi-Tenant Context into Tool Arguments
            if tool_name == "book_appointment":
                tool_args["client_id"] = state["client_id"]
                tool_args["owner_id"] = state["owner_id"]
            
            result = tool_func.invoke(tool_args)
            new_messages.append(ToolMessage(content=str(result), tool_call_id=tool_call["id"]))
        except Exception as e:
            error_msg = f"Tool '{tool_name}' failed with error: {str(e)}. Apologize to the user and suggest an alternative."
            new_messages.append(ToolMessage(content=error_msg, tool_call_id=tool_call["id"]))
            
    return {"messages": new_messages}

def route_after_sentiment(state: AgentState):
    if state.get("escalation_flag", False):
        return "escalate"
    return "context"

def should_continue(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END

workflow = StateGraph(AgentState)

workflow.add_node("sentiment", sentiment_analyzer)
workflow.add_node("escalate", escalation_node)
workflow.add_node("context", context_retriever)
workflow.add_node("model", call_model)
workflow.add_node("tools", custom_tool_node)

workflow.set_entry_point("sentiment")

workflow.add_conditional_edges(
    "sentiment",
    route_after_sentiment,
    {
        "escalate": "escalate",
        "context": "context"
    }
)
workflow.add_edge("escalate", END)
workflow.add_edge("context", "model")
workflow.add_conditional_edges(
    "model",
    should_continue,
    {
        "tools": "tools",
        END: END
    }
)
workflow.add_edge("tools", "model")

agent_graph = workflow.compile()
