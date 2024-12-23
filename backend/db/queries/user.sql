-- name: CreateUser :one
INSERT INTO users (
    email, password_hash, created_at, updated_at
) VALUES (
    $1, $2, NOW(), NOW()
) RETURNING id, email, created_at, updated_at;

-- name: GetUserByEmail :one
SELECT id, email, password_hash, created_at, updated_at
FROM users
WHERE email = $1;

-- name: GetUserForLogin :one
SELECT id, email, password_hash, created_at, updated_at
FROM users
WHERE email = $1 AND password_hash = $2;

-- name: GetUserById :one
SELECT id, email, password_hash, created_at, updated_at
FROM users
WHERE id = $1;

-- name: UpdateUserPassword :one
UPDATE users
SET password_hash = $1, updated_at = NOW()
WHERE id = $2
RETURNING id, email, created_at, updated_at;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;