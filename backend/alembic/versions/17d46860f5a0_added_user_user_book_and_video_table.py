"""Added user, user book, and video table

Revision ID: 17d46860f5a0
Revises: ab59ac25ca64
Create Date: 2026-01-17 15:17:27.041629

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '17d46860f5a0'
down_revision: Union[str, Sequence[str], None] = 'ab59ac25ca64'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create new tables first
    op.create_table('users',
    sa.Column('user_id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('email', sa.Text(), nullable=False),
    sa.Column('name', sa.Text(), nullable=True),
    sa.Column('favorite_genres', postgresql.ARRAY(sa.Text()), nullable=True),
    sa.Column('reading_format', sa.Text(), nullable=True),
    sa.Column('last_book_read', sa.Text(), nullable=True),
    sa.Column('onboarding_completed', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('user_id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('videos',
    sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('platform', sa.Text(), nullable=True),
    sa.Column('url', sa.Text(), nullable=False),
    sa.Column('transcript', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('url')
    )
    
    # Modify books table before creating user_books (which depends on it)
    op.alter_column('books', 'title',
               existing_type=sa.TEXT(),
               nullable=True)
    op.alter_column('books', 'author',
               existing_type=sa.TEXT(),
               nullable=True)
    
    # Create user_books table with foreign key to books.isbn
    op.create_table('user_books',
    sa.Column('user_book_id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('isbn', sa.Text(), nullable=False),
    sa.Column('tbr', sa.Boolean(), nullable=False),
    sa.Column('added_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['isbn'], ['books.isbn'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_book_id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop in reverse order
    op.drop_table('user_books')
    op.drop_table('videos')
    op.drop_table('users')
    op.alter_column('books', 'author',
               existing_type=sa.TEXT(),
               nullable=False)
    op.alter_column('books', 'title',
               existing_type=sa.TEXT(),
               nullable=False)