const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Produk = sequelize.define(
  "Produk",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    Nama: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Harga: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    Harga_diskon: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    Kategori: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Pedagang: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Stok: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "dataproduk",
    timestamps: false,
  }
);

const ProdukImages = sequelize.define("ProdukImages", {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false,
  },
  productId: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  mimetype: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  data: {
    type: DataTypes.BLOB("long"),
    allowNull: false,
  },
});


module.exports = { Produk, ProdukImages };


