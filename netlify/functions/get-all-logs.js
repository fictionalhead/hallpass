// Netlify Function to retrieve all hall pass logs (admin only)
// Uses server-side file storage

const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse query parameters - requires adminEmail
        const queryParams = event.queryStringParameters || {};
        const { adminEmail } = queryParams;
        
        // Check if admin email is provided and is the authorized admin
        if (!adminEmail || adminEmail !== 'meyere@wyomingps.org') {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'Unauthorized - Admin access only' })
            };
        }
        
        const dataDir = path.join(process.cwd(), 'data');
        const allLogs = [];
        const teachers = new Set();

        try {
            // Read all teacher files from the data directory
            const files = await fs.readdir(dataDir);
            const jsonFiles = files.filter(file => file.endsWith('.json') && file.startsWith('teacher_'));

            for (const file of jsonFiles) {
                try {
                    const filePath = path.join(dataDir, file);
                    const fileData = await fs.readFile(filePath, 'utf8');
                    const teacherLogs = JSON.parse(fileData);
                    
                    if (Array.isArray(teacherLogs)) {
                        // Extract teacher email from filename (remove teacher_ prefix and .json extension)
                        const teacherEmail = file.replace('teacher_', '').replace('.json', '').replace(/_/g, '@');
                        
                        // Add teacher to set and include logs
                        teacherLogs.forEach(log => {
                            if (log.teacherEmail) {
                                teachers.add(log.teacherEmail);
                            }
                            allLogs.push(log);
                        });
                    }
                } catch (err) {
                    console.log(`Error reading file ${file}:`, err.message);
                }
            }
        } catch (err) {
            // Data directory doesn't exist yet
            console.log('No data directory found, returning empty results');
        }

        // Sort all logs by timestamp (newest first)
        allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        console.log(`Admin returning ${allLogs.length} total logs from ${teachers.size} teachers`);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ 
                success: true,
                logs: allLogs,
                count: allLogs.length,
                teachers: Array.from(teachers).sort()
            })
        };
    } catch (error) {
        console.error('Error retrieving all logs:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to retrieve logs',
                details: error.message 
            })
        };
    }
};