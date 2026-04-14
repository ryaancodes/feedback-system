# 📋 Feedback Collection System — v2.0
### DBMS Mini Project · Node.js + Express + MySQL

---

## 📝 Project Description (100–150 words)

The **Feedback Collection System** is a full-stack web application that allows users to submit feedback and enables administrators to manage and analyse it through a dedicated dashboard. Built using **Node.js**, **Express**, and **MySQL**, the system demonstrates core DBMS concepts including relational table design, normalisation, indexing, data-integrity constraints, and a wide range of SQL queries. Users fill out a validated form with their name, email, a 1–5 star rating, and comments. Admins log in securely via session-based authentication and access a dashboard showing real-time analytics (total feedback, average rating, star distribution, 7-day trend) and a filterable, sortable, searchable table of all submissions with delete functionality. All data operations are performed via parameterised SQL queries, showcasing INSERT, SELECT, DELETE, ORDER BY, WHERE, LIKE, and aggregate functions (COUNT, AVG, SUM, CASE WHEN) in a real-world context.

---

## 🗂 Folder Structure

```
feedback-system/
│
├── server.js                  ← Express app entry point
├── package.json               ← npm dependencies
├── .env                       ← DB credentials (edit this)
├── database.sql               ← MySQL setup (run once)
│
├── config/
│   └── db.js                  ← MySQL connection pool
│
├── routes/
│   ├── feedback.js            ← GET / POST / DELETE /api/feedback
│   └── admin.js               ← POST/GET /api/admin
│
└── public/
    ├── index.html             ← Feedback form (public)
    ├── css/
    │   └── style.css          ← Global styles
    ├── js/
    │   ├── feedback-form.js   ← Form logic
    │   ├── admin-login.js     ← Login logic
    │   └── dashboard.js       ← Dashboard logic
    └── pages/
        ├── admin-login.html   ← Admin login page
        └── dashboard.html     ← Admin dashboard
```

---

## ⚙️ Setup Instructions (Step-by-Step)

### Prerequisites
- **Node.js** v16+ → https://nodejs.org
- **MySQL** 8.0+ → https://dev.mysql.com/downloads/

---

### Step 1 — Create the Database

Open MySQL Workbench **or** a terminal and run:

```bash
# Terminal method:
mysql -u root -p < database.sql
```

Or open MySQL Workbench → File → Open SQL Script → select `database.sql` → Execute (⚡).

This creates the `feedback_db` database, both tables, all indexes, and inserts sample data.

---

### Step 2 — Configure .env

Open `.env` and fill in your MySQL password:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=feedback_db
PORT=3000
SESSION_SECRET=any_random_string_here
```

---

### Step 3 — Install Dependencies

```bash
cd feedback-system
npm install
```

Packages installed: `express`, `mysql2`, `cors`, `express-session`, `dotenv`, `bcryptjs`

---

### Step 4 — Start the Server

```bash
node server.js
```

Expected output:
```
✅  MySQL connected successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 📋  Feedback Collection System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🌐  http://localhost:3000/
 🔐  http://localhost:3000/admin
 📊  http://localhost:3000/dashboard
```

---

### Step 5 — Open in Browser

| Page             | URL                                   |
|------------------|---------------------------------------|
| Feedback Form    | http://localhost:3000/                |
| Admin Login      | http://localhost:3000/admin           |
| Admin Dashboard  | http://localhost:3000/dashboard       |

**Admin credentials:** `admin` / `admin123`

---

## 🗄️ Database Design

### ER Diagram

```
┌───────────────────────┐       ┌───────────────────────────────┐
│        admins         │       │           feedback             │
├───────────────────────┤       ├───────────────────────────────┤
│ id (PK, AI)           │       │ id          (PK, AI)          │
│ username (UNIQUE, NN) │       │ name        (NOT NULL)        │
│ password (NOT NULL)   │       │ email       (NOT NULL)        │
│ created_at (DEFAULT)  │       │ rating      (NOT NULL, 1–5)   │
└───────────────────────┘       │ comments    (NOT NULL)        │
                                 │ submitted_at (DEFAULT NOW)    │
                                 └───────────────────────────────┘
```

**Relationship:** Admins manage all feedback collectively (no per-admin ownership). If an `assigned_to` feature were added, a FK `admin_id → admins(id)` would be introduced.

---

### Normalisation

**1NF** — All columns hold atomic single values; every row has a unique PK. No repeating groups.

**2NF** — All non-key attributes fully depend on the entire primary key. Both tables use a single-column PK (`id`), so partial dependency is impossible.

**3NF** — No transitive dependencies: `name/email/rating/comments` all directly describe the feedback `id`, not each other.

---

### Indexes

```sql
CREATE INDEX idx_feedback_email  ON feedback(email);
CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_feedback_date   ON feedback(submitted_at);
```

Without indexes, MySQL does a full table scan on every query.  
With a B-Tree index, MySQL jumps to matching rows in O(log n) time.  
**Trade-off:** Indexes consume extra disk space and slightly slow INSERT (index must be updated on every insert).

---

### Constraints Used

| Constraint     | Column                    | Purpose                            |
|----------------|---------------------------|------------------------------------|
| PRIMARY KEY    | id (both tables)          | Uniquely identifies every row      |
| AUTO_INCREMENT | id (both tables)          | DB generates the next ID           |
| NOT NULL       | all data columns          | Prevents empty values              |
| UNIQUE         | admins.username           | No duplicate admin usernames       |
| CHECK          | feedback.rating (1–5)     | Ensures valid rating range         |
| DEFAULT        | submitted_at, created_at  | Auto-records insertion timestamp   |

---

## 📡 API Reference

### Feedback

| Method   | Endpoint                     | Auth  | Description              |
|----------|------------------------------|-------|--------------------------|
| `POST`   | `/api/feedback`              | No    | Submit new feedback      |
| `GET`    | `/api/feedback`              | Admin | List all (filter/sort)   |
| `GET`    | `/api/feedback/analytics`    | Admin | Aggregated stats + trend |
| `DELETE` | `/api/feedback/:id`          | Admin | Delete one row           |

### Admin

| Method   | Endpoint             | Description           |
|----------|----------------------|-----------------------|
| `POST`   | `/api/admin/login`   | Login, create session |
| `POST`   | `/api/admin/logout`  | Destroy session       |
| `GET`    | `/api/admin/check`   | Verify session        |

---

## 🎓 10 Viva Questions & Answers

**Q1. What is a Primary Key and why is AUTO_INCREMENT used?**
> A Primary Key uniquely identifies every row in a table. No two rows can have the same PK value and it cannot be NULL. `AUTO_INCREMENT` tells MySQL to automatically generate the next integer value when a new row is inserted, so the application never has to supply an ID manually. In this project, the `id` column in both `admins` and `feedback` uses this.

---

**Q2. Why use a Connection Pool instead of a single connection?**
> A single connection processes queries one at a time — if two users submit feedback simultaneously, the second has to wait. A pool maintains multiple open connections (set to 10 here) that are reused across requests. This is far more efficient than opening and closing a fresh TCP/MySQL connection for every query, and it prevents the "too many connections" error under load.

---

**Q3. Explain the analytics SQL query in your project.**
> The analytics query uses aggregate functions: `COUNT(*)` counts all rows, `AVG(rating)` computes the mean rating, and `SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END)` counts rows matching a specific value using a conditional expression inside a SUM. `COALESCE(..., 0)` handles the case where there are no rows (AVG would return NULL). All calculation happens inside MySQL, sending only a single small result row to Node.js.

---

**Q4. What is SQL Injection and how is it prevented here?**
> SQL injection is an attack where malicious input like `' OR '1'='1` is inserted into a query string to alter its logic. For example, a vulnerable login query `WHERE username = '${input}'` could be bypassed. We prevent it using **parameterised queries**: `db.execute('SELECT ... WHERE username = ?', [username])`. The `?` placeholder tells the MySQL driver to treat the value as data, not SQL code — it is automatically escaped.

---

**Q5. What does `express-session` do in this project?**
> `express-session` creates a server-side session store. When an admin logs in, their credentials are verified and a session object is created on the server. The client receives only a cookie with a random session ID. On every subsequent request the session ID is looked up on the server to retrieve the admin data. This is safer than storing credentials in a cookie, because the actual data never leaves the server.

---

**Q6. Explain 1NF, 2NF, and 3NF with your project as an example.**
> **1NF**: Each column holds one atomic value per row. Our `feedback` table satisfies this — `rating` is a single integer, not a list. **2NF**: All non-key columns depend on the full primary key. Since our PK is a single column (`id`), this is automatically satisfied. **3NF**: No column depends on another non-key column (no transitive dependency). `name` doesn't determine `email`, `email` doesn't determine `rating` — each describes only the feedback identified by `id`.

---

**Q7. What is the difference between `WHERE` and `HAVING`?**
> `WHERE` filters individual rows **before** aggregation. `HAVING` filters **after** aggregation on grouped results. For example: `SELECT rating, COUNT(*) FROM feedback WHERE submitted_at > '2024-01-01' GROUP BY rating HAVING COUNT(*) > 2` — `WHERE` limits which rows are aggregated; `HAVING` limits which groups are shown. In this project we only use `WHERE` because we filter individual rows, not groups.

---

**Q8. Why are indexes created on email, rating, and submitted_at?**
> Without an index MySQL performs a **full table scan** — reading every row to find matches. With a B-Tree index MySQL can jump directly to the matching rows in O(log n) time. The `email` index speeds up `LIKE` search queries, the `rating` index speeds up `WHERE rating = ?` filters, and the `submitted_at` index speeds up `ORDER BY submitted_at` sorting. The trade-off is extra storage and slightly slower INSERT (the index must be updated).

---

**Q9. What HTTP status codes do your APIs return and why?**
> `200 OK` — successful GET/DELETE. `201 Created` — successful POST (a new row was inserted). `400 Bad Request` — client sent invalid/missing data. `401 Unauthorised` — admin not logged in or wrong credentials. `404 Not Found` — the requested resource (e.g. feedback ID) doesn't exist. `500 Internal Server Error` — unexpected database or server error. Using correct status codes makes the API self-describing and easier to debug.

---

**Q10. What is the DEFAULT constraint and where is it used?**
> The `DEFAULT` constraint specifies the value MySQL inserts automatically when no value is provided for that column. In this project, `submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` means every INSERT into `feedback` automatically records the exact server time, without the Node.js code needing to send it. This guarantees the timestamp is always set, is always accurate (server time, not client time), and simplifies the INSERT query.

---

## 🚀 Possible Future Improvements

1. **bcrypt password hashing** — store `$2b$...` hashes instead of plain text.
2. **Pagination** — `LIMIT ? OFFSET ?` in SQL for large datasets.
3. **CSV export** — download feedback as spreadsheet using the `csv-writer` package.
4. **Email notifications** — send thank-you emails via Nodemailer on new submissions.
5. **Chart.js graphs** — render animated pie/bar charts for the analytics section.
6. **Multiple admins** — a full admin management panel with roles.
7. **Rate limiting** — `express-rate-limit` to prevent spam submissions.
8. **3NF deeper analysis** — add a `categories` table if feedback types are introduced.
9. **HTTPS** — deploy with SSL/TLS certificates via Let's Encrypt.
10. **Search with full-text index** — `FULLTEXT INDEX` + `MATCH ... AGAINST` for faster text search on `comments`.

---

## 🔧 Troubleshooting

| Error                           | Fix                                                   |
|---------------------------------|-------------------------------------------------------|
| `ER_ACCESS_DENIED_ERROR`        | Wrong password in `.env` → check `DB_PASSWORD`       |
| `ER_BAD_DB_ERROR`               | Run `database.sql` first to create `feedback_db`     |
| `ECONNREFUSED 3306`             | MySQL server not running → start it                  |
| Port 3000 already in use        | Change `PORT=3001` in `.env`                         |
| `Cannot find module 'express'`  | Run `npm install` first                              |
| Admin login says "Invalid"      | Ensure `database.sql` seed INSERT ran successfully   |
