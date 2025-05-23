const { DataTypes } = require("sequelize");
const sequelize = require("./db");

// Define the UserImages model (matches userimages table)
const UserImages = sequelize.define(
  "UserImages",
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
      type: DataTypes.BLOB("long"),
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
    tableName: "userimages",
    timestamps: false,
    freezeTableName: true,
    underscored: false,
    indexes: [
      {
        fields: ['user_id'],
        name: 'fk_userimages_user'
      }
    ]
  }
);

// Define the User model (matches user table)
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },
    NamaWarung: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Nama: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // In the User model definition, add unique constraint
Telp: {
  type: DataTypes.STRING(20),
  allowNull: true,
  unique: true // Add this line
},
    Alamat: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'guest'),
      allowNull: false,
      defaultValue: 'user'
    },
    imageUrl: {
      type: DataTypes.STRING(2083),
      allowNull: true,
    },
    is_guest: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  },
  {
    tableName: "user",
    timestamps: false,
    freezeTableName: true,
    underscored: false,
    defaultScope: {
      attributes: { exclude: ['Password'] } // Exclude password by default
    },
    scopes: {
      withPassword: {
        attributes: { include: ['Password'] } // Include when needed
      }
    }
  }
);

// Define associations
User.hasMany(UserImages, {
  foreignKey: 'user_id',
  as: 'images',
  onDelete: 'CASCADE'
});

UserImages.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE'
});

module.exports = { User, UserImages };