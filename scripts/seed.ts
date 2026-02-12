import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();

  const email = "mycrescentai@gmail.com";
  const password = "heyhey123$";
  const hashedPassword = await bcrypt.hash(password, 12);
  const name = "Raahil";
  const id = `user_${Date.now()}`;

  await client.query(
    `INSERT INTO "User" (id, email, "hashedPassword", name, "createdAt")
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (email) DO UPDATE SET "hashedPassword" = $3, name = $4`,
    [id, email, hashedPassword, name]
  );

  console.log(`User seeded: ${email}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
