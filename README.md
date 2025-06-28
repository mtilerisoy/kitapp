
## Project Documentation

This documentation provides a guide for developers to understand the project's architecture, key flows, and development patterns.

### 1. High-Level Architecture

This is a full-stack application composed of:

* **Frontend:** A Next.js (App Router) client written in TypeScript, styled with Tailwind CSS.
* **Backend:** A RESTful API built with Python and the Flask framework.
* **Database & Auth:** Supabase serves as both the PostgreSQL database and the authentication provider (BaaS - Backend as a Service).

#### 1.1 Database Schema Overview

The database is the system's single source of truth, designed to be scalable, relational, and secure. It's architected around a few key concepts: separating user authentication from user profiles, tracking behavior, and storing computed personalization data. All tables are protected by PostgreSQL's Row-Level Security (RLS).

* **User & Profile Management:**

  * `auth.users`: A special table managed by Supabase for authentication credentials. We do not touch this directly.
  * `public.users`: Our application's profile table. It is linked one-to-one with `auth.users`. A database trigger automatically creates a new `public.users` record whenever a user signs up, ensuring data consistency.
* **Content & Categorization:**

  * `public.categories`: Stores a hierarchical list of all categories and sub-categories (e.g., "Programming" -> "Python").
  * `public.books`: The master catalog of all books available in the application.
  * `public.book_categories`: A many-to-many join table that connects books to the categories they belong to.
* **Behavioral & Personalization Data:** This is a crucial separation of raw data vs. computed data.

  * `public.user_reading_progress`: This table tracks **raw user behavior**. It records which books a user is reading, their progress percentage, and their status (`reading`, `finished`, etc.). This data is the input for our personalization logic.
  * `public.user_category_preferences`: This table stores the **computed output** of our personalization engine. It holds a numeric score representing a user's inferred interest in each category, which is updated periodically by a background job analyzing the raw behavioral data. This separation ensures the app can quickly retrieve recommendations without performing complex calculations on the fly.

### 2. End-to-End Authentication Flow

Understanding this flow is critical for working on the application.

1. **[Client] Login Request:** The user enters their email on the `/login` page. The app calls `supabase.auth.signInWithOtp({ email })`. Supabase sends an email with a 6-digit code.
2. **[Client] OTP Verification:** The user is redirected to `/login/verify` and enters the code. The app calls `supabase.auth.verifyOtp({ email, token })`.
3. **[Supabase & Client] Session Creation:** On success, Supabase returns a session containing an `access_token` (JWT) and a `refresh_token`. The `supabase-js` library stores these tokens securely in the browser's `localStorage`.
4. **[Client] Global State Update:** The `onAuthStateChange` listener in `SessionContext` fires, updating the app's global state with the user's session information. The user is now considered logged in.
5. **[Client] Authenticated API Call:** A component needs to fetch data (e.g., categories). It uses the shared `apiClient` to make a request, e.g., `apiClient.get('/api/categories')`.
6. **[Client] Axios Interceptor:** The interceptor in `api.ts` automatically retrieves the `access_token` and `refresh_token` from the Supabase session and attaches them to the outgoing request as headers:
   * `Authorization: Bearer <your_access_token>`
   * `refresh-token: <your_refresh_token>`
7. **[Backend] Auth Middleware:** The Flask backend receives the request. The `@app.before_request` hook runs `auth_context_processor` from `authentication.py`.
8. **[Backend] Token Validation:** The middleware decodes the JWT using the `SUPABASE_JWT_SECRET`. It verifies the signature and expiration. If valid, it extracts the user's ID (`sub` claim).
9. **[Backend] Request Context Population:** The `user_id`, `user_jwt`, and `refresh_token` are stored in Flask's `g` object, making them available for the duration of this request.
10. **[Backend] Route Protection:** The request is passed to the route handler (e.g., `/api/categories`). The `@login_required` decorator confirms that `g.user_id` exists before allowing the function to execute.
11. **[Backend] User-Impersonated DB Call:** The service layer calls `get_supabase_client()`. This function creates a Supabase client and **sets its session using the tokens from the `g` object**. All subsequent database operations from the backend are now performed *as that specific user*, correctly enforcing any RLS policies defined in Supabase.
12. **[Backend & Client] Response:** The backend queries the database, gets the data, and returns it as a JSON response to the client.

### 3. Key Frontend Modules

#### `SessionContext.tsx`

* **Purpose:** The single source of truth for user authentication state.
* **Usage:** Wrap your application in `<SessionProvider>`. Then, in any component that needs user data:
  ```tsx
  import { useSessionContext } from '@/context/SessionContext';

  const MyComponent = () => {
    const { user, session, loading, signOut } = useSessionContext();

    if (loading) return <p>Loading session...</p>;
    if (!session) return <p>You are not logged in.</p>;

    return (
      <div>
        <p>Welcome, {user?.email}</p>
        <button onClick={signOut}>Sign Out</button>
      </div>
    );
  };
  ```

#### `api.ts`

* **Purpose:** A pre-configured Axios instance for all backend communication. Automatically handles auth tokens.
* **Usage:** Simply import and use it. You do not need to add auth headers manually.
  ```tsx
  import apiClient from '@/api';

  async function fetchCategories() {
    try {
      const response = await apiClient.get('/api/categories');
      // The Authorization header was added automatically
      return response.data;
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }
  ```

### 4. Key Backend Modules

#### `authentication.py`

* **Purpose:** Secures API routes.
* **Usage:** To protect a route, add the `@login_required` decorator. You can then safely access `g.user_id`.
  ```python
  from flask import g, jsonify
  from api.utils.authentication import login_required

  @app.route('/api/my-data', methods=['GET'])
  @login_required
  def get_my_data():
      user_id = g.user_id  # Guaranteed to exist
      # Fetch data from the database specific to this user_id
      data = my_service.get_data_for_user(user_id)
      return jsonify(data), 200
  ```

#### Repository Pattern (`*_repository.py`)

* **Purpose:** To abstract database operations and create a clean data access layer.
* **Pattern:**
  1. The **Route** calls a **Service**.
  2. The **Service** implements business logic and calls a **Repository**.
  3. The **Repository** builds and executes the Supabase query.

### 5. Environment Variables

Ensure you have a `.env.local` file for the frontend and a `.env` file for the backend with the following variables.

**Frontend (`.env.local`):**

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (`.env`):**

```
# Must be the same as the frontend
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# This is the JWT Secret from your Supabase Project's API settings
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```
