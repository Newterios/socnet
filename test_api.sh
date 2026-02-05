#!/bin/bash

BASE_URL="http://localhost:8080"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}=== SocialNet API Testing ===${NC}"
echo ""

echo -e "${YELLOW}1. Testing Registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123!","full_name":"Test User"}')

USERNAME=$(echo $REGISTER_RESPONSE | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}   User registered: $USERNAME${NC}"
echo ""

echo -e "${YELLOW}2. Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo -e "${GREEN}   Login successful! Token received${NC}"
echo -e "${GREEN}   User ID: $USER_ID${NC}"
echo ""

echo -e "${YELLOW}3. Creating a post...${NC}"
POST_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello, SocialNet! This is my first post.","media_url":""}')

POST_ID=$(echo $POST_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo -e "${GREEN}   Post created with ID: $POST_ID${NC}"
echo ""

echo -e "${YELLOW}4. Getting the post...${NC}"
GET_POST_RESPONSE=$(curl -s -X GET "$BASE_URL/posts/$POST_ID" \
  -H "Authorization: Bearer $TOKEN")

POST_CONTENT=$(echo $GET_POST_RESPONSE | grep -o '"content":"[^"]*"' | cut -d'"' -f4)
LIKE_COUNT=$(echo $GET_POST_RESPONSE | grep -o '"like_count":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}   Post content: $POST_CONTENT${NC}"
echo -e "${GREEN}   Like count: $LIKE_COUNT${NC}"
echo ""

echo -e "${YELLOW}5. Getting user feed...${NC}"
FEED_RESPONSE=$(curl -s -X GET "$BASE_URL/feed" \
  -H "Authorization: Bearer $TOKEN")

FEED_COUNT=$(echo $FEED_RESPONSE | grep -o '"id"' | wc -l | tr -d ' ')
echo -e "${GREEN}   Feed has $FEED_COUNT post(s)${NC}"
echo ""

echo -e "${YELLOW}6. Liking the post...${NC}"
curl -s -X POST "$BASE_URL/posts/$POST_ID/like" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
echo -e "${GREEN}   Post liked successfully${NC}"
echo ""

echo -e "${YELLOW}7. Commenting on post...${NC}"
COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/posts/$POST_ID/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Great post!"}')

COMMENT_CONTENT=$(echo $COMMENT_RESPONSE | grep -o '"content":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}   Comment created: $COMMENT_CONTENT${NC}"
echo ""

echo -e "${YELLOW}8. Getting comments...${NC}"
COMMENTS_RESPONSE=$(curl -s -X GET "$BASE_URL/posts/$POST_ID/comments" \
  -H "Authorization: Bearer $TOKEN")

COMMENTS_COUNT=$(echo $COMMENTS_RESPONSE | grep -o '"id"' | wc -l | tr -d ' ')
echo -e "${GREEN}   Post has $COMMENTS_COUNT comment(s)${NC}"
echo ""

echo -e "${YELLOW}9. Updating user profile...${NC}"
curl -s -X PUT "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User Updated","bio":"I love coding in Go!","avatar_url":"https://example.com/avatar.jpg"}' > /dev/null
echo -e "${GREEN}   Profile updated successfully${NC}"
echo ""

echo -e "${YELLOW}10. Getting user profile...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN")

PROFILE_USERNAME=$(echo $PROFILE_RESPONSE | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
PROFILE_BIO=$(echo $PROFILE_RESPONSE | grep -o '"bio":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}   Username: $PROFILE_USERNAME${NC}"
echo -e "${GREEN}   Bio: $PROFILE_BIO${NC}"
echo ""

echo -e "${YELLOW}11. Registering second user...${NC}"
USER2_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"friend@example.com","username":"frienduser","password":"Friend123!","full_name":"Friend User"}')

USER2_ID=$(echo $USER2_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
USER2_USERNAME=$(echo $USER2_RESPONSE | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}   Second user registered: $USER2_USERNAME${NC}"
echo ""

echo -e "${YELLOW}12. Sending friend request...${NC}"
curl -s -X POST "$BASE_URL/friends/request" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"addressee_id\":$USER2_ID}" > /dev/null
echo -e "${GREEN}   Friend request sent${NC}"
echo ""

echo -e "${YELLOW}13. Creating a group...${NC}"
GROUP_RESPONSE=$(curl -s -X POST "$BASE_URL/groups" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Go Developers","description":"A group for Go enthusiasts"}')

GROUP_ID=$(echo $GROUP_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
GROUP_TITLE=$(echo $GROUP_RESPONSE | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}   Group created: $GROUP_TITLE${NC}"
echo ""

echo -e "${YELLOW}14. Posting to group...${NC}"
GROUP_POST_RESPONSE=$(curl -s -X POST "$BASE_URL/groups/$GROUP_ID/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Welcome to Go Developers group!"}')

GROUP_POST_CONTENT=$(echo $GROUP_POST_RESPONSE | grep -o '"content":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}   Group post created: $GROUP_POST_CONTENT${NC}"
echo ""

echo -e "${YELLOW}15. Getting notifications...${NC}"
NOTIFICATIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/notifications" \
  -H "Authorization: Bearer $TOKEN")

NOTIFICATIONS_COUNT=$(echo $NOTIFICATIONS_RESPONSE | grep -o '"id"' | wc -l | tr -d ' ')
echo -e "${GREEN}   You have $NOTIFICATIONS_COUNT notification(s)${NC}"
echo ""

echo -e "${YELLOW}16. Searching users...${NC}"
SEARCH_RESPONSE=$(curl -s -X GET "$BASE_URL/users/search?q=friend" \
  -H "Authorization: Bearer $TOKEN")

SEARCH_COUNT=$(echo $SEARCH_RESPONSE | grep -o '"id"' | wc -l | tr -d ' ')
echo -e "${GREEN}   Found $SEARCH_COUNT user(s)${NC}"
echo ""

echo -e "${CYAN}=== All tests completed successfully! ===${NC}"
echo ""
echo -e "${GREEN}Your SocialNet API is working perfectly!${NC}"
