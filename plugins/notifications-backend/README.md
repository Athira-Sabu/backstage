# Notifications Backend Plugin

Welcome to the notifications backend plugin!

## Overview

This backend plugin for Backstage is designed to handle notifications from various sources, providing APIs for fetching,
updating, and deleting notifications. It also integrates a real-time notifications feature using WebSockets.

## Components

- **CRUD Operations**: APIs to create, read, update, and delete notifications.
- **Real-time Notifications**: Utilizes Backstage Signals plugin for real-time notifications through WebSocket
  connections.
- **Database Integration**: Configured SQLite for local development.

## Database Schema

The notifications table schema is as follows:

- `id`: Primary key, integer
- `message`: Notification message, string (500 characters max), not nullable
- `title`: Notification title, string (100 characters max)
- `origin`: Origin of the notification, string, not nullable
- `priority`: Notification priority, enum (values from `Notification_Priority`)
- `user`: User associated with the notification, string, not nullable
- `read`: Read status of the notification, boolean, defaults to false
- `create_at`: Timestamp of when the notification was created, defaults to current timestamp

## API Endpoints

### Get Notifications

Fetches a list of notifications based on various filters. By default, it returns the latest notifications filter by
user.

- **Method**: GET
- **Path**: `/notifications`
- **Query Parameters**:
  - cursor: Pagination cursor for fetching notifications.
  - limit: The maximum number of notifications to return.
  - read: Filter for the read status of notifications (true or false).
  - createdAfter: Fetch notifications created after this timestamp.
  - origin: The origin/source of the notifications.
- **Success Response**: `200 OK` with JSON body of notifications.
- **Error Response**: `500 Internal Server Error` if an error occurs during fetching.

### Post Notification

Creates a new notification.

- **Method**: POST
- **Path**: /notifications
- **Request Body (JSON)**:

```json
{
  "message": "Your notification message here.",
  "title": "Optional title",
  "origin": "Notification origin",
  "priority": "High | Normal | low",
  "user": "User name associated with this notification",
  "read": false
}
```

- **Success Response**: 201 Created when the notification is successfully created.
- **Error Responses**:
  - 400 Bad Request if the request body fails validation.
  - 500 Internal Server Error if an error occurs during creation.

### Update Notification Status

Updates the read status of one or more notifications.

- **Method**: PUT
- **Path**: `/notifications/status`
- **Request Body (JSON)**:

```json
{
  "ids": [1, 2, 3],
  "read": true
}
```

- **Success Response**: 200 OK with a message indicating successful update.
- **Error Responses**:
  - 400 Bad Request if the request body is incorrect.
  - 500 Internal Server Error if an error occurs during the update.

### Delete Notifications

Deletes one or more notifications based on their IDs.

- **Method**: DELETE
- **Path**: `/notifications`
- **Request Body (JSON)**:

```json
{
  "ids": [1, 2, 3]
}
```

- **Success Response**: 200 OK with a message indicating successful deletion.
- **Error Responses**:
  - 400 Bad Request if the request body is incorrect.
  - 500 Internal Server Error if an error occurs during deletion.

## Getting started

### Running the Plugin standalone

1. Start the plugin with `yarn start`.
2. The plugin will be available at `http://localhost:7000/` (or the configured port).

### Testing

Run `yarn test` to execute the test suite and ensure everything is set up correctly.
