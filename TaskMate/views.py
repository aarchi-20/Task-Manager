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

            if user_obj and password == user_obj.Password:
                request.session['is_login'] = True
                request.session['userid'] = user_obj.id
                return redirect('/dashboard')
            else:
                messages.error(request,"Invalid email or password.")
            
    return render(request,'login.html')

def logout(request):
    request.session.flush()
    return redirect('/login')

def dashboard(request):
    return render(request,'dashboard.html')

def profile(request):
    if not request.session.get('is_login'):
        return redirect('/login')
    
    userid = request.session.get('userid')
    user = User.objects.filter(id=userid).first()
    return render(request,'profile.html',{'user':user})

def update_profile(request):
    if not request.session.get('is_login'):
        return redirect('/login')
    
    userid = request.session.get('userid')
    user = User.objects.filter(id=userid).first()

    if request.method == 'POST' and user:
        name = request.POST.get('name')
        email = request.POST.get('email')

        user.Name = name
        user.Email = email
        user.save()
        messages.success(request,'Profile updated')
        return redirect('/profile')
    
    return redirect('/profile')

def change_password(request):
    if not request.session.get('is_login'):
        return redirect('/login')
    
    userid = request.session.get('userid')
    user = User.objects.filter(id=userid).first()
    
    if request.method == 'POST' and user:
        curr_password = request.POST.get('current_password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')

        if curr_password != user.Password:
            messages.error(request,'Current password is incorrect.')
            return redirect('/profile')
        
        if new_password != confirm_password:
            messages.error(request, 'New password and confirm password do not match.')
            return redirect('/profile')
        
        user.Password = new_password
        user.save()
        messages.success(request,'Password changed successfully.')
        return redirect('/profile')
    
    return redirect('/profile')