from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.role import Role
from app.models.user import User
from app.schemas.auth import RegisterRequest


class AuthService:
    """
    Handles authentication-related business logic.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def register_user(
        self,
        data: RegisterRequest,
    ) -> User:
        """
        Register a new normal USER account.
        """

        existing_email = self.db.scalar(
            select(User).where(
                User.email == data.email,
            )
        )

        if existing_email is not None:
            raise ValueError("Email is already registered.")

        existing_username = self.db.scalar(
            select(User).where(
                User.username == data.username,
            )
        )

        if existing_username is not None:
            raise ValueError("Username is already registered.")

        user_role = self.db.scalar(
            select(Role).where(
                Role.name == "USER",
            )
        )

        if user_role is None:
            raise ValueError(
                "Default USER role is not configured."
            )

        user = User(
            username=data.username,
            email=str(data.email).lower(),
            password_hash=hash_password(data.password),
            role_id=user_role.id,
            is_active=True,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def authenticate_user(
        self,
        email: str,
        password: str,
    ) -> User:
        """
        Authenticate a user using email and password.
        """

        user = self.db.scalar(
            select(User).where(
                User.email == email.lower(),
            )
        )

        if user is None:
            raise ValueError("Invalid email or password.")

        if not verify_password(
            password,
            user.password_hash,
        ):
            raise ValueError("Invalid email or password.")

        if not user.is_active:
            raise PermissionError(
                "User account is inactive."
            )

        return user

    def create_login_token(
        self,
        user: User,
    ) -> str:
        """
        Create a JWT token for an authenticated user.
        """

        return create_access_token(
            user_id=user.id,
        )