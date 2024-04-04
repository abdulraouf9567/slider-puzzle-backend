const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express()

app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

mongoose.connect('mongodb://localhost:27017/SliderPuzzle', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', function () {
  console.log('connected to the databse');
});

mongoose.connection.on('error', function (err) {
  console.error('Could not connected to the database: ' + err);
});
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/api/users/register', async(req, res) => {
  const { username, password } = req.body;
  try {

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
})


app.post('/api/users/login', async(req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'User does not exist' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({ message: 'Login successful', user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
})

app.get('/api/users', async (req, res) => {
  try {
    // Query the database for all user documents
    const users = await User.find();

    // Send the list of users as a response
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});




app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})