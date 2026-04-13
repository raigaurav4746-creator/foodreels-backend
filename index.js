const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

const MONGODB_URI = 'mongodb+srv://raigaurav4746_db_user:2Ymdwj4hbVVt9eB2@cluster0.xqigu6q.mongodb.net/foodreels?appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.log('MongoDB error:', err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String
});

const reelSchema = new mongoose.Schema({
  restaurant: String,
  dish: String,
  price: Number,
  color: String
});

const orderSchema = new mongoose.Schema({
  dish: String,
  price: Number,
  customer: String,
  status: { type: String, default: 'New' }
});

const reviewSchema = new mongoose.Schema({
  reelId: Number,
  user: String,
  comment: String,
  rating: Number,
  time: String
});

const User = mongoose.model('User', userSchema);
const Reel = mongoose.model('Reel', reelSchema);
const Order = mongoose.model('Order', orderSchema);
const Review = mongoose.model('Review', reviewSchema);

const initReels = async () => {
  const count = await Reel.countDocuments();
  if (count === 0) {
    await Reel.insertMany([
      { restaurant: 'Burger King', dish: 'Whopper Burger', price: 199, color: '#ff6b6b' },
      { restaurant: 'Pizza Hut', dish: 'Margherita Pizza', price: 299, color: '#ffa500' },
      { restaurant: 'KFC', dish: 'Crispy Chicken', price: 249, color: '#ff4500' },
      { restaurant: 'Dominos', dish: 'Pasta Italiana', price: 179, color: '#e85d04' },
      { restaurant: 'Subway', dish: 'Veggie Sandwich', price: 149, color: '#2ecc71' },
      { restaurant: 'McDonalds', dish: 'McChicken Burger', price: 179, color: '#f39c12' },
      { restaurant: 'Pizza Hut', dish: 'Chicken Pizza', price: 349, color: '#8e44ad' }
    ]);
    console.log('Reels initialized!');
  }
};

mongoose.connection.once('open', initReels);

app.get('/', (req, res) => {
  res.send('FoodReels Backend is running with MongoDB!');
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.json({ message: 'Registered successfully', user: { name, email, role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    res.json({ message: 'Login successful', user: { name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/reels', async (req, res) => {
  try {
    const reels = await Reel.find();
    const reelsWithId = reels.map((r, i) => ({
      id: i + 1,
      restaurant: r.restaurant,
      dish: r.dish,
      price: r.price,
      color: r.color
    }));
    res.json(reelsWithId);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/reels', async (req, res) => {
  try {
    const { restaurant, dish, price, color } = req.body;
    const newReel = new Reel({ restaurant, dish, price, color });
    await newReel.save();
    res.json({ message: 'Reel uploaded successfully', reel: newReel });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/order', async (req, res) => {
  try {
    const { dish, price, customer } = req.body;
    const newOrder = new Order({ dish, price, customer });
    await newOrder.save();
    res.json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/orders/clear', async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: 'Orders cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/reviews', async (req, res) => {
  try {
    const { reelId, user, comment, rating } = req.body;
    const time = new Date().toLocaleTimeString();
    const newReview = new Review({ reelId, user, comment, rating, time });
    await newReview.save();
    res.json({ message: 'Review added!', review: newReview });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});