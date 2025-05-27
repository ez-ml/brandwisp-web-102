const { BigQuery } = require('@google-cloud/bigquery');
const fs = require('fs');
const path = require('path');

async function initBigQuery() {
  try {
    const bigquery = new BigQuery({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: 'brandwisp-dev', // Hardcoding the project ID
    });

    // Create dataset if it doesn't exist
    console.log('Creating dataset if it doesn\'t exist...');
    const [datasets] = await bigquery.getDatasets();
    const datasetExists = datasets.some(dataset => dataset.id === 'brandwisp_db');
    
    if (!datasetExists) {
      await bigquery.createDataset('brandwisp_db', {
        location: 'US' // or your preferred location
      });
      console.log('Dataset created successfully');
    } else {
      console.log('Dataset already exists');
    }

    // Read and execute the SQL script
    console.log('Creating table if it doesn\'t exist...');
    const sqlScript = fs.readFileSync(
      path.join(__dirname, '../src/lib/bigquery/schema/product_ideas.sql'),
      'utf8'
    );

    const [job] = await bigquery.createQueryJob({
      query: sqlScript,
      location: 'US'
    });

    await job.promise();
    console.log('Table created/updated successfully');

  } catch (error) {
    console.error('Error initializing BigQuery:', error);
    process.exit(1);
  }
}

initBigQuery(); 