-- name: CreateURL :one
INSERT INTO urls (user_id, original_url, short_url_prefix, expiration_date)
VALUES ($1, $2, $3, $4)
RETURNING id, user_id, original_url, short_url_prefix, created_at, expiration_date;

-- name: GetURLByShortPrefix :one
SELECT id, user_id, original_url, short_url_prefix, created_at, expiration_date
FROM urls
WHERE short_url_prefix = $1;

-- name: DeleteURLByShortPrefix :execrows
DELETE FROM urls
WHERE short_url_prefix = $1 AND user_id = $2;

-- name: UpdateShortPrefix :exec
UPDATE urls
SET short_url_prefix = $1
WHERE id = $2 AND user_id = $3;

-- name: AddShortPrefix :exec
UPDATE urls
SET short_url_prefix = $1
WHERE id = $2 AND short_url_prefix IS NULL;

-- name: GetURLsByUser :many
SELECT id, user_id, original_url, short_url_prefix, created_at, expiration_date
FROM urls
WHERE user_id = $1
ORDER BY created_at DESC;