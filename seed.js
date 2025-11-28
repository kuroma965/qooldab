// seed.js
import 'dotenv/config'; // load .env
import bcrypt from 'bcryptjs';
import { db } from './src/db/db.js';
import { users } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function main() {
  // ระบุ user ตัวอย่าง (ใส่ email, raw password, name)
  const seedUsers = [
    { email: 'alice@example.com', password: 'password1', name: 'Alice' },
    { email: 'bob@example.com',   password: 'password2', name: 'Bob' },
    { email: 'carol@example.com', password: 'password3', name: 'Carol' },
  ];

  for (const u of seedUsers) {
    // เช็กว่ามี email นี้แล้วหรือยัง
    const existing = await db.select().from(users).where(eq(users.email, u.email));
    if (existing.length) {
      console.log(`Skip (already exists): ${u.email}`);
      continue;
    }

    // hash password (bcryptjs)
    const passwordHash = await bcrypt.hash(u.password, 10);

    // insert
    await db.insert(users).values({
      email: u.email,
      password_hash: passwordHash,
      name: u.name,
      // role/is_active/created_at/updated_at จะใช้ค่า default ที่ schema/database กำหนดไว้
    });

    console.log(`Inserted: ${u.email}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .then(() => process.exit(0));
