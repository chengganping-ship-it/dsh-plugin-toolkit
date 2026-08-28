#!/usr/bin/env bash
set -euo pipefail

# Funding Mirror Deployment Script
# Usage: ./deploy.sh [build|start|stop|restart|logs|status|update]

echo "╔══════════════════════════════════════╗"
echo "║     Funding Mirror Deployment        ║"
╚══════════════════════════════════════╝"

COMMAND="${1:-help}"

case "$COMMAND" in
  build)
    echo "[1/2] Building Docker image..."
    docker compose build --no-cache
    echo "[2/2] Build complete."
    ;;

  start)
    echo "[1/3] Checking docker-compose.yml..."
    if [ ! -f docker-compose.yml ]; then
      echo "ERROR: docker-compose.yml not found"
      exit 1
    fi
    echo "[2/3] Starting Funding Mirror..."
    docker compose up -d
    echo "[3/3] Waiting for health check..."
    sleep 5
    if wget -qO- http://localhost:8771/api/stats > /dev/null 2>&1; then
      echo "✓ Service is healthy at http://localhost:8771"
    else
      echo "⚠ Service may still be starting. Check logs with: $0 logs"
    fi
    ;;

  stop)
    echo "Stopping Funding Mirror..."
    docker compose down
    echo "✓ Stopped."
    ;;

  restart)
    echo "Restarting Funding Mirror..."
    docker compose restart
    echo "✓ Restarted."
    ;;

  logs)
    docker compose logs -f --tail=100
    ;;

  status)
    docker compose ps
    echo "---"
    wget -qO- http://localhost:8771/api/stats 2>/dev/null || echo "Service unreachable"
    echo ""
    ;;

  update)
    echo "[1/4] Pulling latest code..."
    git pull origin main
    echo "[2/4] Rebuilding image..."
    docker compose build --no-cache
    echo "[3/4] Restarting service..."
    docker compose down && docker compose up -d
    echo "[4/4] Waiting for health check..."
    sleep 5
    if wget -qO- http://localhost:8771/api/stats > /dev/null 2>&1; then
      echo "✓ Update complete. Service healthy."
    else
      echo "⚠ Update done. Check logs with: $0 logs"
    fi
    ;;

  *)
    echo ""
    echo "Usage: $0 {build|start|stop|restart|logs|status|update}"
    echo ""
    echo "Commands:"
    echo "  build    - Build Docker image from scratch"
    echo "  start    - Start containers and verify health"
    echo "  stop     - Stop and remove containers"
    echo "  restart  - Restart containers"
    echo "  logs     - Tail container logs"
    echo "  status   - Show container status and API health"
    echo "  update   - Pull code, rebuild, restart (full update)"
    echo ""
    ;;
esac
