import { DatabaseSync } from 'node:sqlite';

try {
  const dbPath = './lms.db';
  const db = new DatabaseSync(dbPath);
  
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables:', tables);
  
  const tablesToDump = ['users', 'subjects', 'sections', 'videos', 'enrollments'];
  
  for (const tableName of tablesToDump) {
    if (tables.some(t => t.name === tableName)) {
      const data = db.prepare(`SELECT * FROM ${tableName} LIMIT 10`).all();
      console.log(`\n--- ${tableName} ---`);
      console.log(data);
    } else {
      console.log(`\nTable ${tableName} not found!`);
    }
  }

} catch (e) {
  console.error('Error checking DB:', e);
}


