from math import ceil

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def _validate_category(
    db: Session,
    category_id: int,
) -> Category:
    category = db.get(Category, category_id)

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    if not category.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Products cannot be assigned to an inactive category.",
        )

    return category


def create_product(
    db: Session,
    data: ProductCreate,
) -> Product:
    _validate_category(db, data.category_id)

    existing_product = db.scalar(
        select(Product).where(Product.sku == data.sku)
    )

    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A product with this SKU already exists.",
        )

    product = Product(
        category_id=data.category_id,
        name=data.name,
        description=data.description,
        sku=data.sku,
        base_price=data.base_price,
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def get_product(
    db: Session,
    product_id: int,
) -> Product:
    product = db.get(Product, product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    return product


def list_products(
    db: Session,
    page: int,
    page_size: int,
    search: str | None,
    category_id: int | None,
    is_active: bool | None,
    min_price,
    max_price,
    sort_by: str,
    sort_order: str,
) -> tuple[list[Product], int, int]:
    query = select(Product)

    if search:
        search_pattern = f"%{search.strip()}%"

        query = query.where(
            or_(
                Product.name.ilike(search_pattern),
                Product.sku.ilike(search_pattern),
                Product.description.ilike(search_pattern),
            )
        )

    if category_id is not None:
        query = query.where(Product.category_id == category_id)

    if is_active is not None:
        query = query.where(Product.is_active == is_active)

    if min_price is not None:
        query = query.where(Product.base_price >= min_price)

    if max_price is not None:
        query = query.where(Product.base_price <= max_price)

    allowed_sort_fields = {
        "id": Product.id,
        "name": Product.name,
        "sku": Product.sku,
        "base_price": Product.base_price,
        "created_at": Product.created_at,
        "updated_at": Product.updated_at,
    }

    sort_column = allowed_sort_fields.get(
        sort_by,
        Product.created_at,
    )

    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    count_query = select(func.count()).select_from(query.subquery())
    total = db.scalar(count_query) or 0

    offset = (page - 1) * page_size

    query = query.offset(offset).limit(page_size)

    products = list(db.scalars(query).all())

    total_pages = ceil(total / page_size) if total else 0

    return products, total, total_pages


def update_product(
    db: Session,
    product_id: int,
    data: ProductUpdate,
) -> Product:
    product = get_product(db, product_id)

    update_data = data.model_dump(exclude_unset=True)

    if "category_id" in update_data:
        _validate_category(
            db,
            update_data["category_id"],
        )

    if "sku" in update_data and update_data["sku"] != product.sku:
        existing_product = db.scalar(
            select(Product).where(
                Product.sku == update_data["sku"],
                Product.id != product_id,
            )
        )

        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A product with this SKU already exists.",
            )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


def update_product_status(
    db: Session,
    product_id: int,
    is_active: bool,
) -> Product:
    product = get_product(db, product_id)

    product.is_active = is_active

    db.commit()
    db.refresh(product)

    return product


def delete_product(
    db: Session,
    product_id: int,
) -> None:
    product = get_product(db, product_id)

    db.delete(product)
    db.commit()