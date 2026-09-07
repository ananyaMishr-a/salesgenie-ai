import os
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

from app.database import engine

def migrate():
    with engine.connect() as conn:
        print("Migrating PostgreSQL database for multi-tenancy...")
        try:
            # 1. Add user_id column if it doesn't exist
            conn.execute(text("ALTER TABLE leads ADD COLUMN user_id INTEGER;"))
            print("Added user_id column to leads.")
        except Exception as e:
            print("user_id column might already exist:", e)
            
        try:
            # 2. Add foreign key constraint
            conn.execute(text(
                "ALTER TABLE leads ADD CONSTRAINT fk_leads_user_id "
                "FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE;"
            ))
            print("Added foreign key constraint.")
        except Exception as e:
            print("Foreign key might already exist:", e)

        try:
            # 3. Assign all existing leads to the first user in the system
            # This ensures old data isn't orphaned.
            result = conn.execute(text("SELECT user_id FROM users ORDER BY user_id LIMIT 1;")).fetchone()
            if result:
                first_user_id = result[0]
                conn.execute(text(f"UPDATE leads SET user_id = {first_user_id} WHERE user_id IS NULL;"))
                print(f"Assigned existing leads to user {first_user_id}.")
            else:
                print("No users found to assign existing leads to.")
        except Exception as e:
            print("Failed to assign existing leads:", e)
            
        try:
            # 4. Alter column to be NOT NULL (optional, but good practice if all rows have user_id)
            conn.execute(text("ALTER TABLE leads ALTER COLUMN user_id SET NOT NULL;"))
            print("Set user_id to NOT NULL.")
        except Exception as e:
            print("Failed to set NOT NULL:", e)

        conn.commit()
        print("Migration complete!")

if __name__ == "__main__":
    migrate()
