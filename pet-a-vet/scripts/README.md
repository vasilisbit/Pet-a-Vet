# Scripts Directory

This directory contains utility scripts for the pet-a-vet application.

## Directory Structure

### `/debug/`

Contains debugging and troubleshooting scripts used during development:

- Date/time related debugging scripts
- Database connection test scripts
- Performance monitoring scripts
- Verification and validation scripts

**Note**: These scripts are primarily for development use and troubleshooting specific issues that occurred during the development process.

### `/database/`

Contains database-related scripts and files:

- Schema definitions and updates
- Database seeding scripts
- Migration scripts

## Usage

### Running Debug Scripts

```bash
cd scripts/debug
node <script-name>.js
```

### Database Scripts

```bash
cd scripts/database
# Run schema updates
mysql -u username -p database_name < schema-updated.sql
# Run seed data
mysql -u username -p database_name < db-seed-updated.sql
```

## Important Notes

- Debug scripts may contain hardcoded values specific to development issues
- Always backup your database before running database scripts
- Some scripts may require environment variables to be set
- Debug scripts are kept for reference and future troubleshooting
