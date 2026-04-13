from database import SessionLocal
from models import Pipeline, DealStage, Deal, Contact, User

def seed_kanban():
    db = SessionLocal()
    try:
        # 1. Get the Admin and Client we created earlier
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            print("No Admin found. Run seed_user.py first.")
            return

        # 2. Create the Pipeline
        pipeline = Pipeline(client_id=admin.client_id, name="Standard Sales Pipeline")
        db.add(pipeline)
        db.commit()
        db.refresh(pipeline)

        # 3. Create the Stages
        stages = [
            DealStage(pipeline_id=pipeline.id, name="New Lead", stage_order=1),
            DealStage(pipeline_id=pipeline.id, name="Discovery Call", stage_order=2),
            DealStage(pipeline_id=pipeline.id, name="Proposal Sent", stage_order=3),
            DealStage(pipeline_id=pipeline.id, name="Closed Won", stage_order=4)
        ]
        db.add_all(stages)
        db.commit()

        # 4. Create a mock Contact and Deal to show on the board
        contact = db.query(Contact).filter(Contact.client_id == admin.client_id).first()
        if not contact:
            contact = Contact(
                client_id=admin.client_id,
                first_name="Test Prospect",
                email="prospect@example.com",
                phone="+919999999999",
                owner_id=admin.id
            )
            db.add(contact)
            db.commit()
            db.refresh(contact)

        # Put the deal in the "New Lead" stage (stages[0])
        deal = Deal(
            contact_id=contact.id,
            owner_id=admin.id,
            stage_id=stages[0].id
        )
        db.add(deal)
        db.commit()
        
        print(f"✅ Kanban Seeded: Pipeline '{pipeline.name}' with 4 stages and 1 deal.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_kanban()
