import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage, messages_from_dict, messages_to_dict
from config import settings
from utils.agent_graph import agent_graph
from utils.prompts import SYSTEM_VOICE
from database import SessionLocal
from models import ConversationSnapshot

class AIEngine:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash", 
            google_api_key=settings.GOOGLE_API_KEY
        )

    def _clean_response(self, content):
        """Standardizes LLM output into a clean string."""
        if isinstance(content, list):
            text_parts = [
                block.get("text", "") 
                for block in content 
                if isinstance(block, dict) and "text" in block
            ]
            return "".join(text_parts).strip()
        return str(content).strip()

    def generate_followup(self, contact_name, notes):
        prompt = f"Write a professional, concise follow-up email to {contact_name} based on these meeting notes: {notes}. Keep it under 100 words."
        response = self.llm.invoke(prompt)
        return self._clean_response(response.content)

    def generate_content(self, context_text: str, user_name: str, target_platform: str = "LinkedIn"):
        """Generates first-person marketing content from context."""
        prompt = f"""
        {SYSTEM_VOICE}
        
        SENDER IDENTITY: You are writing in the first person as {user_name}.
        PLATFORM: {target_platform}
        CONTEXT: {context_text}
        
        TASK: Transform the above context into a high-engagement post. 
        Focus on the problem solved and the value delivered. 
        Use a professional yet punchy tone. Start with a hook.
        """
        response = self.llm.invoke(prompt)
        return self._clean_response(response.content)

    def chat_to_book(self, user_id: int, contact_id: int, user_message: str, db: SessionLocal = None):
        """
        Handles chat interactions via LangGraph state machine with persistence 
        and reasoning transparency.
        """
        local_db = False
        if db is None:
            db = SessionLocal()
            local_db = True
            
        try:
            # 1. Load or Initialize State from Database
            snapshot = db.query(ConversationSnapshot).filter(
                ConversationSnapshot.contact_id == contact_id,
                ConversationSnapshot.user_id == user_id
            ).first()

            if snapshot and snapshot.state_data:
                state_data = snapshot.state_data
                messages = messages_from_dict(json.loads(state_data.get("messages", "[]")))
                sentiment = state_data.get("sentiment", "Neutral")
            # 2. Derive Multi-Tenant Context for Tools
            contact = db.query(Contact).filter(Contact.id == contact_id).first()
            if not contact:
                return "System Error: Contact session lost.", ["error"]
            
            client_id = contact.client_id
            owner_id = contact.owner_id or user_id

            # 3. Run the Graph with Enriched Multi-Tenant State
            initial_state = {
                "messages": messages,
                "user_id": user_id,
                "contact_id": contact_id,
                "client_id": client_id,
                "owner_id": owner_id,
                "sentiment": sentiment,
                "context_snapshot": "",
                "escalation_flag": False
            }
            
            reasoning_path = []
            final_state = initial_state
            
            for output in agent_graph.stream(initial_state):
                for node_name, state_update in output.items():
                    reasoning_path.append(node_name)
                    # Correctly merge the state from the stream update
                    if "messages" in state_update:
                        final_state["messages"].extend(state_update["messages"])
                    for key, val in state_update.items():
                        if key != "messages":
                            final_state[key] = val

            # 4. Save Final State back to Database (History & Sentiment only)
            serializable_messages = json.dumps(messages_to_dict(final_state["messages"]))
            
            if snapshot:
                snapshot.state_data = {
                    "messages": serializable_messages,
                    "sentiment": final_state["sentiment"]
                }
            else:
                snapshot = ConversationSnapshot(
                    contact_id=contact_id,
                    user_id=user_id,
                    state_data={
                        "messages": serializable_messages,
                        "sentiment": final_state["sentiment"]
                    }
                )
                db.add(snapshot)
            try:
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"Database Error in chat_to_book: {e}")
                return "System Error: This lead profile no longer exists.", ["error"]

            # 5. Extract and Return Result + Reasoning Path
            last_msg = final_state["messages"][-1]
            return self._clean_response(last_msg.content), reasoning_path

        finally:
            if local_db:
                db.close()

ai_engine = AIEngine()
