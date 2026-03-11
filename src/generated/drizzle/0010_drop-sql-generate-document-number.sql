-- Drop the SQL function since generateDocumentNumber is now handled
-- by the PostGraphile plugin (which supports idStrategy override)
DROP FUNCTION IF EXISTS generate_document_number(TEXT, TEXT);