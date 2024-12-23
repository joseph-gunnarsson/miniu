package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/joseph-gunnarsson/miniu/api"
	db "github.com/joseph-gunnarsson/miniu/db/migrations"
	red "github.com/joseph-gunnarsson/miniu/redis"
)

func main() {
	_, inDocker := os.LookupEnv("DOCKER_CONTAINER")
	if _, err := os.Stat("/.dockerenv"); err == nil {
		inDocker = true
	}

	// If we're not in Docker, try to load .env file
	if !inDocker {
		if err := godotenv.Load(); err != nil {
			log.Fatalf("Error loading .env file")
		}
	}
	conn := db.GetDBConnection()

	log.Println("Got db connection")
	redis := red.GetRedisConnection()
	log.Println("Got redis connection")
	handler := api.NewBaseHandler(conn, redis)
	log.Println("Initalized handlers")
	mm := api.NewMiddlewareManager(conn)
	log.Println("Initalized middlewear")
	mux := api.Routers(handler, mm)
	log.Println("listening on port :8080")
	go log.Fatal(http.ListenAndServe(":8080", mux))

}
