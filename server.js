
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URIs
const restaurantDBUri = 'mongodb://localhost:27017/restaurantDB';
const formDBUri = 'mongodb://localhost:27017/formSubmissionDB';

// Connecting to restaurantDB
const restaurantDBConnection = mongoose.createConnection(restaurantDBUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

restaurantDBConnection.on('open', () =>
  console.log(`Connected to MongoDB: restaurantDB`)
);
restaurantDBConnection.on('error', (err) =>
  console.error('MongoDB connection error (restaurantDB):', err)
);

// Connecting to formSubmissionDB
const formDBConnection = mongoose.createConnection(formDBUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

formDBConnection.on('open', () =>
  console.log(`Connected to MongoDB: formSubmissionDB`)
);
formDBConnection.on('error', (err) =>
  console.error('MongoDB connection error (formSubmissionDB):', err)
);

// Schemas
const CartItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  img: { type: String, required: true },
});

const FormSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const TableBookingSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  bookedAt: { type: Date, default: Date.now },
});

// Models
const CartItem = restaurantDBConnection.model('CartItem', CartItemSchema);
const TableBooking = restaurantDBConnection.model('TableBooking', TableBookingSchema);
const FormSubmission = formDBConnection.model('FormSubmission', FormSubmissionSchema);

// Routes

// Root route (fixes "Cannot GET /")
app.get('/', (req, res) => {
  res.send('Server is running! Use specific API endpoints for data access.');
});

// Cart Management
app.post('/api/cart', async (req, res) => {
  try {
    const newItem = new CartItem(req.body);
    await newItem.save();
    res.status(200).json({ message: 'Item added to cart', item: newItem });
  } catch (err) {
    console.error('Error adding item to cart:', err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

app.get('/api/cart', async (req, res) => {
  try {
    const items = await CartItem.find();
    res.status(200).json(items);
  } catch (err) {
    console.error('Error fetching cart items:', err);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    await CartItem.deleteMany({});
    res.status(200).json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Form Submissions
app.post('/api/forms', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const formSubmission = new FormSubmission(req.body);
    await formSubmission.save();
    res.status(200).json({
      message: 'Form submitted successfully',
      form: formSubmission,
    });
  } catch (err) {
    console.error('Error submitting form:', err);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

app.get('/api/forms', async (req, res) => {
  try {
    const forms = await FormSubmission.find();
    res.status(200).json(forms);
  } catch (err) {
    console.error('Error fetching form submissions:', err);
    res.status(500).json({ error: 'Failed to fetch form submissions' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
