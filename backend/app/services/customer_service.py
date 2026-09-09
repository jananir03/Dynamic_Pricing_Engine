from math import ceil

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.role import Role
from app.schemas.customer import CustomerCreate, CustomerUpdate


def _is_admin(
    db: Session,
    role_id: int,
) -> bool:
    role = db.scalar(
        select(Role).where(Role.id == role_id)
    )

    return role is not None and role.name == "ADMIN"


def create_customer(
    db: Session,
    data: CustomerCreate,
) -> Customer:
    existing_customer = db.scalar(
        select(Customer).where(Customer.email == data.email)
    )

    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A customer with this email already exists.",
        )

    customer = Customer(
        name=data.name,
        email=data.email,
        customer_type=data.customer_type,
        customer_category=data.customer_category,
        location=data.location,
        is_active=True,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer


def get_customer(
    db: Session,
    customer_id: int,
    role_id: int,
) -> Customer:
    customer = db.get(Customer, customer_id)

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    if not _is_admin(db, role_id) and not customer.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    return customer


def list_customers(
    db: Session,
    role_id: int,
    page: int,
    page_size: int,
    search: str | None,
    customer_type,
    customer_category: str | None,
    location: str | None,
    is_active: bool | None,
    sort_by: str,
    sort_order: str,
) -> tuple[list[Customer], int, int]:
    query = select(Customer)

    is_admin = _is_admin(db, role_id)

    # Non-admin users can only see active customers.
    if not is_admin:
        query = query.where(Customer.is_active.is_(True))
    elif is_active is not None:
        query = query.where(Customer.is_active == is_active)

    if search:
        search_pattern = f"%{search.strip()}%"

        query = query.where(
            or_(
                Customer.name.ilike(search_pattern),
                Customer.email.ilike(search_pattern),
                Customer.customer_category.ilike(search_pattern),
                Customer.location.ilike(search_pattern),
            )
        )

    if customer_type is not None:
        query = query.where(
            Customer.customer_type == customer_type
        )

    if customer_category:
        query = query.where(
            Customer.customer_category.ilike(
                f"%{customer_category.strip()}%"
            )
        )

    if location:
        query = query.where(
            Customer.location.ilike(
                f"%{location.strip()}%"
            )
        )

    if is_admin and is_active is not None:
        query = query.where(Customer.is_active == is_active)

    allowed_sort_fields = {
        "id": Customer.id,
        "name": Customer.name,
        "email": Customer.email,
        "customer_type": Customer.customer_type,
        "created_at": Customer.created_at,
        "updated_at": Customer.updated_at,
    }

    sort_column = allowed_sort_fields.get(
        sort_by,
        Customer.created_at,
    )

    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    count_query = select(func.count()).select_from(query.subquery())
    total = db.scalar(count_query) or 0

    offset = (page - 1) * page_size

    query = query.offset(offset).limit(page_size)

    customers = list(db.scalars(query).all())

    total_pages = ceil(total / page_size) if total else 0

    return customers, total, total_pages


def update_customer(
    db: Session,
    customer_id: int,
    data: CustomerUpdate,
) -> Customer:
    customer = db.get(Customer, customer_id)

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    update_data = data.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"] != customer.email:
        existing_customer = db.scalar(
            select(Customer).where(
                Customer.email == update_data["email"],
                Customer.id != customer_id,
            )
        )

        if existing_customer:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A customer with this email already exists.",
            )

    for field, value in update_data.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)

    return customer


def update_customer_status(
    db: Session,
    customer_id: int,
    is_active: bool,
) -> Customer:
    customer = db.get(Customer, customer_id)

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    customer.is_active = is_active

    db.commit()
    db.refresh(customer)

    return customer


def delete_customer(
    db: Session,
    customer_id: int,
) -> None:
    customer = db.get(Customer, customer_id)

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    db.delete(customer)
    db.commit()