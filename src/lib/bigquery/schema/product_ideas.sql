CREATE TABLE IF NOT EXISTS `brandwisp-dev.brandwisp_db.product_ideas` (
  id STRING NOT NULL,
  userId STRING NOT NULL,
  title STRING,
  description STRING,
  imageUrl STRING,
  inputType STRING NOT NULL,
  targetMarket STRING,
  priceRange STRING,
  analysis JSON,
  trendSignal STRING,
  searchabilityIndex STRING,
  visualAppeal STRING,
  competitiveNiche STRING,
  marketSummary STRING,
  suggestedKeywords ARRAY<STRING>,
  competitorInsights ARRAY<STRUCT<
    name STRING,
    price STRING,
    rating FLOAT64,
    marketShare STRING
  >>,
  potentialMarkets ARRAY<STRING>,
  status STRING NOT NULL,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL,
  tags ARRAY<STRING>,
  metadata JSON
)
PARTITION BY DATE(createdAt)
CLUSTER BY userId; 