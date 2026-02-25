require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const { sequelize, Reader, Journal, Sale, Shop } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'db-error', error: e.message });
  }
});

// 1) Какие журналы были куплены определённым покупателем?
// safe
app.get('/journals-by-reader', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'email query param is required' });

    const rows = await Sale.findAll({
      include: [
        { model: Reader, attributes: [] },
        { model: Journal, attributes: [] },
      ],
      where: { '$Reader.email$': email },
      attributes: [
        [sequelize.col('Reader.email'), 'reader'],
        [sequelize.col('Journal.name'), 'journal'],
      ],
      raw: true,
    });

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 2) Как называется журнал с заданным ISBN?
// vuln
app.get('/vuln/journal-by-isbn', async (req, res) => {
  try {
    const { isbn } = req.query;
    if (!isbn) return res.status(400).json({ error: 'isbn query param is required' });

    const query = `
      SELECT isbn, name AS journal
      FROM journal
      WHERE isbn = '${isbn}';
    `;

    const [rows] = await sequelize.query(query);
    res.json(rows[0] || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 3) Какой ISBN у журнала с заданным названием?
// safe
app.get('/isbn-by-name', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'name query param is required' });

    const row = await Journal.findOne({
      attributes: [['name', 'journal'], 'isbn'],
      where: { name },
      raw: true,
    });

    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 4) Когда журнал был куплен? (по названию)
// vuln
app.get('/vuln/purchases-by-journal-name', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'name query param is required' });

    const query = `
      SELECT j.name AS journal, s.date
      FROM transaction s
      JOIN journal j ON s.journal_id = j.id
      WHERE j.name = '${name}'
      ORDER BY s.date ASC;
    `;

    const [rows] = await sequelize.query(query);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 5) Кто из покупателей купил журнал более месяца назад?
// safe
app.get('/readers-old-purchases', async (req, res) => {
  try {
    const rows = await Sale.findAll({
      include: [
        { model: Journal, attributes: [] },
        { model: Reader, attributes: [] },
      ],
      where: Sequelize.where(
        Sequelize.col('date'),
        '<',
        Sequelize.literal(`NOW() - INTERVAL '1 month'`)
      ),
      attributes: [
        'date',
        [sequelize.col('Journal.name'), 'journal'],
        [sequelize.col('Reader.email'), 'reader'],
      ],
      order: [['date', 'ASC']],
      raw: true,
    });

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 6) Найти покупателя самых редких журналов (по наличию в магазине)
// safe
app.get('/buyers-of-rare-journals', async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      WITH rare_journal AS (
        SELECT j.id, j.name, COALESCE(SUM(c.amount), 0) AS copies
        FROM journal j
        LEFT JOIN catalog c ON j.id = c.journal_id
        GROUP BY j.id, j.name
        HAVING COALESCE(SUM(c.amount), 0) > 0
        ORDER BY copies ASC
        LIMIT 3
      )
      SELECT r.email AS reader, rj.name AS rare_journal, rj.copies
      FROM transaction t
      JOIN reader r ON t.reader_id = r.id
      JOIN rare_journal rj ON t.journal_id = rj.id;
    `);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 7) Какое число покупателей пользуется определённым магазином?
// vuln
app.get('/vuln/readers-by-shop', async (req, res) => {
  try {
    const { shopId } = req.query;
    if (!shopId) return res.status(400).json({ error: 'shopId query param is required' });

    const query = `
      SELECT COUNT(DISTINCT reader_id) AS readers
      FROM transaction
      WHERE shop_id = '${shopId}';
    `;

    const [rows] = await sequelize.query(query);
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 8) Сколько покупателей младше 20 лет?
// safe
app.get('/readers-younger-than-20', async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT COUNT(DISTINCT id) AS readers
      FROM reader
      WHERE birth_date > (CURRENT_DATE - INTERVAL '20 years');
    `);
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
