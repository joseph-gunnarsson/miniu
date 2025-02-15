// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: urls.sql

package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

const addShortPrefix = `-- name: AddShortPrefix :exec
UPDATE urls
SET short_url_prefix = $1
WHERE id = $2 AND short_url_prefix IS NULL
`

type AddShortPrefixParams struct {
	ShortUrlPrefix string `json:"short_url_prefix"`
	ID             int32  `json:"id"`
}

func (q *Queries) AddShortPrefix(ctx context.Context, arg AddShortPrefixParams) error {
	_, err := q.db.Exec(ctx, addShortPrefix, arg.ShortUrlPrefix, arg.ID)
	return err
}

const createURL = `-- name: CreateURL :one
INSERT INTO urls (user_id, original_url, short_url_prefix, expiration_date)
VALUES ($1, $2, $3, $4)
RETURNING id, user_id, original_url, short_url_prefix, created_at, expiration_date
`

type CreateURLParams struct {
	UserID         pgtype.Int4      `json:"user_id"`
	OriginalUrl    string           `json:"original_url"`
	ShortUrlPrefix string           `json:"short_url_prefix"`
	ExpirationDate pgtype.Timestamp `json:"expiration_date"`
}

func (q *Queries) CreateURL(ctx context.Context, arg CreateURLParams) (Url, error) {
	row := q.db.QueryRow(ctx, createURL,
		arg.UserID,
		arg.OriginalUrl,
		arg.ShortUrlPrefix,
		arg.ExpirationDate,
	)
	var i Url
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.OriginalUrl,
		&i.ShortUrlPrefix,
		&i.CreatedAt,
		&i.ExpirationDate,
	)
	return i, err
}

const deleteURLByShortPrefix = `-- name: DeleteURLByShortPrefix :execrows
DELETE FROM urls
WHERE short_url_prefix = $1 AND user_id = $2
`

type DeleteURLByShortPrefixParams struct {
	ShortUrlPrefix string      `json:"short_url_prefix"`
	UserID         pgtype.Int4 `json:"user_id"`
}

func (q *Queries) DeleteURLByShortPrefix(ctx context.Context, arg DeleteURLByShortPrefixParams) (int64, error) {
	result, err := q.db.Exec(ctx, deleteURLByShortPrefix, arg.ShortUrlPrefix, arg.UserID)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected(), nil
}

const getURLByShortPrefix = `-- name: GetURLByShortPrefix :one
SELECT id, user_id, original_url, short_url_prefix, created_at, expiration_date
FROM urls
WHERE short_url_prefix = $1
`

func (q *Queries) GetURLByShortPrefix(ctx context.Context, shortUrlPrefix string) (Url, error) {
	row := q.db.QueryRow(ctx, getURLByShortPrefix, shortUrlPrefix)
	var i Url
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.OriginalUrl,
		&i.ShortUrlPrefix,
		&i.CreatedAt,
		&i.ExpirationDate,
	)
	return i, err
}

const getURLsByUser = `-- name: GetURLsByUser :many
SELECT id, user_id, original_url, short_url_prefix, created_at, expiration_date
FROM urls
WHERE user_id = $1
ORDER BY created_at DESC
`

func (q *Queries) GetURLsByUser(ctx context.Context, userID pgtype.Int4) ([]Url, error) {
	rows, err := q.db.Query(ctx, getURLsByUser, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Url
	for rows.Next() {
		var i Url
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.OriginalUrl,
			&i.ShortUrlPrefix,
			&i.CreatedAt,
			&i.ExpirationDate,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateShortPrefix = `-- name: UpdateShortPrefix :exec
UPDATE urls
SET short_url_prefix = $1
WHERE id = $2 AND user_id = $3
`

type UpdateShortPrefixParams struct {
	ShortUrlPrefix string      `json:"short_url_prefix"`
	ID             int32       `json:"id"`
	UserID         pgtype.Int4 `json:"user_id"`
}

func (q *Queries) UpdateShortPrefix(ctx context.Context, arg UpdateShortPrefixParams) error {
	_, err := q.db.Exec(ctx, updateShortPrefix, arg.ShortUrlPrefix, arg.ID, arg.UserID)
	return err
}
