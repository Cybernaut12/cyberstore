# CyberStore Deployment Guide

## 1) Deploy backend (Render)

1. Push repo to GitHub.
2. In Render, create a new **Web Service** from your repo.
3. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables in Render:
   - `PORT=10000` (Render default listen port)
   - `MONGO_URI=...`
   - `JWT_SECRET=...`
   - `CLOUDINARY_CLOUD_NAME=...`
   - `CLOUDINARY_API_KEY=...`
   - `CLOUDINARY_API_SECRET=...`
   - `PAYSTACK_SECRET_KEY=...`
   - `PAYSTACK_PUBLIC_KEY=...`
   - `PAYSTACK_CALLBACK_URL=https://<frontend-domain>/payment-success`
   - `SMTP_HOST=smtp-relay.brevo.com`
   - `SMTP_PORT=2525`
   - `SMTP_SECURE=false`
   - `SMTP_USER=...`
   - `SMTP_PASS=...`
   - `EMAIL_FROM=CyberStore <your-verified-sender@email>`
   - `EMAIL_TIMEOUT_MS=8000`
   - `GOOGLE_CLIENT_ID=...`
   - `FRONTEND_URL=https://<frontend-domain>`
   - `FRONTEND_URLS=https://<frontend-domain>,https://<other-allowed-origin>`
5. Deploy and copy your backend URL (example: `https://cyberstore-api.onrender.com`).

## 2) Deploy frontend (Vercel)

1. Import repo in Vercel.
2. Configure project:
   - Root Directory: `frontend`
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
3. Add environment variables:
   - `REACT_APP_API_URL=https://<backend-domain>/api`
   - `REACT_APP_BACKEND_ORIGIN=https://<backend-domain>`
   - `REACT_APP_GOOGLE_CLIENT_ID=...`
4. Deploy and copy your frontend URL.

## 3) Final wiring

1. Update backend `FRONTEND_URL` and `FRONTEND_URLS` with your real frontend domain(s).
2. Update backend `PAYSTACK_CALLBACK_URL` to your frontend `/payment-success` URL.
3. Redeploy backend.
4. Test:
   - Register + signup OTP
   - Login
   - Forgot password
   - Product image loading
   - Checkout redirect + payment callback

## Security note

- Rotate and replace any secret key that has ever been shared in chat/screenshots (`SMTP_PASS`, `PAYSTACK_SECRET_KEY`, etc).
