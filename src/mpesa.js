//src/mpesa.js
const express = require("express");
const axios = require("axios");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 3001; // Corrected port to 3001 for backend

// Port active
app.listen(port, () => {
    console.log(`app is running at localhost:${port}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000', // Adjusted to match frontend origin
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
}));

// Check whether server is running
app.get("/", (req, res) => {
    res.send("<h1>push push</h1>");
});

const generateToken = async () => {
    const secret = process.env.CONSUMER_SECRET ? process.env.CONSUMER_SECRET.trim() : null;
    const consumer = process.env.CONSUMER_KEY ? process.env.CONSUMER_KEY.trim() : null;

    if (!secret || !consumer) {
        console.error('Missing CONSUMER_SECRET or CONSUMER_KEY in environment variables');
        throw new Error('Missing CONSUMER_SECRET or CONSUMER_KEY in environment variables');
    }

    const auth = Buffer.from(`${consumer}:${secret}`).toString("base64");
    console.log(`Generated auth header: Basic ${auth}`);

    try {
        const response = await axios.get(
            'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        console.log('Token response:', response.data);
        return response.data.access_token;
    } catch (err) {
        console.error('Error generating token:', err.response ? err.response.data : err.message);
        if (err.response) {
            console.error('Full error response:', err.response.data);
        }
        if (err.response && err.response.status === 400) {
            console.error('Possible causes: Incorrect credentials, wrong URL, or issues with Safaricom API');
        }
        throw err;
    }
};

// Middleware function to generate token
app.post("/stk", async (req, res) => {
    console.log('Received STK request:', req.body); // Added logging to check request body
    try {
        const token = await generateToken();
        console.log('Generated token:', token); // Log the generated token

        const phone = req.body.phone;
        const amount = req.body.amount;

        const date = new Date();
        const timestamp =
            date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        const Shortcode = process.env.SHORTCODE ? process.env.SHORTCODE.trim() : null;
        const passkey = process.env.PASSKEY ? process.env.PASSKEY.trim() : null;

        if (!Shortcode || !passkey) {
            console.error('Missing SHORTCODE or PASSKEY in environment variables');
            throw new Error('Missing SHORTCODE or PASSKEY in environment variables');
        }

        const password = Buffer.from(Shortcode + passkey + timestamp).toString("base64");

        const CALLBACK_URL = process.env.CALLBACK_URL ? process.env.CALLBACK_URL.trim() : null;

        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                BusinessShortCode: Shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: phone,
                PartyB: Shortcode,
                PhoneNumber: phone,
                CallBackURL: CALLBACK_URL,
                AccountReference: 'Reference',
                TransactionDesc: 'Payment Description',
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        console.log('STK response:', response.data);
        res.status(200).json(response.data);
    } catch (err) {
        console.error('Error processing STK push:', err.response ? err.response.data : err.message);
        if (err.response) {
            console.error('Full error response:', err.response.data);
        }
        res.status(400).json({ error: err.message });
    }
});

app.get("/token", async (req, res) => {
    try {
        const token = await generateToken();
        res.json({ token });
    } catch (err) {
        console.error('Error in /token endpoint:', err.response ? err.response.data : err.message);
        res.status(500).send('Error generating token');
    }
});
