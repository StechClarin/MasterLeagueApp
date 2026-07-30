import strawberry
from typing import Generic, TypeVar

T = TypeVar("T")

@strawberry.type
class PaginatedType(Generic[T]):
    items: list[T]
    total_count: int
    num_pages: int
    current_page: int
    page_size: int
