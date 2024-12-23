package api

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/joseph-gunnarsson/miniu/db/models"
	"github.com/joseph-gunnarsson/miniu/internals/auth"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

type BaseHandler struct {
	redis *redis.Client
	db    *pgxpool.Pool
}

func NewBaseHandler(db *pgxpool.Pool, redis *redis.Client) *BaseHandler {
	return &BaseHandler{
		db:    db,
		redis: redis,
	}
}

func (h *BaseHandler) CreateUserHandler(rw http.ResponseWriter, r *http.Request) {
	var newUser db.CreateUserParams
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		HandleError(rw, ValidationError{Message: "Invalid request body"})
		return
	}

	if newUser.Email == "" || newUser.PasswordHash == "" {
		HandleError(rw, ValidationError{Message: "Missing required fields"})
		return
	}

	newUser.PasswordHash, err = auth.HashPassword(newUser.PasswordHash)
	if err != nil {
		HandleError(rw, err)
		return
	}

	query := db.New(h.db)
	user, err := query.CreateUser(r.Context(), newUser)
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			HandleError(rw, ValidationError{Message: "Username or email already exists"})
		} else {
			HandleError(rw, err)
		}
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusCreated)
	json.NewEncoder(rw).Encode(user)
}

func (h *BaseHandler) LoginHandler(rw http.ResponseWriter, r *http.Request) {
	var loginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&loginRequest)
	if err != nil {
		HandleError(rw, ValidationError{Message: "Invalid request body: " + err.Error()})
		return
	}

	query := db.New(h.db)
	userInformation, err := query.GetUserByEmail(r.Context(), loginRequest.Email)
	if err != nil {
		if err == pgx.ErrNoRows {
			HandleError(rw, UnauthorizedError{Message: "Invalid username or password"})
		} else {
			HandleError(rw, err)
		}
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(userInformation.PasswordHash), []byte(loginRequest.Password))
	if err != nil {
		HandleError(rw, UnauthorizedError{Message: "Invalid username or password"})
		return
	}

	token, err := auth.GenerateJWTToken(userInformation.ID, userInformation.Email)
	if err != nil {
		HandleError(rw, err)
		return
	}

	response := map[string]string{
		"message": "success",
	}

	http.SetCookie(rw, &http.Cookie{
		Name:     "auth_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	json.NewEncoder(rw).Encode(response)
}

func (h *BaseHandler) VerifyTokenHandler(rw http.ResponseWriter, r *http.Request) {
	_, ok := r.Context().Value(UserKey).(db.User)
	if !ok {
		HandleError(rw, UnauthorizedError{Message: "Invalid token"})
		return
	}

	response := map[string]string{
		"message": "Token is valid",
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	json.NewEncoder(rw).Encode(response)
}

func (h *BaseHandler) LogoutHandler(rw http.ResponseWriter, r *http.Request) {
	http.SetCookie(rw, &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
	})

	rw.WriteHeader(http.StatusOK)
	response := map[string]string{
		"message": "Loggout successful",
	}
	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	json.NewEncoder(rw).Encode(response)
}

func (h *BaseHandler) CreateURLHandler(rw http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(UserKey).(db.User)
	if !ok {
		HandleError(rw, UnauthorizedError{Message: "Unauthorized: User context missing"})
		return
	}

	var createURLRequest struct {
		OriginalUrl    string `json:"original_url"`
		ShortUrlPrefix string `json:"short_url_prefix"`
	}

	err := json.NewDecoder(r.Body).Decode(&createURLRequest)
	if err != nil {
		HandleError(rw, ValidationError{Message: "Invalid request body"})
		return
	}

	dbParams := db.CreateURLParams{
		UserID:         pgtype.Int4{user.ID, true},
		OriginalUrl:    createURLRequest.OriginalUrl,
		ShortUrlPrefix: createURLRequest.ShortUrlPrefix,
	}

	if dbParams.ShortUrlPrefix == "" {
		dbParams.ShortUrlPrefix = generateShortURLPrefix(6)
	}

	query := db.New(h.db)
	url, err := query.CreateURL(r.Context(), dbParams)
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			HandleError(rw, ValidationError{Message: "Short URL prefix already exists"})
		} else {
			HandleError(rw, err)
		}
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusCreated)
	json.NewEncoder(rw).Encode(url)
}

func generateShortURLPrefix(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func (h *BaseHandler) GetURLsByUserHandler(rw http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(UserKey).(db.User)
	if !ok {
		HandleError(rw, UnauthorizedError{Message: "Unauthorized: User context missing"})
		return
	}

	query := db.New(h.db)

	id := pgtype.Int4{Int32: user.ID, Valid: true}
	urls, err := query.GetURLsByUser(r.Context(), id)

	if err != nil {
		HandleError(rw, err)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	json.NewEncoder(rw).Encode(urls)
}

func (h *BaseHandler) GetURLByShortPrefixHandler(rw http.ResponseWriter, r *http.Request) {
	shortPrefix := r.PathValue("shortUrlPrefix")
	if shortPrefix == "" {
		HandleError(rw, ValidationError{Message: "Short URL prefix is required"})
		return
	}

	cacheKey := "url:" + shortPrefix
	cachedURL, err := h.redis.Get(r.Context(), cacheKey).Result()
	if err == nil && cachedURL != "" {
		http.Redirect(rw, r, cachedURL, http.StatusSeeOther)
		return
	} else if err != redis.Nil {
		HandleError(rw, err)
		return
	}

	query := db.New(h.db)
	url, err := query.GetURLByShortPrefix(r.Context(), shortPrefix)
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			HandleError(rw, NotFoundError{Message: "URL not found"})
		} else {
			HandleError(rw, err)
		}
		return
	}

	originalURL := url.OriginalUrl
	if !strings.HasPrefix(originalURL, "http://") && !strings.HasPrefix(originalURL, "https://") {
		originalURL = "https://" + originalURL
	}

	err = h.redis.Set(r.Context(), cacheKey, originalURL, 24*5*time.Hour).Err()
	if err != nil {
		log.Printf("Failed to cache URL in Redis: %v", err)
	}

	http.Redirect(rw, r, originalURL, http.StatusSeeOther)
}

func (h *BaseHandler) DeleteURLByShortPrefixHandler(rw http.ResponseWriter, r *http.Request) {
	shortPrefix := r.PathValue("shortUrlPrefix")
	if shortPrefix == "" {
		HandleError(rw, ValidationError{Message: "Short URL prefix is required"})
		return
	}
	user, ok := r.Context().Value(UserKey).(db.User)
	if !ok {
		HandleError(rw, UnauthorizedError{Message: "Unauthorized: User context missing"})
		return
	}

	deleteURLParams := db.DeleteURLByShortPrefixParams{
		UserID:         pgtype.Int4{Int32: user.ID, Valid: true},
		ShortUrlPrefix: shortPrefix,
	}
	query := db.New(h.db)
	altered, err := query.DeleteURLByShortPrefix(r.Context(), deleteURLParams)
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			HandleError(rw, NotFoundError{Message: "URL not found"})
		} else {
			HandleError(rw, err)
		}
		return
	}
	if altered == 0 {
		HandleError(rw, NotFoundError{Message: "URL not found"})
	}

	cacheKey := "url:" + shortPrefix
	if err := h.redis.Del(r.Context(), cacheKey).Err(); err != nil {
		log.Printf("Failed to delete URL from Redis: %v", err)
	}

	rw.WriteHeader(http.StatusOK)
}

func (h *BaseHandler) UpdateURLByIDHandler(rw http.ResponseWriter, r *http.Request) {
	var updatedURL db.UpdateShortPrefixParams
	err := json.NewDecoder(r.Body).Decode(&updatedURL)
	if err != nil {
		HandleError(rw, ValidationError{Message: "Invalid request body"})
		return
	}

	user, ok := r.Context().Value(UserKey).(db.User)
	if !ok {
		HandleError(rw, UnauthorizedError{Message: "Unauthorized: User context missing"})
		return
	}

	updatedURL.UserID = pgtype.Int4{Int32: user.ID, Valid: true}

	query := db.New(h.db)
	err = query.UpdateShortPrefix(r.Context(), updatedURL)
	if err != nil {
		if pgErr, ok := err.(*pgconn.PgError); ok && pgErr.Code == "23505" {
			HandleError(rw, NotFoundError{Message: "Short URL prefix already exists"})
		} else {
			HandleError(rw, err)
		}
		return
	}

	rw.WriteHeader(http.StatusOK)
}
