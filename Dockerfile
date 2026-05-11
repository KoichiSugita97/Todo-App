FROM node:18-alpine

# 作業ディレクトリの作成
WORKDIR /app

# 依存関係ファイルを先にコピーしてキャッシュを活かす
COPY package*.json ./
RUN npm install

# アプリケーションのソースコードをすべてコピー
COPY . .
RUN echo "===== pages directory =====" && ls -R src/pages

# Prisma クライアントの生成（Prisma 使用時）
RUN npx prisma generate

# Next.js のビルドを実行
RUN npm run build

# コンテナ内でポート3000を開放
EXPOSE 3000

# アプリケーションの起動
CMD ["npm", "run", "start"]
