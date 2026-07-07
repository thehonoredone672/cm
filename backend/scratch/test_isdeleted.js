const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.message.count({ where: { isDeleted: false } })
  .then(n => { console.log("isDeleted OK, count:", n); })
  .catch(e => { console.error("FAIL:", e.message); })
  .finally(() => p.$disconnect());
