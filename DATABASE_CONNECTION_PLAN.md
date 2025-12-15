# Database Connection Action Plan

## Current Status
✅ Database is connected and accessible
✅ Backend server is running on port 5000
✅ Frontend is running on port 3000
✅ Authentication (login/signup) is working
✅ User profiles are being saved

## What Needs Database Connection

### 1. POSTS (Priority 1)
**Current Issue:** Posts not persisting
**What needs to be done:**
- [ ] Verify posts are being saved to database
- [ ] Fix post fetching to include author information
- [ ] Ensure posts persist after refresh

### 2. LIKES (Priority 1)
**Current Issue:** Like button not working
**What needs to be done:**
- [ ] Verify post_likes table exists
- [ ] Implement like/unlike functionality
- [ ] Ensure one user = one like per post
- [ ] Update like count display

### 3. COMMENTS (Priority 1)
**Current Issue:** Cannot add comments
**What needs to be done:**
- [ ] Verify comments table exists
- [ ] Fix comment submission endpoint
- [ ] Display comments for each post
- [ ] Show commenter name

### 4. MESSAGES - 1-on-1 (Priority 2)
**Current Issue:** Cannot send/receive messages
**What needs to be done:**
- [ ] Verify messages table exists
- [ ] Fix message sending endpoint
- [ ] Fix message fetching endpoint
- [ ] Implement file attachment storage
- [ ] Add real-time updates (Socket.IO)

### 5. CONNECTIONS (Priority 2)
**Current Issue:** Connection logic not working properly
**What needs to be done:**
- [ ] Verify connections table exists
- [ ] Implement mutual connection logic
- [ ] Show only connected users in 1-on-1 chat list
- [ ] Handle connection requests

### 6. TEAM CHATS (Priority 3)
**Current Issue:** Groups not persisting, messages not working
**What needs to be done:**
- [ ] Verify team_groups table exists
- [ ] Verify team_messages table exists
- [ ] Fix group creation
- [ ] Fix message sending in groups
- [ ] Add/remove members functionality
- [ ] Show sender names in group messages

### 7. PROFILES (Priority 3)
**Current Issue:** Showing static data instead of real users
**What needs to be done:**
- [ ] Fetch only registered users
- [ ] Remove duplicate profiles
- [ ] Show correct user information

## Execution Plan

I will fix these in order, ONE AT A TIME:

**Phase 1: Core Features (Today)**
1. Posts persistence and display
2. Likes functionality
3. Comments functionality

**Phase 2: Communication (Next)**
4. 1-on-1 messaging
5. Connections logic
6. File attachments

**Phase 3: Advanced Features (Last)**
7. Team chats
8. Profiles page
9. UI polish

## What I Need From You

Please tell me: **Should I start with Phase 1 (Posts, Likes, Comments)?**

If yes, I'll fix them one by one, testing each before moving to the next.
