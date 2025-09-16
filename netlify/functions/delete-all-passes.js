// Netlify Function to delete all passes in the system
// Admin only functionality - requires extreme caution

const database = require('./lib/database');

exports.handler = async (event, context) => {
    // Only allow DELETE requests
    if (event.httpMethod !== 'DELETE') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { adminEmail } = JSON.parse(event.body || '{}');
        
        if (!adminEmail) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Admin email is required' })
            };
        }

        // Delete all passes from database
        console.log(`Admin ${adminEmail} deleting ALL passes - DANGER ZONE`);
        const result = await database.deleteAllPasses(adminEmail);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Error deleting all passes:', error);
        
        if (error.message.includes('Unauthorized')) {
            return {
                statusCode: 403,
                body: JSON.stringify({ 
                    error: 'Unauthorized',
                    details: error.message 
                })
            };
        }
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to delete all passes',
                details: error.message 
            })
        };
    }
};