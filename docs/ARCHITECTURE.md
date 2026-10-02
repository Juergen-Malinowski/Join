# Architecture

This document provides a concise technical overview of the Join application. It focuses on the current application structure, service responsibilities, data flow, and Firestore data model.

## Application Overview

Join is an Angular single-page application for task and contact management. The application combines a Kanban board, task creation and editing, contact management, authentication, and a summary dashboard. Firebase Authentication and Cloud Firestore provide authentication and persistent application data.

The application is built with standalone Angular components. The root routing configuration loads the main application area lazily and exposes the feature pages as child routes.

## Application Structure

```text
App
├── Login
└── MainPage
    ├── Header
    ├── Navbar
    └── Routed content
        ├── Summary
        ├── Board
        │   ├── TaskPreview
        │   ├── DialogShowEditTask
        │   └── DialogAddTask
        ├── AddTask
        ├── Contacts
        │   ├── ListContact
        │   ├── SingleContact
        │   ├── DialogAddNewContact
        │   └── DialogEditContact
        ├── Helper
        ├── PrivacyPolicy
        └── LegalNotice
```

The main feature routes are defined in `src/app/app.routes.ts`. The login page is loaded directly, while the feature pages below `MainPage` are loaded through `loadComponent()`.

## Component Responsibilities

| Area | Responsibility |
| --- | --- |
| `Login` | Registered-user login, signup, and anonymous guest login |
| `MainPage` | Shared application shell for the feature routes |
| `Header` / `Navbar` | Application navigation and user-facing shell controls |
| `Summary` | Dashboard information derived from task data |
| `Board` | Kanban workflow with task search, task previews, and drag-and-drop status changes |
| `AddTask` | Creation of tasks, assignments, priorities, due dates, and subtasks |
| `TaskPreview` / task dialogs | Task display, detail view, editing, and deletion flows |
| `Contacts` | Contact list, contact details, creation, editing, and deletion |

Detailed method behavior remains documented directly in the TypeScript source through concise JSDoc where it adds value.

## Service Layer

### `AuthService`

`AuthService` wraps Firebase Authentication and provides the application's authentication flows:

- email/password login
- account creation
- anonymous guest login
- logout
- deletion of an anonymous Firebase user during guest logout
- authentication-state exposure through RxJS

When a registered account is created, the service also creates the corresponding contact document in Firestore.

### `FirebaseServices`

`FirebaseServices` is the central persistence service. It uses AngularFire to provide live Firestore streams and CRUD operations for:

- contacts
- tasks
- task assignments
- subtasks
- avatar color state
- current-user display data

Task assignments and subtasks are stored as subcollections below their parent task. Task deletion removes these child documents together with the task document.

### `UserUiService`

`UserUiService` contains reusable presentation-related logic, including:

- contact initials
- avatar color sequencing
- task urgency checks
- remaining-day calculations
- Firestore date formatting

## Data Flow

The main data flow follows this pattern:

```text
Angular component
      │
      ▼
Application service
      │
      ▼
AngularFire
      │
      ▼
Firebase Authentication / Cloud Firestore
      │
      ▼
Observable data stream or Promise result
      │
      ▼
Component state and template
```

Firestore reads that represent changing application data use AngularFire observables such as `collectionData()` and `docData()`. Write operations are handled asynchronously through Firebase CRUD functions.

The Kanban board persists workflow changes by updating the task's `status` field after a task is moved between columns.

## Authentication Flow

The application supports three authentication-related flows:

```text
Registered login
Email + password
      │
      ▼
Firebase Authentication
      │
      ▼
Application session

Signup
Name + email + password
      │
      ▼
Firebase Authentication
      │
      ├── creates user account
      ▼
Firestore contacts/{uid}
      │
      └── stores user contact data

Guest login
      │
      ▼
Anonymous Firebase Authentication
      │
      ▼
Temporary guest session
```

Registered users are represented in the `contacts` collection using their Firebase user ID as the document ID. Anonymous guest accounts are removed from Firebase Authentication when the guest logs out.

## Task Model

The main task model contains:

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | `string` | Firestore document ID; added when reading stored tasks |
| `type` | `TaskType` | `UserStory` or `TechnicalTask` |
| `status` | `TaskStatus` | Current Kanban workflow state |
| `date` | `Timestamp` | Due date |
| `title` | `string` | Task title |
| `description` | `string` | Task description |
| `priority` | `number` | Numeric priority value used by the UI |

Task types are represented by the numeric `TaskType` enum:

```text
1 = UserStory
2 = TechnicalTask
```

Workflow states are represented by `TaskStatus`:

```text
todo
in_progress
await_feedback
done
```

## Firestore Data Model

The application currently uses the following Firestore structure:

```text
contacts/{contactId}

tasks/{taskId}
├── assigns/{assignId}
└── subtasks/{subtaskId}

appSettings/contacts
```

### Contacts

A contact document contains the application contact data:

```text
name
email
phone
color
isUser (optional in the TypeScript interface)
```

For registered users, the Firebase Authentication UID is used as the contact document ID.

### Tasks

Task documents store the task fields described in the task model. New tasks receive `todo` as the default workflow status when no status is supplied.

### Assignments

Assignments are stored below the related task:

```text
tasks/{taskId}/assigns/{assignId}
```

Each stored assignment contains a `contactId`, linking the task assignment to a document in the `contacts` collection.

### Subtasks

Subtasks are stored below the related task:

```text
tasks/{taskId}/subtasks/{subtaskId}
```

Each subtask contains:

```text
title
done
```

### Application Settings

`appSettings/contacts` stores the most recently used avatar color index. The value is used to cycle through the available user colors when new user-related contact data is created.

## Deployment Architecture

The production application is delivered as a static Angular build from **ALL-INKL.COM** webspace under:

**https://join.juergen-malinowski.de**

```text
Browser
   │
   ▼
HTTPS
   │
   ▼
ALL-INKL.COM / Apache
   │
   ├── Angular production files
   └── .htaccess SPA fallback
            │
            ▼
      Angular application
            │
            ├── Firebase Authentication
            └── Cloud Firestore
```

Apache serves existing static files directly and routes other application requests to `index.html`, allowing Angular Router URLs to resolve correctly in the single-page application. Authentication and persistent application data remain hosted in Firebase and are accessed from the Angular application through AngularFire.

## Key Technical Decisions

- Angular standalone components are used instead of NgModule-based feature modules.
- Feature pages below `MainPage` are lazy-loaded through the Angular router.
- AngularFire provides Firebase Authentication and Firestore integration.
- RxJS observables provide live Firestore data to the UI.
- Angular Signals are used for local component state in multiple feature components.
- Angular CDK drag-and-drop is used for Kanban task movement.
- Firestore subcollections keep assignments and subtasks scoped to their parent task.
- Shared interfaces and enums define the persisted task, contact, assignment, subtask, task-type, and task-status shapes.

This document intentionally focuses on architecture and data relationships. Setup, deployment, testing, and implementation details are documented only where they reflect the actual repository state and are otherwise kept close to the source code or the main README.