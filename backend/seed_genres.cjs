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
  for (let i = 0; i < GENRES.length; i++) {
    const g = GENRES[i];
    await supabase.from('genres').upsert({
      id: i + 1,
      name: g.label,
      slug: g.slug
    });
  }
  console.log('Done');
}
seed();
