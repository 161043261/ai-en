## monorepo

```bash
pnpm add dayjs md5 -w
pnpm add @types/md5 -D -w
```

## concurrently

```bash
pnpm add concurrently -D -w
```

## `.git/hooks/pre-commit`

```bash
cd ./apps/server
pnpm format

cd ../web-vue
pnpm format

cd ../web
pnpm format

if [ -n "$(git diff --name-only)" ]; then
  git add .
fi
```
