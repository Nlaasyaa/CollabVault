# TechTribe Issues Summary

## ✅ FIXED ISSUES

### 1. Login Error - "Unexpected token 'H', "Hackathon" is not valid JSON"
**Status:** FIXED
**Solution:** Updated both frontend and backend to properly handle `open_for` field as JSON array

### 2. Display Name showing as "User"
**Status:** FIXED
**Solution:** 
- Added display_name field to profile creation page
- Backend now saves display_name during registration
- Frontend properly fetches and displays email and display_name

### 3. Logout redirect
**Status:** FIXED
**Solution:** Logout now properly redirects to landing page

### 4. Default page after login
**Status:** FIXED
**Solution:** Users now land on Posts page after login (not 1-on-1 chat)

---

## 🔧 ISSUES THAT NEED FIXING

### High Priority

1. **Posts not persisting after refresh**
   - Posts disappear when page is refreshed
   - Need to verify database storage

2. **Post author showing as "user5" instead of username**
   - Need to join users/profiles table when fetching posts

3. **Like button not working**
   - Need to implement like functionality
   - Ensure one user can only like once per post

4. **Comment button not working**
   - Error: "Failed to comment on post"
   - Need to debug backend endpoint

5. **Share button not working**
   - Need to implement share functionality

6. **Unable to send messages in 1-on-1 chat**
   - Error: "Failed to send message"
   - Error: "Failed to fetch messages"
   - Need to debug message endpoints

7. **Unable to send messages in team chats**
   - Messages not persisting
   - Need to verify database storage

8. **File attachments not working**
   - Files don't get sent in both 1-on-1 and team chats

### Medium Priority

9. **Profiles page showing static profiles**
   - Should only show registered users
   - Profile cards repeating in same session

10. **Find Teammates connection logic**
    - Mutual connection required for chat to appear
    - Need to implement proper connection workflow

11. **Team chat UI inconsistent with 1-on-1 chat**
    - Chat space too small
    - Need to make UI consistent

12. **Team chats not persisting after refresh**
    - Groups disappear after page refresh

13. **Add/Remove members in team chat not working**
    - "Add Member" and "Manage Members" buttons not functional

14. **Missing sender username in team chats**
    - Should show who sent each message (like WhatsApp)

### Low Priority

15. **Call and video call buttons**
    - Need to remove these buttons (not needed)

16. **Emoji picker**
    - Need to add emoji support for chats

17. **Settings - Email/Phone non-editable**
    - Email should be read-only
    - Display name should be editable

18. **View Profile and Block User in 1-on-1 chat**
    - 3-dot menu needs these options

---

## 📋 RECOMMENDED FIX ORDER

1. Fix login error (✅ DONE)
2. Fix post persistence and display
3. Fix messaging (1-on-1 and team)
4. Fix like/comment functionality
5. Fix connections and chat visibility
6. Fix team chat UI and persistence
7. Add emoji picker and file attachments
8. Polish UI and settings

---

## 🚀 NEXT STEPS

Please try logging in again at `http://localhost:3000/login` with:
- Email: nlaasya.04@gmail.com
- Password: 12345678

The login should now work! After that, we can systematically fix the other issues one by one.
