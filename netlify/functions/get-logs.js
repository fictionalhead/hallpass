// Netlify Function to retrieve hall pass logs
// Uses Supabase database for persistent storage

const database = require('./lib/database');

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
        
        console.log(`Loading logs from database for teacher: ${teacherEmail}`);
        
        // Get logs from Supabase database
        let logs = await database.getPassesForTeacher(teacherEmail, limit ? parseInt(limit) : 1000);

        // Filter by date if requested
        if (date) {
            const filterDate = new Date(date);
            logs = logs.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate.toDateString() === filterDate.toDateString();
            });
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