# MeatDoctorUcc Backend

Node.js/Express.js backend for the MeatDoctorUcc food ordering system using Supabase, Nodemailer, and Hubtel SMS API.

## Setup

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Create a `.env` file with the required variables (see `.env` template).
4. Set up Supabase:
   - Create a project in Supabase.
   - Run the SQL schema in the SQL Editor (see artifact `c1673f73-5802-4595-a291-ac3c9d469989`).
   - Create `food-images` and `background-images` storage buckets with public read and authenticated write access.
5. Set up SMTP (e.g., Gmail):
   - Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in `.env`.
   - For Gmail, use an App Password if 2FA is enabled.
   - If SMTP is not set up, OTPs will be logged to the console.
6. Seed the admin user:
   ```bash
   npm run seed


Start the server:npm run dev



API Endpoints

Auth:
POST /api/auth/login: Send OTP to admin email or log to console.
POST /api/auth/verify-otp: Verify OTP and get JWT.


Foods:
GET /api/foods: List foods (public).
POST /api/foods: Create food (admin).
PUT /api/foods/:id: Update food (admin).
DELETE /api/foods/:id: Delete food (admin).
POST /api/foods/upload-image: Upload food image (admin).


Orders:
POST /api/orders: Create order and send SMS notification (public).
GET /api/orders: List orders, optionally filtered by status or order ID (admin).
PUT /api/orders/:id: Update order status (admin).
DELETE /api/orders/:id: Delete order (admin).
GET /api/orders/track/:orderId: Track order by order ID (public).


Settings:
PUT /api/settings: Update email/SMS settings or background image URL (admin).
GET /api/settings: Retrieve settings (admin).
POST /api/settings/upload-background: Upload background image (admin).


Analytics:
GET /api/analytics: Get order statistics (admin).



Environment Variables

SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY: Supabase credentials (service key for seeding).
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS: SMTP email settings (optional).
HUBTEL_CLIENT_ID, HUBTEL_CLIENT_SECRET, HUBTEL_SENDER_ID: Hubtel SMS credentials.
FRONTEND_URL: React app URL.
JWT_SECRET: JWT signing secret.
ADMIN_EMAIL, ADMIN_PASSWORD: Admin credentials.

Seeding
Run npm run seed to insert the admin user defined in ADMIN_EMAIL and ADMIN_PASSWORD into the admins table. Requires SUPABASE_SERVICE_KEY.
Notes

Apply the Supabase database schema before running the seeder or server.
Orders trigger SMS notifications to the user's phone number with detailed order information.
Use a secure JWT_SECRET (e.g., generate with openssl rand -base64 32).
The trackOrder endpoint allows users to check order status using the orderId from the SMS.
If SMTP credentials are missing, OTPs are logged to the console for testing.



