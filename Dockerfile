# Use an official Python runtime as a parent image
FROM python:3.12-slim-bookworm as builder

# Set the working directory in the container
WORKDIR /code

RUN apt-get update && apt-get install -y build-essential libssl-dev libffi-dev python3-dev

# Poetry deps:
RUN pip install poetry==1.8.3
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

COPY poetry.lock pyproject.toml ./

# Install any needed packages specified in pyproject.toml or poetry.lock
RUN poetry install --without dev --no-root && rm -rf $POETRY_CACHE_DIR 

# Use an official Python runtime as a parent image
FROM python:3.12-slim-bookworm as runtime
ENV VIRTUAL_ENV=/code/.venv \
    PATH="$VIRTUAL_ENV/bin:$PATH"

COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}

# Set the working directory in the container
WORKDIR /code
COPY akhilsinghrana ./akhilsinghrana

# Make port 80 available to the world outside this container
EXPOSE 80

# Set the maintainer label
LABEL maintainer="Akhil Singh Rana <akhilsinghrana@gmail.com>"

# Run main.py when the container launches
CMD ["fastapi", "run", "akhilsinghrana/main.py", "--host", "0.0.0.0", "--port", "80"]DockerfileCopy code