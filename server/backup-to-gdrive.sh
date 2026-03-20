#!/bin/bash
# Rahe Kaba - Daily Database Backup to Google Drive
# This script dumps the PostgreSQL database and uploads to Google Drive
# Setup: Install rclone, configure with `rclone config`, then add to crontab

set -euo pipefail

# ---- Configuration ----
BACKUP_DIR="/tmp/rahekaba-backups"
GDRIVE_REMOTE="gdrive"                    # rclone remote name
GDRIVE_FOLDER="Rahe Kaba/Database Backups" # Google Drive folder path
DB_CONTAINER="digiwebdex-postgres"
DB_USER="digiwebdex"
DB_NAME="rahekaba"
KEEP_DAYS=30                               # Delete backups older than 30 days
LOG_FILE="/var/log/rahekaba-backup.log"

# ---- Functions ----
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ---- Start Backup ----
log "===== Backup Started ====="

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate filename with timestamp
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
BACKUP_FILE="rahekaba_backup_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Dump database from Docker container and compress
log "Dumping database..."
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl | gzip > "$BACKUP_PATH"

if [ ! -s "$BACKUP_PATH" ]; then
  log "ERROR: Backup file is empty or not created!"
  exit 1
fi

FILESIZE=$(du -h "$BACKUP_PATH" | cut -f1)
log "Backup created: ${BACKUP_FILE} (${FILESIZE})"

# Upload to Google Drive
log "Uploading to Google Drive: ${GDRIVE_FOLDER}/"
rclone mkdir "${GDRIVE_REMOTE}:${GDRIVE_FOLDER}" 2>/dev/null || true
rclone copy "$BACKUP_PATH" "${GDRIVE_REMOTE}:${GDRIVE_FOLDER}/" --progress 2>&1 | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
  log "Upload successful!"
else
  log "ERROR: Upload failed!"
  exit 1
fi

# Clean up old local backups
log "Cleaning up local backups older than ${KEEP_DAYS} days..."
find "$BACKUP_DIR" -name "rahekaba_backup_*.sql.gz" -mtime +${KEEP_DAYS} -delete 2>/dev/null || true

# Clean up old Google Drive backups
log "Cleaning up Google Drive backups older than ${KEEP_DAYS} days..."
rclone delete "${GDRIVE_REMOTE}:${GDRIVE_FOLDER}/" --min-age "${KEEP_DAYS}d" 2>&1 | tee -a "$LOG_FILE" || true

log "===== Backup Completed Successfully ====="
