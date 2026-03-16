# server

```bash
# cd /path/to/server
nest g app ai
nest g lib shared
nest g res user --project server
nest g res chat --project ai
nest g mo prisma --project shared
nest g s prisma --project shared

nest g itc interceptor --project shared
nest g mo response --project shared
nest g s response --project shared

pnpm dlx prisma init
psql -U root -W
create databse ai_en;
pnpm add dotenv prisma @prisma/client @prisma/adapter-pg
pnpm exec prisma migrate dev --name init
pnpm exec prisma generate

nest g res word-book --project main
```


```js
// index.js.example
// NODE_OPTIONS=--max_old_space_size=16864 node ./index.js
const {
  readLargeCsv,
} = require("./dist/libs/shared/src/ecdict.js");
const { join } = require("path");

readLargeCsv(join(__dirname, "../../ecdict.csv")).catch(() =>
  process.exit(1),
);
```
