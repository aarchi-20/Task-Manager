from django.db import models

# Create your models here.

class User(models.Model):
    Name = models.CharField(max_length=30)
    Email = models.EmailField()
    Password = models.CharField(max_length=10)
    Cpassword = models.CharField(max_length=10)
