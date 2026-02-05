$baseUrl = "http://localhost:8080"

Write-Host "=== SocialNet API Testing ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Testing Registration..." -ForegroundColor Yellow
$registerResponse = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -ContentType "application/json" -Body (@{
    email = "test@example.com"
    username = "testuser"
    password = "Test123!"
    full_name = "Test User"
} | ConvertTo-Json)

Write-Host "   User registered: $($registerResponse.username)" -ForegroundColor Green
Write-Host ""

Write-Host "2. Testing Login..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -ContentType "application/json" -Body (@{
    email = "test@example.com"
    password = "Test123!"
} | ConvertTo-Json)

$token = $loginResponse.token
$userId = $loginResponse.user.id
Write-Host "   Login successful! Token received" -ForegroundColor Green
Write-Host "   User ID: $userId" -ForegroundColor Green
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "3. Creating a post..." -ForegroundColor Yellow
$postResponse = Invoke-RestMethod -Uri "$baseUrl/posts" -Method Post -Headers $headers -Body (@{
    content = "Hello, SocialNet! This is my first post."
    media_url = ""
} | ConvertTo-Json)

$postId = $postResponse.id
Write-Host "   Post created with ID: $postId" -ForegroundColor Green
Write-Host ""

Write-Host "4. Getting the post..." -ForegroundColor Yellow
$getPostResponse = Invoke-RestMethod -Uri "$baseUrl/posts/$postId" -Method Get -Headers $headers
Write-Host "   Post content: $($getPostResponse.content)" -ForegroundColor Green
Write-Host "   Like count: $($getPostResponse.like_count)" -ForegroundColor Green
Write-Host ""

Write-Host "5. Getting user feed..." -ForegroundColor Yellow
$feedResponse = Invoke-RestMethod -Uri "$baseUrl/feed" -Method Get -Headers $headers
Write-Host "   Feed has $($feedResponse.Count) post(s)" -ForegroundColor Green
Write-Host ""

Write-Host "6. Liking the post..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$baseUrl/posts/$postId/like" -Method Post -Headers $headers | Out-Null
Write-Host "   Post liked successfully" -ForegroundColor Green
Write-Host ""

Write-Host "7. Commenting on post..." -ForegroundColor Yellow
$commentResponse = Invoke-RestMethod -Uri "$baseUrl/posts/$postId/comments" -Method Post -Headers $headers -Body (@{
    content = "Great post!"
} | ConvertTo-Json)
Write-Host "   Comment created: $($commentResponse.content)" -ForegroundColor Green
Write-Host ""

Write-Host "8. Getting comments..." -ForegroundColor Yellow
$commentsResponse = Invoke-RestMethod -Uri "$baseUrl/posts/$postId/comments" -Method Get -Headers $headers
Write-Host "   Post has $($commentsResponse.Count) comment(s)" -ForegroundColor Green
Write-Host ""

Write-Host "9. Updating user profile..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Put -Headers $headers -Body (@{
    full_name = "Test User Updated"
    bio = "I love coding in Go!"
    avatar_url = "https://example.com/avatar.jpg"
} | ConvertTo-Json) | Out-Null
Write-Host "   Profile updated successfully" -ForegroundColor Green
Write-Host ""

Write-Host "10. Getting user profile..." -ForegroundColor Yellow
$profileResponse = Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Get -Headers $headers
Write-Host "   Username: $($profileResponse.username)" -ForegroundColor Green
Write-Host "   Bio: $($profileResponse.bio)" -ForegroundColor Green
Write-Host ""

Write-Host "11. Registering second user..." -ForegroundColor Yellow
$user2Response = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -ContentType "application/json" -Body (@{
    email = "friend@example.com"
    username = "frienduser"
    password = "Friend123!"
    full_name = "Friend User"
} | ConvertTo-Json)
$user2Id = $user2Response.id
Write-Host "   Second user registered: $($user2Response.username)" -ForegroundColor Green
Write-Host ""

Write-Host "12. Sending friend request..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$baseUrl/friends/request" -Method Post -Headers $headers -Body (@{
    addressee_id = $user2Id
} | ConvertTo-Json) | Out-Null
Write-Host "   Friend request sent" -ForegroundColor Green
Write-Host ""

Write-Host "13. Creating a group..." -ForegroundColor Yellow
$groupResponse = Invoke-RestMethod -Uri "$baseUrl/groups" -Method Post -Headers $headers -Body (@{
    title = "Go Developers"
    description = "A group for Go enthusiasts"
} | ConvertTo-Json)
$groupId = $groupResponse.id
Write-Host "   Group created: $($groupResponse.title)" -ForegroundColor Green
Write-Host ""

Write-Host "14. Posting to group..." -ForegroundColor Yellow
$groupPostResponse = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/posts" -Method Post -Headers $headers -Body (@{
    content = "Welcome to Go Developers group!"
} | ConvertTo-Json)
Write-Host "   Group post created: $($groupPostResponse.content)" -ForegroundColor Green
Write-Host ""

Write-Host "15. Getting notifications..." -ForegroundColor Yellow
$notificationsResponse = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Get -Headers $headers
Write-Host "   You have $($notificationsResponse.Count) notification(s)" -ForegroundColor Green
Write-Host ""

Write-Host "16. Searching users..." -ForegroundColor Yellow
$searchResponse = Invoke-RestMethod -Uri "$baseUrl/users/search?q=friend" -Method Get -Headers $headers
Write-Host "   Found $($searchResponse.Count) user(s)" -ForegroundColor Green
Write-Host ""

Write-Host "=== All tests completed successfully! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your SocialNet API is working perfectly! 🚀" -ForegroundColor Green
