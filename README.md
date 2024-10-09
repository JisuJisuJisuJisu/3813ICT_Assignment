# S5310537

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.1. The system enables real-time communication between users across various groups and channels, offering both text and video chat functionalities. It supports creating and managing multiple communication channels, ensuring smooth interaction within different user groups.

## Project Structure

The structure of the project directory is as follows:

- `src/`: Contains the main source code for the project, including Angular components.
- `public/`: Stores static files such as background images and other assets.
- `server/`: Holds backend server files and logic.
- `server/uploads`: Directory where files uploaded by users are stored on the server.
- `src/app/`: Contains Angular components responsible for the frontend functionality.

## Git Branch Structure

My Git repository for this project is organized into several branches to maintain my progress throughout the project duration and clearly indicate the current stage I am at. Having completed Phase 1, the structure for the branches related to Phase 2 is as follows:

- **Main Branch**: This branch is merged when all functionalities from the separate branches are working correctly and without errors, maintaining a stable version of the project. It always contains reliable code, indicating that the project is ready for deployment.
  
- **feature/peerjs**: This branch was created to integrate PeerJS for implementing video call functionality. By utilizing PeerJS, it allows for real-time video and audio communication between users.
  
- **feature/socket**: This branch focuses on adding the chat functionality using Socket.IO, enabling real-time communication. Through Socket.IO, users can instantly send and receive messages, creating an interactive environment.
  
- **feature/fixerrors**: This branch is dedicated to fixing numerous server and client errors that arose during the migration to MongoDB. It aimed to resolve bugs and issues discovered during the transition process, enhancing the overall stability of the application.
  
- **feature/mongodb**: This branch deals with the stage of migrating data to use MongoDB in Phase 2. The goal is to transform and transfer data according to MongoDB's schema, improving the efficiency of data management.

## Install Instructions

To install and set up the project locally, follow these steps:
1. Ensure you have [Node.js](https://nodejs.org/) installed on your system.
2. Clone the project repository:
   `git clone https://github.com/your-repo/s5310537-project.git`
3. Navigate to the project directory: `cd s5310537-project`
4. Install the Angular CLI globally:`npm install -g @angular/cli`
5. Navigate to the server directory:`cd src/server`
6. Install server dependencies:`npm install`
7. Start the server:`node index.js`

## Run Instructions
To run the Angular development server:
1. Start the Angular development server: `ng serve --open`
2. This command will automatically open `http://localhost:4200/` in your default browser
3. The application will automatically reload as you make changes to the source files:

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running Unit Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running End-to-End Tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Running Mocha Tests

Run `npm run mocha-test` to execute unit and integration tests using Mocha. This command is used to test server-side functionality and ensure the API behaves as expected.


## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## 2. Data Structures

### 2.1 User Model
- **_id?**: Optional MongoDB unique identifier.
- **id**: Unique identifier for the user.
- **username**: Display name used within the application.
- **email**: User’s email, used for login and account identification.
- **password**: User’s password for security authentication.
- **roles**: Array of strings representing the user’s roles for managing permissions.
- **groups**: Array of groups the user belongs to.
- **interestGroups**: Array of groups the user is interested in.
- **profileImage?**: Optional URL representing the user’s profile image.

### 2.2 Group Model
- **id**: Unique identifier for the group.
- **name**: Name of the group.
- **description**: Brief description of the group.
- **channels**: Array of channels within the group.
- **createdBy**: ID of the user who created the group.
- **imageUrl?**: Optional URL of the group’s image.
- **pendingUsers?**: Optional array of users waiting for approval.
- **members?**: Optional array of users who are members of the group.

### 2.3 Channel Model
- **id?**: Optional unique identifier for the channel.
- **name**: Name of the channel.
- **description?**: Optional description of the channel.
- **groupId?**: Optional identifier for the group that the channel belongs to.

### 2.4 Messages Collection
- **_id**: ObjectId (unique identifier for the message).
- **groupId**: Nullable field (can be null if not associated with a group).
- **channelId**: ID of the channel where the message was posted.
- **userId**: ID of the user who posted the message.
- **message**: Content of the message.
- **timestamp**: Timestamp of when the message was posted (ISODate).

### 2.5 Groups Collection
- **_id**: ObjectId (unique identifier for the group).
- **id**: Custom group ID.
- **name**: Group name.
- **description**: Group description.
- **createdBy**: ID of the group creator.
- **channels**: Array of objects representing channels within the group.
- **imageUrl**: URL of the group’s image.
- **pendingUsers**: Array of users requesting to join.
- **members**: Array of group members.

### 2.6 Users Collection
- **_id**: ObjectId (unique identifier for the user).
- **id**: Custom user ID.
- **username**: User’s display name.
- **email**: User’s email.
- **password**: User’s password.
- **roles**: Array of roles (e.g., "User", "Admin").
- **groups**: Array of groups the user is part of.
- **interestGroups**: Array of group IDs the user is interested in.

### 2.7 Data Relationships
- Each user can belong to multiple groups, and each group contains multiple channels.
- When a user joins a group, the group ID is added to the user’s group list, and the user’s ID is added to the group’s member list.
- Channels are associated with groups, and channel-related logic requires searching for the group before locating the channel.
- When data is deleted or updated, the relationship between users and groups is maintained (e.g., removing a user from a group also updates both user and group records).

## 3. Responsibilities between Client and Server

### 3.1 Client Responsibilities
- **User Interface (UI)**: The client uses Angular to build the UI, allowing users to access features such as login, chat screens, group management, and profile screens.
- **API Calls**: The client sends requests to the server’s REST API and displays the necessary data on the screen based on the server's responses.
- **User Input Handling**: The client processes user inputs (e.g., login forms, group join requests, creating new groups) and sends these requests to the server for processing.

### 3.2 Server Responsibilities
- **REST API**: The server provides various API endpoints to handle client requests, processing data and returning results in JSON format.
  - **Examples**:
    - `GET /groups`: Returns all group information in JSON format.
    - `POST /users`: Registers a new user and returns a success message in JSON format.
- **Serving Static Files**: The server handles and serves static files such as images uploaded by users, enabling the client to display user-generated content.
  - **Example**: `app.use('/uploads', express.static(path.join(__dirname, 'uploads')));` serves uploaded images.
- **Database Interaction**: The server is connected to MongoDB and handles CRUD operations for user, group, channel, and message data based on client requests.
- **Real-Time Data Handling**: The server uses Socket.IO to manage real-time communication with the client, enabling features like instant chat.

## 4. List of Routes, Parameters, Return Values, and Purpose

| **Route**                               | **Method** | **Parameter**                                           | **Return Value**                             | **Purpose**                                                   |
|-----------------------------------------|------------|---------------------------------------------------------|----------------------------------------------|---------------------------------------------------------------|
| `/upload-profile-image`                 | POST       | userId: string                                           | { message: string, imageUrl: string }        | Uploads a user's profile image and updates the user's profile. |
| `/groups`                               | GET        | None                                                    | Array of Group Objects                       | Retrieves a list of all groups.                               |
| `/groups/:groupId`                      | GET        | groupId: string                                          | Group Object                                 | Retrieves information for a specific group.                   |
| `/groups`                               | POST       | Body: Group Object                                       | Inserted Group Object                        | Creates a new group and returns the created group object.      |
| `/groups/:groupId/channels`             | POST       | groupId: string, Body: Channel Object                    | { message: string, group: string }           | Adds a new channel to a specific group.                       |
| `/groups/approve/:groupId`              | PUT        | groupId: string, Body: { userId: string }                | { message: string, group: string }           | Approves a user's request to join a group.                    |
| `/groups/reject/:groupId`               | PUT        | groupId: string, Body: { userId: string }                | { message: string }                          | Rejects a user's request to join a group.                     |
| `/users/:email/interest-groups`         | GET        | email: string                                            | Array of Group Objects                       | Retrieves a list of interest groups for a specific user.       |
| `/groups/:groupId/join`                 | POST       | groupId: string, Body: { email: string }                 | { message: string }                          | Submits a join request for a user to a specific group.         |
| `/group/:groupId/invite`                | POST       | groupId: string, Body: { userId: string }                | { message: string }                          | Invites a user to join a specific group.                      |
| `/signup`                               | POST       | Body: User Object                                        | Registered User Object                       | Registers a new user and returns the registered user object.   |
| `/login`                                | POST       | Body: { email: string, password: string }                | { message: string, user: User Object }       | Authenticates a user and returns the user information.         |
| `/users`                                | GET        | None                                                    | Array of User Objects                        | Retrieves a list of all users.                                |
| `/users/email`                          | GET        | email: string                                            | User Object                                  | Retrieves user information based on email.                    |
| `/users/:userId`                        | GET        | userId: string                                           | User Object                                  | Retrieves information for a specific user.                    |
| `/messages`                             | POST       | Body: { channelId: string, userId: string, message: string } | { message: string, savedMessage: Message Object } | Adds a new message to a channel and returns the saved message. |
| `/upload-chat-image`                    | POST       | Body: { image: file }                                    | { imageUrl: string }                         | Uploads an image for chat and returns the image URL.           |
| `/groups/:groupId/channels`             | GET        | groupId: string                                          | Array of Channel Objects                    | Retrieves all channels in a specific group.                   |
| `/channels/:channelId`                  | DELETE     | channelId: string                                        | { message: string }                          | Deletes a specific channel by channel ID.                     |
| `/groups/:groupId/channels/:channelId`  | PUT        | groupId: string, channelId: string, Body: Channel Object | { message: string }                          | Updates information for a specific channel.                   |
| `/messages`                             | GET        | channelId: string                                        | Array of Message Objects                     | Retrieves all messages for a specific channel.                |

## 5. Angular Architecture

### 5.1 Components
- **LoginComponent**: Handles user login functionality.
- **SignupComponent**: Manages user registration and account creation.
- **DashboardComponent**: Displays an overview of user information and features.
- **SuperAdminComponent**: Provides functionalities specific to Super Admin users, such as user management and group oversight.
- **GroupAdminComponent**: Allows Group Admins to manage their respective groups and members.
- **ManageUsersComponent**: Facilitates the management of user accounts.
- **ManageGroupsComponent**: Enables the creation, modification, and deletion of groups.
- **ManageChannelsComponent**: Manages channels within groups.
- **GroupListComponent**: Displays a list of groups the user belongs to or can join.
- **GroupDetailComponent**: Shows detailed information about a specific group, including its members and channels.
- **ProfileComponent**: Manages user profile information and settings.
- **JoinGroupComponent**: Allows users to join groups by sending requests.
- **GroupMemberComponent**: Displays information about members of a specific group.
- **ChannelComponent**: Handles the display and interaction within a specific channel.

### 5.2 Services

#### 5.2.1 GroupService
Handles group-related tasks such as creating, retrieving, and managing groups.
- **createGroup(newGroup: any)**:
  - **Function**: Sends a POST request to create a new group.
  - **API Endpoint**: `/groups`
  - **Returns**: Observable of the server's response with the created group.
- **getAllGroups()**:
  - **Function**: Sends a GET request to retrieve all groups.
  - **API Endpoint**: `/groups`
  - **Returns**: Observable containing a list of all groups.
- **getGroupById(groupId: string)**:
  - **Function**: Sends a GET request to fetch a group by its ID.
  - **API Endpoint**: `/groups/{groupId}`
  - **Returns**: Observable containing the group's detailed information.

#### 5.2.2 UserService
Manages user-related tasks such as login, registration, and user data retrieval.
- **login(email: string, password: string)**:
  - **Function**: Sends a POST request to authenticate a user.
  - **API Endpoint**: `/login`
  - **Returns**: Observable with the user’s information upon successful login.
- **signup(newUser: any)**:
  - **Function**: Sends a POST request to register a new user.
  - **API Endpoint**: `/signup`
  - **Returns**: Observable with the created user details.
- **getAllUsers()**:
  - **Function**: Sends a GET request to retrieve all users.
  - **API Endpoint**: `/users`
  - **Returns**: Observable containing a list of all users.
- **getUserByEmail(email: string)**:
  - **Function**: Sends a GET request to retrieve a user by email.
  - **API Endpoint**: `/users/email`
  - **Returns**: Observable with the user’s details for the given email.

### 5.3 Models
The application utilizes three main models:
- **User Model**: Manages user details including name, email, password, roles, and associated groups.
- **Group Model**: Represents a collection of users and channels, including pending users awaiting approval.
- **Channel Model**: Defines subgroups within a group, used for focused discussions or activities.
Refer to **2. Data Structures** for detailed information.

### 5.4 Routes
The application’s routes are structured with the **DashboardComponent** as the central framework. From the dashboard, users can access various components based on their roles (Super Admin, Group Admin, or User). The dashboard provides navigation to group lists, group details, profiles, and group joining functionality, with each user role having access to different components and features.

## 6. Details of the Interaction between Client and Server

### 6.1 Create Group
- **Client Request**: The user submits a group creation form via the `ManageGroupsComponent`, which sends a POST request to `/groups` with the group name, description, and creator ID.
- **Server Processing**:
  - Deletes the `_id` field from the request (MongoDB auto-generates it).
  - Initializes default fields like `pendingUsers` and `members`.
  - Saves the group in MongoDB and updates the creator's group list.
- **Client Response**: The server returns the created group's details, and the UI updates to display the new group.

### 6.2 Handling User Interest Group Requests
- **Client Request**: The user sends a join request via the `JoinGroupComponent` by submitting a POST request to `/groups/:groupId/join` with the user's email and group ID.
- **Server Processing**:
  - Retrieves the group by ID.
  - Adds the user's email to the `pendingUsers` array and updates the user's `interestGroups`.
- **Client Response**: The server returns a success message, and the UI informs the user that the request was sent.

### 6.3 Handling Group Invitations
- **Client Request**: A Super Admin or Group Admin invites a user to join a group via a POST request to `/group/:groupId/invite`, with the invited user's ID and the group ID.
- **Server Processing**:
  - Retrieves the group and adds the user to the `pendingUsers` array.
- **Client Response**: The server returns a success message, notifying the client that the invitation was sent.

### 6.4 Handling Channel Messages
- **Client Request**: When a user sends a message in a channel, the client sends a POST request to `/messages` with the message content, channel ID, and user ID.
- **Server Processing**:
  - Validates required fields (channelId, userId, message).
  - Retrieves user information and saves the message in MongoDB.
- **Client Response**: The server returns the saved message along with the user's profile image, and the UI updates to display the message.

### 6.5 Handling Chat Image Uploads
- **Client Request**: The client sends a POST request to `/upload-chat-image` with the image file to be uploaded.
- **Server Processing**:
  - Validates the image file and stores it on the server, generating a URL.
- **Client Response**: The server returns the image URL, and the UI displays the image in the chat.

### 6.6 Retrieving Channel Messages
- **Client Request**: The client sends a GET request to `/messages` with the `channelId` as a query parameter to retrieve messages for a specific channel.
- **Server Processing**:
  - Retrieves all messages for the given `channelId` from MongoDB and attaches each user's profile image.
- **Client Response**: The server returns the list of messages with profile images, and the client updates the message UI for the channel.

