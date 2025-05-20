// migrate-passwords.js
const { User } = require('./user.model');
const bcrypt = require('bcryptjs');

async function migratePasswords() {
  try {
    const users = await User.findAll();
    
    for (const user of users) {
      // Skip if password is already hashed
      if (user.Password.startsWith('$2a$') || user.Password.startsWith('$2b$')) {
        continue;
      }
      
      const hashedPassword = await bcrypt.hash(user.Password, 10);
      await user.update({ Password: hashedPassword });
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