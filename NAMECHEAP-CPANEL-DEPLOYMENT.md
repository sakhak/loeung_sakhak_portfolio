# Deploy the Portfolio to Namecheap cPanel

This guide deploys the React frontend and Laravel API as one website on one HTTPS domain. The browser loads the built React files, and requests to `/api` are handled by Laravel on the same domain. Vite is only used for local development; it does not need to run on Namecheap.

Examples below use:

- Domain: `example.com`
- cPanel account username: `CPANEL_USER`
- Private Laravel directory: `/home/CPANEL_USER/portfolio-backend`
- cPanel public web directory: `/home/CPANEL_USER/public_html`

Replace these examples with your real domain and paths. Never share your cPanel password, database password, mail password, or Laravel application key.

## 1. Check your hosting plan

In cPanel, confirm your account has:

- PHP **8.2 or later** selected for the domain.
- The PHP extensions `openssl`, `fileinfo`, `pdo_mysql`, `mbstring`, `ctype`, and `xml` enabled.
- MySQL databases and database users.
- Apache `mod_rewrite` and `.htaccess` support.
- A way to run Laravel Artisan commands: cPanel Terminal or SSH is easiest. Cron Jobs can run one-time commands if Terminal/SSH is unavailable.
- Enough storage and PHP upload limits for your uploaded images and CV PDF.

Enable SSL for the domain in cPanel (usually **SSL/TLS Status** or **Let's Encrypt SSL**) before testing the live site.

## 2. Build the frontend on your computer

Open PowerShell in the project and build the production frontend:

```powershell
cd D:\Fullstack\Portfolio\sakhak-portfolio_V2\frontend
npm ci
npm run build
```

The deployable website files are created in `frontend\dist`. Do not upload `node_modules` or run `npm run dev` on cPanel.

## 3. Create the production MySQL database

1. Open cPanel and launch **MySQL Database Wizard** (or **MySQL Databases**).
2. Create a database and a database user with a strong, unique password.
3. Assign the user to the database with **All Privileges**.
4. Record the database name, username, and password exactly as cPanel shows them. Shared hosting commonly adds your cPanel username as a prefix, for example `CPANEL_USER_portfolio`.
5. In phpMyAdmin, confirm the database exists. Do not import your local development database unless you specifically need that data.

The migration command in a later step creates the required tables.

## 4. Upload Laravel outside `public_html`

Keep the Laravel application and its secrets outside the public web directory.

### Recommended layout when cPanel lets you change the document root

Upload the entire `backend` directory to a private path such as:

```text
/home/CPANEL_USER/portfolio-backend
```

The backend directory must contain `artisan`, `app`, `bootstrap`, `config`, `database`, `public`, `routes`, `storage`, and `vendor`.

Build Composer dependencies before uploading, or install them using Terminal/SSH:

```sh
cd /home/CPANEL_USER/portfolio-backend
composer install --no-dev --optimize-autoloader
```

If you prepare `vendor` locally, use a Linux-compatible Composer install if possible. Windows-built dependencies can sometimes differ from the hosting environment; installing Composer dependencies on the server is preferred.

In cPanel's domain management, set the domain's document root to:

```text
/home/CPANEL_USER/portfolio-backend/public
```

Copy **all contents** of your local `frontend\dist` folder into this `public` folder. Merge the files; do not overwrite or delete Laravel's `index.php`. Use the generated `frontend/dist/.htaccess` in the live web root: it preserves the bearer authorization header, routes `/api` requests to Laravel's `index.php`, and serves the React app for browser routes.

### Alternative layout if the document root must remain `public_html`

Upload the entire Laravel `backend` directory to the private path `/home/CPANEL_USER/portfolio-backend`. Do not upload it inside `public_html`.

1. Copy the **contents** of `backend/public` into `public_html`.
2. Copy the **contents** of `frontend/dist` into `public_html`, merging files and preserving Laravel's `index.php`.
3. Edit `public_html/index.php`. Change its two bootstrap paths:

   ```php
   require __DIR__.'/../portfolio-backend/vendor/autoload.php';
   (require_once __DIR__.'/../portfolio-backend/bootstrap/app.php')
   ```

   These example paths assume `public_html` and `portfolio-backend` are sibling directories under `/home/CPANEL_USER`. If your folders differ, use the correct paths. Do not change or remove the rest of Laravel's `index.php`.

4. Use `frontend/dist/.htaccess` as `public_html/.htaccess`. It preserves the bearer authorization header, routes `/api` requests to Laravel's `index.php`, and serves React's `index.html` for browser routes. Do not replace it with the backend `.htaccess`.

## 5. Configure the production `.env`

In the private Laravel directory, copy `.env.example` to `.env`. Edit the server copy only; do not upload a local development `.env` or put `.env` under `public_html`.

Set the important values:

```dotenv
APP_NAME="Sakhak Portfolio"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://example.com
APP_TIMEZONE=Asia/Phnom_Penh

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=CPANEL_USER_portfolio
DB_USERNAME=CPANEL_USER_dbuser
DB_PASSWORD="your-strong-database-password"

FILESYSTEM_DISK=public

MAIL_MAILER=smtp
MAIL_SCHEME=tls
MAIL_HOST=mail.example.com
MAIL_PORT=587
MAIL_USERNAME=your-domain-mailbox@example.com
MAIL_PASSWORD="your-mailbox-password"
MAIL_FROM_ADDRESS=your-domain-mailbox@example.com
MAIL_FROM_NAME="${APP_NAME}"
CONTACT_TO_EMAIL=loeungsakhak438@gmail.com

ADMIN_NAME="Portfolio Admin"
ADMIN_EMAIL=your-private-admin-email@example.com
ADMIN_PASSWORD="use-a-unique-strong-password"
```

Important:

- Use the exact database host provided by Namecheap/cPanel; it is often `localhost`, but confirm in your hosting panel.
- Use a mailbox and SMTP settings supported by your hosting or mail provider. The contact form will not send email until SMTP is configured correctly.
- Choose a unique admin password. Quoting values with spaces or special dotenv characters avoids parsing errors.
- Keep `APP_DEBUG=false` on the live site.
- Set `APP_KEY` once. With Terminal/SSH, run `php artisan key:generate` after creating `.env`. If using Cron Jobs, generate it locally with `php artisan key:generate --show` and copy the resulting `base64:...` value into the server `.env`. Never expose this key. Do not generate a new key for an existing live installation; changing it can invalidate encrypted data and sessions.
- `CORS_ALLOWED_ORIGINS` can be set to `https://example.com`. Since the frontend and API share one origin, CORS is normally not needed for this deployment.

## 6. Run Laravel setup commands

Using cPanel Terminal or SSH, run these commands from the private Laravel directory:

```sh
cd /home/CPANEL_USER/portfolio-backend
php artisan key:generate
php artisan config:clear
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
```

Run `key:generate` only if you have not already set a production `APP_KEY`.

`db:seed` creates or updates the admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD` and seeds the sample projects. Because the seeder updates the admin password from `.env`, avoid running it casually after changing that value. To keep existing production projects untouched, run only `php artisan migrate --force` and create the admin account through your established database setup instead of seeding.

If Terminal/SSH is unavailable, you can use **Cron Jobs** for one-time Artisan commands if your hosting plan allows it:

1. Create a temporary cron entry scheduled to run once, using the PHP CLI path supplied by Namecheap:

   ```sh
   cd /home/CPANEL_USER/portfolio-backend && /usr/local/bin/php artisan migrate --force
   ```

2. Check the cron output or notification email for errors.
3. Add a separate temporary command for `php artisan db:seed --force` only if you intend to seed the admin and sample projects.
4. Add a separate temporary command for `php artisan storage:link`.
5. Delete the temporary cron entries after they succeed.

Do not create an unauthenticated web page or script to run migrations.

## 7. Set writable directories and public storage

Laravel must be able to write to:

```text
storage/
bootstrap/cache/
```

Use cPanel File Manager permissions or Terminal to make these writable by the PHP process, following Namecheap's recommended permissions. Do not make the whole application world-writable.

The `php artisan storage:link` command creates a public link from `public/storage` to `storage/app/public`. Uploaded profile images and CV PDFs rely on it. If symlinks are disabled, contact Namecheap support for the supported Laravel public-storage setup.

## 8. Configure upload limits

The app accepts a CV PDF up to **10 MB**. PHP's `upload_max_filesize` must be at least `10M`, and `post_max_size` should be larger (for example, `12M`). Set these values for the domain through cPanel's **MultiPHP INI Editor** or the PHP settings tool available on your plan.

The profile photo upload limit is 5 MB. Check the effective PHP settings for the website, not only the PHP CLI configuration.

## 9. Verify the live site

After deploying, open these URLs:

1. `https://example.com` — homepage loads.
2. `https://example.com/admin` — React admin page loads, including after refreshing the route.
3. `https://example.com/api/projects` — returns JSON with the projects.
4. `https://example.com/api/content` — returns JSON with the portfolio content.
5. Sign in to `/admin`; update some content and confirm it remains after refreshing.
6. Upload one profile photo and one shared CV PDF. Open the CV download link in both English and Khmer modes.
7. Submit the contact form after SMTP configuration and confirm the email arrives.

If the API returns 404, check that the live `.htaccess` routes `/api` to Laravel's `index.php`, `mod_rewrite` is enabled, and the domain points to the correct public directory. If a page gives a 500 error, inspect `storage/logs/laravel.log` privately and confirm `APP_DEBUG=false` remains set in production.

## 10. Updating the site later

For frontend changes, rebuild with `npm run build` and upload the new contents of `frontend/dist` to the live public directory. For backend code changes, upload the changed backend files and run any new migrations with `php artisan migrate --force`.

After changing `.env`, clear Laravel's cached configuration:

```sh
php artisan config:clear
```

Back up the MySQL database and `storage/app/public` files before updates. Never overwrite the production `.env`, delete uploaded files, or rerun database seeders without first confirming the impact.
