// produk.model.js
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
      field: 'imageUrl'  // Explicitly map to column name
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    user_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  },
  {
    tableName: "dataproduk",
    timestamps: false,
    freezeTableName: true,
    underscored: false,
    indexes: [
      {
        fields: ['Pedagang'],
        name: 'idx_pedagang'
      },
      {
        fields: ['user_id'],
        name: 'fk_dataproduk_user'
      }
    ],
    name: {
      singular: 'Produk',
      plural: 'Produks'
    }
  }
);

const ProdukImages = sequelize.define(
  "ProdukImages",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    data: {
      type: DataTypes.BLOB('long'),
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    upload_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    tableName: "productimages",
    timestamps: false
  }
);

// Define associations
Produk.hasOne(ProdukImages, {
  foreignKey: 'id',
  sourceKey: 'id',
  as: 'images',
  onDelete: 'CASCADE'
});

ProdukImages.belongsTo(Produk, {
  foreignKey: 'id',
  targetKey: 'id',
  as: 'product',
  onDelete: 'CASCADE'
});

module.exports = { Produk, ProdukImages };
