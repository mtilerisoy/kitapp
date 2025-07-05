# Backend Test Suite Documentation

## Overview
This test suite provides comprehensive coverage for the Flask backend, including API endpoints, service logic, and repository/database interactions. The suite is designed for use with Pytest and follows best practices for modular, maintainable, and secure testing.

## Structure

- `conftest.py`: Pytest configuration and fixtures for the Flask app, test client, and Supabase mocking.
- `test_routes.py`: Integration tests for all main API endpoints, including authentication, success, and error cases.
- `test_services.py`: Unit tests for service-layer logic, mocking database and Supabase interactions.
- `test_repositories.py`: Unit tests for repository/database logic, mocking the Supabase client.

## How to Run

1. Install dependencies:
   ```bash
   pip install -r ../../requirements.txt
   pip install pytest pytest-cov
   ```
2. Run all tests:
   ```bash
   pytest --cov=api
   ```
3. View coverage report:
   ```bash
   pytest --cov=api --cov-report=term-missing
   ```

## Test File Details

### `test_routes.py`
- **/api/health**: Checks health endpoint returns 200 and correct message.
- **/api/me**: Tests both authenticated (valid JWT) and unauthenticated access.
- **/api/categories**: Tests success and DB error cases.
- *(Extendable for /api/books, /api/my-books, etc.)*

### `test_services.py`
- **book_service.get_discover_books**: Success and error (RPC failure) cases.
- **categories_service.get_categories**: Success and error (DB failure) cases.

### `test_repositories.py`
- **BooksRepository**: Fetch paginated books (success, no client).
- **Categories**: Fetch all categories (success, no client).

## Extending the Suite
- Add more tests for edge cases, error handling, and additional endpoints as needed.
- Use mocking to isolate units and avoid real DB calls in unit tests.

## Best Practices
- Keep tests isolated and repeatable.
- Use fixtures for setup/teardown.
- Mock external dependencies.
- Cover both positive and negative scenarios.

---

*Synth-Stack: For questions or improvements, see the code comments or contact the maintainer.* 