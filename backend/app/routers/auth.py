from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import (
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: Annotated[
        Session,
        Depends(get_db),
    ],
) -> UserResponse:
    """
    Register a new normal USER account.
    """

    service = AuthService(db)

    try:
        user = service.register_user(data)

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    form_data: Annotated[
        OAuth2PasswordRequestForm,
        Depends(),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
) -> TokenResponse:
    """
    Authenticate a user using the OAuth2 password flow.

    The OAuth2 username field contains the user's email address.
    """

    service = AuthService(db)

    try:
        user = service.authenticate_user(
            email=form_data.username,
            password=form_data.password,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={
                "WWW-Authenticate": "Bearer",
            },
        ) from exc

    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc

    token = service.create_login_token(user)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
    )