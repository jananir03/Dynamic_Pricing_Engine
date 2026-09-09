from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import AdminUser, CurrentUser
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.user import (
    UserStatusUpdate,
    UserWithRoleResponse,
)


router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


@router.get(
    "/me",
    response_model=UserWithRoleResponse,
)
def get_current_user_profile(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> UserWithRoleResponse:

    user = db.scalar(
        select(User)
        .where(User.id == current_user.id)
        .options(joinedload(User.role))
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.role is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User role configuration is invalid.",
        )

    return UserWithRoleResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        is_active=user.is_active,
        role={
            "id": user.role.id,
            "name": user.role.name,
        },
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.get(
    "",
    response_model=list[UserWithRoleResponse],
)
def list_users(
    current_admin: AdminUser,
    db: Annotated[Session, Depends(get_db)],
) -> list[UserWithRoleResponse]:

    users = db.scalars(
        select(User)
        .options(joinedload(User.role))
        .order_by(User.id)
    ).unique().all()

    return [
        UserWithRoleResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            is_active=user.is_active,
            role={
                "id": user.role.id,
                "name": user.role.name,
            },
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
        for user in users
        if user.role is not None
    ]


@router.patch(
    "/{user_id}/status",
    response_model=UserResponse,
)
def update_user_status(
    user_id: int,
    data: UserStatusUpdate,
    current_admin: AdminUser,
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:

    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.id == current_admin.id and not data.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An administrator cannot deactivate their own account.",
        )

    user.is_active = data.is_active

    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)