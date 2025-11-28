const { MongoClient, ServerApiVersion } = require('mongodb');

const username = 'careerconnect';
const password = 'RuD_RE9tyTht73';
const cluster = 'cluster0.uiy2c.mongodb.net';
const uri = `mongodb+srv://${username}:${password}@${cluster}/?appName=Cluster0`;

console.log('Testing connection with username:', username);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await client.connect();
    
    // Test authentication with a simple command
    await client.db('admin').command({ ping: 1 });
    console.log('Authentication successful!');
    
    // List available databases to verify permissions
    const dbs = await client.db().admin().listDatabases();
    console.log('\nAccessible databases:');
    dbs.databases.forEach(db => console.log(` - ${db.name}`));

  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      console.error('DNS resolution failed - check cluster URL');
    } else if (err.code === 'MONGODB_ERROR') {
      console.error('Authentication failed - check username and password');
    } else {
      console.error('Connection error:', err);
    }
  } finally {
    await client.close();
  }
}

testConnection().catch(console.error);