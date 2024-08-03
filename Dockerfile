# Build stage
FROM python:3.12-slim-bookworm AS builder

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential libssl-dev libffi-dev python3-dev && \
    pip install --no-cache-dir poetry==1.8.3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

COPY poetry.lock pyproject.toml ./

RUN --mount=type=cache,target=$POETRY_CACHE_DIR poetry install --without dev --no-root

# Runtime stage
FROM python:3.12-slim-bookworm AS runtime

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

COPY --from=builder /app/.venv ${VIRTUAL_ENV}
COPY akhilsinghrana ./akhilsinghrana

EXPOSE 8080

LABEL maintainer="Akhil Singh Rana <akhilsinghrana@gmail.com>"

CMD ["fastapi", "run", "./akhilsinghrana/main.py", "--host", "0.0.0.0", "--port", "8080"]