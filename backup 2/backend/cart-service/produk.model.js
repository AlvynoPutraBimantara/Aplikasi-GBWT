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
      index: true, // MUL index in database
    },
    Stok: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW, // Maps to CURRENT_TIMESTAMP
    }
  },
  {
    tableName: "dataproduk",
    timestamps: false, // We're handling created_at manually
  }
);

module.exports = Produk;