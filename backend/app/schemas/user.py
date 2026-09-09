from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserDetailResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    username: str
    email: EmailStr
    role_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserRoleResponse(BaseModel):
    id: int
    name: str


class UserWithRoleResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    username: str
    email: EmailStr
    is_active: bool
    role: UserRoleResponse
    created_at: datetime
    updated_at: datetime