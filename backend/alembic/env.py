from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.db.base import Base

# Import every model explicitly so Alembic registers
# all SQLAlchemy tables in Base.metadata.
from app.models.calculation_rule import CalculationRule
from app.models.category import Category
from app.models.customer import Customer
from app.models.pricing_calculation import PricingCalculation
from app.models.pricing_rule import PricingRule
from app.models.product import Product
from app.models.promotion import Promotion
from app.models.role import Role
from app.models.rule_action import RuleAction
from app.models.rule_condition import RuleCondition
from app.models.user import User


config = context.config


if config.config_file_name is not None:
    fileConfig(config.config_file_name)


config.set_main_option(
    "sqlalchemy.url",
    settings.database_url.replace("%", "%%"),
)


target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in offline mode."""

    url = settings.database_url

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named",
        },
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in online mode."""

    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()