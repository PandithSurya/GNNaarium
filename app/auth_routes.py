from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse

from datetime import datetime
import os
import json
from app.database import get_user_by_email, create_user, create_jwt_token

router = APIRouter()

def backend_url():
    return os.getenv('BACKEND_URL', 'http://localhost:8000')

def frontend_url():
    url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    if not url.startswith('http'):
        url = 'https://' + url
    return url.rstrip('/')

@router.get("/auth/test")
async def test_oauth_config():
    from urllib.parse import urlencode
    params = {
        'client_id': os.getenv('GOOGLE_CLIENT_ID'),
        'redirect_uri': f'{backend_url()}/auth/google/callback',
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'offline'
    }
    manual_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return {
        "client_id": os.getenv('GOOGLE_CLIENT_ID'),
        "client_secret_configured": bool(os.getenv('GOOGLE_CLIENT_SECRET')),
        "redirect_uri": f'{backend_url()}/auth/google/callback',
        "manual_oauth_url": manual_url
    }

@router.get("/auth/google/login")
async def google_login(request: Request, redirect_to: str = None, origin: str = None):
    try:
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        if not client_id or not os.getenv('GOOGLE_CLIENT_SECRET'):
            raise HTTPException(status_code=500, detail="Google OAuth not configured")

        from urllib.parse import urlencode
        import base64

        # Use explicitly passed origin, fallback to Referer, fallback to FRONTEND_URL env
        if not origin:
            referer = request.headers.get('referer') or request.headers.get('origin')
            if referer:
                from urllib.parse import urlparse
                parsed = urlparse(referer)
                origin = f"{parsed.scheme}://{parsed.netloc}"
        if not origin:
            origin = frontend_url()

        state_data = json.dumps({'redirect_to': redirect_to or '/', 'origin': origin})
        state = base64.b64encode(state_data.encode()).decode()

        params = {
            'client_id': client_id,
            'redirect_uri': f'{backend_url()}/auth/google/callback',
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline',
            'state': state,
        }

        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        return RedirectResponse(url=auth_url)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth error: {str(e)}")

@router.get("/auth/google/callback")
async def google_callback(request: Request):
    # Extract origin from state first — before anything can fail
    origin = frontend_url()
    redirect_to = '/'
    state = request.query_params.get('state')
    if state:
        try:
            import base64
            state_data = json.loads(base64.b64decode(state.encode()).decode())
            redirect_to = state_data.get('redirect_to', '/')
            origin = state_data.get('origin') or frontend_url()
        except:
            pass

    try:
        if 'error' in request.query_params:
            error = request.query_params.get('error')
            raise Exception(f"Google OAuth error: {error}")

        code = request.query_params.get('code')
        if not code:
            raise Exception("No authorization code received")

        import httpx
        token_data = {
            'code': code,
            'client_id': os.getenv('GOOGLE_CLIENT_ID'),
            'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
            'redirect_uri': f'{backend_url()}/auth/google/callback',
            'grant_type': 'authorization_code'
        }

        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                'https://oauth2.googleapis.com/token',
                data=token_data
            )
            token_json = token_response.json()

            if 'access_token' not in token_json:
                raise Exception(f"Failed to get access token: {token_json}")

            user_response = await client.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f'Bearer {token_json["access_token"]}'}
            )
            user_info = user_response.json()

        if not user_info or not user_info.get('email'):
            raise Exception("Failed to get user info from Google")

        existing_user = await get_user_by_email(user_info['email'])

        if existing_user:
            jwt_token = create_jwt_token(existing_user)
            user_data = {
                "email": existing_user["email"],
                "name": existing_user["name"],
                "profile_pic": existing_user.get("profile_pic")
            }
        else:
            new_user_data = {
                "email": user_info['email'],
                "name": user_info['name'],
                "google_id": user_info['id'],
                "profile_pic": user_info.get('picture'),
                "created_at": datetime.utcnow()
            }
            user_id = await create_user(new_user_data)
            if not user_id:
                raise Exception("Failed to create user")
            jwt_token = create_jwt_token(new_user_data)
            user_data = {
                "email": new_user_data["email"],
                "name": new_user_data["name"],
                "profile_pic": new_user_data.get("profile_pic")
            }

        import urllib.parse
        user_data_encoded = urllib.parse.quote(json.dumps(user_data))
        redirect_url = f"{origin}?token={jwt_token}&user={user_data_encoded}"
        if redirect_to and redirect_to != '/':
            redirect_url = f"{origin}{redirect_to}?token={jwt_token}&user={user_data_encoded}"

        return RedirectResponse(url=redirect_url)

    except Exception as e:
        return RedirectResponse(url=f"{origin}?error={str(e)}")

@router.post("/auth/logout")
async def logout():
    return {"status": "success", "message": "Logged out successfully"}
