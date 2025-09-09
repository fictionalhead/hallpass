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
        // Get logs from Netlify Blobs
        const { getStore } = await import('@netlify/blobs');
        const store = getStore('hallpass-logs');
        
        // Get current logs
        let logs = [];
        try {
            const existingLogs = await store.get('passes', { type: 'json' });
            if (existingLogs) {
                logs = existingLogs;
            }
        } catch (e) {
            console.log('No existing logs found');
        }

        // Parse query parameters for filtering (optional)
        const queryParams = event.queryStringParameters || {};
        const { date, limit } = queryParams;

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