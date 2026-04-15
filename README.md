## monorepo

```bash
pnpm add dayjs md5 -w
pnpm add @types/md5 -D -w
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

## git large file storage

```bash
brew install git-lfs
git lfs install
git lfs track "*.csv"
git add .gitattributes
```
