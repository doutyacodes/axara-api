// api/submit.js
export default function handler(req, res) {
    if (req.method === 'POST') {
      const { name, age } = req.body;
      res.status(200).json({ message: `Received data: Name: ${name}, Age: ${age}` });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  