# IRODORI Azure デプロイメントガイド

## 概要
IRODORI Webアプリケーション（Next.js + FastAPI）をAzure App Serviceで自動デプロイするためのガイドです。
GitHub Actionsを使用してフロントエンドとバックエンドを別々にデプロイします。

## 現在のデプロイ済み環境

### 本番環境URL
- **フロントエンド**: https://aps-irodori-01-service-habzggebhadug7fg.eastasia-01.azurewebsites.net
- **バックエンド**: https://aps-irodori-02-service-agheduaahbcta4ce.eastasia-01.azurewebsites.net
- **データベース**: Azure MySQL (Azure側で管理)

### 技術スタック
- **フロントエンド**: Next.js 14.0.3 + TypeScript + Tailwind CSS
- **バックエンド**: FastAPI + SQLAlchemy + bcrypt認証
- **データベース**: Azure MySQL (SQLiteフォールバック対応)
- **認証**: セッションベース認証（JWT不使用）
- **デプロイ**: Azure App Service + GitHub Actions

## 前提条件
- Azure サブスクリプション
- GitHub リポジトリ（frontend・backend別ディレクトリ）
- Azure CLI
- Node.js 20.x
- Python 3.11

## Azure リソース設定

### 1. フロントエンド App Service
```bash
# App Service プラン作成
az appservice plan create \
  --name aps-irodori-frontend-plan \
  --resource-group your-resource-group \
  --location "East Asia" \
  --sku B1 \
  --is-linux

# Web アプリ作成
az webapp create \
  --resource-group your-resource-group \
  --plan aps-irodori-frontend-plan \
  --name aps-irodori-01-service \
  --runtime "NODE|20-lts"
```

### 2. バックエンド App Service
```bash
# App Service プラン作成
az appservice plan create \
  --name aps-irodori-backend-plan \
  --resource-group your-resource-group \
  --location "East Asia" \
  --sku B1 \
  --is-linux

# Web アプリ作成
az webapp create \
  --resource-group your-resource-group \
  --plan aps-irodori-backend-plan \
  --name aps-irodori-02-service \
  --runtime "PYTHON|3.11"
```

## 環境変数設定

### フロントエンド環境変数
Azure Portal → aps-irodori-01-service → 構成 → アプリケーション設定
```
NEXT_PUBLIC_API_BASE_URL=https://aps-irodori-02-service-agheduaahbcta4ce.eastasia-01.azurewebsites.net
```

### バックエンド環境変数
Azure Portal → aps-irodori-02-service → 構成 → アプリケーション設定
```bash
SECRET_KEY=your-production-secret-key-here
SESSION_MAX_AGE=3600
ALLOWED_ORIGINS=http://localhost:3000,https://aps-irodori-01-service-habzggebhadug7fg.eastasia-01.azurewebsites.net
DB_HOST=your-mysql-host
DB_PORT=3306
DB_NAME=irodori_db
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

### スタートアップコマンド設定
```bash
# フロントエンド
PORT=8080 npm start

# バックエンド
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

## GitHub Actions設定

### フロントエンド Workflow
ファイル: `frontend/.github/workflows/azure-deploy.yml`
```yaml
name: Deploy Frontend to Azure App Service

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js version
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_API_BASE_URL: ${{ secrets.NEXT_PUBLIC_API_BASE_URL }}

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: .

  deploy:
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: node-app
      
      - name: 'Deploy to Azure Web App'
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v3
        with:
          app-name: 'aps-IRODORI-01-service'
          slot-name: 'Production'
          package: .
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_FRONTEND }}
```

### バックエンド Workflow
ファイル: `backend/.github/workflows/main_aps-irodori-02-service.yml`
```yaml
name: Build and deploy Python app to Azure Web App - aps-IRODORI-02-service

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python version
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Create and start virtual environment
        run: |
          python -m venv venv
          source venv/bin/activate
      
      - name: Install dependencies
        run: pip install -r requirements.txt
        
      - name: Upload artifact for deployment jobs
        uses: actions/upload-artifact@v4
        with:
          name: python-app
          path: |
            .
            !venv/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: python-app
      
      - name: 'Deploy to Azure Web App'
        uses: azure/webapps-deploy@v3
        id: deploy-to-webapp
        with:
          app-name: 'aps-IRODORI-02-service'
          slot-name: 'Production'
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_BACKEND }}
```

## GitHubシークレット設定

GitHub Repository → Settings → Secrets and variables → Actions

### 必要なシークレット
```
AZUREAPPSERVICE_PUBLISHPROFILE_FRONTEND=<フロントエンド発行プロファイル>
AZUREAPPSERVICE_PUBLISHPROFILE_BACKEND=<バックエンド発行プロファイル>
NEXT_PUBLIC_API_BASE_URL=https://aps-irodori-02-service-agheduaahbcta4ce.eastasia-01.azurewebsites.net
```

## デプロイメント仕様

### フロントエンド
- **ランタイム**: Node.js 20.x
- **ビルドコマンド**: `npm run build`
- **起動コマンド**: `node server.js`（カスタムサーバー使用）
- **ポート**: Azure環境変数 `PORT` を自動使用（通常8080）
- **環境変数**: ビルド時に `NEXT_PUBLIC_API_BASE_URL` 埋め込み

### バックエンド
- **ランタイム**: Python 3.11
- **Webサーバー**: Gunicorn + Uvicorn
- **起動コマンド**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`
- **ポート**: 8000（Azureが自動的にルーティング）
- **データベース**: Azure MySQL（SQLiteフォールバック対応）

## API仕様

### エンドポイント
- `GET /` - ヘルスチェック
- `POST /register` - ユーザー登録
- `POST /login` - ログイン
- `GET /logout` - ログアウト

### 認証方式
- **セッションベース認証**（JWTは使用しない）
- **bcryptパスワードハッシュ化**
- **HttpOnly セッションCookie**

## セキュリティ設定

### CORS設定
```python
# バックエンド main.py
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### セッション設定
```python
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "your-secret-key-change-in-production"),
    max_age=int(os.getenv("SESSION_MAX_AGE", "3600"))
)
```

## データベース設定

### 接続設定
```python
# database.py
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./app.db"  # フォールバック
)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)
```

### Azure MySQL接続例
```
DATABASE_URL=mysql+pymysql://username:password@server.mysql.database.azure.com:3306/database_name
```

## ファイル構成

```
IRODORI/
├── frontend/
│   ├── .github/workflows/azure-deploy.yml
│   ├── src/
│   ├── package.json
│   ├── server.js (カスタムサーバー)
│   └── .env (ローカル用)
├── backend/
│   ├── .github/workflows/main_aps-irodori-02-service.yml
│   ├── main.py
│   ├── requirements.txt
│   ├── models.py
│   ├── auth.py
│   └── routers/auth.py
├── API仕様書.txt
├── テストケース.txt
├── 統合テストドキュメント.txt
└── DEPLOYMENT.md
```

## 本番運用

### モニタリング
- **Azure Application Insights**: パフォーマンス監視
- **Azure Monitor**: ログ監視
- **GitHub Actions**: デプロイメント監視

### バックアップ
- **データベース**: Azure MySQL自動バックアップ
- **アプリケーション**: GitHubリポジトリ
- **設定**: Azure Resource Manager テンプレート

### スケーリング
- **フロントエンド**: Azure App Service スケールアウト
- **バックエンド**: Gunicorn ワーカー数調整
- **データベース**: Azure MySQL スケールアップ

## トラブルシューティング

### ログ確認
```bash
# フロントエンドログ
az webapp log tail --resource-group your-rg --name aps-irodori-01-service

# バックエンドログ
az webapp log tail --resource-group your-rg --name aps-irodori-02-service
```

### よくある問題

1. **CORS エラー**
   - `ALLOWED_ORIGINS` 環境変数を確認
   - フロントエンドURLが正しく設定されているか確認

2. **環境変数が読み込まれない**
   - Azure Portal で設定を確認
   - アプリを再起動

3. **ビルド失敗**
   - Node.js/Python バージョンを確認
   - dependencies が正しくインストールされているか確認

4. **データベース接続エラー**
   - DATABASE_URL 設定を確認
   - ファイアウォール設定を確認

## テスト済み動作確認

✅ **単体APIテスト**: 7/7 成功
✅ **結合テスト**: 14/14 成功  
✅ **E2Eテスト**: 完全ユーザーフロー動作確認
✅ **CORS**: クロスオリジン通信正常
✅ **セッション**: 認証・ログアウト正常
✅ **データベース**: 読み書き・制約確認正常

**総合成功率**: 21/21 (100%)

## コスト最適化

### 推奨構成
- **開発環境**: B1 App Service Plan
- **本番環境**: S1 App Service Plan（スケーリング対応）
- **データベース**: Basic/General Purpose（用途に応じて）

### 自動スケーリング設定
```bash
# CPU使用率ベースの自動スケーリング
az monitor autoscale create \
  --resource-group your-rg \
  --resource aps-irodori-02-service \
  --resource-type Microsoft.Web/sites \
  --name irodori-autoscale \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

## 今後の拡張

### 推奨追加機能
1. **Redis Cache**: セッション・データキャッシュ
2. **CDN**: 静的ファイル配信最適化
3. **Application Gateway**: ロードバランシング
4. **Key Vault**: シークレット管理
5. **Container Registry**: コンテナ化対応