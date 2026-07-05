from django.contrib.auth.hashers import make_password, check_password
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import SignupForm, LoginForm
from .models import User

# Create your views here.
def index(request):
    return render(request,'index.html')

def signup(request):
    form = SignupForm(request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            confirm_password = form.cleaned_data['confirm_password']

            if password != confirm_password:
                messages.error(request, "Passwords do not match.")
                return render(request, 'signup.html')
            
            User.objects.create(Name=name, Email=email, Password=password, Cpassword=confirm_password)
            return redirect('/dashboard')
        
    return render(request, 'signup.html')

def login(request):
    if request.session.get('is_login'):
        return redirect('/dashboard')
    
    form = LoginForm(request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']

            user_obj = User.objects.filter(Email=email).first()

            if user_obj and check_password(password, user_obj.Password):
                request.session['is_login'] = True
                request.session['userid'] = user_obj.id
                return redirect('/dashboard')
            else:
                messages.error(request, "Invalid email or password.")

    return render(request,'login.html')

def logout(request):
    request.session.flush()
    return redirect('/login')

def dashboard(request):
    return render(request,'dashboard.html')

def profile(request):
    return render(request,'profile.html')