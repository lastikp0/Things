const { faker } = require('@faker-js/faker');
const { sequelize, Author, Branch, Catalog, Journal, JournalAuthor, Reader, Shop, Sale } = require('../models');

const argv = require('minimist')(process.argv.slice(2), {
  string: ['sizes', 'indexes'],
  default: { sizes: '100,1000,10000,1000000', limit: '100', indexes: 'on', runs: 2, batch: 10000 }
});

const SIZES = argv.sizes.split(',').map(s => parseInt(s, 10)).filter(Boolean);
const LIMIT = parseInt(argv.limit, 10);
const INDEXES_ON = argv.indexes === 'on';
const RUNS = parseInt(argv.runs, 10) || 1;
const BATCH = parseInt(argv.batch, 10) || 1000;

function nowMs() {
  return Number(process.hrtime.bigint() / 1000000n);
}

async function ensureBaseStaticData() {
  await Shop.bulkCreate([
    { id: '4db426cb-00e3-477c-9f78-9eaf82c968b3' },
    { id: 'a8029dce-c70b-43a7-bb69-0829d1d41bca' },
    { id: 'cd707836-60d4-4213-910d-eb6dad43fe86' },
    { id: '7e0f0fc4-fcf4-4bcb-a415-e0824f1b6412' },
    { id: 'dba0ed7e-d2fc-47d7-be1e-db8a3a9d0476' },
  ], { ignoreDuplicates: true });

  await Author.bulkCreate([
    { id: '737fbeb0-a0c4-4df1-a396-e4ae45377e86', name: 'Stan Lee' },
    { id: '008686be-9460-4b34-992c-4f2d2d75c44a', name: 'Bob Kane' },
    { id: 'fcd98444-756e-4fff-a7ad-2f481f142994', name: 'Jerry Siegel' },
    { id: '130d813f-6f13-4d6d-8a09-8fc1475658ea', name: 'Hajime Isayama' },
    { id: 'dd4b104b-df47-4637-a3f2-a3db44418dfa', name: 'Kohei Horikoshi' },
    { id: '5a4a8e0b-95a5-4d21-be43-c8494fabd4e3', name: 'Neil Gaiman' },
    { id: 'a8d3940a-0a00-4ab5-8af5-44b6ed46c999', name: 'Jason Latour' },
    { id: 'e01519a1-606f-4f2b-a6cd-9eb684ac1e8d', name: 'J. Torres' },
  ], { ignoreDuplicates: true });

  await Branch.bulkCreate([
    { id: 'a025e999-5b29-4a61-892a-201b3ff173aa', shop_id: '4db426cb-00e3-477c-9f78-9eaf82c968b3', name: 'Комиксы Marvel', capacity: 50 },
    { id: '1448d45d-cf20-4fc7-a53e-7a455a7b8d1c', shop_id: '4db426cb-00e3-477c-9f78-9eaf82c968b3', name: 'Комиксы DC', capacity: 45 },
    { id: 'ca339d8a-4dd8-4cdb-85b1-f7abc942f6a1', shop_id: 'a8029dce-c70b-43a7-bb69-0829d1d41bca', name: 'Манга и аниме', capacity: 60 },
  ], { ignoreDuplicates: true });
}

async function createIndexes() {
  const idxCmds = [
    `CREATE INDEX IF NOT EXISTS idx_reader_birth_date ON reader (birth_date);`,
    `CREATE INDEX IF NOT EXISTS idx_reader_email ON reader (email);`,
    `CREATE INDEX IF NOT EXISTS idx_journal_isbn ON journal (isbn);`,
    `CREATE INDEX IF NOT EXISTS idx_journal_name ON journal (name);`,
    `CREATE INDEX IF NOT EXISTS idx_catalog_amount ON catalog (amount);`,
    `CREATE INDEX IF NOT EXISTS idx_transaction_date ON transaction (date);`,
    `CREATE INDEX IF NOT EXISTS idx_transaction_journal_id ON transaction (journal_id);`,
    `CREATE INDEX IF NOT EXISTS idx_transaction_reader_id ON transaction (reader_id);`,
    `CREATE INDEX IF NOT EXISTS idx_transaction_shop_id ON transaction (shop_id);`,
  ];
  for (const cmd of idxCmds) {
    await sequelize.query(cmd);
  }
}

async function dropOurIndexes() {
  const drops = [
    `DROP INDEX IF EXISTS idx_reader_birth_date;`,
    `DROP INDEX IF EXISTS idx_reader_email;`,
    `DROP INDEX IF EXISTS idx_journal_isbn;`,
    `DROP INDEX IF EXISTS idx_journal_name;`,
    `DROP INDEX IF EXISTS idx_catalog_amount;`,
    `DROP INDEX IF EXISTS idx_transaction_date;`,
    `DROP INDEX IF EXISTS idx_transaction_journal_id;`,
    `DROP INDEX IF EXISTS idx_transaction_reader_id;`,
    `DROP INDEX IF EXISTS idx_transaction_shop_id;`,
  ];
  for (const cmd of drops) {
    await sequelize.query(cmd);
  }
}

async function bulkCreateInBatches(model, rows, batchSize = BATCH) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    await model.bulkCreate(chunk);
  }
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateDataForSize(n) {
  console.log(`--- Generating data: ${n} rows per table (batch=${BATCH}) ---`);

  const readers = [];
  for (let i = 0; i < n; ++i) {
    readers.push({
      email: `user_${n}_${i}@example.com`,
      name: faker.person.fullName(),
      birth_date: faker.date.birthdate({ min: 1940, max: 2015 }).toISOString().slice(0,10),
      address: faker.location.streetAddress(),
      phone: faker.phone.number(),
    });
  }
  await bulkCreateInBatches(Reader, readers);

  const journals = [];
  for (let i = 0; i < n; ++i) {
    journals.push({
      name: `Journal_${n}_${i}_${faker.word.noun()}`,
      series: faker.number.int({ min: 1, max: 100 }),
      publisher: faker.company.name(),
      publishing_year: faker.number.int({ min: 1950, max: 2025 }),
      isbn: faker.string.alphanumeric(13) + `-${n}-${i}`,
      is_active: faker.datatype.boolean?.() ?? (Math.random() > 0.5),
    });
  }
  await bulkCreateInBatches(Journal, journals);

  const journalIds = (await Journal.findAll({ attributes: ['id'], limit: n, order: [['id','ASC']], raw: true })).map(r => r.id);
  const branchRows = await Branch.findAll({ attributes: ['id'], raw: true });
  const branchIds = branchRows.map(b => b.id);

  const catalogs = [];
  for (let i = 0; i < n; ++i) {
    catalogs.push({
      branch_id: randChoice(branchIds),
      journal_id: journalIds[i % journalIds.length],
      amount: faker.number.int({ min: 0, max: 100 }),
    });
  }
  await bulkCreateInBatches(Catalog, catalogs);

  const shops = (await Shop.findAll({ attributes: ['id'], raw: true })).map(s => s.id);
  const readerIds = (await Reader.findAll({ attributes: ['id'], limit: n, order: [['id','ASC']], raw: true })).map(r => r.id);

  const sales = [];
  for (let i = 0; i < n; ++i) {
    sales.push({
      reader_id: randChoice(readerIds),
      shop_id: randChoice(shops),
      journal_id: randChoice(journalIds),
      date: faker.date.past({ years: 3 }).toISOString(),
    });
  }
  await bulkCreateInBatches(Sale, sales);

  const authorRows = await Author.findAll({ attributes: ['id'], raw: true });
  const authorIds = authorRows.map(a => a.id);

  const jlinks = [];
  for (let i = 0; i < n; ++i) {
    jlinks.push({
      journal_id: journalIds[i % journalIds.length],
      author_id: randChoice(authorIds),
    });
  }
  await bulkCreateInBatches(JournalAuthor, jlinks);

  console.log(`Data generation for ${n} done.`);
}

async function runQueries(limit, options = { order: true }) {
  const results = [];

  // 1) Journals bought by a specific buyer
  {
    const emailRow = await Reader.findOne({ attributes: ['email'], raw: true });
    const email = emailRow ? emailRow.email : null;
    if (email) {
      const label = `1) Journals by reader email${options.order ? ' ORDERED' : ''}`;
      const t0 = nowMs();
      await Sale.findAll({
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
        limit,
        order: options.order ? [['date','ASC']] : undefined,
      });
      const t1 = nowMs();
      results.push({ name: label, ms: t1 - t0 });
      console.log(`${label}: ${t1 - t0} ms`);
    }
  }

  // 2) Journal by ISBN
  {
    const j = await Journal.findOne({ attributes: ['isbn'], raw: true });
    if (j) {
      const isbn = j.isbn;
      const label = `2) Journal by ISBN`;
      const t0 = nowMs();
      await Journal.findOne({ where: { isbn }, attributes: ['isbn', ['name', 'journal']], raw: true });
      const t1 = nowMs();
      results.push({ name: label, ms: t1 - t0 });
      console.log(`${label}: ${t1 - t0} ms`);
    }
  }

  // 3) ISBN by journal name
  {
    const j = await Journal.findOne({ attributes: ['name'], raw: true });
    if (j) {
      const name = j.name;
      const label = `3) ISBN by journal name`;
      const t0 = nowMs();
      await Journal.findOne({ attributes: [['name','journal'], 'isbn'], where: { name }, raw: true });
      const t1 = nowMs();
      results.push({ name: label, ms: t1 - t0 });
      console.log(`${label}: ${t1 - t0} ms`);
    }
  }

  // 4) When a journal was bought? (by name)
  {
    const j = await Journal.findOne({ attributes: ['name'], raw: true });
    if (j) {
      const name = j.name;
      const label = `4) Purchases of journal ${options.order ? ' ORDERED' : ''}`;
      const t0 = nowMs();
      await Sale.findAll({
        include: [{ model: Journal, attributes: [] }],
        where: { '$Journal.name$': name },
        attributes: [
          [sequelize.col('Journal.name'), 'journal'],
          'date',
        ],
        order: options.order ? [['date', 'ASC']] : undefined,
        limit,
        raw: true,
      });
      const t1 = nowMs();
      results.push({ name: label, ms: t1 - t0 });
      console.log(`${label}: ${t1 - t0} ms`);
    }
  }

  // 5) Readers who bought more than 1 month ago
  {
    const label = `5) Readers who bought >1 month ago${options.order ? ' ORDERED' : ''}`;
    const t0 = nowMs();
    await Sale.findAll({
      include: [
        { model: Journal, attributes: [] },
        { model: Reader, attributes: [] },
      ],
      where: sequelize.where(
        sequelize.col('date'),
        '<',
        sequelize.literal(`NOW() - INTERVAL '1 month'`)
      ),
      attributes: [
        'date',
        [sequelize.col('Journal.name'), 'journal'],
        [sequelize.col('Reader.email'), 'reader'],
      ],
      order: options.order ? [['date', 'ASC']] : undefined,
      limit,
      raw: true,
    });
    const t1 = nowMs();
    results.push({ name: label, ms: t1 - t0 });
    console.log(`${label}: ${t1 - t0} ms`);
  }

  // 6) Readers who bought rare journals
  {
    const label = `6) Buyers of rare journals (always ORDERED)`;
    const t0 = nowMs();
    await sequelize.query(`
      WITH rare_journal AS (
        SELECT j.id, j.name, COALESCE(SUM(c.amount), 0) AS copies
        FROM journal j
        LEFT JOIN catalog c ON j.id = c.journal_id
        GROUP BY j.id, j.name
        HAVING COALESCE(SUM(c.amount), 0) > 0
        ORDER BY copies ASC
        LIMIT ${Math.max(1, Math.floor(limit/10))}
      )
      SELECT r.email AS reader, rj.name AS rare_journal, rj.copies
      FROM "transaction" t
      JOIN reader r ON t.reader_id = r.id
      JOIN rare_journal rj ON t.journal_id = rj.id
      LIMIT ${limit};
    `);
    const t1 = nowMs();
    results.push({ name: label, ms: t1 - t0 });
    console.log(`${label}: ${t1 - t0} ms`);
  }

  // 7) Distinct readers for shop (count)
  {
    const shop = await Shop.findOne({ attributes: ['id'], raw: true });
    if (shop) {
      const label = `7) Distinct readers for shop (count)`;
      const t0 = nowMs();
      await Sale.count({
        where: { shop_id: shop.id },
        distinct: true,
        col: 'reader_id',
      });
      const t1 = nowMs();
      results.push({ name: label, ms: t1 - t0 });
      console.log(`${label}: ${t1 - t0} ms`);
    }
  }

  // 8) Readers younger than 20
  {
    const label = `8) Readers younger than 20`;
    const t0 = nowMs();
    await sequelize.query(`
      SELECT COUNT(DISTINCT id) AS readers
      FROM reader
      WHERE birth_date > (CURRENT_DATE - INTERVAL '20 years')
      LIMIT ${limit};
    `);
    const t1 = nowMs();
    results.push({ name: label, ms: t1 - t0 });
    console.log(`${label}: ${t1 - t0} ms`);
  }

  return results;
}

async function runBenchForSize(n) {
  console.log(`\n=== RUN for size ${n} ===`);
  await sequelize.sync({ force: true });

  await ensureBaseStaticData();

  const genT0 = nowMs();
  await generateDataForSize(n);
  const genT1 = nowMs();
  console.log(`Data gen time: ${genT1 - genT0} ms`);

  if (INDEXES_ON) {
    console.log('Creating indexes...');
    await createIndexes();
  }

  const aggregated = [];

  if (INDEXES_ON) {
    for (let pass = 0; pass < RUNS; ++pass) {
      console.log(`\n--- Run ${pass+1}/${RUNS} (order=OFF, indexes=ON) ---`);
      const resNoOrder = await runQueries(LIMIT, { order: false });
      console.log(`\n--- Run ${pass+1}/${RUNS} (order=ON, indexes=ON) ---`);
      const resOrder = await runQueries(LIMIT, { order: true });

      aggregated.push({ noOrder: resNoOrder, order: resOrder, indexes: true});
    }

    console.log('\nDropping indexes to measure effect without them...');
    await dropOurIndexes();
  }

  for (let pass = 0; pass < RUNS; ++pass) {
    console.log(`\n--- Run ${pass+1}/${RUNS} (order=OFF, indexes=OFF) ---`);
    const resNoOrder = await runQueries(LIMIT, { order: false });
    console.log(`\n--- Run ${pass+1}/${RUNS} (order=ON, indexes=OFF) ---`);
    const resOrder = await runQueries(LIMIT, { order: true });

    aggregated.push({ noOrder: resNoOrder, order: resOrder, indexes: false});
  }

  return { genMs: genT1 - genT0, aggregated };
}

(async () => {
  console.log('BENCH START', { SIZES, LIMIT, INDEXES_ON, RUNS, BATCH });
  for (const n of SIZES) {
    try {
      const res = await runBenchForSize(n);
      console.log(`\n=== Summary for size ${n} ===`);
      console.log(`Data generation time: ${res.genMs} ms`);

      const data = res.aggregated;

      const grouped = {
        true:  data.filter(x => x.indexes === true),
        false: data.filter(x => x.indexes === false)
      };

      const avgByName = (arr, key) => {
        const sums = {};
        const counts = {};
      
        for (const item of arr) {
          for (const { name, ms } of item[key]) {
            sums[name] = (sums[name] ?? 0) + ms;
            counts[name] = (counts[name] ?? 0) + 1;
          }
        }
      
        const result = {};
        for (const name of Object.keys(sums)) {
          const avg = sums[name] / (counts[name] || 1);
          result[name] = Number(avg.toFixed(2));
        }
      
        return result;
      };

      const modes = [
        { key: 'noOrder', label: 'order=OFF' },
        { key: 'order',   label: 'order=ON'  },
      ];

      const idxFlags = [
        { value: false, label: 'indexes=OFF' },
        { value: true,  label: 'indexes=ON'  },
      ];

      for (const { value: idxVal, label: idxLabel } of idxFlags) {
        const group = grouped[idxVal];
      
        for (const { key, label: modeLabel } of modes) {
          const averages = avgByName(group, key);
        
          console.log(`\n--- Average time (${modeLabel}, ${idxLabel}) ---`);
          for (const [name, ms] of Object.entries(averages)) {
            console.log(`${name}: ${ms} ms`);
          }
        }
      }
    } catch (err) {
      console.error(`Error while running bench for size ${n}:`, err);
    }
  }

  console.log('\nAll sizes done. Closing connection.');
  await sequelize.close();
  process.exit(0);
})();
