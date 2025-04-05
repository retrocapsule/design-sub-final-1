-- Check if the Role enum type exists
SELECT n.nspname as schema, t.typname as type, t.typtype, array_agg(e.enumlabel) as enum_values
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'Role'
GROUP BY schema, type, t.typtype; 