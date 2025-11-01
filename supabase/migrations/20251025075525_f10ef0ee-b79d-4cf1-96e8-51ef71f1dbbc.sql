-- Poista tuplat numerointi_asetukset-taulusta (säilytä vanhat rivit)
DELETE FROM numerointi_asetukset 
WHERE id IN (
  '5f1fd30a-dda2-40c1-b95c-1889ccf1de5e',
  '8e9edc0e-4b21-4b7c-ab64-ab3fa91cfee3',
  '5b8b1874-9809-48b2-90d7-13fe10bd31f0'
);

-- Poista tuplat service_statuses-taulusta (säilytä vanhat rivit)
DELETE FROM service_statuses 
WHERE id IN (
  'ebdcae54-0369-4729-a4af-16e95904c344',
  '1f5dd1b3-8c73-4d05-86aa-7ae39e23bed7',
  '2ba5ff72-555b-4553-99ef-998bb31cece6',
  '67493fa9-5c6e-4904-80a7-b2cbd569325e'
);