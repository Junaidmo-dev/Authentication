# API Documentation

SecureDash uses **Next.js Server Actions** which function as a remote procedure call (RPC) style API. Below are the available "endpoints" and their contracts.

## Authentication (`actions/auth.ts`)

### `signup(formData: FormData)`
- **Input**: `name`, `email`, `password`
- **Output**: `{ success: boolean } | { errors: { field: string[] } }`
- **Logic**: Hashes password (bcrypt), checks email uniqueness, creates User, creates Session.

### `login(formData: FormData)`
- **Input**: `email`, `password`
- **Output**: Redirects on success, or returns validation errors.
- **Logic**: Verifies credentials, generates JWT, sets HttpOnly cookie.

### `logout()`
- **Input**: None
- **Output**: `{ success: true }`
- **Logic**: Invalidates session, deletes cookie.

---

## Todos (`actions/todos.ts`)

### `getTodos()`
- **Auth**: Required
- **Output**: `Array<Todo>`
- **Description**: Fetches all todos for the current user, ordered by priority/date.

### `createTodo(formData: FormData)`
- **Auth**: Required
- **Input**:
  - `title`: String using `formData`.
  - `priority`: "low", "medium", "high".
  - `tags`: Comma-separated strings (e.g. "Work, Urgent").
  - `dueDate`: ISO string.
- **Output**: `{ success: boolean } | { error: string }`

### `reorderTodos(items: { id: string; order: number }[])`
- **Auth**: Required
- **Description**: Bulk updates order for drag-and-drop.
- **Payload**: Array of objects with `id` and `order`.

### `toggleTodo(id: string)`
- **Auth**: Required
- **Output**: `{ success: boolean }`
- **Description**: Toggles `completed` status. Checks ownership before update.

---

## Notes (`actions/notes.ts`)

### `getNotes()`
- **Auth**: Required
- **Output**: `Array<Note>` (Ordered by Pinned status)

### `createNote(formData: FormData)`
- **Auth**: Required
- **Input**:
  - `title`: String.
  - `content`: String (Markdown supported).
  - `color`: "default", "blue", "green", "yellow", "red".
- **Output**: `{ success: boolean }`

### `togglePinNote(id: string)`
- **Auth**: Required
- **Description**: Pins/Unpins a note to the top of the dashboard.
