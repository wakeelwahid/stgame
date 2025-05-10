from django.urls import path
from .views import *

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MobileLoginView.as_view(), name='login'),
    path('balance/', wallet_balance, name='wallet-balance'),
    path('deposit/', deposit_request, name='deposit-request'),
    path('withdraw/', withdraw_request, name='withdraw-request'),
    path('transactions/', transaction_history, name='transaction-history'),
]
