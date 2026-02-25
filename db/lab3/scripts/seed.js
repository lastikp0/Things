const { sequelize, Author, Branch, Catalog, Journal, JournalAuthor, Reader, Shop, Sale } = require('../models');

async function main() {
  // await sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  await sequelize.sync({ force: true });

  await Shop.bulkCreate([
    { id: '4db426cb-00e3-477c-9f78-9eaf82c968b3' },
    { id: 'a8029dce-c70b-43a7-bb69-0829d1d41bca' },
    { id: 'cd707836-60d4-4213-910d-eb6dad43fe86' },
    { id: '7e0f0fc4-fcf4-4bcb-a415-e0824f1b6412' },
    { id: 'dba0ed7e-d2fc-47d7-be1e-db8a3a9d0476' },
  ]);

  await Author.bulkCreate([
    { id: '737fbeb0-a0c4-4df1-a396-e4ae45377e86', name: 'Stan Lee' },
    { id: '008686be-9460-4b34-992c-4f2d2d75c44a', name: 'Bob Kane' },
    { id: 'fcd98444-756e-4fff-a7ad-2f481f142994', name: 'Jerry Siegel' },
    { id: '130d813f-6f13-4d6d-8a09-8fc1475658ea', name: 'Hajime Isayama' },
    { id: 'dd4b104b-df47-4637-a3f2-a3db44418dfa', name: 'Kohei Horikoshi' },
    { id: '5a4a8e0b-95a5-4d21-be43-c8494fabd4e3', name: 'Neil Gaiman' },
    { id: 'a8d3940a-0a00-4ab5-8af5-44b6ed46c999', name: 'Jason Latour' },
    { id: 'e01519a1-606f-4f2b-a6cd-9eb684ac1e8d', name: 'J. Torres' },
  ]);

  await Branch.bulkCreate([
    { id: 'a025e999-5b29-4a61-892a-201b3ff173aa', shop_id: '4db426cb-00e3-477c-9f78-9eaf82c968b3', name: 'Комиксы Marvel', capacity: 50 },
    { id: '1448d45d-cf20-4fc7-a53e-7a455a7b8d1c', shop_id: '4db426cb-00e3-477c-9f78-9eaf82c968b3', name: 'Комиксы DC', capacity: 45 },
    { id: 'ca339d8a-4dd8-4cdb-85b1-f7abc942f6a1', shop_id: 'a8029dce-c70b-43a7-bb69-0829d1d41bca', name: 'Манга и аниме', capacity: 60 },
    { id: '9bc65a0e-4deb-4952-98a3-aadec14fd6af', shop_id: 'a8029dce-c70b-43a7-bb69-0829d1d41bca', name: 'Графические романы', capacity: 35 },
    { id: '787f74cf-4583-44eb-88cf-ac20433017a3', shop_id: 'cd707836-60d4-4213-910d-eb6dad43fe86', name: 'Новинки', capacity: 40 },
    { id: 'b415ce4b-0d5c-4e59-8920-68c39e862b4e', shop_id: 'cd707836-60d4-4213-910d-eb6dad43fe86', name: 'Раритетные издания', capacity: 25 },
    { id: '7caf2960-6006-40c9-9455-a8d91a01f1b9', shop_id: '7e0f0fc4-fcf4-4bcb-a415-e0824f1b6412', name: 'Детские комиксы', capacity: 55 },
    { id: 'fc6b205a-3d6e-4862-baa0-1c5962fca291', shop_id: '7e0f0fc4-fcf4-4bcb-a415-e0824f1b6412', name: 'Западные комиксы', capacity: 48 },
    { id: '00943eb3-5a06-4f2b-93de-7f82ae5732a8', shop_id: 'dba0ed7e-d2fc-47d7-be1e-db8a3a9d0476', name: 'Супергерои', capacity: 52 },
    { id: '749ced6a-5a79-46bc-984e-98f5abe5bfd4', shop_id: 'dba0ed7e-d2fc-47d7-be1e-db8a3a9d0476', name: 'Научная фантастика', capacity: 38 },
  ]);

  await Journal.bulkCreate([
    { id: '0bc82198-02a1-4228-84fa-2c48f4c7c793', name: 'The Amazing Spider-Man', series: 1, publisher: 'Marvel', publishing_year: 2024, isbn: '978-1-302-95001-1', is_active: true },
    { id: 'ef947889-d288-4ded-86d2-5f26d46a9c85', name: 'X-Men', series: 7, publisher: 'Marvel', publishing_year: 2023, isbn: '978-1-302-93456-1', is_active: true },
    { id: 'f5751297-75b7-4283-a3e8-f4bd0a84168c', name: 'Batman: The Dark Knight', series: 1, publisher: 'DC Comics', publishing_year: 2024, isbn: '978-1-7795-1651-1', is_active: true },
    { id: 'd30d33f8-c0d9-4078-a4c0-86b67be587bb', name: 'Superman: Legacy', series: 3, publisher: 'DC Comics', publishing_year: 2023, isbn: '978-1-7795-1287-2', is_active: false },
    { id: '0045dc9a-8cef-4e17-976a-82a8b26ca9a4', name: 'Attack on Titan', series: 34, publisher: 'Kodansha', publishing_year: 2023, isbn: '978-1-63236-978-1', is_active: true },
    { id: 'eb7446ff-4ee3-410b-b41a-8d5ed0521cc6', name: 'My Hero Academia', series: 32, publisher: 'Shueisha', publishing_year: 2024, isbn: '978-1-9747-2345-6', is_active: true },
    { id: '655f827b-c785-4b43-979d-47b6f11d31d4', name: 'The Sandman: Overture', series: 1, publisher: 'Vertigo', publishing_year: 2023, isbn: '978-1-4012-6552-1', is_active: true },
    { id: '664969a2-0804-4390-9400-7c24f8eb2066', name: 'Spider-Gwen: Ghost-Spider', series: 1, publisher: 'Marvel', publishing_year: 2024, isbn: '978-1-302-95678-1', is_active: true },
    { id: '3497d265-40a6-43fc-8858-01a8e555fa5e', name: 'The Fantastic Four', series: 1, publisher: 'Marvel', publishing_year: 1961, isbn: '978-1-302-90001-1', is_active: false },
    { id: '1bb5c6ac-b86a-4d33-9e0a-f6a3e3dce2d5', name: 'Teen Titans Go!', series: 15, publisher: 'DC Comics', publishing_year: 2024, isbn: '978-1-7795-1789-1', is_active: true },
  ]);

  await JournalAuthor.bulkCreate([
    { journal_id: '0bc82198-02a1-4228-84fa-2c48f4c7c793', author_id: '737fbeb0-a0c4-4df1-a396-e4ae45377e86' },
    { journal_id: 'ef947889-d288-4ded-86d2-5f26d46a9c85', author_id: '737fbeb0-a0c4-4df1-a396-e4ae45377e86' },
    { journal_id: '3497d265-40a6-43fc-8858-01a8e555fa5e', author_id: '737fbeb0-a0c4-4df1-a396-e4ae45377e86' },
    { journal_id: 'f5751297-75b7-4283-a3e8-f4bd0a84168c', author_id: '008686be-9460-4b34-992c-4f2d2d75c44a' },
    { journal_id: 'd30d33f8-c0d9-4078-a4c0-86b67be587bb', author_id: 'fcd98444-756e-4fff-a7ad-2f481f142994' },
    { journal_id: '0045dc9a-8cef-4e17-976a-82a8b26ca9a4', author_id: '130d813f-6f13-4d6d-8a09-8fc1475658ea' },
    { journal_id: 'eb7446ff-4ee3-410b-b41a-8d5ed0521cc6', author_id: 'dd4b104b-df47-4637-a3f2-a3db44418dfa' },
    { journal_id: '655f827b-c785-4b43-979d-47b6f11d31d4', author_id: '5a4a8e0b-95a5-4d21-be43-c8494fabd4e3' },
    { journal_id: '664969a2-0804-4390-9400-7c24f8eb2066', author_id: 'a8d3940a-0a00-4ab5-8af5-44b6ed46c999' },
    { journal_id: '1bb5c6ac-b86a-4d33-9e0a-f6a3e3dce2d5', author_id: 'e01519a1-606f-4f2b-a6cd-9eb684ac1e8d' },
  ]);

  await Reader.bulkCreate([
    { id: '66c8c0fd-d849-43b4-ae97-5a7cf04a1d4e', email: 'ivan.petrov@email.com', name: 'Иван Петров',  birth_date: '1990-05-15', address: 'г. Москва, ул. Ленина, д. 10, кв. 25', phone: '+7-915-123-45-67' },
    { id: '5740d88c-701c-4137-a4ba-91f78e993467', email: 'anna.sidorova@email.com', name: 'Анна Сидорова',  birth_date: '1985-12-03', address: 'г. Санкт-Петербург, Невский пр-т, д. 50', phone: null },
    { id: '9477efca-4b5e-418b-8983-22c70e74eb2b', email: 'sergey.kozlov@email.com', name: 'Сергей Козлов',  birth_date: '1998-08-20', address: null, phone: '+7-916-987-65-43' },
    { id: '5d10d4b5-9045-4aa0-956d-65c56b204140', email: 'maria.ivanova@email.com', name: 'Мария Иванова',  birth_date: '2010-03-10', address: null, phone: null },
    { id: '11309de7-2b40-4ee2-ae96-c891faf5a9d1', email: 'dmitry.sokolov@email.com', name: 'Дмитрий Соколов', birth_date: '2011-11-28', address: 'г. Казань, ул. Баумана, д. 15', phone: null },
  ]);

  await Catalog.bulkCreate([
    { branch_id: 'a025e999-5b29-4a61-892a-201b3ff173aa', journal_id: '0bc82198-02a1-4228-84fa-2c48f4c7c793', amount: 12 },
    { branch_id: 'a025e999-5b29-4a61-892a-201b3ff173aa', journal_id: 'ef947889-d288-4ded-86d2-5f26d46a9c85', amount: 10 },
    { branch_id: '1448d45d-cf20-4fc7-a53e-7a455a7b8d1c', journal_id: 'f5751297-75b7-4283-a3e8-f4bd0a84168c', amount: 8 },
    { branch_id: 'ca339d8a-4dd8-4cdb-85b1-f7abc942f6a1', journal_id: '0045dc9a-8cef-4e17-976a-82a8b26ca9a4', amount: 15 },
    { branch_id: 'ca339d8a-4dd8-4cdb-85b1-f7abc942f6a1', journal_id: 'eb7446ff-4ee3-410b-b41a-8d5ed0521cc6', amount: 12 },
    { branch_id: '9bc65a0e-4deb-4952-98a3-aadec14fd6af', journal_id: '655f827b-c785-4b43-979d-47b6f11d31d4', amount: 5 },
    { branch_id: '787f74cf-4583-44eb-88cf-ac20433017a3', journal_id: '664969a2-0804-4390-9400-7c24f8eb2066', amount: 8 },
    { branch_id: '7caf2960-6006-40c9-9455-a8d91a01f1b9', journal_id: '1bb5c6ac-b86a-4d33-9e0a-f6a3e3dce2d5', amount: 10 },
    { branch_id: 'fc6b205a-3d6e-4862-baa0-1c5962fca291', journal_id: 'ef947889-d288-4ded-86d2-5f26d46a9c85', amount: 7 },
    { branch_id: '00943eb3-5a06-4f2b-93de-7f82ae5732a8', journal_id: '664969a2-0804-4390-9400-7c24f8eb2066', amount: 6 },
  ]);

  await Sale.bulkCreate([
    { id: '9a34773e-2d46-4a73-b099-ee745a62a3f6',  reader_id: '66c8c0fd-d849-43b4-ae97-5a7cf04a1d4e', shop_id: '4db426cb-00e3-477c-9f78-9eaf82c968b3', journal_id: '0bc82198-02a1-4228-84fa-2c48f4c7c793', date: '2024-01-15 10:30:00+03' },
    { id: 'c163b0ca-cd16-4585-ad0e-dc831927b090',  reader_id: '5740d88c-701c-4137-a4ba-91f78e993467', shop_id: '4db426cb-00e3-477c-9f78-9eaf82c968b3', journal_id: 'f5751297-75b7-4283-a3e8-f4bd0a84168c', date: '2024-01-16 14:20:00+03' },
    { id: 'c1f985bc-71cb-4719-bc64-c01ebc6d48d9',  reader_id: '9477efca-4b5e-418b-8983-22c70e74eb2b', shop_id: 'a8029dce-c70b-43a7-bb69-0829d1d41bca', journal_id: '0045dc9a-8cef-4e17-976a-82a8b26ca9a4', date: '2024-01-17 16:45:00+03' },
    { id: 'cabb4e87-f218-40f3-82ca-6b27b179c9ae',  reader_id: '5d10d4b5-9045-4aa0-956d-65c56b204140', shop_id: 'a8029dce-c70b-43a7-bb69-0829d1d41bca', journal_id: '655f827b-c785-4b43-979d-47b6f11d31d4', date: '2024-01-18 11:15:00+03' },
    { id: '008a3ef4-9786-4f28-9731-b581045cf338',  reader_id: '11309de7-2b40-4ee2-ae96-c891faf5a9d1', shop_id: 'cd707836-60d4-4213-910d-eb6dad43fe86', journal_id: '664969a2-0804-4390-9400-7c24f8eb2066', date: '2024-01-19 13:30:00+03' },
    { id: '5404b7d2-989d-4241-933e-3fe6492c291d',  reader_id: '66c8c0fd-d849-43b4-ae97-5a7cf04a1d4e', shop_id: '7e0f0fc4-fcf4-4bcb-a415-e0824f1b6412', journal_id: 'ef947889-d288-4ded-86d2-5f26d46a9c85', date: '2024-01-20 15:20:00+03' },
    { id: 'c2fb3ebd-361b-40a0-b060-bff05282bb84',  reader_id: '5740d88c-701c-4137-a4ba-91f78e993467', shop_id: '7e0f0fc4-fcf4-4bcb-a415-e0824f1b6412', journal_id: '1bb5c6ac-b86a-4d33-9e0a-f6a3e3dce2d5', date: '2024-01-21 12:40:00+03' },
    { id: '0f8aaeb5-8470-4723-97b9-3371f2f9cbea',  reader_id: '9477efca-4b5e-418b-8983-22c70e74eb2b', shop_id: 'a8029dce-c70b-43a7-bb69-0829d1d41bca', journal_id: 'eb7446ff-4ee3-410b-b41a-8d5ed0521cc6', date: '2024-01-22 17:10:00+03' },
    { id: '00a0bd29-88ee-4cbc-8503-76f9f2ea6499',  reader_id: '5d10d4b5-9045-4aa0-956d-65c56b204140', shop_id: 'dba0ed7e-d2fc-47d7-be1e-db8a3a9d0476', journal_id: 'ef947889-d288-4ded-86d2-5f26d46a9c85', date: '2024-01-23 09:50:00+03' },
    { id: '47e71442-9308-402c-8bd9-a4c1c1b8b786',  reader_id: '11309de7-2b40-4ee2-ae96-c891faf5a9d1', shop_id: '4db426cb-00e3-477c-9f78-9eaf82c968b3', journal_id: '0bc82198-02a1-4228-84fa-2c48f4c7c793', date: '2024-01-24 18:30:00+03' },
  ]);

  console.log('Schema synced and data seeded');
  await sequelize.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
