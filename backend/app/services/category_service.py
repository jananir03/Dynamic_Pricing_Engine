from math import ceil

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def create_category(
    db: Session,
    data: CategoryCreate,
) -> Category:
    existing_category = db.scalar(
        select(Category).where(Category.name == data.name)
    )

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this name already exists.",
        )

    category = Category(
        name=data.name,
        description=data.description,
        is_active=True,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def get_category(
    db: Session,
    category_id: int,
) -> Category:
    category = db.get(Category, category_id)

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    return category


def list_categories(
    db: Session,
    page: int,
    page_size: int,
    search: str | None,
    is_active: bool | None,
    sort_by: str,
    sort_order: str,
) -> tuple[list[Category], int, int]:
    query = select(Category)

    if search:
        search_pattern = f"%{search.strip()}%"

        query = query.where(
            or_(
                Category.name.ilike(search_pattern),
                Category.description.ilike(search_pattern),
            )
        )

    if is_active is not None:
        query = query.where(Category.is_active == is_active)

    allowed_sort_fields = {
        "id": Category.id,
        "name": Category.name,
        "created_at": Category.created_at,
        "updated_at": Category.updated_at,
    }

    sort_column = allowed_sort_fields.get(sort_by, Category.created_at)

    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    count_query = select(func.count()).select_from(query.subquery())
    total = db.scalar(count_query) or 0

    offset = (page - 1) * page_size

    query = query.offset(offset).limit(page_size)

    categories = list(db.scalars(query).all())

    total_pages = ceil(total / page_size) if total else 0

    return categories, total, total_pages


def update_category(
    db: Session,
    category_id: int,
    data: CategoryUpdate,
) -> Category:
    category = get_category(db, category_id)

    update_data = data.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] != category.name:
        existing_category = db.scalar(
            select(Category).where(
                Category.name == update_data["name"],
                Category.id != category_id,
            )
        )

        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A category with this name already exists.",
            )

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category


def update_category_status(
    db: Session,
    category_id: int,
    is_active: bool,
) -> Category:
    category = get_category(db, category_id)

    category.is_active = is_active

    db.commit()
    db.refresh(category)

    return category


def delete_category(
    db: Session,
    category_id: int,
) -> None:
    category = get_category(db, category_id)

    if category.products:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Category cannot be deleted because products are associated "
                "with it. Deactivate the category instead."
            ),
        )

    db.delete(category)
    db.commit()