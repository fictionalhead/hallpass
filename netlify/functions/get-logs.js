// Netlify Function to retrieve hall pass logs
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
        // Parse query parameters - now requires teacherEmail
        const queryParams = event.queryStringParameters || {};
        const { teacherEmail, date, limit } = queryParams;
        
        // Teacher email is required
        if (!teacherEmail) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Teacher email is required' })
            };
        }
        
        // Create safe filename from teacher email
        const safeTeacherEmail = teacherEmail.replace(/[^a-zA-Z0-9]/g, '_');
        const dataDir = path.join(process.cwd(), 'data');
        const teacherFile = path.join(dataDir, `teacher_${safeTeacherEmail}.json`);

        // Load logs for this teacher
        let logs = [];
        try {
            const existingData = await fs.readFile(teacherFile, 'utf8');
            logs = JSON.parse(existingData);
        } catch (err) {
            // File doesn't exist, return empty logs
            console.log(`No logs found for teacher: ${teacherEmail}`);
        }

        // Filter by date if requested
        if (date) {
            const filterDate = new Date(date);
            logs = logs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate.toDateString() === filterDate.toDateString();
            });
        }

        // Limit results if requested
        if (limit) {
            const limitNum = parseInt(limit, 10);
            if (!isNaN(limitNum) && limitNum > 0) {
                logs = logs.slice(0, limitNum);
            }
        }

        console.log(`Returning ${logs.length} logs for teacher: ${teacherEmail}`);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ 
                success: true,
                logs: logs,
                count: logs.length
            })
        };
    } catch (error) {
        console.error('Error retrieving logs:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to retrieve logs',
                details: error.message 
            })
        };
    }
};