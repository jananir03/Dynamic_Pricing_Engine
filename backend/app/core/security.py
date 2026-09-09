from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    """
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against a bcrypt hash.
    """
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    user_id: int,
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a JWT access token containing the user's ID.
    """

    if expires_delta is None:
        expires_delta = timedelta(
            minutes=settings.access_token_expire_minutes,
        )

    expire = datetime.now(timezone.utc) + expires_delta

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> int:
    """
    Decode a JWT access token and return the user ID.
    """

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )

        subject = payload.get("sub")

        if subject is None:
            raise ValueError("Token subject is missing.")

        return int(subject)

    except (
        JWTError,
        ValueError,
        TypeError,
    ) as exc:
        raise ValueError(
            "Invalid or expired access token."
        ) from exc