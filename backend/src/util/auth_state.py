import os
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv  # 1. Import load_dotenv

# 2. Load the variables from .env
load_dotenv() 

app = FastAPI()
auth_scheme = HTTPBearer()

# 3. Now os.environ can see your keys
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")

# Check if keys are missing to avoid cryptic errors later
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def get_current_user(token: HTTPAuthorizationCredentials = Security(auth_scheme)):
    try:
        # We pass the JWT from the frontend to Supabase to verify it
        user = supabase.auth.get_user(token.credentials)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid session")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

@app.get("/protected-data")
async def root(user=Depends(get_current_user)):
    # user.user is where Supabase stores the user metadata
    return {"message": f"Hello {user.user.email}, you are authorized!"}