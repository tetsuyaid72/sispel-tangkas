// Script to add completed_documents column to existing database
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'dev.db');
const db = new Database(dbPath);

try {
    // Check if column exists
    const columns = db.prepare("PRAGMA table_info(service_requests)").all();
    const hasCompletedDocs = columns.some((col: any) => col.name === 'completed_documents');

    if (!hasCompletedDocs) {
        console.log('Adding completed_documents column...');
        db.exec('ALTER TABLE service_requests ADD COLUMN completed_documents TEXT');
        console.log('Column added successfully!');
    } else {
        console.log('Column already exists');
    }
} catch (error) {
    console.error('Error:', error);
} finally {
    db.close();
}
