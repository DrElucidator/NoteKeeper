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
  auth/             session state, token storage, interceptor, guard, DTOs
  categories/       category service, list, create, and edit screens
  notes/            note service, list, create, and edit screens
  workspace/        protected shell and workspace home
  home/             public landing page
  public/           public presentation components
  shared/
    ui/             reusable presentational components
  app.config.ts     routes, providers, and application configuration
```

Rules:

- Components present data and delegate API work to services.
- Auth, category, and note services are the only feature layer that calls HTTP endpoints.
- API route names remain unchanged because they are server contracts.
- The authenticated user comes from the JWT and `/auth/me`; `userId` is not
  submitted by the client.
- The application UI, components, models, and documentation use English.

## Implementation sequence

### Phase 1: Foundation

1. Create the Angular application.
2. Configure Tailwind CSS, Lucide Angular, global styles, and the API base URL.
3. Add routing in `app.config.ts` and create the public and protected layouts.
4. Create feature DTOs and show API validation or conflict feedback near the relevant fields.

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

1. Review responsive behavior, labels, empty states, loading states, validation, and confirmation feedback.
2. Prepare the final portfolio README, planning references, animated demonstration, and local run instructions.
3. Deploy the Angular client and .NET API together through GitHub Actions, Azure App Service, and Azure SQL Database.

**Checkpoint:** the full application is demonstrable, documented, deployed, and ready for public portfolio use.

## Optional future improvements

Client unit and end-to-end tests are valuable for future maintenance, but they are not a requirement of the academic specification or the current delivery scope.

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
