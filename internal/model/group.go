package model

import "time"

type Group struct {
	ID          int64     `json:"id"`
	OwnerID     int64     `json:"owner_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	Owner       *User     `json:"owner,omitempty"`
	MemberCount int       `json:"member_count"`
	IsMember    bool      `json:"is_member"`
}

type GroupPost struct {
	ID        int64     `json:"id"`
	GroupID   int64     `json:"group_id"`
	UserID    int64     `json:"user_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	Author    *User     `json:"author,omitempty"`
}

type GroupCreate struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

type GroupPostCreate struct {
	Content string `json:"content"`
}
