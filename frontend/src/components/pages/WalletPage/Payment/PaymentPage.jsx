// === React: PaymentPage.jsx ===
import React, { useState } from 'react';
import './PaymentPage.css';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount, paymentMethod } = location.state || {};

  const [utr, setUtr] = useState('');
  const [error, setError] = useState('');

  const handleConfirmPayment = async () => {
    if (!/^[0-9]{12}$/.test(utr)) {
      setError('Please enter a valid 12-digit UTR number.');
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/api/deposit/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          utr,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/addchipssuccess", {
          state: {
            amount: amount,
            transactionId: "TXN" + Date.now(),
          },
        });
      } else {
        setError(data.error || "Failed to submit deposit.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <div className="payment-container">
      <header className="payment-header">
        <h1 className="payment-title">PAYMENT</h1>
      </header>

      <div className="payment-card">
        <h2>Complete Your Payment</h2>

        <p>Scan and pay via <strong>{paymentMethod}</strong> - ₹{amount}</p>

        <input
          type="text"
          placeholder="Enter 12-digit UTR"
          value={utr}
          onChange={(e) => {
            setUtr(e.target.value);
            setError('');
          }}
        />
        {error && <p className="error">{error}</p>}

        <button onClick={handleConfirmPayment}>CONFIRM PAYMENT</button>
      </div>
    </div>
  );
};

export default PaymentPage;