from mongoengine import Document, IntField, StringField, BooleanField, ReferenceField, DateField, CASCADE
from .model_users import User
import datetime

class Sticky(Document):
    content=StringField(required=True)
    completed=BooleanField(default=False)
    category=StringField(required=True)
    completion_count = IntField(default=0)
    user=ReferenceField(User, required=True, reverse_delete_rule=CASCADE)
    last_reset=DateField(default=datetime.datetime.now(datetime.timezone.utc))

    def to_dict(self):
        return{
            '_id': str(self.id),
            'content': self.content,
            'category': self.category,
            'completed': self.completed,
            'completion_count' : self.completion_count,
            'user': str(self.user.id),
            'last_rest': str(self.last_reset)
        }
    
    
    