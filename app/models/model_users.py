# Like in Express, the models or Schema should be a class
from mongoengine import Document, StringField, EmailField, DateField, IntField
from datetime import datetime, timezone
import bcrypt


class User(Document):
    name = StringField(required=True)
    username = StringField(required=True, unique=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    last_active_date = DateField(default=lambda: datetime.now(timezone.utc).date())
    streak_count = IntField(default=1)

    def to_dict(self):
        return{
            'id': str(self.id),
            'name': self.name,
            'username': self.username,
            'email': self.email,
            # 'password': self.password,
            'last_active_date': self.last_active_date,
            'streak_count': self.streak_count
        }
    
    def save(self, *args, **kwargs):
        # avoid double hashing
        if self.password and not self.password.startswith('$2b$'):
            self.password = bcrypt.hashpw(self.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        super(User, self).save(*args, **kwargs)