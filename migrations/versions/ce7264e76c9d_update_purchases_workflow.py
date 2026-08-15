"""update purchases workflow

Revision ID: ce7264e76c9d
Revises: 22e4c58893ea
Create Date: 2026-08-15

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "ce7264e76c9d"
down_revision = "22e4c58893ea"
branch_labels = None
depends_on = None


def upgrade():
    # Nuevas columnas para el flujo de solicitudes de pago
    op.add_column(
        "purchases",
        sa.Column("schedule_id", sa.Integer(), nullable=True)
    )

    op.add_column(
        "purchases",
        sa.Column("request_code", sa.String(length=30), nullable=True)
    )

    op.add_column(
        "purchases",
        sa.Column("payment_method", sa.String(length=30), nullable=True)
    )

    op.add_column(
        "purchases",
        sa.Column("customer_note", sa.Text(), nullable=True)
    )

    op.add_column(
        "purchases",
        sa.Column("admin_note", sa.Text(), nullable=True)
    )

    op.add_column(
        "purchases",
        sa.Column("reviewed_by", sa.Integer(), nullable=True)
    )

    op.add_column(
        "purchases",
        sa.Column("reviewed_at", sa.DateTime(), nullable=True)
    )

    op.add_column(
        "purchases",
        sa.Column("updated_at", sa.DateTime(), nullable=True)
    )

    # payment_intent_id ahora puede estar vacío porque no todos
    # los pagos se generan mediante Stripe.
    op.alter_column(
        "purchases",
        "payment_intent_id",
        existing_type=sa.String(length=255),
        nullable=True
    )

    # El nuevo modelo requiere created_at.
    # Protegemos registros existentes antes de aplicar NOT NULL.
    op.execute(
        """
        UPDATE purchases
        SET created_at = NOW()
        WHERE created_at IS NULL
        """
    )

    op.alter_column(
        "purchases",
        "created_at",
        existing_type=sa.DateTime(),
        nullable=False
    )

    # Restricciones
    op.create_unique_constraint(
        "uq_purchases_request_code",
        "purchases",
        ["request_code"]
    )

    op.create_foreign_key(
        "fk_purchases_schedule_id_course_schedule",
        "purchases",
        "course_schedule",
        ["schedule_id"],
        ["id"]
    )

    op.create_foreign_key(
        "fk_purchases_reviewed_by_user",
        "purchases",
        "user",
        ["reviewed_by"],
        ["id"]
    )


def downgrade():
    # Eliminar primero las restricciones nuevas
    op.drop_constraint(
        "fk_purchases_reviewed_by_user",
        "purchases",
        type_="foreignkey"
    )

    op.drop_constraint(
        "fk_purchases_schedule_id_course_schedule",
        "purchases",
        type_="foreignkey"
    )

    op.drop_constraint(
        "uq_purchases_request_code",
        "purchases",
        type_="unique"
    )

    # Volver created_at al comportamiento anterior
    op.alter_column(
        "purchases",
        "created_at",
        existing_type=sa.DateTime(),
        nullable=True
    )

    # Si se hiciera downgrade y existen compras sin payment_intent_id,
    # asignamos un identificador para poder recuperar NOT NULL.
    op.execute(
        """
        UPDATE purchases
        SET payment_intent_id = 'legacy-' || id::text
        WHERE payment_intent_id IS NULL
        """
    )

    op.alter_column(
        "purchases",
        "payment_intent_id",
        existing_type=sa.String(length=255),
        nullable=False
    )

    # Eliminar columnas nuevas
    op.drop_column("purchases", "updated_at")
    op.drop_column("purchases", "reviewed_at")
    op.drop_column("purchases", "reviewed_by")
    op.drop_column("purchases", "admin_note")
    op.drop_column("purchases", "customer_note")
    op.drop_column("purchases", "payment_method")
    op.drop_column("purchases", "request_code")
    op.drop_column("purchases", "schedule_id")
