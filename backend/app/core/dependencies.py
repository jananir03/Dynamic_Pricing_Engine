from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.role import Role
from app.models.user import User


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
)


def get_current_user(
    token: Annotated[
        str,
        Depends(oauth2_scheme),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
) -> User:
    """
    Resolve the authenticated user from the OAuth2 bearer token.
    """

    try:
        user_id = decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        ) from exc

    user = db.scalar(
        select(User).where(
            User.id == user_id,
        )
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    return user


def require_role(
    required_role: str,
) -> Callable:
    """
    Create a reusable role-based access dependency.
    """

    def role_checker(
        current_user: Annotated[
            User,
            Depends(get_current_user),
        ],
        db: Annotated[
            Session,
            Depends(get_db),
        ],
    ) -> User:

        role = db.scalar(
            select(Role).where(
                Role.id == current_user.role_id,
            )
        )

        if role is None or role.name != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )

        return current_user

    return role_checker


CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]


AdminUser = Annotated[
    User,
    Depends(require_role("ADMIN")),
]