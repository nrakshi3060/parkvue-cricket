# Quickstart: parkvue-cric-info Database

This guide explains how to set up and run the PostgreSQL database for the `parkvue-cric-info` application using Podman or Docker.

## Prerequisites

- **Podman** (v4.0+) or **Docker**
- **Podman Compose** or **Docker Compose**

### 1. Initialize Podman (If using Podman on macOS/Windows)
If you haven't started your Podman machine yet, run:
```bash
podman machine init
podman machine start
```

## Running the Database

1.  **Navigate to the scripts directory**:
    ```bash
    cd dbscripts
    ```

2.  **Start the container**:
    Using Podman Compose:
    ```bash
    podman compose up -d
    ```
    *Alternatively, using Docker Compose:*
    ```bash
    docker-compose up -d
    ```

## Database Details

The container will automatically create the database and schema on the first run.

- **Database Name**: `parkvue_cric_info`
- **Username**: `cric_user`
- **Password**: `cric_password`
- **Port**: `5432`

## Verifying the Setup

Once the container is running, you can verify that the tables were created successfully:

```bash
podman exec -it parkvue-cric-db psql -U cric_user -d parkvue_cric_info -c "\dt"
```

You should see a list of tables including `tournaments`, `matches`, `deliveries`, etc.

## Connecting via GUI (Optional)

You can connect using any PostgreSQL client (like DBeaver, pgAdmin, or TablePlus) with the following credentials:
- **Host**: `localhost`
- **Port**: `5432`
- **User**: `cric_user`
- **Password**: `cric_password`
- **Database**: `parkvue_cric_info`

## Troubleshooting

- **Container won't start**: Ensure no other service is using port `5432`.
- **Permission Denied (Podman)**: The `docker-compose.yml` uses the `:Z` flag for volume mounts. If you still encounter issues on Linux, check your SELinux settings.
- **Wipe and Restart**: To start with a fresh database, run:
  ```bash
  podman compose down -v
  podman compose up -d
  ```
