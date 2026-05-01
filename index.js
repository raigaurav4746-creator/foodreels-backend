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
  color: String,
  openTime: { type: String, default: '09:00' },
  closeTime: { type: String, default: '22:00' },
  deliveryTime: { type: String, default: '30-45 mins' },
  minOrder: { type: Number, default: 99 }
});

const orderSchema = new mongoose.Schema({
  dish: String,
  price: Number,
  customer: String,
  restaurant: String,
  status: { type: String, default: 'New' },
  createdAt: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema({
  reelId: String,
  user: String,
  comment: String,
  rating: Number,
  time: String
});

const complaintSchema = new mongoose.Schema({
  customer: String,
  subject: String,
  message: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Reel = mongoose.model('Reel', reelSchema);
const Order = mongoose.model('Order', orderSchema);
const Review = mongoose.model('Review', reviewSchema);
const Complaint = mongoose.model('Complaint', complaintSchema);

const initReels = async () => {
  const count = await Reel.countDocuments();
  if (count === 0) {
    await Reel.insertMany([
      { restaurant: 'Burger King', dish: 'Whopper Burger', price: 199, color: '#ff6b6b', openTime: '10:00', closeTime: '23:00', deliveryTime: '25-35 mins', minOrder: 99 },
      { restaurant: 'Pizza Hut', dish: 'Margherita Pizza', price: 299, color: '#ffa500', openTime: '11:00', closeTime: '23:00', deliveryTime: '30-45 mins', minOrder: 149 },
      { restaurant: 'KFC', dish: 'Crispy Chicken', price: 249, color: '#ff4500', openTime: '10:00', closeTime: '23:00', deliveryTime: '20-30 mins', minOrder: 99 },
      { restaurant: 'Dominos', dish: 'Pasta Italiana', price: 179, color: '#e85d04', openTime: '10:00', closeTime: '23:59', deliveryTime: '30-40 mins', minOrder: 99 },
      { restaurant: 'Subway', dish: 'Veggie Sandwich', price: 149, color: '#2ecc71', openTime: '09:00', closeTime: '22:00', deliveryTime: '20-30 mins', minOrder: 99 },
      { restaurant: 'McDonalds', dish: 'McChicken Burger', price: 179, color: '#f39c12', openTime: '08:00', closeTime: '23:59', deliveryTime: '20-30 mins', minOrder: 99 },
      { restaurant: 'Pizza Hut', dish: 'Chicken Pizza', price: 349, color: '#8e44ad', openTime: '11:00', closeTime: '23:00', deliveryTime: '30-45 mins', minOrder: 149 }
    ]);
    console.log('Default reels added!');
  }
};

mongoose.connection.once('open', initReels);

app.get('/', (req, res) => {
  res.send('FoodReels Backend running with MongoDB!');
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
    const reelsWithId = reels.map(r => ({
      id: r._id.toString(),
      restaurant: r.restaurant,
      dish: r.dish,
      price: r.price,
      color: r.color,
      openTime: r.openTime || '09:00',
      closeTime: r.closeTime || '22:00',
      deliveryTime: r.deliveryTime || '30-45 mins',
      minOrder: r.minOrder || 99
    }));
    res.json(reelsWithId);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/reels', async (req, res) => {
  try {
    const { restaurant, dish, price, color, openTime, closeTime, deliveryTime, minOrder } = req.body;
    if (!restaurant || !dish || !price) {
      return res.status(400).json({ message: 'Restaurant, dish and price are required' });
    }
    const newReel = new Reel({
      restaurant, dish,
      price: parseInt(price),
      color: color || '#e85d04',
      openTime: openTime || '09:00',
      closeTime: closeTime || '22:00',
      deliveryTime: deliveryTime || '30-45 mins',
      minOrder: parseInt(minOrder) || 99
    });
    await newReel.save();
    res.json({ message: 'Reel added successfully!', reel: newReel });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/order', async (req, res) => {
  try {
    const { dish, price, customer, restaurant } = req.body;
    const newOrder = new Order({ dish, price, customer, restaurant: restaurant || 'Unknown' });
    await newOrder.save();
    res.json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/orders/restaurant/:restaurant', async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.params.restaurant }).sort({ createdAt: -1 });
    res.json(orders);
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

app.post('/complaints', async (req, res) => {
  try {
    const { customer, subject, message } = req.body;
    if (!customer || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const newComplaint = new Complaint({ customer, subject, message });
    await newComplaint.save();
    res.json({ message: 'Complaint submitted successfully!', complaint: newComplaint });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});