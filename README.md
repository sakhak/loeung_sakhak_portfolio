# Loeung SakHak Portfolio

The React frontend is organized into models, controllers, and views so the content and API logic stay separate from the page layout. Public English/Khmer text, profile details, skills, and social links can be edited in the authenticated admin at `/admin`. Projects are managed there as well and loaded from Laravel.

## Project layout

```text
portfolio/
|-- README.md
|-- .gitignore
|-- frontend/
|   |-- index.html
|   |-- package.json
|   |-- package-lock.json
|   |-- vite.config.js
|   |-- public/
|   |   |-- .htaccess
|   |   `-- profile.jpg
|   `-- src/
|       |-- App.jsx
|       |-- Admin.jsx
|       |-- ContentEditor.jsx
|       |-- admin.css
|       |-- index.css
|       |-- controllers/
|       |   `-- usePortfolioData.js
|       |-- models/
|       |   |-- projects.js
|       |   `-- siteContent.js
|       |-- components/portfolio/
|       |   |-- BackgroundEffects.jsx
|       |   |-- ProjectShowcase.jsx
|       |   |-- SharedComponents.jsx
|       |   `-- VisitorWidgets.jsx
|       |-- styles/
|       |   `-- portfolio.css
|       |-- views/
|       |   `-- PortfolioView.jsx
|       `-- main.jsx
`-- backend/
    |-- .env.example
    |-- artisan
    |-- composer.json
    |-- composer.lock
    |-- app/
    |   |-- Http/Controllers/Api/
    |   |   |-- AuthController.php
    |   |   |-- ContactController.php
    |   |   |-- ProjectController.php
    |   |   `-- SiteContentController.php
    |   |-- Http/Middleware/EnsureUserIsAdmin.php
    |   `-- Models/
    |       |-- ContactMessage.php
    |       |-- Project.php
    |       |-- SiteContent.php
    |       `-- User.php
    |-- bootstrap/app.php
    |-- config/
    |   |-- admin.php
    |   |-- cors.php
    |   `-- mail.php
    |-- database/
    |   |-- migrations/
    |   `-- seeders/
    |       |-- DatabaseSeeder.php
    |       `-- ProjectSeeder.php
    |-- public/
    |   |-- .htaccess
    |   `-- index.php
    |-- routes/
    |   |-- api.php
    |   `-- web.php
    |-- tests/Feature/PortfolioApiTest.php
    `-- remaining generated Laravel 11 scaffold files
```

`frontend/public/profile.jpg` is the photo already present alongside the provided portfolio file. Replace it with your preferred square photo when ready.

Frontend code map:

- `models/` contains default site content, project translation helpers, and content-merging rules.
- `controllers/usePortfolioData.js` loads public content and projects from the Laravel API.
- `views/PortfolioView.jsx` connects page state and renders the portfolio.
- `components/portfolio/` contains the reusable visual and interactive parts of the page.
- `styles/portfolio.css` contains the portfolio's page styling; `App.jsx` is the small entry-point export.

## API

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/projects` | Public | List projects in id order |
| GET | `/api/content` | Public | Read the saved portfolio text and profile content |
| PUT | `/api/content` | Admin bearer token | Save the portfolio text and profile content |
| POST | `/api/content/cv` | Admin bearer token | Upload or replace the shared CV PDF and save its URL in site content |
| POST | `/api/projects` | Admin bearer token | Create project (optionally with image) |
| PUT | `/api/projects/{id}` | Admin bearer token | Update project (optionally replace image) |
| DELETE | `/api/projects/{id}` | Admin bearer token | Delete project |
| POST | `/api/contact` | Public, rate limited | Save and email contact message; retains `website` honeypot |
| POST | `/api/login` | Public, rate limited | Return a Sanctum personal access token for the seeded admin |
| POST | `/api/logout` | Admin bearer token | Revoke the current token |

Project responses include `id`, `category`, `tech`, `link`, `github`, `image`, `title_en`, `title_km`, `description_en`, and `description_km`. Image URLs are absolute URLs for the configured `APP_URL`.

In `/admin`, sign in and open **Website content** to edit the public copy in English and Khmer, profile/contact details, skills, badges, and social links. Upload one shared CV PDF in the CV File section; it is used for both English and Khmer visitors and updates the saved CV URL in the site-content database. Clear a text field to remove its text, or delete list items such as experience points and social links. Save the other content changes to publish them. Project titles and descriptions are edited in the separate project form. Admin interface labels and visitor-submitted messages are not part of the site-copy editor.

If Laravel reports that the `site_contents` table does not exist, run `php artisan migrate` from the `backend` directory against the same database configured for the running application. Confirm the `2026_10_25_000001_create_site_contents_table` migration is marked as `Ran` with `php artisan migrate:status`.

## Run locally (Windows PowerShell)

Prerequisites: PHP 8.2+, Composer, Node.js 20.19+ (or 22.12+), npm, and MySQL. Enable PHP's `openssl`, `fileinfo`, `pdo_mysql`, `mbstring`, `ctype`, and `xml` extensions.

1. Create a MySQL database and user, then grant that user access to the database.
2. Configure the backend:

   ```powershell
   cd backend
   Copy-Item .env.example .env
   composer install
   php artisan key:generate
   ```

   Edit `backend/.env` with your local database credentials and set a private `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Set `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`, and `MAIL_SCHEME` to your mail provider's SMTP settings. Keep `.env` private and do not upload it to source control.
3. Create the tables, seed the five projects and create the admin account. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` first; the database seeder intentionally refuses to create an admin with a default password:

   ```powershell
   php artisan migrate --seed
   php artisan storage:link
   ```
4. In another PowerShell window, run the API:

   ```powershell
   cd backend
   php artisan serve
   ```

5. In a third window, install frontend packages and run Vite:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Open the Vite URL (usually `http://localhost:5173`). Its `/api` proxy forwards requests to Laravel at `http://127.0.0.1:8000`. The admin page is `/admin`.
6. Create the deployable frontend bundle with `npm run build` in `frontend`. The generated files are in `frontend/dist`.

If Composer reports a missing PHP extension, enable it in the PHP configuration used by your CLI and rerun Composer. The PHP extensions enabled in cPanel and in your local CLI may differ.

If you only want to populate the public portfolio before choosing admin credentials, run `php artisan db:seed --class=ProjectSeeder` after migrations. Later, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` and run `php artisan db:seed` to create the admin and safely re-seed the same projects.

## Deploy to Namecheap shared hosting / cPanel

For the full deployment walkthrough, see [NAMECHEAP-CPANEL-DEPLOYMENT.md](./NAMECHEAP-CPANEL-DEPLOYMENT.md).

Use a single HTTPS origin for the React site and API. Laravel is the web root; the React build is copied into Laravel's `public` directory. That keeps the API same-origin, so production does not need a separate API host or permissive CORS policy.

1. **Create the MySQL database.** In cPanel's MySQL Database Wizard, create a database and database user, assign the user all required privileges, and record the cPanel-prefixed database name and username.
2. **Build and prepare locally.** In `backend`, run `composer install --no-dev --optimize-autoloader`. In `frontend`, run `npm run build`. Do not copy your local `.env`.
3. **Upload Laravel outside the public web directory.** Using cPanel File Manager, upload the complete `backend` directory (including `vendor`, `artisan`, and `composer.lock`) to a private path such as `/home/CPANEL_USER/portfolio-backend`. Do not put the Laravel application, `.env`, `vendor`, or logs under `public_html`.
4. **Set the domain document root.** If cPanel permits changing the domain document root, point it to `/home/CPANEL_USER/portfolio-backend/public`. This is the recommended setup. If cPanel requires the root domain to use `public_html`, keep the application at `/home/CPANEL_USER/portfolio-backend`, copy the *contents* of `backend/public` into `public_html`, and update `public_html/index.php` so its two bootstrap paths point to `../portfolio-backend/vendor/autoload.php` and `../portfolio-backend/bootstrap/app.php`.
5. **Upload the React bundle.** Copy all contents of `frontend/dist` (including its `.htaccess` and `index.html`) into the live Laravel public directory (`backend/public` for the first setup, or `public_html` for the fallback setup). Do not replace Laravel's `index.php`. This `.htaccess` forwards `/api/...` to Laravel, preserves the bearer token header, and sends browser routes such as `/admin` to React.
6. **Create the server environment file.** Copy `backend/.env.example` to `backend/.env` using File Manager and edit it privately. Set:
   - `APP_ENV=production`, `APP_DEBUG=false`, and `APP_URL=https://your-domain.example`.
   - MySQL settings from the cPanel database wizard (the database and username usually include your cPanel account prefix).
   - A strong, unique `APP_KEY`. Generate it with `php artisan key:generate` using cPanel Terminal, or generate it locally and copy the resulting `APP_KEY=base64:...` value directly into the server `.env`. Never publish the key.
   - Private `ADMIN_EMAIL` and `ADMIN_PASSWORD` values before the one-time seeding command.
   - Your hosting account's SMTP values in `MAIL_*`; set `MAIL_FROM_ADDRESS` to a mailbox your domain is permitted to send from. `CONTACT_TO_EMAIL` defaults to the portfolio contact email.
   - `CORS_ALLOWED_ORIGINS=https://your-domain.example` (comma-separate any additional trusted origins). For the same-origin setup, browsers do not need CORS, but this setting supports an explicitly trusted alternate frontend origin.
7. **Run migrations and seed without SSH.** Use cPanel **Cron Jobs** as a one-time command runner if your plan has no Terminal/SSH:
   - In Cron Jobs, schedule this command for the next minute, using your actual paths and the PHP CLI binary/version listed by Namecheap/cPanel:

     ```sh
     cd /home/CPANEL_USER/portfolio-backend && /usr/local/bin/php artisan migrate --force --seed
     ```

   - Set the cron notification email so you receive command output. Delete the temporary cron entry after it runs. If the PHP path differs, use the path provided in cPanel's MultiPHP/cron documentation.
   - Create the public storage link once with a separate temporary cron command, `cd /home/CPANEL_USER/portfolio-backend && /usr/local/bin/php artisan storage:link`, then remove that cron entry too. If you used the `public_html` fallback instead of pointing the domain directly at Laravel's `public` directory, create the public link in the live web root with a one-time cron command such as `ln -s /home/CPANEL_USER/portfolio-backend/storage/app/public /home/CPANEL_USER/public_html/storage` (adjust both paths). If symbolic links are disabled, ask Namecheap support to enable them or follow their documented public-storage setup before relying on uploaded images.
   - If your cPanel plan does not provide Terminal, SSH, or Cron Jobs, ask Namecheap support to run these Artisan commands. Do not expose an unauthenticated web-based migration script.
8. **Permissions and test.** Ensure `storage` and `bootstrap/cache` are writable by PHP. Visit `https://your-domain.example/api/projects`, the homepage, and `/admin`. Sign in with the seeded admin credentials. Test an image upload and the contact form after SMTP is configured. The server must allow PHP file uploads of at least 5 MB; increase `upload_max_filesize` and `post_max_size` in cPanel's PHP INI editor if needed.
9. **After deployment.** Keep `APP_DEBUG=false`, restrict File Manager access, retain the backend outside the document root, and do not leave temporary setup cron jobs active. When changing server `.env`, clear cached configuration by running `php artisan config:clear` (via cPanel Terminal or a temporary cron command).

The Vite proxy is only for local development; production requests go to `/api` on the same domain.
