'use client';

import { useState } from 'react';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('access_token');

      if (!token) {
        alert('Devi fare login');
        return;
      }

      const res = await fetch('http://127.0.0.1:3000/api/billing/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        alert(data.message || 'Errore checkout');
        return;
      }

      if (!data.url) {
        alert('Stripe URL mancante');
        return;
      }

      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      alert('Errore durante il checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Billing</h1>
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Caricamento...' : 'Vai al checkout'}
      </button>
    </div>
  );
}