package http

import (
	"net/http"
	"socialnet/internal/http/handler"
	"socialnet/internal/http/middleware"
	"strings"
)

type Router struct {
	authHandler         *handler.AuthHandler
	userHandler         *handler.UserHandler
	postHandler         *handler.PostHandler
	socialHandler       *handler.SocialHandler
	messageHandler      *handler.MessageHandler
	groupHandler        *handler.GroupHandler
	notificationHandler *handler.NotificationHandler
	adminHandler        *handler.AdminHandler
	authMiddleware      *middleware.AuthMiddleware
	rateLimiter         *middleware.RateLimiter
}

func NewRouter(
	authHandler *handler.AuthHandler,
	userHandler *handler.UserHandler,
	postHandler *handler.PostHandler,
	socialHandler *handler.SocialHandler,
	messageHandler *handler.MessageHandler,
	groupHandler *handler.GroupHandler,
	notificationHandler *handler.NotificationHandler,
	adminHandler *handler.AdminHandler,
	authMiddleware *middleware.AuthMiddleware,
	rateLimiter *middleware.RateLimiter,
) *Router {
	return &Router{
		authHandler:         authHandler,
		userHandler:         userHandler,
		postHandler:         postHandler,
		socialHandler:       socialHandler,
		messageHandler:      messageHandler,
		groupHandler:        groupHandler,
		notificationHandler: notificationHandler,
		adminHandler:        adminHandler,
		authMiddleware:      authMiddleware,
		rateLimiter:         rateLimiter,
	}
}

func (rt *Router) Setup() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/register", rt.authHandler.Register)
	mux.HandleFunc("/login", rt.authHandler.Login)

	mux.HandleFunc("/users/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/search") {
			rt.authMiddleware.Authenticate(http.HandlerFunc(rt.userHandler.SearchUsers)).ServeHTTP(w, r)
			return
		}

		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 3 && parts[2] != "" {
			if r.Method == http.MethodGet {
				rt.authMiddleware.Authenticate(http.HandlerFunc(rt.userHandler.GetProfile)).ServeHTTP(w, r)
			} else if r.Method == http.MethodPut {
				rt.authMiddleware.Authenticate(http.HandlerFunc(rt.userHandler.UpdateProfile)).ServeHTTP(w, r)
			} else {
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			}
			return
		}
		http.Error(w, "not found", http.StatusNotFound)
	})

	mux.HandleFunc("/posts", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			rt.authMiddleware.Authenticate(http.HandlerFunc(rt.postHandler.CreatePost)).ServeHTTP(w, r)
		} else {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/posts/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 3 && parts[2] != "" {
			if strings.HasSuffix(r.URL.Path, "/like") {
				if r.Method == http.MethodPost {
					rt.authMiddleware.Authenticate(http.HandlerFunc(rt.socialHandler.LikePost)).ServeHTTP(w, r)
				} else if r.Method == http.MethodDelete {
					rt.authMiddleware.Authenticate(http.HandlerFunc(rt.socialHandler.UnlikePost)).ServeHTTP(w, r)
				}
				return
			}

			if strings.HasSuffix(r.URL.Path, "/comments") {
				if r.Method == http.MethodPost {
					rt.authMiddleware.Authenticate(http.HandlerFunc(rt.socialHandler.CommentOnPost)).ServeHTTP(w, r)
				} else if r.Method == http.MethodGet {
					rt.authMiddleware.Authenticate(http.HandlerFunc(rt.socialHandler.GetComments)).ServeHTTP(w, r)
				}
				return
			}

			if r.Method == http.MethodGet {
				rt.authMiddleware.Authenticate(http.HandlerFunc(rt.postHandler.GetPost)).ServeHTTP(w, r)
			} else if r.Method == http.MethodPut {
				rt.authMiddleware.Authenticate(http.HandlerFunc(rt.postHandler.UpdatePost)).ServeHTTP(w, r)
			} else if r.Method == http.MethodDelete {
				rt.authMiddleware.Authenticate(http.HandlerFunc(rt.postHandler.DeletePost)).ServeHTTP(w, r)
			}
			return
		}
		http.Error(w, "not found", http.StatusNotFound)
	})

	mux.HandleFunc("/feed", func(w http.ResponseWriter, r *http.Request) {
		rt.authMiddleware.Authenticate(http.HandlerFunc(rt.postHandler.GetFeed)).ServeHTTP(w, r)
	})

	mux.HandleFunc("/friends", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			rt.authMiddleware.Authenticate(http.HandlerFunc(rt.socialHandler.GetFriends)).ServeHTTP(w, r)
		} else {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/friends/request", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			rt.authMiddleware.Authenticate(http.HandlerFunc(rt.socialHandler.SendFriendRequest)).ServeHTTP(w, r)
		} else {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/friends/pending", func(w http.ResponseWriter, r *http.Request) {
		rt.authMiddleware.Authenticate(http.HandlerFunc(rt.socialHandler.GetPendingRequests)).ServeHTTP(w, r)
	})

	mux.HandleFunc("/friends/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 3 && parts[2] != "" {
			if strings.HasSuffix(r.URL.Path, "/accept") {
				rt.authMiddleware.Authenticate(http.HandlerFunc(rt.socialHandler.AcceptFriendRequest)).ServeHTTP(w, r)
			} else if strings.HasSuffix(r.URL.Path, "/block") {
				rt.authMiddleware.Authenticate(http.HandlerFunc(rt.socialHandler.BlockUser)).ServeHTTP(w, r)
			}
			return
		}
		http.Error(w, "not found", http.StatusNotFound)
	})

	mux.HandleFunc("/conversations", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			rt.authMiddleware.Authenticate(http.HandlerFunc(rt.messageHandler.StartConversation)).ServeHTTP(w, r)
		} else if r.Method == http.MethodGet {
			rt.authMiddleware.Authenticate(http.HandlerFunc(rt.messageHandler.GetConversations)).ServeHTTP(w, r)
		}
	})

	mux.HandleFunc("/conversations/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 3 && parts[2] != "" {
			if strings.HasSuffix(r.URL.Path, "/messages") {
				if r.Method == http.MethodPost {
					rt.authMiddleware.Authenticate(http.HandlerFunc(rt.messageHandler.SendMessage)).ServeHTTP(w, r)
				} else if r.Method == http.MethodGet {
					rt.authMiddleware.Authenticate(http.HandlerFunc(rt.messageHandler.GetMessages)).ServeHTTP(w, r)
				}
			}
			return
		}
		http.Error(w, "not found", http.StatusNotFound)
	})

	mux.HandleFunc("/groups", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			rt.authMiddleware.Authenticate(http.HandlerFunc(rt.groupHandler.CreateGroup)).ServeHTTP(w, r)
		} else if r.Method == http.MethodGet {
			rt.authMiddleware.Authenticate(http.HandlerFunc(rt.groupHandler.GetUserGroups)).ServeHTTP(w, r)
		}
	})

	mux.HandleFunc("/groups/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 3 && parts[2] != "" {
			if strings.HasSuffix(r.URL.Path, "/join") {
				rt.authMiddleware.Authenticate(http.HandlerFunc(rt.groupHandler.JoinGroup)).ServeHTTP(w, r)
			} else if strings.HasSuffix(r.URL.Path, "/leave") {
				rt.authMiddleware.Authenticate(http.HandlerFunc(rt.groupHandler.LeaveGroup)).ServeHTTP(w, r)
			} else if strings.HasSuffix(r.URL.Path, "/posts") {
				if r.Method == http.MethodPost {
					rt.authMiddleware.Authenticate(http.HandlerFunc(rt.groupHandler.PostToGroup)).ServeHTTP(w, r)
				} else if r.Method == http.MethodGet {
					rt.authMiddleware.Authenticate(http.HandlerFunc(rt.groupHandler.GetGroupPosts)).ServeHTTP(w, r)
				}
			} else if r.Method == http.MethodGet {
				rt.authMiddleware.Authenticate(http.HandlerFunc(rt.groupHandler.GetGroup)).ServeHTTP(w, r)
			}
			return
		}
		http.Error(w, "not found", http.StatusNotFound)
	})

	mux.HandleFunc("/notifications", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			rt.authMiddleware.Authenticate(http.HandlerFunc(rt.notificationHandler.GetNotifications)).ServeHTTP(w, r)
		} else if r.Method == http.MethodDelete {
			rt.authMiddleware.Authenticate(http.HandlerFunc(rt.notificationHandler.ClearNotifications)).ServeHTTP(w, r)
		}
	})

	mux.HandleFunc("/notifications/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 3 && parts[2] != "" {
			if strings.HasSuffix(r.URL.Path, "/read") {
				rt.authMiddleware.Authenticate(http.HandlerFunc(rt.notificationHandler.MarkAsRead)).ServeHTTP(w, r)
			}
			return
		}
		http.Error(w, "not found", http.StatusNotFound)
	})

	mux.HandleFunc("/notifications/unread", func(w http.ResponseWriter, r *http.Request) {
		rt.authMiddleware.Authenticate(http.HandlerFunc(rt.notificationHandler.GetUnreadCount)).ServeHTTP(w, r)
	})

	mux.HandleFunc("/reports", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			rt.authMiddleware.Authenticate(http.HandlerFunc(rt.adminHandler.CreateReport)).ServeHTTP(w, r)
		}
	})

	mux.HandleFunc("/admin/reports", func(w http.ResponseWriter, r *http.Request) {
		rt.authMiddleware.Authenticate(
			middleware.RequireAdmin(http.HandlerFunc(rt.adminHandler.GetReports)),
		).ServeHTTP(w, r)
	})

	mux.HandleFunc("/admin/reports/", func(w http.ResponseWriter, r *http.Request) {
		rt.authMiddleware.Authenticate(
			middleware.RequireAdmin(http.HandlerFunc(rt.adminHandler.ReviewReport)),
		).ServeHTTP(w, r)
	})

	mux.HandleFunc("/admin/content/", func(w http.ResponseWriter, r *http.Request) {
		rt.authMiddleware.Authenticate(
			middleware.RequireAdmin(http.HandlerFunc(rt.adminHandler.DeleteContent)),
		).ServeHTTP(w, r)
	})

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			w.Write([]byte(`{"message":"SocialNet API","version":"1.0"}`))
			return
		}
		http.Error(w, "not found", http.StatusNotFound)
	})

	return rt.rateLimiter.Limit(mux)
}
