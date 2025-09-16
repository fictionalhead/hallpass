// Netlify Function to delete a single hall pass
// Admin only functionality

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
        // Extract pass ID from the path
        const pathParts = event.path.split('/');
        const passId = pathParts[pathParts.length - 1];
        
        if (!passId || passId === 'delete-pass') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Pass ID is required' })
            };
        }

        const { adminEmail } = JSON.parse(event.body || '{}');
        
        if (!adminEmail) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Admin email is required' })
            };
        }

        // Delete the pass from database
        console.log(`Admin ${adminEmail} deleting pass ${passId}`);
        const result = await database.deletePass(passId, adminEmail);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Error deleting pass:', error);
        
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
                error: 'Failed to delete pass',
                details: error.message 
            })
        };
    }
};