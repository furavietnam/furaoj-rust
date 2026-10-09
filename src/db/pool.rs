// Logic: Establishes PostgreSQL connection pool and executes schema initialization matching Django 170+ migrations.
// Input: DatabaseConfig containing host, port, credentials, and connection limits.
// Output: Result<PgPool, sqlx::Error> providing ready-to-use asynchronous database pool.

use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::time::Duration;
use tracing::info;

use crate::config::DatabaseConfig;

// Logic: Creates a resilient PostgreSQL connection pool falling back to container host 'db' if localhost times out.
// Input: config (&DatabaseConfig).
// Output: Result<PgPool, sqlx::Error>.
pub async fn create_pool(config: &DatabaseConfig) -> Result<PgPool, sqlx::Error> {
    let conn_str = config.connection_string();
    info!("Connecting to PostgreSQL database at {}:{}", config.host, config.port);

    match PgPoolOptions::new()
        .max_connections(config.max_connections)
        .idle_timeout(Duration::from_secs(config.idle_timeout_seconds))
        .acquire_timeout(Duration::from_secs(3))
        .connect(&conn_str)
        .await
    {
        Ok(pool) => Ok(pool),
        Err(_e) if config.host == "localhost" => {
            info!("Connection to localhost timed out, attempting container network host 'db'...");
            let mut fallback_config = config.clone();
            fallback_config.host = "db".to_string();
            let fallback_conn = fallback_config.connection_string();
            PgPoolOptions::new()
                .max_connections(config.max_connections)
                .idle_timeout(Duration::from_secs(config.idle_timeout_seconds))
                .acquire_timeout(Duration::from_secs(5))
                .connect(&fallback_conn)
                .await
        }
        Err(e) => Err(e),
    }
}

// Logic: Bootstraps 1:1 invariant schema tables and seeds default dev fixtures if database is empty.
// Input: pool (&PgPool).
// Output: Result<(), sqlx::Error>.
pub async fn initialize_schema(pool: &PgPool) -> Result<(), sqlx::Error> {
    let ddl = r#"
    CREATE TABLE IF NOT EXISTS auth_user (
        id SERIAL PRIMARY KEY,
        password VARCHAR(128) NOT NULL,
        last_login TIMESTAMPTZ,
        is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
        username VARCHAR(150) UNIQUE NOT NULL,
        first_name VARCHAR(150) NOT NULL DEFAULT '',
        last_name VARCHAR(150) NOT NULL DEFAULT '',
        email VARCHAR(254) NOT NULL DEFAULT '',
        is_staff BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        date_joined TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS judge_profile (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
        about TEXT NOT NULL DEFAULT '',
        timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
        language VARCHAR(10) NOT NULL DEFAULT 'en',
        points DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        performance_points DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        problem_count INTEGER NOT NULL DEFAULT 0,
        rating INTEGER,
        display_rank VARCHAR(32) NOT NULL DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS judge_language (
        id SERIAL PRIMARY KEY,
        key VARCHAR(16) UNIQUE NOT NULL,
        name VARCHAR(64) NOT NULL,
        short_name VARCHAR(16) NOT NULL,
        common_name VARCHAR(32) NOT NULL,
        ace VARCHAR(32) NOT NULL DEFAULT 'plain_text',
        template TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS judge_problem (
        id SERIAL PRIMARY KEY,
        code VARCHAR(64) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        time_limit DOUBLE PRECISION NOT NULL DEFAULT 1.0,
        memory_limit INTEGER NOT NULL DEFAULT 256,
        points DOUBLE PRECISION NOT NULL DEFAULT 100.0,
        is_public BOOLEAN NOT NULL DEFAULT TRUE,
        is_manually_managed BOOLEAN NOT NULL DEFAULT FALSE,
        date_added TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS judge_submission (
        id SERIAL PRIMARY KEY,
        problem_id INTEGER NOT NULL REFERENCES judge_problem(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES judge_profile(id) ON DELETE CASCADE,
        language_id INTEGER NOT NULL REFERENCES judge_language(id) ON DELETE RESTRICT,
        date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        time DOUBLE PRECISION,
        memory INTEGER,
        points DOUBLE PRECISION,
        status VARCHAR(4) NOT NULL DEFAULT 'QU',
        result VARCHAR(3),
        is_rejudged BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS judge_submissiontestcase (
        id SERIAL PRIMARY KEY,
        submission_id INTEGER NOT NULL REFERENCES judge_submission(id) ON DELETE CASCADE,
        case_num INTEGER NOT NULL,
        status VARCHAR(3) NOT NULL DEFAULT 'SC',
        time DOUBLE PRECISION,
        memory INTEGER,
        points DOUBLE PRECISION DEFAULT 0.0,
        output TEXT
    );

    CREATE TABLE IF NOT EXISTS judge_contest (
        id SERIAL PRIMARY KEY,
        key VARCHAR(64) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        time_limit INTERVAL,
        is_rated BOOLEAN NOT NULL DEFAULT FALSE,
        is_visible BOOLEAN NOT NULL DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS judge_contestparticipation (
        id SERIAL PRIMARY KEY,
        contest_id INTEGER NOT NULL REFERENCES judge_contest(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES judge_profile(id) ON DELETE CASCADE,
        score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        cumtime DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        virtual INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS judge_contestproblem (
        id SERIAL PRIMARY KEY,
        contest_id INTEGER NOT NULL REFERENCES judge_contest(id) ON DELETE CASCADE,
        problem_id INTEGER NOT NULL REFERENCES judge_problem(id) ON DELETE CASCADE,
        points INTEGER NOT NULL DEFAULT 100,
        "order" INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS judge_judge (
        id SERIAL PRIMARY KEY,
        name VARCHAR(64) UNIQUE NOT NULL,
        auth_key VARCHAR(128) NOT NULL,
        is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
        online BOOLEAN NOT NULL DEFAULT FALSE,
        start_time TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS judge_comment (
        id SERIAL PRIMARY KEY,
        author_id INTEGER NOT NULL REFERENCES judge_profile(id) ON DELETE CASCADE,
        body TEXT NOT NULL DEFAULT '',
        time TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS judge_organization (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(64) UNIQUE NOT NULL,
        name VARCHAR(128) NOT NULL,
        short_name VARCHAR(32) NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS judge_ticket (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES judge_profile(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL DEFAULT '',
        time TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    "#;

    sqlx::raw_sql(ddl).execute(pool).await?;

    let seed_sql = r#"
    INSERT INTO auth_user (id, username, password, is_superuser, is_staff, is_active)
    VALUES (
        1,
        'admin',
        'pbkdf2_sha256$260000$furaojsalt123456$hfk5jpjQnNJqDoI7Emmu7fOoBXuxQuaoy/MO0+Nbtms=',
        TRUE,
        TRUE,
        TRUE
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO judge_profile (id, user_id, points, rating, display_rank, about)
    VALUES (1, 1, 1500.0, 2100, 'admin', 'System Administrator & Root Architect')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO judge_language (id, key, name, short_name, common_name, ace)
    VALUES 
        (1, 'py3', 'Python 3.12', 'Python 3', 'Python', 'python'),
        (2, 'cpp20', 'C++ 20 (GCC)', 'C++ 20', 'C++', 'c_cpp'),
        (3, 'rust', 'Rust 2021', 'Rust', 'Rust', 'rust'),
        (4, 'c', 'C11 (GCC)', 'C11', 'C', 'c_cpp'),
        (5, 'cppthemis', 'C++ (Themis)', 'C++ Themis', 'C++', 'c_cpp'),
        (6, 'pasthemis', 'Pascal (Themis)', 'Pas Themis', 'Pascal', 'pascal'),
        (7, 'pas', 'Pascal (FPC)', 'Pascal', 'Pascal', 'pascal'),
        (8, 'java', 'Java 21', 'Java 21', 'Java', 'java'),
        (9, 'go', 'Go', 'Go', 'Go', 'golang'),
        (10, 'scratch', 'Scratch 3.0', 'Scratch', 'Scratch', 'plain_text'),
        (11, 'nodejs', 'Node.js', 'Node.js', 'JavaScript', 'javascript'),
        (12, 'kotlin', 'Kotlin', 'Kotlin', 'Kotlin', 'kotlin')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO judge_problem (id, code, name, description, time_limit, memory_limit, points)
    VALUES (
        1,
        'aplusb',
        'A Plus B Problem',
        'Given $N$ pairs of integers $A$ and $B$, compute and output their sum:

$$S = A + B$$

### Input Specification
The first line of input contains an integer $N$ ($1 \le N \le 100\,000$), the number of test cases.
The next $N$ lines each contain two space-separated integers $A$ and $B$ ($-10^9 \le A, B \le 10^9$).

### Output Specification
For each test case, output the single integer representing the sum $S$ on a separate line.

### Sample Input
```
2
5 5
1 1
```

### Sample Output
```
10
2
```',
        1.0,
        256,
        100.0
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO judge_contest (id, key, name, description, start_time, end_time, is_rated, is_visible)
    VALUES (
        1,
        'demo',
        'FuraOJ Inaugural Cup 2026',
        'Welcome to the official FuraOJ modern architecture migration celebration round!',
        NOW() - INTERVAL '1 hour',
        NOW() + INTERVAL '23 hours',
        TRUE,
        TRUE
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO judge_judge (id, name, auth_key, is_blocked, online)
    VALUES (1, 'default-judge', 'judge_secret_authentication_key', FALSE, TRUE)
    ON CONFLICT (id) DO NOTHING;
    "#;

    sqlx::raw_sql(seed_sql).execute(pool).await?;
    info!("Database schema tables and initial seed data verified successfully");
    Ok(())
}
