# Hall Pass Data Storage

This folder contains the persistent data for the hall pass application.

- Each teacher gets their own JSON file
- Data persists across deployments
- Admin can read all files for combined view

## File Structure
- `teacher_email_domain_com.json` - Individual teacher logs
- Files are committed to the repository for persistence