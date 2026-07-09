const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const GENRES = [
  { label: 'Tiên Hiệp', slug: 'tien-hiep' },
  { label: 'Kiếm Hiệp', slug: 'kiem-hiep' },
  { label: 'Huyền Huyễn', slug: 'huyen-huyen' },
  { label: 'Ngôn Tình', slug: 'ngon-tinh' },
  { label: 'Đô Thị', slug: 'do-thi' },
  { label: 'Võng Du', slug: 'vong-du' },
  { label: 'Fantasy', slug: 'fantasy' },
  { label: 'Sci-Fi', slug: 'sci-fi' },
  { label: 'Mystery', slug: 'mystery' },
];

async function seed() {
  try {
    const genresToUpsert = GENRES.map((g, i) => ({
      id: i + 1,
      name: g.label,
      slug: g.slug
    }));
    const { error } = await supabase.from('genres').upsert(genresToUpsert);
    if (error) throw error;
    console.log('Done');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}
seed();
