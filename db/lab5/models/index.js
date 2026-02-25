const { sequelize } = require('../config/database');
const { DataTypes, Sequelize } = require('sequelize');

// MODELS

// author
const Author = sequelize.define('Author', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
  name: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'author',
});

// shop
const Shop = sequelize.define('Shop', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
}, {
  tableName: 'shop',
});

// branch
const Branch = sequelize.define('Branch', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
  shop_id: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'branch',
});

// journal
const Journal = sequelize.define('Journal', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
  name: { type: DataTypes.STRING, allowNull: false },
  series: { type: DataTypes.INTEGER, allowNull: false },
  publisher: { type: DataTypes.STRING, allowNull: false },
  publishing_year: { type: DataTypes.INTEGER, allowNull: false },
  isbn: { type: DataTypes.STRING, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false },
}, {
  tableName: 'journal',
  indexes: [
    { name: 'idx_journal_isbn', fields: ['isbn'] },
    { name: 'idx_journal_name', fields: ['name'] },
  ],
});

// reader
const Reader = sequelize.define('Reader', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  birth_date: { type: DataTypes.DATEONLY, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'reader',
  indexes: [
    { name: 'idx_reader_birth_date', fields: ['birth_date'] },
  ],
});

// catalog
const Catalog = sequelize.define('Catalog', {
  branch_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  journal_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  amount: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'catalog',
  indexes: [
    { name: 'idx_catalog_amount', fields: ['amount'] },
  ],
});

// journal_author
const JournalAuthor = sequelize.define('JournalAuthor', {
  journal_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
  author_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
}, {
  tableName: 'journal_author',
});

// transaction, internally called Sale due to sequelize.transaction()
const Sale = sequelize.define('Sale', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
  reader_id: { type: DataTypes.UUID, allowNull: false },
  shop_id: { type: DataTypes.UUID, allowNull: false },
  journal_id: { type: DataTypes.UUID, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'transaction',
  indexes: [
    { name: 'idx_transaction_date', fields: ['date'] },
    { name: 'idx_transaction_journal_id', fields: ['journal_id'] },
    { name: 'idx_transaction_reader_id', fields: ['reader_id'] },
    { name: 'idx_transaction_shop_id', fields: ['shop_id'] },
  ],
});

// ASSOCIATIONS
// Shop --> Branch
Shop.hasMany(Branch, { foreignKey: 'shop_id', onDelete: 'RESTRICT' });
Branch.belongsTo(Shop, { foreignKey: 'shop_id', onDelete: 'RESTRICT' });

// Branch --> Catalog <-- Journal
Branch.hasMany(Catalog, { foreignKey: 'branch_id', onDelete: 'RESTRICT' });
Catalog.belongsTo(Branch, { foreignKey: 'branch_id', onDelete: 'RESTRICT' });
Journal.hasMany(Catalog, { foreignKey: 'journal_id', onDelete: 'RESTRICT' });
Catalog.belongsTo(Journal, { foreignKey: 'journal_id', onDelete: 'RESTRICT' });

// Journal --> JournalAuthor <-- Author
Journal.belongsToMany(Author, { through: JournalAuthor, foreignKey: 'journal_id', otherKey: 'author_id', onDelete: 'RESTRICT' });
Author.belongsToMany(Journal, { through: JournalAuthor, foreignKey: 'author_id', otherKey: 'journal_id', onDelete: 'RESTRICT' });

// Reader --> Sale <-- Journal
//              ^
//              | Shop
Reader.hasMany(Sale, { foreignKey: 'reader_id', onDelete: 'RESTRICT' });
Sale.belongsTo(Reader, { foreignKey: 'reader_id', onDelete: 'RESTRICT' });
Shop.hasMany(Sale, { foreignKey: 'shop_id', onDelete: 'RESTRICT' });
Sale.belongsTo(Shop, { foreignKey: 'shop_id', onDelete: 'RESTRICT' });
Journal.hasMany(Sale, { foreignKey: 'journal_id', onDelete: 'RESTRICT' });
Sale.belongsTo(Journal, { foreignKey: 'journal_id', onDelete: 'RESTRICT' });

module.exports = {
  sequelize,
  Author, Branch, Catalog, Journal, JournalAuthor, Reader, Shop, Sale,
};
