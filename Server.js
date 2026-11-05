const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Basic route to test if it works
app.get('/', (req, res) => res.send('BIDORA Backend is running!'));

// Chapa Payment Route
app.post('/api/pay', async (req, res) => {
  const { amount, phone, email } = req.body;
  try {
    const response = await axios.post('https://api.chapa.co/v1/transaction/initialize', {
      amount: amount,
      currency: 'ETB',
      email: email || 'test@bidora.shop',
      first_name: 'Bidder',
      last_name: 'User',
      phone_number: phone,
      tx_ref: 'TX-' + Date.now(),
      callback_url: 'https://bidora-backend.onrender.com/api/chapa-webhook',
      return_url: 'https://bidora.shop'
    }, {
      headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` }
    });
    res.json({ checkout_url: response.data.data.checkout_url });
  } catch (error) {
    res.status(500).json({ error: 'Payment failed' });
  }
});

// SMS Ethiopia Route
app.post('/api/send-otp', async (req, res) => {
  const { phone, otp } = req.body;
  try {
    await axios.post('https://api.afromessage.com/api/send', {
      to: phone,
      message: `Your BIDORA code is: ${otp}`,
      from: 'BIDORA'
    }, {
      headers: { Authorization: `Bearer ${process.env.SMS_API_KEY}` }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'SMS failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
