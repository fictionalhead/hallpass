// Netlify Function to delete all passes for a specific teacher
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
        const { adminEmail, targetTeacher } = JSON.parse(event.body || '{}');
        
        if (!adminEmail || !targetTeacher) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Admin email and target teacher are required' })
            };
        }

        // Delete all passes for the teacher
        console.log(`Admin ${adminEmail} deleting all passes for teacher ${targetTeacher}`);
        const result = await database.deleteTeacherPasses(targetTeacher, adminEmail);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error('Error deleting teacher passes:', error);
        
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
                error: 'Failed to delete teacher passes',
                details: error.message 
            })
        };
    }
};