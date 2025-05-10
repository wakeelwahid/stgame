from rest_framework import generics, status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from .serializers import RegisterSerializer, MobileTokenObtainPairSerializer
from .models import Wallet, DepositRequest, WithdrawRequest, Transaction


# --- Auth Views ---
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

class MobileLoginView(TokenObtainPairView):
    serializer_class = MobileTokenObtainPairSerializer


# --- Wallet Balance View ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_balance(request):
    wallet, _ = Wallet.objects.get_or_create(user=request.user)
    return Response({
        'balance': str(wallet.balance),  # Ab yeh string mein de rahe hain taaki precision loss na ho
        'bonus': str(wallet.bonus),      # Bonus aur winnings bhi same way mein
        'winnings': str(wallet.winnings)
    })


# --- Deposit Request View ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit_request(request):
    amount = request.data.get('amount')
    utr = request.data.get('utr_number')

    # Basic validation
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return Response({'error': 'Amount must be a valid number'}, status=400)

    if not utr or len(utr) < 8:
        return Response({'error': 'Invalid UTR number (must be at least 8 characters)'}, status=400)

    DepositRequest.objects.create(
        user=request.user,
        amount=amount,
        utr_number=utr
    )
    return Response({'message': 'Deposit request submitted, pending admin approval'})


# --- Withdraw Request View ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw_request(request):
    amount = request.data.get('amount')

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return Response({'error': 'Amount must be a valid number'}, status=400)

    wallet = Wallet.objects.get(user=request.user)

    if wallet.balance < amount:
        return Response({'error': 'Insufficient balance'}, status=400)

    WithdrawRequest.objects.create(
        user=request.user,
        amount=amount
    )
    return Response({'message': 'Withdrawal request submitted, pending admin approval'})


# --- Transaction History View ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_history(request):
    transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')
    return Response([{
        'type': tx.transaction_type,
        'amount': str(tx.amount),  # Amount ko string mein de rahe hain
        'date': tx.created_at,
        'note': tx.note
    } for tx in transactions])
