import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

// Initialize database with tables and seed data
const sqlite = new Database('./dev.db');

console.log('🔧 Running database migrations...');

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Create service_requests table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS service_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_number TEXT NOT NULL UNIQUE,
    service_id TEXT NOT NULL,
    service_title TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    applicant_address TEXT,
    applicant_nik TEXT,
    notes TEXT,
    documents TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
  )
`);

// Create admin_users table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
  )
`);

// Create request_status_history table
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS request_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    changed_by INTEGER,
    changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES admin_users(id)
  )
`);

console.log('✅ Tables created successfully');

// Seed default admin user if not exists
const existingAdmin = sqlite.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');

if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    sqlite.prepare(`
    INSERT INTO admin_users (username, password_hash, name, role)
    VALUES (?, ?, ?, ?)
  `).run('admin', passwordHash, 'Administrator', 'superadmin');

    console.log('✅ Default admin user created (username: admin, password: admin123)');
} else {
    console.log('ℹ️  Admin user already exists');
}

sqlite.close();
console.log('🎉 Database migration completed!');
