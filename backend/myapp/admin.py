from django.contrib import admin, messages
from django.utils import timezone
from decimal import Decimal
from .models import User, Wallet, DepositRequest, WithdrawRequest, Transaction

# Register custom user
admin.site.register(User)

# Wallet admin
@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'bonus', 'winnings')


# Deposit request admin
@admin.register(DepositRequest)
class DepositRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'utr_number', 'is_approved', 'is_rejected', 'created_at', 'approved_at')
    actions = ['approve_deposit']

    def approve_deposit(self, request, queryset):
        count = 0
        for deposit in queryset.filter(is_approved=False, is_rejected=False):
            wallet, _ = Wallet.objects.get_or_create(user=deposit.user)
            wallet.balance += Decimal(deposit.amount)
            wallet.save()  # ✅ Save after update

            deposit.is_approved = True
            deposit.approved_at = timezone.now()
            deposit.save()

            Transaction.objects.create(
                user=deposit.user,
                transaction_type='deposit',
                amount=deposit.amount,
                note=f"Deposit approved (UTR: {deposit.utr_number})"
            )
            count += 1
        if count > 0:
            self.message_user(request, f"✅ {count} deposit(s) approved and wallet updated.")
        else:
            self.message_user(request, "⚠️ No unapproved deposits selected.", level=messages.WARNING)
    approve_deposit.short_description = "✅ Approve selected deposit requests"


# Withdraw request admin
@admin.register(WithdrawRequest)
class WithdrawRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'is_approved', 'is_rejected', 'created_at', 'approved_at')
    actions = ['approve_withdrawal']

    def approve_withdrawal(self, request, queryset):
        approved_count = 0
        for withdraw in queryset.filter(is_approved=False, is_rejected=False):
            wallet, _ = Wallet.objects.get_or_create(user=withdraw.user)
            if wallet.balance >= withdraw.amount:
                wallet.balance -= Decimal(withdraw.amount)
                wallet.save()

                withdraw.is_approved = True
                withdraw.approved_at = timezone.now()
                withdraw.save()

                Transaction.objects.create(
                    user=withdraw.user,
                    transaction_type='withdraw',
                    amount=withdraw.amount,
                    note="Withdrawal approved"
                )
                approved_count += 1
            else:
                self.message_user(
                    request,
                    f"❌ Skipped: {withdraw.user.username} - insufficient balance (₹{wallet.balance})",
                    level=messages.WARNING
                )
        if approved_count > 0:
            self.message_user(request, f"✅ {approved_count} withdrawal(s) approved and wallet updated.")
        else:
            self.message_user(request, "⚠️ No eligible withdrawals selected.", level=messages.WARNING)
    approve_withdrawal.short_description = "✅ Approve selected withdrawal requests"


# Transaction admin
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'transaction_type', 'amount', 'created_at', 'note')
