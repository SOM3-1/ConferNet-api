# ConferNet API

## Overview
ConferNet API provides endpoints for user registration, role management, and user retrieval. The API interacts with Firestore to store and manage user data.

### Base URL
For local development:
```
http://localhost:5003
```
For frontend applications, use the appropriate server IP or domain:
```
http://your-server-ip:5003
```

## Endpoints

### 1. Register a New User
#### Route:
```
POST /register
```
#### Description:
Registers a new user in Firestore and updates their role in `userRoles` collection.

#### Required Fields:
- `userId` (string) - Unique user ID from Firebase Auth.
- `name` (string) - Full name of the user.
- `email` (string) - Email address.
- `dob` (string) - Date of birth (YYYY-MM-DD).

#### Optional Fields:
- `role` (integer) - Default: `5` (Keynote Speaker). Roles: 1 = Admin, 2 = Organizer, 3 = Speaker, 4 = Attendee, 5 = Keynote Speaker.
- `phoneNumber` (string)
- `organization` (string)
- `jobTitle` (string)
- `country` (string)
- `city` (string)
- `bio` (string)
- `profilePicture` (string, URL)

#### Example Request using `curl`:
```sh
curl -X POST "http://your-server-ip:5003/register" \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "user123",
       "name": "John Doe",
       "email": "john.doe@example.com",
       "dob": "1995-06-15"
     }'
```

#### Example Request using `axios`:
```js
axios.post("http://your-server-ip:5003/register", {
  userId: "user123",
  name: "John Doe",
  email: "john.doe@example.com",
  dob: "1995-06-15"
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

#### Response:
- **201**: User registered successfully.
- **400**: Missing required fields.
- **500**: Server error.

---

### 2. Retrieve Users by Role
#### Route:
```
GET /{roleId}
```
#### Description:
Fetches users belonging to a specific role.

#### Example Request using `curl`:
```sh
curl -X GET "http://your-server-ip:5003/3"
```

#### Example Request using `axios`:
```js
axios.get("http://your-server-ip:5003/3")
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

#### Response:
- **200**: List of users.
- **404**: Role not found.
- **500**: Server error.

---

### 3. Retrieve All Users
#### Route:
```
GET /users
```
#### Description:
Fetches all registered users.

#### Example Request using `curl`:
```sh
curl -X GET "http://your-server-ip:5003/users"
```

#### Example Request using `axios`:
```js
axios.get("http://your-server-ip:5003/users")
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

#### Response:
- **200**: List of users.
- **404**: No users found.
- **500**: Server error.

---

### 4. Retrieve User by ID
#### Route:
```
GET /users/{userId}
```
#### Description:
Fetches details of a specific user by their `userId`.

#### Example Request using `curl`:
```sh
curl -X GET "http://your-server-ip:5003/users/user123"
```

#### Example Request using `axios`:
```js
axios.get("http://your-server-ip:5003/users/user123")
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

#### Response:
- **200**: User details.
- **404**: User not found.
- **500**: Server error.