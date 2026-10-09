# Stage 1: Build binary using official Rust toolchain
FROM rust:latest AS builder

WORKDIR /usr/src/furaoj-rust

# Install Postgres native build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests and source
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Compile release binary
RUN cargo build --release

# Stage 2: Minimal runtime image
FROM debian:trixie-slim AS runner

WORKDIR /app

# Install runtime shared libraries and curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged application user
RUN groupadd -g 10001 appuser && \
    useradd -u 10001 -g appuser -s /bin/sh -d /app appuser && \
    mkdir -p /var/furaoj/media /var/furaoj/problems && \
    chown -R appuser:appuser /app /var/furaoj

# Copy compiled binary from builder
COPY --from=builder --chown=appuser:appuser /usr/src/furaoj-rust/target/release/furaoj-api /app/furaoj-api

USER appuser

EXPOSE 8080 9999

ENTRYPOINT ["/app/furaoj-api"]
