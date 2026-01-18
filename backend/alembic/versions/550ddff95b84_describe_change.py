"""describe change

Revision ID: 550ddff95b84
Revises: e679cb06e1cc
Create Date: 2026-01-17 21:41:29.493857

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '550ddff95b84'
down_revision: Union[str, Sequence[str], None] = 'e679cb06e1cc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Refresh the FK to ensure it points at books.isbn (which remains unique)
    op.drop_constraint('user_books_isbn_fkey', 'user_books', type_='foreignkey')
    op.create_foreign_key(
        'user_books_isbn_fkey',
        'user_books',
        'books',
        ['isbn'],
        ['isbn'],
        ondelete='CASCADE',
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('user_books_isbn_fkey', 'user_books', type_='foreignkey')
