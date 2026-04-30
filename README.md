# Teaching System

A complete full-stack monorepo designed for teaching web development (HTML, CSS, JS, Next.js, and Laravel APIs).

## 🚀 How to Run

1. Make sure Docker is running on your machine.
2. Inside the `teaching-system` directory, run:
   ```bash
   docker-compose up -d --build
   ```
3. Once the containers are up, run the database migrations and seed the teaching materials:
   ```bash
   docker-compose exec laravel php artisan migrate:fresh --seed
   ```
4. Access the system:
   - **Frontend Dashboard**: [http://localhost:3001](http://localhost:3001)
   - **Laravel API**: [http://localhost:8080/api](http://localhost:8080/api) (Nginx reverse proxies this to the Laravel backend container)

## 📁 Project Structure

- `frontend/` - Next.js App Router project containing the Teaching Dashboard, Slide Viewer, API Tester, and Code Sandbox.
- `backend/` - Laravel 11 REST API containing the modules, lessons, slides, exercises, and code examples.
- `docker/` - Dockerfiles and Nginx configurations.
- `docker-compose.yml` - Brings up the Next.js frontend, Laravel API, Nginx Reverse Proxy, and PostgreSQL database.

## 🌟 Features
- **Presentations**: Markdown-based full-screen slides.
- **Live Code Editor**: Monaco Editor integrated with HTML/JS live previews.
- **API Tester**: Live interceptor to call backend Laravel REST endpoints.
- **Offline Capable**: All services run locally via Docker, meaning it works perfectly in classrooms without internet access.
