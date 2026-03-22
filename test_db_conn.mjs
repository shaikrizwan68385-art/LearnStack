import mysql from 'mysql2/promise';

async function testConn() {
  const configs = [
    { user: 'root', password: '' },
    { user: 'root', password: 'password' },
    { user: 'root', password: 'root' },
    { user: 'root', password: 'admin123' },
    { user: 'root', password: 'admin' },
    { user: 'rehan', password: '' },
    { user: 'rehan', password: 'password' },
    { user: 'rehan', password: 'admin123' },
    { user: 'shaik', password: '' }
  ];

  for (const config of configs) {
    console.log(`Testing ${config.user} / "${config.password}"...`);
    try {
      const conn = await mysql.createConnection({
        host: '127.0.0.1',
        user: config.user,
        password: config.password,
        port: 3306
      });
      console.log(`✅ SUCCESS: ${config.user} / "${config.password}" worked!`);
      await conn.end();
      return;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
    }
  }
}

testConn();
