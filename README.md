# Divine Encounter 2026 - Religious Event Landing Page

A complete registration and payment system for religious events, built with FastAPI, Supabase, and Paystack.

## 🌟 Features

### Frontend
- ✨ Modern, spiritually-inspired design with elegant typography
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Smooth animations and transitions
- 📸 Gallery section for previous events
- 🎥 Video section support
- 📝 Multi-section landing page with mission/vision
- 🔗 Social media integration in footer

### Backend
- 🔐 Secure payment processing with Paystack
- 💾 Database management with Supabase (PostgreSQL)
- ✅ Payment verification with webhooks
- 📊 Registration statistics API
- 🔒 Transaction reference generation
- 📧 Email confirmation support (configurable)

### User Flow
1. **Landing Page** → Explore event details
2. **Signup Page** → Fill registration form
3. **Payment Gateway** → Secure Paystack payment
4. **Verification** → Backend verifies payment
5. **Success Page** → Confirmation and next steps

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Supabase account
- Paystack account

### Installation

1. **Clone or download the project**
```bash
cd religious-event-site
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Set up Supabase**
   - Go to [Supabase](https://supabase.com) and create a new project
   - In the SQL Editor, run the contents of `database_schema.sql`
   - Copy your project URL and anon key

4. **Set up Paystack**
   - Go to [Paystack](https://paystack.com) and create an account
   - Get your test/live API keys from Settings → API Keys & Webhooks
   - Set up webhook URL: `https://your-domain.com/api/webhook/paystack`

5. **Configure environment variables**
```bash
cp .env.example .env
```
Edit `.env` and add your credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

6. **Update Paystack public key in frontend**
Edit `static/js/signup.js` line 70:
```javascript
key: 'pk_test_your_paystack_public_key', // Replace with your actual key
```

7. **Run the application**
```bash
python main.py
```
Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

8. **Open in browser**
```
http://localhost:8000
```

## 📁 Project Structure

```
religious-event-site/
├── main.py                 # FastAPI backend
├── requirements.txt        # Python dependencies
├── database_schema.sql     # Database schema
├── .env.example           # Environment variables template
├── templates/
│   ├── index.html         # Landing page
│   ├── signup.html        # Registration page
│   └── success.html       # Success page
├── static/
│   ├── css/
│   │   └── styles.css     # All styles
│   ├── js/
│   │   ├── main.js        # Landing page scripts
│   │   ├── signup.js      # Registration & payment
│   │   └── success.js     # Success page scripts
│   └── images/            # Images (add your own)
└── README.md
```

## 🎨 Customization

### 1. Update Event Details
Edit `templates/index.html`:
- Event name, theme, dates
- Location
- Mission and vision statements
- Schedule and event details

### 2. Change Colors and Fonts
Edit `static/css/styles.css`:
```css
:root {
    --primary: #2c3e50;
    --accent: #c29657;
    --font-display: 'Playfair Display', serif;
    --font-body: 'Crimson Pro', serif;
}
```

### 3. Update Registration Fee
Edit `static/js/signup.js` line 79:
```javascript
amount: 500000, // Amount in kobo (₦5,000)
```

Edit `templates/signup.html` to show the new price.

### 4. Add Real Images
Replace gallery placeholders in `templates/index.html`:
```html
<div class="gallery-item">
    <img src="/static/images/event-photo-1.jpg" alt="Event photo">
</div>
```

### 5. Add Video
Edit `templates/index.html` line ~267:
```html
<div class="video-container">
    <iframe width="100%" height="100%" 
        src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
        frameborder="0" allowfullscreen>
    </iframe>
</div>
```

### 6. Update Social Media Links
Edit `templates/index.html` footer section (~340+):
```html
<a href="https://facebook.com/yourpage" target="_blank">...</a>
<a href="https://instagram.com/yourpage" target="_blank">...</a>
```

### 7. Update Contact Information
Edit footer in all HTML templates:
```html
<p>Email: info@yourdomain.com</p>
<p>Phone: +234 800 000 0000</p>
```

## 🔧 API Endpoints

### Public Endpoints
- `GET /` - Landing page
- `GET /signup` - Registration page
- `GET /success` - Success page
- `POST /api/register` - Create registration
- `POST /api/verify-payment` - Verify payment

### Webhook
- `POST /api/webhook/paystack` - Paystack webhook

### Admin Endpoints (Secure these in production)
- `GET /api/registration/{id}` - Get registration details
- `GET /api/stats` - Get statistics

## 🔒 Security Considerations

### For Production:

1. **Enable HTTPS** - Use SSL certificate (Let's Encrypt)

2. **Secure API Keys** - Never commit API keys to version control

3. **Webhook Security** - Verify Paystack webhook signatures:
```python
import hmac
import hashlib

def verify_webhook(signature, body):
    hash = hmac.new(
        PAYSTACK_SECRET_KEY.encode('utf-8'),
        body,
        hashlib.sha512
    ).hexdigest()
    return hash == signature
```

4. **Rate Limiting** - Add rate limiting to prevent abuse:
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

5. **CORS Configuration** - Restrict allowed origins:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

6. **Database Security**
   - Use Supabase RLS (Row Level Security)
   - Create separate service accounts
   - Limit database access

## 📧 Email Notifications

To add email confirmations, implement the `send_confirmation_email` function in `main.py`:

### Using SendGrid:
```python
import sendgrid
from sendgrid.helpers.mail import Mail

async def send_confirmation_email(registration_data):
    sg = sendgrid.SendGridAPIClient(api_key=os.getenv('SENDGRID_API_KEY'))
    message = Mail(
        from_email='noreply@yourdomain.com',
        to_emails=registration_data['email'],
        subject='Divine Encounter 2026 - Registration Confirmed',
        html_content=f'''
            <h1>Registration Confirmed!</h1>
            <p>Dear {registration_data['full_name']},</p>
            <p>Your registration for Divine Encounter 2026 has been confirmed.</p>
        '''
    )
    sg.send(message)
```

## 🚀 Deployment

### Option 1: Render (Recommended)
1. Push code to GitHub
2. Connect to Render
3. Set environment variables
4. Deploy

### Option 2: Railway
1. Push code to GitHub
2. Connect to Railway
3. Set environment variables
4. Deploy

### Option 3: DigitalOcean App Platform
1. Push code to GitHub
2. Create new app
3. Set environment variables
4. Deploy

### Option 4: AWS EC2
1. Launch EC2 instance
2. Install dependencies
3. Use Nginx as reverse proxy
4. Set up SSL with Certbot
5. Use systemd for process management

## 📊 Database Schema

```sql
registrations (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    attendance_mode VARCHAR(20),
    church VARCHAR(255),
    special_needs TEXT,
    newsletter BOOLEAN,
    payment_status VARCHAR(20),
    transaction_reference VARCHAR(100) UNIQUE,
    payment_amount DECIMAL(10, 2),
    created_at TIMESTAMP,
    paid_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## 🧪 Testing

### Test Payment Flow:
1. Use Paystack test cards:
   - Success: `4084084084084081`
   - Decline: `5060666666666666666`
2. Use test keys (prefix: `sk_test_` and `pk_test_`)
3. Verify payment in Paystack dashboard

### Test Webhook:
Use Paystack's webhook testing tool or tools like ngrok for local testing.

## 📈 Monitoring

Track important metrics:
- Total registrations
- Payment success rate
- Attendance mode distribution
- Revenue
- Registration sources

Use the `/api/stats` endpoint for dashboard data.

## 🤝 Support

For issues or questions:
- Email: support@yourdomain.com
- Phone: +234 800 000 0000

## 📄 License

This project is proprietary software created for Divine Encounter Ministry.

## 🙏 Credits

Built with:
- FastAPI
- Supabase
- Paystack
- Playfair Display & Crimson Pro fonts

---

**Divine Encounter 2026 - Where Heaven Meets Earth** ✨#   S e c r e t - G a r d e n  
 #   S e c r e t - G a r d e n  
 