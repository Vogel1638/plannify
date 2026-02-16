# Plannify – Deine Setup- und Start-Anleitung

## Was ist Plannify?

Plannify bringt dir:

- **Frontend:** Next.js 15 (läuft auf Port 3000)
- **Backend:** Laravel (PHP 8.2) (läuft auf Port 8000)
- **Datenbank:** MySQL 8 (läuft auf Port 3306)
- Alles läuft bequem in Containern mit **Docker Compose**

---

## Was brauchst du?

Bitte installiere:

- Docker Desktop
- Git

---

## Los geht’s: Projekt starten

### 1. Repository klonen

```bash
git clone <repository-url>
cd plannify
```

---

### 2. Die Laravel .env Datei anlegen

Falls noch nicht vorhanden:

```bash
cp .env.example .env
```

Stelle sicher, dass in deiner `.env` Datei die Datenbank so eingestellt ist:

```env
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=plannify
DB_USERNAME=plannify
DB_PASSWORD=plannify

CACHE_STORE=file
SESSION_DRIVER=file
```

---

### 3. Container bauen und starten

```bash
docker compose down
docker compose up -d --build
```

---

### 4. Composer-Abhängigkeiten installieren (falls nötig)

```bash
docker compose exec backend composer install
```

---

### 5. Laravel Application Key generieren

```bash
docker compose exec backend php artisan key:generate
```

---

### 6. Datenbank-Migration ausführen

```bash
docker compose exec backend php artisan migrate
```

---

## Wie erreichst du die Anwendung?

| Service   | URL                  |
|-----------|----------------------|
| Frontend  | http://localhost:3000|
| Backend   | http://localhost:8000|
| MySQL     | localhost:3306       |

---

## Architektur im Überblick

Das Frontend spricht per HTTP mit dem Laravel Backend:

http://localhost:8000/api/...

Das Backend läuft im Container mit:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

MySQL läuft als eigener Docker-Service.
Die PHP-Erweiterung `pdo_mysql` ist aktiviert.

---

## Container stoppen

```bash
docker compose down
```

Um die Datenbank samt Volumes zu löschen:

```bash
docker compose down -v
```

---

## Häufige Stolpersteine

### "could not find driver"

Backend neu bauen:

```bash
docker compose build --no-cache backend
```

### "Database file does not exist"

Prüfe, ob deine `.env` richtig konfiguriert ist und führe dann aus:

```bash
docker compose exec backend php artisan config:clear
```

---

## Projektstruktur

plannify/ <br>
├── frontend/   # Next.js Frontend<br>
├── app/        # Laravel Backend<br>
├── docker-compose.yml<br>
└── Dockerfile  # Backend Dockerfile

---

## Projekt komplett neu starten

```bash
docker compose down
docker compose up -d --build
```
