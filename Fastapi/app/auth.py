from pwdlib import PasswordHash
import jwt
from jwt.exceptions import InvalidTokenError
from datetime import  datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from app.database import get_db
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")

from app.conf import settings

secret =settings.SECRET_KEY
ALGORITHM =settings.ALGORITHM
expire_token_mins = settings.ACCESS_TOKEN_EXPIRE_MINUTES


password_hash = PasswordHash.recommended()

def hashing_password(password:str):
    return password_hash.hash(password)

def verify_password(password:str,hashpassword:str):
    return password_hash.verify(password,hashpassword)


#--------tokens of JWT --------#

def create_token(data):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_token_mins)

    to_encode.update({"exp" :expire})
    encode_jwt =jwt.encode(
        payload=to_encode,
        key=secret,
        algorithm=ALGORITHM
        )
    return encode_jwt


def decode_token(token:str):
    decode_jwt = jwt.decode(token,secret,algorithms=ALGORITHM)
    return decode_jwt

def get_current_user( token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    from app.crud import get_user_by_username

    try:
        paylode = decode_token(token)
    except InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
            )
    
    username = paylode["sub"]
    user = get_user_by_username(db,username)

    if user is None:
        raise HTTPException(status_code=401, detail="User Not Found")
    
    return user