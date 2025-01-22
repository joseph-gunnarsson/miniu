# miniu
# miniu

miniu is a lightweight and efficient URL shortener built with modern technologies. It is designed to provide a seamless way to shorten, manage, and track your URLs using a robust backend and a modern, responsive frontend.

## Features

- **URL Shortening**: Convert long URLs into concise, easy-to-share links.
- **Custom Aliases**: Enable users to create personalized short URLs.
- **Fast and Scalable**: Built with Go, Redis, and PostgreSQL for performance and reliability.
- **Modern Frontend**: Developed using React, TypeScript, and Tailwind CSS for a clean, responsive design.

## Tech Stack

- **Backend**: Go, Redis, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS
- **Build Tools**: Vite

## Installation

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### Installation via Docker

1. Clone the repository:

   ```bash
   git clone https://github.com/joseph-gunnarsson/miniu.git
   cd miniu
   ```

2. Update the environment variables:

   Edit the `docker-compose` file in the root directory to configure your settings. Example:

   ```env
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DB=your_database_name
   REDIS_URL=redis://redis:6379
   ```

3. Build and start the services:

   ```bash
   docker-compose up --build
   ```

   The backend will be available at `http://localhost:8080`, and the frontend at `http://localhost:5173`.

## Configuration

The Vite configuration includes a proxy setup that forwards API requests from `/api` to `http://localhost:8080`. This ensures seamless integration between the frontend and backend during development.

