const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];
let orders = [];
const reels = [
  { id: 1, restaurant: 'Burger King', dish: 'Whopper Burger', price: 199, color: '#ff6b6b' },
  { id: 2, restaurant: 'Pizza Hut', dish: 'Margherita Pizza', price: 299, color: '#ffa500' },
  { id: 3, restaurant: 'KFC', dish: 'Crispy Chicken', price: 249, color: '#ff4500' },
  { id: 4, restaurant: 'Dominos', dish: 'Pasta Italiana', price: 179, color: '#e85d04' },
  { id: 5, restaurant: 'Subway', dish: 'Veggie Sandwich', price: 149, color: '#2ecc71' },
  { id: 6, restaurant: 'McDonalds', dish: 'McChicken Burger', price: 179, color: '#f39c12' },
  { id: 7, restaurant: 'Pizza Hut', dish: 'Chicken Pizza', price: 349, color: '#8e44ad' }
];

app.get('/', (req, res) => {
  res.send('FoodReels Backend is running!');
});

app.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const newUser = { id: users.length + 1, name, email, password, role };
  users.push(newUser);
  res.json({ message: 'Registered successfully', user: { name, email, role } });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }
  res.json({ message: 'Login successful', user: { name: user.name, email, role: user.role } });
});

app.get('/reels', (req, res) => {
  res.json(reels);
});

app.post('/reels', (req, res) => {
  const { restaurant, dish, price, color } = req.body;
  const newReel = { id: reels.length + 1, restaurant, dish, price, color };
  reels.push(newReel);
  res.json({ message: 'Reel uploaded successfully', reel: newReel });
});

app.post('/order', (req, res) => {
  const { dish, price, customer } = req.body;
  const newOrder = { id: orders.length + 1, dish, price, customer, status: 'New' };
  orders.push(newOrder);
  res.json({ message: 'Order placed successfully', order: newOrder });
});

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.delete('/orders/clear', (req, res) => {
  orders = [];
  res.json({ message: 'Orders cleared' });
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});