const { MongoClient } = require('mongodb');

export default async function handler(req, res) {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(); // Uses the default database from your connection string
    const tasks = await db.collection('tasks').find({}).toArray();
    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}