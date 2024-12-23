package api

import (
	"net/http"
)

func Routers(handler *BaseHandler, mm *MiddlewareManager) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /user/register/", MultipleMiddleware(handler.CreateUserHandler, mm.ErrorHandlerMiddleware))
	mux.HandleFunc("POST /user/login/", MultipleMiddleware(handler.LoginHandler, mm.ErrorHandlerMiddleware))
	mux.HandleFunc("GET /user/logout/", MultipleMiddleware(handler.LogoutHandler, mm.ErrorHandlerMiddleware, mm.AuthMiddleware))
	mux.HandleFunc("GET /verify-token/", MultipleMiddleware(handler.VerifyTokenHandler, mm.ErrorHandlerMiddleware, mm.AuthMiddleware))

	mux.HandleFunc("POST /url/create/", MultipleMiddleware(handler.CreateURLHandler, mm.ErrorHandlerMiddleware, mm.AuthMiddleware))
	mux.HandleFunc("POST /url/update/", MultipleMiddleware(handler.UpdateURLByIDHandler, mm.ErrorHandlerMiddleware, mm.AuthMiddleware))
	mux.HandleFunc("GET /url/list/", MultipleMiddleware(handler.GetURLsByUserHandler, mm.ErrorHandlerMiddleware, mm.AuthMiddleware))
	mux.HandleFunc("GET /{shortUrlPrefix}/", MultipleMiddleware(handler.GetURLByShortPrefixHandler, mm.ErrorHandlerMiddleware, mm.AuthMiddleware))
	mux.HandleFunc("DELETE /url/{shortUrlPrefix}/", MultipleMiddleware(handler.DeleteURLByShortPrefixHandler, mm.ErrorHandlerMiddleware, mm.AuthMiddleware))

	return mux
}
