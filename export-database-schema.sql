-- Export Database Schema Script for Supabase
-- Run this in your Supabase SQL Editor to get complete database structure

-- 1. Get all table structures with complete CREATE TABLE statements
SELECT 
    t.table_name,
    'CREATE TABLE ' || t.table_name || ' (' ||
    string_agg(
        '    ' || c.column_name || ' ' || 
        CASE 
            WHEN c.data_type = 'character varying' THEN 'VARCHAR(' || c.character_maximum_length || ')'
            WHEN c.data_type = 'character' THEN 'CHAR(' || c.character_maximum_length || ')'
            WHEN c.data_type = 'numeric' THEN 'NUMERIC(' || c.numeric_precision || ',' || c.numeric_scale || ')'
            WHEN c.data_type = 'timestamp with time zone' THEN 'TIMESTAMP WITH TIME ZONE'
            WHEN c.data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
            WHEN c.data_type = 'boolean' THEN 'BOOLEAN'
            WHEN c.data_type = 'integer' THEN 'INTEGER'
            WHEN c.data_type = 'bigint' THEN 'BIGINT'
            WHEN c.data_type = 'uuid' THEN 'UUID'
            WHEN c.data_type = 'text' THEN 'TEXT'
            WHEN c.data_type = 'jsonb' THEN 'JSONB'
            ELSE UPPER(c.data_type)
        END ||
        CASE WHEN c.is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE 
            WHEN c.column_default IS NOT NULL THEN ' DEFAULT ' || c.column_default 
            ELSE '' 
        END,
        E',\n'
        ORDER BY c.ordinal_position
    ) || 
    E'\n);' as create_table_statement
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name 
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT LIKE 'pg_%'
    AND c.table_schema = 'public'
GROUP BY t.table_name
ORDER BY t.table_name;

-- 2. Get all constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK)
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    'ALTER TABLE ' || tc.table_name || ' ADD CONSTRAINT ' || tc.constraint_name || ' ' ||
    CASE tc.constraint_type
        WHEN 'PRIMARY KEY' THEN 'PRIMARY KEY (' || string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) || ')'
        WHEN 'FOREIGN KEY' THEN 'FOREIGN KEY (' || string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) || ') REFERENCES ' || 
                                ccu.table_name || '(' || string_agg(ccu.column_name, ', ') || ')'
        WHEN 'UNIQUE' THEN 'UNIQUE (' || string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) || ')'
        WHEN 'CHECK' THEN 'CHECK (' || cc.check_clause || ')'
    END || ';' as constraint_statement
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name AND tc.constraint_schema = cc.constraint_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name NOT LIKE 'pg_%'
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type, cc.check_clause, ccu.table_name
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- 3. Get all indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef as create_index_statement
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'pg_%'
ORDER BY tablename, indexname;

-- 4. Get Row Level Security policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    'CREATE POLICY "' || policyname || '" ON ' || schemaname || '.' || tablename ||
    ' FOR ' || cmd || ' TO ' || array_to_string(roles, ', ') ||
    CASE WHEN qual IS NOT NULL THEN ' USING (' || qual || ')' ELSE '' END ||
    CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END ||
    ';' as policy_statement
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Get triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_orientation,
    action_statement,
    'CREATE TRIGGER ' || trigger_name || 
    ' ' || action_timing || ' ' || event_manipulation || 
    ' ON ' || event_object_table ||
    ' FOR EACH ' || action_orientation ||
    ' EXECUTE FUNCTION ' || action_statement || ';' as trigger_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND trigger_name NOT LIKE 'pg_%'
ORDER BY event_object_table, trigger_name;

-- 6. Get functions/procedures
SELECT 
    routine_name,
    routine_type,
    data_type as return_type,
    'CREATE OR REPLACE FUNCTION ' || routine_name || '() RETURNS ' || 
    COALESCE(data_type, 'trigger') || ' LANGUAGE plpgsql AS $$' || E'\n' ||
    routine_definition || E'\n' || '$$;' as function_statement
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name NOT LIKE 'pg_%'
ORDER BY routine_name;

-- 7. Simple query to see all your tables and row counts
SELECT 
    schemaname,
    tablename,
    n_tup_ins as total_inserts,
    n_tup_upd as total_updates, 
    n_tup_del as total_deletes,
    n_live_tup as current_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 8. Get table storage info
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC; 