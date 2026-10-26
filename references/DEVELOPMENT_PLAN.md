# NoteKeeper development plan

## Purpose

This document records the technical decisions and implementation sequence for
the NoteKeeper frontend. It is a development reference, not the final
portfolio README.

The final project README should describe the finished application, how to run
it, its implemented technologies, screenshots, and the public API integration.

## Planned stack

| Area       | Decision                           | Reason                                                                             |
| ---------- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| Framework  | Angular with standalone components | Matches the established Academy projects and keeps routes and features modular.    |
| Language   | TypeScript                         | Provides typed DTOs, forms, and API boundaries.                                    |
| Async flow | RxJS                               | Handles HTTP streams, loading state, errors, and reactive UI updates.              |
| Forms      | Angular Signal Forms               | Supports consistent validation for authentication, categories, and notes.          |
| Routing    | Angular Router with guards         | Protects the workspace and redirects unauthenticated users.                        |
| HTTP       | HttpClient with a JWT interceptor  | Centralizes requests and adds the Bearer token to protected calls.                 |
| Styling    | Tailwind CSS                       | Required by the specification and consistent with recent frontend projects.        |
| Icons      | Lucide Angular                     | Provides a small, accessible icon set without custom SVG duplication.              |
| Backend    | Existing NoteKeeper REST API       | The Angular app consumes the server contract; it does not reimplement the backend. |

## Architecture boundaries

```text
src/app/
  core/
    api/            HTTP configuration and ProblemDetails handling
    auth/           session state, token storage, interceptor, guard
    models/         request and response DTOs
  shared/
    ui/             reusable presentational components
  features/
    auth/           register and sign-in pages
    categories/     category list and form
    notes/          note list, filters, and form
  app.routes.ts
```

Rules:

- Components present data and delegate API work to services.
- Feature services are the only feature layer that calls HTTP endpoints.
- API route names remain unchanged because they are server contracts.
- The authenticated user comes from the JWT and `/auth/me`; `userId` is not
  submitted by the client.
- The application UI, components, models, and documentation use English.

## Implementation sequence

### Phase 1: Foundation

1. Create the Angular application.
2. Configure Tailwind CSS, Lucide Angular, global styles, and the API base URL.
3. Add routing and the initial public and protected layouts.
4. Create shared DTOs and centralized ProblemDetails parsing.

**Checkpoint:** the application builds, has a consistent visual foundation, and
can reach the configured API URL.

### Phase 2: Authentication and session

1. Implement register and sign-in pages with Angular Signal Forms.
2. Add `AuthService` for `/auth/cadastro`, `/auth/login`, `/auth/me`, and
   `/auth/logout`.
3. Persist the JWT session, add the HTTP interceptor, and add the route guard.
4. Restore the current user on application startup and redirect invalid sessions
   to sign in.

**Checkpoint:** a user can register, sign in, refresh the page, access protected
routes, and sign out.

### Phase 3: Categories

1. Implement category list, create, edit, and delete interactions.
2. Validate the title before submission and display API validation or conflict
   feedback near the corresponding field.
3. Provide loading, empty, success, and error states.

**Checkpoint:** authenticated users manage only their own categories.

### Phase 4: Notes

1. Implement note list and note form.
2. Allow zero or more categories on a note.
3. Implement category filtering with the API intersection behavior.
4. Implement edit, archive, and delete actions with clear confirmation feedback.

**Checkpoint:** notes, categories, status, and filters behave consistently with
the backend contract.

### Phase 5: Quality and delivery

1. Review responsive behavior, keyboard navigation, labels, and empty states.
2. Add appropriate unit tests for services, guards, and form validation.
3. Add end-to-end coverage for register, sign in, category management, and note
   filtering.
4. Prepare the final portfolio README, screenshots, run instructions, and Azure
   deployment configuration.

**Checkpoint:** the frontend is demonstrable, documented, and ready for public
portfolio use.

## API contract reminders

- Authentication uses `/auth/cadastro`, `/auth/login`, `/auth/me`, and
  `/auth/logout`.
- Protected category and note calls require `Authorization: Bearer <token>`.
- Category titles and note titles are unique per authenticated user.
- A category deletion removes its note associations but preserves notes.
- A note can have no categories.
- Repeated `categoriaIds` in the notes endpoint use intersection behavior.
- The API returns ProblemDetails for validation, authorization, and conflict
  failures. The client should convert these into clear, actionable feedback.
