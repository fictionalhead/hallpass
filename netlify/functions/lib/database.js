// Database configuration and utilities
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with your project credentials
const supabaseUrl = 'https://eusldzvhrmnoshepycuf.supabase.co';

// Try to use service role key from environment variable, fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1c2xkenZocm1ub3NoZXB5Y3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczODQ4NzEsImV4cCI6MjA3Mjk2MDg3MX0.dyI3QZQeaEApqC7JrYF2-6hzDGGJ2KG-ZxJVkhjxePs';

const supabase = createClient(supabaseUrl, supabaseKey);

// Log which key type we're using
console.log('Using Supabase key type:', process.env.SUPABASE_SERVICE_KEY ? 'service' : 'anon');

// Database functions
const database = {
    // Save a new hall pass
    async savePass(pass) {
        const { data, error } = await supabase
            .from('hall_passes')
            .insert([{
                id: pass.id,
                teacher_email: pass.teacherEmail,
                student_name: pass.name,
                location: pass.location,
                timestamp: pass.timestamp,
                created_at: new Date().toISOString()
            }]);
            
        if (error) {
            throw new Error(`Failed to save pass: ${error.message}`);
        }
        
        return data;
    },

    // Get passes for a specific teacher
    async getPassesForTeacher(teacherEmail, limit = 1000) {
        const { data, error } = await supabase
            .from('hall_passes')
            .select('*')
            .eq('teacher_email', teacherEmail)
            .order('timestamp', { ascending: false })
            .limit(limit);
            
        if (error) {
            throw new Error(`Failed to get passes: ${error.message}`);
        }
        
        // Convert back to frontend format
        return data.map(row => ({
            id: row.id,
            name: row.student_name,
            location: row.location,
            timestamp: row.timestamp,
            teacherEmail: row.teacher_email
        }));
    },

    // Get all passes (admin only)
    async getAllPasses(limit = 10000) {
        const { data, error } = await supabase
            .from('hall_passes')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);
            
        if (error) {
            throw new Error(`Failed to get all passes: ${error.message}`);
        }
        
        // Convert back to frontend format and get unique teachers
        const passes = data.map(row => ({
            id: row.id,
            name: row.student_name,
            location: row.location,
            timestamp: row.timestamp,
            teacherEmail: row.teacher_email
        }));
        
        const teachers = [...new Set(data.map(row => row.teacher_email))].sort();
        
        return { passes, teachers };
    },

    // Delete a single pass
    async deletePass(passId, adminEmail) {
        // Verify admin
        if (adminEmail !== 'meyere@wyomingps.org') {
            throw new Error('Unauthorized: Only admin can delete passes');
        }
        
        const { data, error, count } = await supabase
            .from('hall_passes')
            .delete()
            .eq('id', passId)
            .select();  // Add select() to return deleted rows
            
        if (error) {
            console.error('Supabase delete error:', error);
            throw new Error(`Failed to delete pass: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
            console.warn(`No pass found with id ${passId} or RLS policy blocked deletion`);
            throw new Error('Pass not found or could not be deleted due to permissions');
        }
        
        console.log(`Successfully deleted pass ${passId}`);
        return { success: true, deletedId: passId, deletedCount: data.length };
    },

    // Delete all passes for a specific teacher
    async deleteTeacherPasses(targetTeacher, adminEmail) {
        // Verify admin
        if (adminEmail !== 'meyere@wyomingps.org') {
            throw new Error('Unauthorized: Only admin can delete passes');
        }
        
        // First, let's see what we're about to delete
        const { data: toDelete, error: selectError } = await supabase
            .from('hall_passes')
            .select('id')
            .eq('teacher_email', targetTeacher);
            
        if (selectError) {
            throw new Error(`Failed to find teacher passes: ${selectError.message}`);
        }
        
        console.log(`Found ${toDelete ? toDelete.length : 0} passes to delete for ${targetTeacher}`);
        
        // Now delete them with select() to return deleted rows
        const { data, error } = await supabase
            .from('hall_passes')
            .delete()
            .eq('teacher_email', targetTeacher)
            .select();  // Add select() to return deleted rows
            
        if (error) {
            console.error('Supabase delete error:', error);
            throw new Error(`Failed to delete teacher passes: ${error.message}`);
        }
        
        // Check if deletion actually happened
        if (!data || data.length === 0) {
            console.warn(`No passes deleted for ${targetTeacher}. RLS policy may be blocking deletion.`);
            
            // Try alternative approach - delete by IDs
            if (toDelete && toDelete.length > 0) {
                console.log('Attempting to delete by individual IDs...');
                const deletePromises = toDelete.map(pass => 
                    supabase
                        .from('hall_passes')
                        .delete()
                        .eq('id', pass.id)
                        .select()
                );
                
                const results = await Promise.all(deletePromises);
                const deletedCount = results.filter(r => !r.error && r.data && r.data.length > 0).length;
                
                if (deletedCount > 0) {
                    console.log(`Successfully deleted ${deletedCount} passes using individual deletes`);
                    return { success: true, deletedTeacher: targetTeacher, count: deletedCount };
                }
            }
            
            throw new Error('Could not delete passes - RLS policies may be preventing deletion');
        }
        
        console.log(`Successfully deleted ${data.length} passes for ${targetTeacher}`);
        return { success: true, deletedTeacher: targetTeacher, count: data.length };
    },

    // Delete all passes in the system
    async deleteAllPasses(adminEmail) {
        // Verify admin
        if (adminEmail !== 'meyere@wyomingps.org') {
            throw new Error('Unauthorized: Only admin can delete all passes');
        }
        
        const { data, error } = await supabase
            .from('hall_passes')
            .delete()
            .neq('id', ''); // Delete all rows (id is never empty)
            
        if (error) {
            throw new Error(`Failed to delete all passes: ${error.message}`);
        }
        
        return { success: true, message: 'All passes deleted' };
    },

    // Test RLS policies
    async testRLS() {
        // Try to get RLS status
        const { data, error } = await supabase.rpc('current_setting', { setting: 'row_security' });
        console.log('RLS status check:', data, error);
        
        return { rlsInfo: data || 'unknown' };
    },

    // Create the table if it doesn't exist (for initial setup)
    async createTable() {
        const { error } = await supabase.rpc('create_hall_passes_table');
        if (error) {
            console.error('Table creation error:', error);
        }
    }
};

module.exports = database;