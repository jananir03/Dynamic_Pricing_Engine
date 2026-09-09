from sqlalchemy import select

from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.role import Role
from app.models.user import User


DEFAULT_ROLES = [
    {
        "name": "ADMIN",
        "description": "Administrator with full system access.",
    },
    {
        "name": "USER",
        "description": "Standard user with pricing access.",
    },
]


def seed_roles() -> dict[str, Role]:
    """
    Create default application roles if they don't exist.
    """

    db = SessionLocal()

    try:
        roles: dict[str, Role] = {}

        for role_data in DEFAULT_ROLES:
            role = db.scalar(
                select(Role).where(
                    Role.name == role_data["name"],
                )
            )

            if role is None:
                role = Role(
                    name=role_data["name"],
                    description=role_data["description"],
                )

                db.add(role)
                db.flush()

            roles[role.name] = role

        db.commit()

        return roles

    finally:
        db.close()


def seed_admin() -> None:
    """
    Create the initial administrator account.

    Credentials are read from environment-backed settings.
    """

    from app.core.config import settings

    db = SessionLocal()

    try:
        admin_role = db.scalar(
            select(Role).where(
                Role.name == "ADMIN",
            )
        )

        if admin_role is None:
            raise RuntimeError(
                "ADMIN role does not exist."
            )

        existing_admin = db.scalar(
            select(User).where(
                User.email == settings.admin_email,
            )
        )

        if existing_admin is not None:
            return

        admin = User(
            username=settings.admin_username,
            email=settings.admin_email.lower(),
            password_hash=hash_password(
                settings.admin_password,
            ),
            role_id=admin_role.id,
            is_active=True,
        )

        db.add(admin)
        db.commit()

    finally:
        db.close()


def main() -> None:
    seed_roles()
    seed_admin()

    print("Database seed completed successfully.")


if __name__ == "__main__":
    main()