# Classic Caller Frontend

React + Vite SPA. Phone-frame UI with 5 screens: Home dashboard, Dialer (real Twilio Voice SDK WebRTC calls), Top-up (wallet recharge), Call history, and Profile.

## Setup

1. Install dependencies
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and set:
   ```
   VITE_API_BASE_URL=http://localhost:4000
   ```

3. Run:
   ```
   npm run dev
   ```
   Open http://localhost:5173

## Making real calls work

The Dialer uses `@twilio/voice-sdk` (WebRTC). For calls to go through:

1. Your **backend** must be publicly reachable so Twilio can POST to `/calls/voice` and `/calls/status`.
   - Use `ngrok http 4000` for local dev: `ngrok http 4000`
   - Set `BASE_URL=https://your-ngrok-url.ngrok-free.app` in the backend `.env`

2. In the [Twilio Console](https://console.twilio.com):
   - Create a **TwiML App** → Voice Request URL = `${BASE_URL}/calls/voice` (POST)
   - Copy the TwiML App SID → set as `TWILIO_TWIML_APP_SID` in the backend `.env`
   - Create an **API Key** (Standard) → set `TWILIO_API_KEY_SID` + `TWILIO_API_KEY_SECRET`

3. Browsers require **HTTPS** for WebRTC microphone access in production. In dev, `localhost` works without HTTPS.

## Screen map

| Screen     | Route (tab) | What it does                                    |
|------------|-------------|-------------------------------------------------|
| Home       | home        | Dashboard: SIM card, metrics, quick actions, recent calls |
| Call       | dial        | Full dialpad, real Twilio Voice WebRTC calls, mute |
| Top up     | recharge    | Plan selector + custom amount, hooks to wallet recharge API |
| History    | history     | Call log with filter (all/out/in/missed), cost per call |
| Numbers    | (from home) | Provision Twilio virtual number by country      |
| Profile    | settings    | Account info, balance, sign out                 |

## Payment integration

The `/wallet/recharge` endpoint is called directly in dev (no real payment). For production:

1. Create a payment intent with **Stripe / Paystack / Flutterwave** on the frontend.
2. On successful payment, the provider sends a webhook to a **new backend route** you create (e.g. `POST /webhooks/paystack`).
3. That route verifies the webhook signature, then calls the recharge logic internally.
4. Never expose `/wallet/recharge` as a direct client endpoint in production.

## Folder structure

```
src/
  main.jsx          # React entry point
  index.css         # Global tokens (CSS variables)
  api.js            # All fetch() calls to the backend
  AuthContext.jsx   # Login / register / logout state
  AppDataContext.jsx# Wallet, numbers, call logs (shared)
  App.jsx           # Phone frame, tab bar, screen router
  AuthScreen.jsx    # Login + registration form
  Dashboard.jsx     # Home screen
  Dialer.jsx        # Dialpad + Twilio Voice SDK
  Recharge.jsx      # Top-up screen
  History.jsx       # Call history
  Numbers.jsx       # Virtual number provisioning
  Settings.jsx      # Profile / settings
  ui.jsx            # Shared tokens + tiny components (Avatar, Badge, etc.)
```
