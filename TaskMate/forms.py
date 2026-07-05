from django import forms

class SignupForm(forms.Form):
    name = forms.CharField(max_length=30)
    email = forms.EmailField()
    password = forms.CharField()
    confirm_password = forms.CharField()

class LoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField()