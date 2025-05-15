import threading
import time
import datetime
from mongoengine import connect
from pymongo import MongoClient
# from app.config._config import MONGODB_URI
import os
from dotenv import load_dotenv

# Global flag to prevent duplicate threads
# reset_thread_started = False

load_dotenv()
MONGODB_URI = os.environ.get('MONGODB_URI')

def connect_db():
    """Connect to MongoDB and start the background reset task (only once)."""
    # global reset_thread_started

    try:
        connect(host=MONGODB_URI)
        client = MongoClient(MONGODB_URI)
        db = client.get_database()
        print(f'Successfully connected to {db.name}')

        # Ensure the reset task runs only once
        # if not reset_thread_started:
        #     start_reset_thread(db)
        #     reset_thread_started = True  # Prevent multiple starts

        return db
    except Exception as e:
        print(f"Failed to connect to MongoDB: {str(e)}")
        exit(1)

# def reset_and_increment_sticky(db):
#     """Resets 'completed' field and increments count periodically."""
#     while True:
#         now = datetime.datetime.now()
#         next_reset = now + datetime.timedelta(seconds=24)  # Simulated interval for dev
#         time_until_reset = max(1, (next_reset - now).total_seconds())  # Avoid non-zero wait time

#         print(f"Sleeping until reset stickies... ({time_until_reset} seconds)")
#         time.sleep(time_until_reset)

#         # Increment completion_count for completed stickies before resetting
#         collection = db["sticky"]
#         collection.update_many(
#             {"completed": True}, 
#             {"$inc": {"completion_count": 1}}
#         )

#         # Reset completed field
#         collection.update_many({}, {"$set": {"completed": False}})

#         print("Incremented completion count and reset stickies for the new cycle!")

# def start_reset_thread(db):
#     """Start a background thread to handle task resets."""
#     thread = threading.Thread(target=reset_and_increment_sticky, args=(db,), daemon=True)
#     thread.start()