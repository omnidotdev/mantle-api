-- Custom SQL migration file, put your code below! --

CREATE OR REPLACE FUNCTION generate_document_number(
  org_id TEXT,
  doc_type TEXT
) RETURNS TEXT AS $$
DECLARE
  config RECORD;
  result TEXT;
  seq_num INT;
  random_id TEXT;
  date_part TEXT;
BEGIN
  -- Get or create config with defaults
  INSERT INTO document_numbering_config (
    organization_id, document_type, prefix, separator, date_format,
    id_strategy, sequential_padding, random_length, next_sequential_number
  )
  VALUES (
    org_id, doc_type,
    CASE doc_type
      WHEN 'quote' THEN 'QT'
      WHEN 'invoice' THEN 'INV'
      ELSE UPPER(LEFT(doc_type, 3))
    END,
    '-', NULL, 'sequential', 4, 8, 1
  )
  ON CONFLICT (organization_id, document_type) DO NOTHING;

  -- Lock and fetch config
  SELECT * INTO config
  FROM document_numbering_config
  WHERE organization_id = org_id AND document_type = doc_type
  FOR UPDATE;

  -- Build date segment
  date_part := '';
  IF config.date_format IS NOT NULL THEN
    CASE config.date_format
      WHEN 'YYYY' THEN date_part := TO_CHAR(NOW(), 'YYYY');
      WHEN 'YYMM' THEN date_part := TO_CHAR(NOW(), 'YYMM');
      WHEN 'YYYYMM' THEN date_part := TO_CHAR(NOW(), 'YYYYMM');
    END CASE;
  END IF;

  -- Build ID segment
  IF config.id_strategy = 'sequential' THEN
    seq_num := config.next_sequential_number;

    -- Increment counter
    UPDATE document_numbering_config
    SET next_sequential_number = next_sequential_number + 1,
        updated_at = NOW()
    WHERE id = config.id;

    result := LPAD(seq_num::TEXT, config.sequential_padding, '0');
  ELSE
    -- Random uppercase hex
    random_id := UPPER(ENCODE(gen_random_bytes(config.random_length), 'hex'));
    result := LEFT(random_id, config.random_length);
  END IF;

  -- Assemble final number
  IF config.prefix = '' AND date_part = '' THEN
    RETURN result;
  ELSIF config.prefix != '' AND date_part != '' THEN
    RETURN config.prefix || config.separator || date_part || config.separator || result;
  ELSIF config.prefix != '' THEN
    RETURN config.prefix || config.separator || result;
  ELSE
    RETURN date_part || config.separator || result;
  END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION generate_document_number IS
  'Atomically generate the next document number for an organization and document type';
