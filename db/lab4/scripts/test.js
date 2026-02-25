const { sequelize, Reader, Journal, Sale, Shop } = require('../models');
const { Op, Sequelize } = require('sequelize');

async function run() {
  // 1) Какие журналы были куплены определенным покупателем?
  {
    const email = 'ivan.petrov@email.com';
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
    console.log('\n1) Journals by reader email:', rows);
  }

  // 2) Как называется журнал с заданным ISBN?
  {
    const isbn = '978-1-302-95001-1';
    const row = await Journal.findOne({
      attributes: ['isbn', ['name', 'journal']],
      where: { isbn },
      raw: true,
    });
    console.log('\n2) Journal by ISBN:', row);
  }

  // 3) Какой ISBN у журнала с заданным названием?
  {
    const name = 'Teen Titans Go!';
    const row = await Journal.findOne({
      attributes: [['name', 'journal'], 'isbn'],
      where: { name },
      raw: true,
    });
    console.log('\n3) ISBN by journal name:', row);
  }

  // 4) Когда журнал был куплен? (по названию)
  {
    const name = 'Teen Titans Go!';
    const rows = await Sale.findAll({
      include: [{ model: Journal, attributes: [] }],
      where: { '$Journal.name$': name },
      attributes: [
        [sequelize.col('Journal.name'), 'journal'],
        'date',
      ],
      order: [['date', 'ASC']],
      raw: true,
    });
    console.log('\n4) Purchases of journal:', rows);
  }

  // 5) Кто из покупателей купил журнал более месяца назад?
  {
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
    console.log('\n5) Readers who bought > 1 month ago:', rows);
  }

  // 6) Найти покупателя самых редких журналов (по наличию в магазине).
  // raw SQL
  {
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
    console.log('\n6) Buyers of rare journals:', rows);
  }

  // 7) Какое число покупателей пользуется определенным магазином?
  {
    const shopId = '4db426cb-00e3-477c-9f78-9eaf82c968b3';
    const count = await Sale.count({
      where: { shop_id: shopId },
      distinct: true,
      col: 'reader_id',
    });
    console.log('\n7) Distinct readers for shop:', count);
  }

  // 8) Сколько покупателей младше 20 лет?
  {
    const [row] = await sequelize.query(`
      SELECT COUNT(DISTINCT id) AS readers
      FROM reader
      WHERE birth_date > (CURRENT_DATE - INTERVAL '20 years');
    `);
    console.log('\n8) Readers younger than 20:', row[0]);
  }

  await sequelize.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
