// backend/orders-service/associations.js
module.exports = function setupAssociations(models) {
  // eslint-disable-next-line no-unused-vars
  const { User, Cart, CartItems, Produk, Orders, OrderItems, Invoice } = models;

  // User associations
  User.hasMany(Produk, {
    foreignKey: "user_id",
    as: "user_products",
    onDelete: 'CASCADE'
  });

  User.hasMany(Cart, {
    foreignKey: "user",
    as: "user_carts",
    onDelete: 'CASCADE'
  });

  User.hasMany(Orders, {
    foreignKey: "user",
    as: "user_orders",
    onDelete: 'CASCADE'
  });

  // Produk associations
  Produk.belongsTo(User, {
    foreignKey: "user_id",
    as: "product_owner",
    onDelete: 'CASCADE'
  });

  Produk.hasMany(CartItems, {
    foreignKey: "itemid",
    as: "product_cart_items",
    onDelete: 'CASCADE'
  });

  Produk.hasMany(OrderItems, {
    foreignKey: "itemid",
    as: "product_order_items",
    onDelete: 'CASCADE'
  });

  // Cart associations
  Cart.belongsTo(User, {
    foreignKey: "user",
    as: "cart_owner",
    onDelete: 'CASCADE'
  });

  // CartItems associations
  CartItems.belongsTo(Produk, {
    foreignKey: "itemid",
    as: "cart_item_product",
    onDelete: 'CASCADE'
  });

  // Orders associations
  Orders.belongsTo(User, {
    foreignKey: "user",
    as: "order_owner",
    onDelete: 'CASCADE'
  });

  Orders.hasMany(OrderItems, {
    foreignKey: "order_id",
    as: "order_items_list",
    onDelete: 'CASCADE'
  });

  // OrderItems associations
  OrderItems.belongsTo(Orders, {
    foreignKey: "order_id",
    as: "order_parent",
    onDelete: 'CASCADE'
  });

  OrderItems.belongsTo(Produk, {
    foreignKey: "itemid",
    as: "order_item_product",
    onDelete: 'CASCADE'
  });

  // Invoice associations - REMOVED duplicate definitions
  // These are already properly defined in orders.model.js
};