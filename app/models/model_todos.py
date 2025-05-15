from mongoengine import Document, IntField, StringField, BooleanField, DateTimeField, ReferenceField, signals, CASCADE
import datetime
from .model_users import User

class Todo(Document):
    title=StringField(required=True)
    content=StringField(required=True)
    urgency=BooleanField(default=False)
    category=StringField(default='None')
    completed=BooleanField(default=False)
    created_at=DateTimeField(default=datetime.datetime.now(datetime.timezone.utc))
    due_date=DateTimeField(required=True)
    user=ReferenceField(User, required=True, reverse_delete_rule=CASCADE)

    def to_dict(self):
        return{
            '_id': str(self.id),
            'title': self.title,
            'content': self.content,
            'urgency': self.urgency,
            'category': self.category,
            'completed': self.completed,
            'created_at': self.created_at,
            'due_date': self.due_date,
            'user_id': str(self.user.id)
        }
