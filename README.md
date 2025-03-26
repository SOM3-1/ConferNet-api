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

## **Messaging API**
### **Overview**
The messaging system allows users to send messages, retrieve chat history, and list all users a user has messaged. Messages are stored in Firestore under **conversations**, ensuring **sorted user IDs for consistency**.

### **Base URL**
```
http://localhost:5003
```

---

### **1. Send a Message**
#### **Route:**
```
POST /messages
```
#### **Description:**
Sends a message from one user to another. The message is stored in Firestore under a **conversation subcollection**, and the conversation document is updated with the **last message**.

#### **Required Fields:**
- `senderId` (string) - ID of the sender.
- `receiverId` (string) - ID of the receiver.
- `message` (string) - The message content.

#### **Example Request using `curl`:**
```sh
curl -X POST "http://your-server-ip:5003/messages" \
     -H "Content-Type: application/json" \
     -d '{
           "senderId": "user123",
           "receiverId": "user456",
           "message": "Hey Bob, how are you?"
         }'
```

#### **Example Request using `axios`:**
```js
axios.post("http://your-server-ip:5003/messages", {
  senderId: "user123",
  receiverId: "user456",
  message: "Hey Bob, how are you?"
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

#### **Response:**
- **201**: Message sent successfully.
- **400**: Missing required fields.
- **500**: Server error.

---

### **2. Get All Users a User Has Messaged**
#### **Route:**
```
GET /messages/{userId}/conversations
```
#### **Description:**
Retrieves a list of all users that a specific user has messaged.

#### **Example Request using `curl`:**
```sh
curl -X GET "http://your-server-ip:5003/messages/user456/conversations" \
     -H "Content-Type: application/json"
```

#### **Example Request using `axios`:**
```js
axios.get("http://your-server-ip:5003/messages/user456/conversations")
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

#### **Expected Response:**
```json
[
  {
    "id": "user123_user456",
    "otherUserId": "user123",
    "lastMessage": "Hi Alice! I'm doing well. Yes, I completed it!",
    "lastSender": "user456",
    "timestamp": "2025-02-26T10:02:00Z"
  },
  {
    "id": "user456_user789",
    "otherUserId": "user789",
    "lastMessage": "Hey Charlie, are you free this weekend?",
    "lastSender": "user456",
    "timestamp": "2025-02-26T10:05:00Z"
  }
]
```
- **200**: List of conversations.
- **404**: No conversations found.
- **500**: Server error.

---

### **3. Get Chat History Between Two Users**
#### **Route:**
```
GET /messages/{user1}/{user2}/history
```
#### **Description:**
Retrieves all messages exchanged between two users, sorted by timestamp.

#### **Example Request using `curl`:**
```sh
curl -X GET "http://your-server-ip:5003/messages/user123/user456/history" \
     -H "Content-Type: application/json"
```

#### **Example Request using `axios`:**
```js
axios.get("http://your-server-ip:5003/messages/user123/user456/history")
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

#### **Expected Response:**
```json
[
  {
    "id": "msg1",
    "senderId": "user123",
    "receiverId": "user456",
    "message": "Hey Bob, how are you?",
    "timestamp": "2025-02-26T10:00:00Z"
  },
  {
    "id": "msg2",
    "senderId": "user123",
    "receiverId": "user456",
    "message": "Did you complete the project?",
    "timestamp": "2025-02-26T10:01:00Z"
  },
  {
    "id": "msg3",
    "senderId": "user456",
    "receiverId": "user123",
    "message": "Hi Alice! I'm doing well. Yes, I completed it!",
    "timestamp": "2025-02-26T10:02:00Z"
  }
]
```
- **200**: List of messages.
- **404**: No messages found.
- **500**: Server error.

---

### **4. Example Messaging Flow (Test Cases)**
Here’s a **step-by-step example** of sending and retrieving messages.

#### ** Alice Messages Bob Twice**
```sh
curl -X POST "http://your-server-ip:5003/messages" \
     -H "Content-Type: application/json" \
     -d '{
           "senderId": "user123",
           "receiverId": "user456",
           "message": "Hey Bob, how are you?"
         }'
```

```sh
curl -X POST "http://your-server-ip:5003/messages" \
     -H "Content-Type: application/json" \
     -d '{
           "senderId": "user123",
           "receiverId": "user456",
           "message": "Did you complete the project?"
         }'
```

#### ** Bob Replies to Alice**
```sh
curl -X POST "http://your-server-ip:5003/messages" \
     -H "Content-Type: application/json" \
     -d '{
           "senderId": "user456",
           "receiverId": "user123",
           "message": "Hi Alice! I'm doing well. Yes, I completed it!"
         }'
```

#### ** Bob Messages Charlie**
```sh
curl -X POST "http://your-server-ip:5003/messages" \
     -H "Content-Type: application/json" \
     -d '{
           "senderId": "user456",
           "receiverId": "user789",
           "message": "Hey Charlie, are you free this weekend?"
         }'
```

#### ** Retrieve All Conversations for Bob**
```sh
curl -X GET "http://your-server-ip:5003/messages/user456/conversations"
```

#### ** Retrieve Chat History Between Bob & Alice**
```sh
curl -X GET "http://your-server-ip:5003/messages/user123/user456/history"
```

#### ** Retrieve Chat History Between Bob & Charlie**
```sh
curl -X GET "http://your-server-ip:5003/messages/user456/user789/history"
```

---

### ** Final Summary**
| **Feature** | **Endpoint** | **Method** |
|------------|-------------|------------|
| **Send a message** | `/messages` | `POST` |
| **List all users a user has messaged** | `/messages/{userId}/conversations` | `GET` |
| **Retrieve chat history between two users** | `/messages/{user1}/{user2}/history` | `GET` |
