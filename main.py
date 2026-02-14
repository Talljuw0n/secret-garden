from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, EmailStr
import os
import uuid
import httpx
from datetime import datetime
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

# Initialize FastAPI app
app = FastAPI(title="Divine Encounter 2026 API")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Setup templates
templates = Jinja2Templates(directory="templates")

# Load environment variables from .env file
load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "your_supabase_url")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your_supabase_key")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("URL:", SUPABASE_URL)
print("KEY:", SUPABASE_KEY)


# Paystack Configuration
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "sk_test_your_secret_key")
PAYSTACK_API_URL = "https://api.paystack.co"

# Request Models
class RegistrationRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    attendance_mode: str
    church: Optional[str] = None
    special_needs: Optional[str] = None
    newsletter: bool = False

class PaymentVerificationRequest(BaseModel):
    reference: str


# Routes
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Landing page"""
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    """Registration page"""
    return templates.TemplateResponse("signup.html", {"request": request})


@app.get("/success", response_class=HTMLResponse)
async def success_page(request: Request):
    """Success page after payment"""
    return templates.TemplateResponse("success.html", {"request": request})


@app.post("/api/register")
async def register_user(registration: RegistrationRequest):
    """
    Register a new user and create a pending payment record
    """
    try:
        # Generate unique transaction reference
        transaction_reference = f"DE2026-{uuid.uuid4().hex[:12].upper()}"
        
        # Prepare registration data
        registration_data = {
            "full_name": registration.full_name,
            "email": registration.email,
            "phone": registration.phone,
            "attendance_mode": registration.attendance_mode,
            "church": registration.church,
            "special_needs": registration.special_needs,
            "newsletter": registration.newsletter,
            "payment_status": "pending",
            "transaction_reference": transaction_reference,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Insert into Supabase
        result = supabase.table("registrations").insert(registration_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create registration")
        
        registration_id = result.data[0]["id"]
        
        return {
            "status": "success",
            "message": "Registration created successfully",
            "registration_id": registration_id,
            "transaction_reference": transaction_reference
        }
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@app.post("/api/verify-payment")
async def verify_payment(payment: PaymentVerificationRequest):
    """
    Verify payment with Paystack and update registration status
    """
    try:
        # Verify payment with Paystack
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
                "Content-Type": "application/json"
            }
            
            response = await client.get(
                f"{PAYSTACK_API_URL}/transaction/verify/{payment.reference}",
                headers=headers
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Payment verification failed")
            
            payment_data = response.json()
            
            # Check if payment was successful
            if payment_data["status"] and payment_data["data"]["status"] == "success":
                # Update registration status in database
                update_result = supabase.table("registrations")\
                    .update({
                        "payment_status": "paid",
                        "paid_at": datetime.utcnow().isoformat(),
                        "payment_amount": payment_data["data"]["amount"] / 100  # Convert from kobo
                    })\
                    .eq("transaction_reference", payment.reference)\
                    .execute()
                
                if not update_result.data:
                    raise HTTPException(status_code=500, detail="Failed to update payment status")
                
                # Send confirmation email (implement email service)
                # await send_confirmation_email(update_result.data[0])
                
                return {
                    "status": "success",
                    "message": "Payment verified successfully",
                    "data": update_result.data[0]
                }
            else:
                raise HTTPException(status_code=400, detail="Payment was not successful")
                
    except Exception as e:
        print(f"Payment verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")


@app.post("/api/webhook/paystack")
async def paystack_webhook(request: Request):
    """
    Webhook endpoint for Paystack payment notifications
    This provides additional security and redundancy for payment verification
    """
    try:
        # Verify webhook signature
        signature = request.headers.get("x-paystack-signature")
        body = await request.body()
        
        # Verify the signature (implement proper verification)
        # In production, verify using HMAC SHA512
        
        payload = await request.json()
        event = payload.get("event")
        data = payload.get("data")
        
        if event == "charge.success":
            # Extract transaction reference
            reference = data.get("reference")
            
            # Update payment status
            supabase.table("registrations")\
                .update({
                    "payment_status": "paid",
                    "paid_at": datetime.utcnow().isoformat(),
                    "payment_amount": data.get("amount") / 100
                })\
                .eq("transaction_reference", reference)\
                .execute()
            
            return {"status": "success"}
        
        return {"status": "ignored"}
        
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}


@app.get("/api/registration/{registration_id}")
async def get_registration(registration_id: str):
    """
    Get registration details by ID (for admin or user verification)
    """
    try:
        result = supabase.table("registrations")\
            .select("*")\
            .eq("id", registration_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Registration not found")
        
        return result.data[0]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch registration: {str(e)}")


@app.get("/api/stats")
async def get_stats():
    """
    Get registration statistics (for admin dashboard)
    """
    try:
        # Total registrations
        total = supabase.table("registrations").select("id", count="exact").execute()
        
        # Paid registrations
        paid = supabase.table("registrations")\
            .select("id", count="exact")\
            .eq("payment_status", "paid")\
            .execute()
        
        # In-person vs virtual
        in_person = supabase.table("registrations")\
            .select("id", count="exact")\
            .eq("attendance_mode", "in-person")\
            .eq("payment_status", "paid")\
            .execute()
        
        return {
            "total_registrations": total.count,
            "paid_registrations": paid.count,
            "in_person_attendees": in_person.count,
            "virtual_attendees": paid.count - in_person.count if paid.count else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


# Optional: Email notification function
async def send_confirmation_email(registration_data: dict):
    """
    Send confirmation email to registered user
    Implement using your preferred email service (SendGrid, AWS SES, etc.)
    """
    # TODO: Implement email sending logic
    pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
