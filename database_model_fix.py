from pymongo import MongoClient
from datetime import datetime, timezone, date
from app.config.config import *

# Connect to your MongoDB
client = MongoClient(MONGODB_URI)
db = client['todolist']
collection = db["user"]  # Your collection name

# Remove the 'days_left' field from all documents
# collection.update_many({}, {"$set": {"completion_count": 0}})

# collection.update_many(
#     {"streak_count": {"$exists": False}},  # only if it doesn't exist
#     {"$set": {"streak_count": 1}}
# )

today_datetime = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)

collection.update_many(
    {"last_active_date": {"$exists": False}},
    {"$set": {"last_active_date": today_datetime}}
)

# collection.update_many(
#     {"last_active_day": {"$exists": True}},
#     {"$unset": {"last_active_day": ""}}
# )

print("Update fix to all documents!")