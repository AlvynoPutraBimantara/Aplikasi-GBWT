require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Cart, CartItems } = require('./cart.model');
const { Produk } = require('./produk.model');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3004;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Generate random ID
const generateRandomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'cart-service' });
});

// Get cart for user
app.get('/cart', async (req, res) => {
  const { user } = req.query;
  try {
    const cart = await Cart.findOne({
      where: { user },
      include: [{ model: CartItems, as: 'cart_items' }],
    });
    res.status(200).json(cart ? cart.cart_items : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// Add to cart
app.post('/cart', async (req, res) => {
  try {
    const { user, itemid, name, price, quantity, pedagang } = req.body;

    const product = await Produk.findOne({ where: { id: itemid } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const finalPrice = product.Harga_diskon || price;

    let cart = await Cart.findOne({ where: { user } });
    if (!cart) cart = await Cart.create({ id: generateRandomId(), user });

    const existingItem = await CartItems.findOne({ where: { cart_id: cart.id, itemid } });

    if (existingItem) {
      const updatedQuantity = existingItem.quantity + quantity;
      await CartItems.update(
        { quantity: updatedQuantity },
        { where: { id: existingItem.id } }
      );
      return res.status(200).json({ message: 'Quantity updated' });
    }

    await CartItems.create({
      id: generateRandomId(),
      cart_id: cart.id,
      itemid,
      name,
      price: finalPrice,
      quantity,
      pedagang,
    });

    res.status(201).json({ message: 'Item added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item
app.put('/cart/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const cartItem = await CartItems.findOne({ where: { id } });
    if (!cartItem) return res.status(404).json({ error: 'Cart item not found' });

    const product = await Produk.findOne({
      where: { id: cartItem.itemid },
      attributes: ['Stok'],
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const clampedQuantity = Math.min(quantity, product.Stok);
    await CartItems.update(
      { quantity: clampedQuantity },
      { where: { id } }
    );

    res.status(200).json({ message: 'Quantity updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Delete cart item
app.delete('/cart/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const cartItem = await CartItems.findOne({ where: { id } });
    if (!cartItem) return res.status(404).json({ error: 'Cart item not found' });

    const cartId = cartItem.cart_id;
    await CartItems.destroy({ where: { id } });
    
    const remainingItems = await CartItems.count({ where: { cart_id: cartId } });
    if (remainingItems === 0) await Cart.destroy({ where: { id: cartId } });
    
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete cart item' });
  }
});

// Clear cart
app.delete('/cart', async (req, res) => {
  const { user } = req.query;
  try {
    const cart = await Cart.findOne({ where: { user } });
    if (cart) {
      await CartItems.destroy({ where: { cart_id: cart.id } });
      await Cart.destroy({ where: { id: cart.id } });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Error handling
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Cart service running on port ${port}`);
});