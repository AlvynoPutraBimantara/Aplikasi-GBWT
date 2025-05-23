// migrate-passwords.js
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function migratePasswords() {
  try {
    // Get all users from the database
    const [users] = await pool.query("SELECT * FROM user");
    
    for (const user of users) {
      // Skip if password is already hashed
      if (user.Password.startsWith('$2a$') || user.Password.startsWith('$2b$')) {
        console.log(`Password already hashed for user ${user.Nama}`);
        continue;
      }
      
      // Hash the plaintext password
      const hashedPassword = await bcrypt.hash(user.Password, 10);
      
      // Update the user with the hashed password
      await pool.query("UPDATE user SET Password = ? WHERE id = ?", [hashedPassword, user.id]);
      
      console.log(`Updated password for user ${user.Nama}`);
    }
    
    console.log('Password migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migratePasswords();