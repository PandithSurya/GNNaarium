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
    return os.getenv('FRONTEND_URL', 'http://localhost:3000')

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
async def google_login(request: Request, redirect_to: str = None):
    try:
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        if not client_id or not os.getenv('GOOGLE_CLIENT_SECRET'):
            raise HTTPException(status_code=500, detail="Google OAuth not configured")

        from urllib.parse import urlencode
        import base64

        state = base64.b64encode((redirect_to or '/').encode()).decode() if redirect_to else None

        params = {
            'client_id': client_id,
            'redirect_uri': f'{backend_url()}/auth/google/callback',
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline'
        }

        if state:
            params['state'] = state

        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        return RedirectResponse(url=auth_url)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth error: {str(e)}")

@router.get("/auth/google/callback")
async def google_callback(request: Request):
    try:
        if 'error' in request.query_params:
            error = request.query_params.get('error')
            error_description = request.query_params.get('error_description', '')
            raise HTTPException(status_code=400, detail=f"Google OAuth error: {error} - {error_description}")

        code = request.query_params.get('code')
        if not code:
            raise HTTPException(status_code=400, detail="No authorization code received")

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
                raise HTTPException(status_code=400, detail="Failed to get access token")

            user_response = await client.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f'Bearer {token_json["access_token"]}'}
            )
            user_info = user_response.json()

        if not user_info or not user_info.get('email'):
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")

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
                raise HTTPException(status_code=500, detail="Failed to create user")
            jwt_token = create_jwt_token(new_user_data)
            user_data = {
                "email": new_user_data["email"],
                "name": new_user_data["name"],
                "profile_pic": new_user_data.get("profile_pic")
            }

        state = request.query_params.get('state')
        redirect_to = '/'
        if state:
            try:
                import base64
                redirect_to = base64.b64decode(state.encode()).decode()
            except:
                redirect_to = '/'

        import urllib.parse
        user_data_encoded = urllib.parse.quote(json.dumps(user_data))

        if redirect_to and redirect_to != '/':
            redirect_url = f"{frontend_url()}{redirect_to}?token={jwt_token}&user={user_data_encoded}"
        else:
            redirect_url = f"{frontend_url()}?token={jwt_token}&user={user_data_encoded}"

        return RedirectResponse(url=redirect_url)

    except Exception as e:
        return RedirectResponse(url=f"{frontend_url()}?error={str(e)}")

@router.post("/auth/logout")
async def logout():
    return {"status": "success", "message": "Logged out successfully"}
