// Netlify Function to retrieve hall pass logs

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
        
        // Get logs from Netlify Blobs
        const { getStore } = await import('@netlify/blobs');
        const store = getStore('hallpass-logs');
        
        // Use teacher email as folder/key prefix
        const teacherKey = `teacher_${teacherEmail.replace(/[^a-zA-Z0-9]/g, '_')}/passes`;
        
        // Get current logs for this teacher
        let logs = [];
        try {
            const existingLogs = await store.get(teacherKey, { type: 'json' });
            if (existingLogs) {
                logs = existingLogs;
            }
        } catch (e) {
            console.log(`No existing logs found for teacher ${teacherEmail}`);
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