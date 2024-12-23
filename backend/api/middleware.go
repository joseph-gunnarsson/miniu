package api

import (
	"context"
	"log"
	"net/http"
	"runtime/debug"

	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/joseph-gunnarsson/miniu/db/models"
	"github.com/joseph-gunnarsson/miniu/internals/auth"
)

type Middleware func(http.HandlerFunc) http.HandlerFunc

type MiddlewareManager struct {
	db *pgxpool.Pool
}
type ContextKey string

const UserKey ContextKey = "user"

func NewMiddlewareManager(db *pgxpool.Pool) *MiddlewareManager {
	return &MiddlewareManager{
		db: db,
	}
}

func (m *MiddlewareManager) AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		authCookie, err := r.Cookie("auth_token")

		if err != nil {
			HandleError(rw, UnauthorizedError{Message: "Missing Authorization Cookie"})
			return
		}
		token := authCookie.Value

		err = auth.VerifyToken(token)
		if err != nil {
			HandleError(rw, UnauthorizedError{Message: "Invalid token"})
			return
		}

		userID, err := auth.ExtractSubFromToken(token)
		if err != nil {
			HandleError(rw, UnauthorizedError{Message: "Failed to extract user ID from token"})
			return
		}

		query := db.New(m.db)
		user, err := query.GetUserById(r.Context(), userID)

		if err != nil {
			HandleError(rw, err)
			return
		}
		ctx := context.WithValue(r.Context(), UserKey, user)

		next.ServeHTTP(rw, r.WithContext(ctx))
	}
}

func (m *MiddlewareManager) ErrorHandlerMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				debug.PrintStack()
				log.Printf("Panic: %v", err)
				SendErrorResponse(rw, "Internal server error", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(rw, r)
	}
}

func MultipleMiddleware(h http.HandlerFunc, middlewares ...Middleware) http.HandlerFunc {
	if len(middlewares) < 1 {
		return h
	}
	wrapped := h
	for i := len(middlewares) - 1; i >= 0; i-- {
		wrapped = middlewares[i](wrapped)

	}
	return wrapped
}
