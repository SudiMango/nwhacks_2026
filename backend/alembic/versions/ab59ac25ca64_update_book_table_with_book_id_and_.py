"""Update Book table with book_id and description

Revision ID: ab59ac25ca64
Revises: c627c522e753
Create Date: 2026-01-17 14:37:26.713135

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'ab59ac25ca64'
down_revision: Union[str, Sequence[str], None] = 'c627c522e753'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new columns
    op.add_column('books', sa.Column('book_id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False))
    op.add_column('books', sa.Column('description', sa.Text(), nullable=True))
    
    # Drop the old primary key constraint
    op.drop_constraint('books_pkey', 'books', type_='primary')
    
    # Make isbn nullable and add unique constraint
    op.alter_column('books', 'isbn', existing_type=sa.TEXT(), nullable=True)
    op.create_unique_constraint('books_isbn_unique', 'books', ['isbn'])
    
    # Create new primary key on book_id
    op.create_primary_key('books_pkey', 'books', ['book_id'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the new primary key
    op.drop_constraint('books_pkey', 'books', type_='primary')
    
    # Drop unique constraint on isbn
    op.drop_constraint('books_isbn_unique', 'books', type_='unique')
    
    # Restore old primary key on isbn
    op.alter_column('books', 'isbn', existing_type=sa.TEXT(), nullable=False)
    op.create_primary_key('books_pkey', 'books', ['isbn'])
    
    # Drop new columns
    op.drop_column('books', 'description')
    op.drop_column('books', 'book_id')