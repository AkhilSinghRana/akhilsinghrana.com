PYTHON = python
FRONTEND_DIR = akhilsinghrana/frontend
BACKEND_DIR  = akhilsinghrana/backend

# ── Dev ───────────────────────────────────────────────────────────────────────

run:
	@echo "Starting backend on :8000 ..."
	@uv run uvicorn akhilsinghrana.backend.main:app --host 0.0.0.0 --port 8000 --reload

run-frontend:
	@echo "Starting frontend dev server on :3000 ..."
	@cd $(FRONTEND_DIR) && npm run dev

# ── Build ─────────────────────────────────────────────────────────────────────

build-frontend:
	@echo "Exporting frontend (static) ..."
	@cd $(FRONTEND_DIR) && npm run build

export-content:
	@echo "Regenerating site-content.json for RAG ..."
	@cd $(FRONTEND_DIR) && node scripts/export-content.mjs

rebuild-db:
	@echo "Rebuilding faiss_db vector index ..."
	@uv run python3 -c "import os, shutil; from dotenv import load_dotenv; load_dotenv('akhilsinghrana/backend/.env'); shutil.rmtree('./akhilsinghrana/backend/db/faiss_db', ignore_errors=True); from akhilsinghrana.backend.RAG_Chat import RAGChat; RAGChat(recreateVectorDB=True, folder='./akhilsinghrana/frontend/public/blogs'); print('Done')"

# ── Install ───────────────────────────────────────────────────────────────────

install:
	@echo "Installing all dependencies (including dev) ..."
	@uv sync
	@cd $(FRONTEND_DIR) && npm install

install-prod:
	@echo "Installing production dependencies only ..."
	@uv sync --no-dev

# ── Quality ───────────────────────────────────────────────────────────────────

lint:
	@echo "Running black + pylint ..."
	@uv run black --check --diff --color .
	@uv run pylint akhilsinghrana/

format:
	@echo "Auto-formatting with black ..."
	@uv run black .

test:
	@echo "Running tests ..."
	@uv run pytest

# ── Clean ─────────────────────────────────────────────────────────────────────

clean:
	@echo "Cleaning Python artifacts ..."
	@find . -type d -name __pycache__ -not -path "./.venv/*" -exec rm -rf {} + 2>/dev/null || true
	@find . -name "*.pyc" -not -path "./.venv/*" -delete 2>/dev/null || true
	@rm -rf .pytest_cache
	@echo "Done."

clean-frontend:
	@echo "Cleaning frontend build artifacts ..."
	@rm -rf $(FRONTEND_DIR)/.next $(FRONTEND_DIR)/out
	@echo "Done."

clean-all: clean clean-frontend
	@echo "All clean."

.PHONY: run run-frontend build-frontend export-content rebuild-db \
        install install-prod lint format test \
        clean clean-frontend clean-all
