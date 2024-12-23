package db

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetDBConnection() *pgxpool.Pool {
	ctx := context.Background()
	conn, err := pgxpool.New(ctx, os.Getenv("POSTGRES_URL"))
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	err = conn.Ping(ctx)
	if err != nil {
		log.Fatalf("Failed to ping database: %v\n", err)
		conn.Close()
	}

	return conn
}
