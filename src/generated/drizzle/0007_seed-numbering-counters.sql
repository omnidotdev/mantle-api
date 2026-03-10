-- Seed quote counters from existing quote numbers
INSERT INTO document_numbering_config (
  organization_id, document_type, prefix, separator,
  id_strategy, sequential_padding, random_length, next_sequential_number
)
SELECT
  q.organization_id,
  'quote',
  'QT',
  '-',
  'sequential',
  4,
  8,
  MAX(
    CASE
      WHEN q.quote_number ~ '^QT-\d+$'
      THEN CAST(SUBSTRING(q.quote_number FROM 4) AS INT)
      ELSE 0
    END
  ) + 1
FROM quote q
GROUP BY q.organization_id
ON CONFLICT (organization_id, document_type) DO UPDATE
SET next_sequential_number = GREATEST(
  document_numbering_config.next_sequential_number,
  EXCLUDED.next_sequential_number
);

-- Seed invoice counters from existing invoice numbers
INSERT INTO document_numbering_config (
  organization_id, document_type, prefix, separator,
  id_strategy, sequential_padding, random_length, next_sequential_number
)
SELECT
  i.organization_id,
  'invoice',
  'INV',
  '-',
  'sequential',
  4,
  8,
  MAX(
    CASE
      WHEN i.invoice_number ~ '^INV-\d+$'
      THEN CAST(SUBSTRING(i.invoice_number FROM 5) AS INT)
      ELSE 0
    END
  ) + 1
FROM invoice i
GROUP BY i.organization_id
ON CONFLICT (organization_id, document_type) DO UPDATE
SET next_sequential_number = GREATEST(
  document_numbering_config.next_sequential_number,
  EXCLUDED.next_sequential_number
);
