package repository

import (
	"database/sql"
	"errors"
	"socialnet/internal/model"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *model.User) (int64, error) {
	query := `INSERT INTO users (email, username, password_hash, full_name, bio, avatar_url, is_admin) 
			  VALUES (?, ?, ?, ?, ?, ?, ?)`
	result, err := r.db.Exec(query, user.Email, user.Username, user.PasswordHash,
		user.FullName, user.Bio, user.AvatarURL, user.IsAdmin)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (r *UserRepository) GetByID(id int64) (*model.User, error) {
	query := `SELECT id, email, username, password_hash, full_name, bio, avatar_url, is_admin, created_at 
			  FROM users WHERE id = ?`
	user := &model.User{}
	err := r.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.Username, &user.PasswordHash,
		&user.FullName, &user.Bio, &user.AvatarURL, &user.IsAdmin, &user.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.New("user not found")
	}
	return user, err
}

func (r *UserRepository) GetByEmail(email string) (*model.User, error) {
	query := `SELECT id, email, username, password_hash, full_name, bio, avatar_url, is_admin, created_at 
			  FROM users WHERE email = ?`
	user := &model.User{}
	err := r.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.Username, &user.PasswordHash,
		&user.FullName, &user.Bio, &user.AvatarURL, &user.IsAdmin, &user.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.New("user not found")
	}
	return user, err
}

func (r *UserRepository) GetByUsername(username string) (*model.User, error) {
	query := `SELECT id, email, username, password_hash, full_name, bio, avatar_url, is_admin, created_at 
			  FROM users WHERE username = ?`
	user := &model.User{}
	err := r.db.QueryRow(query, username).Scan(
		&user.ID, &user.Email, &user.Username, &user.PasswordHash,
		&user.FullName, &user.Bio, &user.AvatarURL, &user.IsAdmin, &user.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.New("user not found")
	}
	return user, err
}

func (r *UserRepository) Update(user *model.User) error {
	query := `UPDATE users SET full_name = ?, bio = ?, avatar_url = ? WHERE id = ?`
	_, err := r.db.Exec(query, user.FullName, user.Bio, user.AvatarURL, user.ID)
	return err
}

func (r *UserRepository) Search(searchTerm string, limit int) ([]*model.User, error) {
	query := `SELECT id, email, username, full_name, bio, avatar_url, is_admin, created_at 
			  FROM users WHERE username LIKE ? OR full_name LIKE ? LIMIT ?`
	pattern := "%" + searchTerm + "%"
	rows, err := r.db.Query(query, pattern, pattern, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*model.User
	for rows.Next() {
		user := &model.User{}
		err := rows.Scan(&user.ID, &user.Email, &user.Username, &user.FullName,
			&user.Bio, &user.AvatarURL, &user.IsAdmin, &user.CreatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}
