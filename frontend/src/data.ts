import { Book, Chapter, Comment } from './types';

export const FEATURED_BOOK = {
  id: 'featured-1',
  title: 'Đại Đạo Tranh Phong',
  author: 'Unknown',
  coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVnDN7_2njwvETWKLNDXtuCPO9qGjWATU9vyCUTvwGxweuf4ojgbQKIheHkJDYqOUSxhHRKS7OsCeV3y9Sg9n16ShLADgilvaInPNQmIh6txYt5mpN1qhIxqRl9Fk-BSikAmv6byncJsngeGX8GK9XAE9PMOR2hmiq982hjxR27u4t19QJBViKDu3Unfx3dECbM0y_McktmM4V98HdN3lZ7nVnmHYLaSSaO782oTG0gzzwUJeH3qqK3pXiG0qlvSulV4fAU2S6B8h0',
  description: 'Một câu chuyện tu tiên mang đậm triết lý nhân sinh, nơi con đường cầu đạo không chỉ là sức mạnh mà còn là sự thấu hiểu vũ trụ và bản ngã.'
};

export const RECENT_BOOKS: Book[] = [
  {
    id: 'rec-1',
    title: 'Tinh Thần Biến',
    author: 'Unknown',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGF-pqGyIru0yO10_yZdczw4lVtFWxQSg3i15mg2CSrUW4Oy2mke5bIDBUyEn9mNzIUtaDlGO2a8aSZcDQtCVQ87rVqU5FKKlqk-zp1vr0Ab3c69S-iCJssYoJ-9PVbbfdZAcNJa9fKRH3tEpntaVByW3qAW7p-EzV5IJC4CNCVmEcwQwRSVh3JyN2UyDVdDSjfg69E1ZwymQ9yREh-lBep_0-puJkk63yxJP_LtB3Sf66CgeVxsljIB66J2nAM1Te3BahP2Om_F3h',
    genres: ['Tiên Hiệp'],
    status: 'Ongoing',
    chapterCount: 1024
  },
  {
    id: 'rec-2',
    title: 'Kiếm Đạo Độc Tôn',
    author: 'Unknown',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoO7Ax1ffYmP4uKR9_LVYze9F045R2oF82mU6K4Feb0IezaFB6dDV8bELqAelgSnfKE8RmfgMcgaBfMLHJH-jKtI4zIn2_oxMwKHcERJ4kbUo4w0To9wgUiRV7oL-SnEYybXesX7dGmO46eDxLNjaEUsD0IeeHH1rElyKG5cAmJo_609vVATBEvbxFNG2BuvPkS1m_xIn7HSPwkRlAUO-Z-WA6Ifsw5ha9WANaPZGbpVvq6JUaHdHxj-eUZqhEOPbh_lT31ZSRITas',
    genres: ['Kiếm Hiệp'],
    status: 'Ongoing',
    chapterCount: 542
  },
  {
    id: 'rec-3',
    title: 'Phàm Nhân Tu Tiên',
    author: 'Unknown',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVjglz5StAoYr4oOGvY24qMo1C7fLOk07yfSgoOeChKyeNDKMCvx3sxP5a5vwFpU_v8Ss7gv83J_ynysAuCD8pGw7ARV5JIj602bCSx6qepaBrzaLWMw_a__uKxiHFHoH0cI2MQObKqTCB7tzDSYMzbBuniHQSeh3uNRyoo2evW17h_V6y61qVUYin0ZXtCUDX_yPadXj_FAAEdJe1PhZTJHagOZjrf68GuP8qYgwqCpzqjfvC64QmuAxL_EN6WTUk55W0GcOwe3cv',
    genres: ['Tiên Hiệp'],
    status: 'Ongoing',
    chapterCount: 2100
  }
];

export const RANKINGS = [
  { rank: 1, title: 'Thế Giới Hoàn Mỹ', views: '12.5k' },
  { rank: 2, title: 'Đấu Phá Thương Khung', views: '10.2k' },
  { rank: 3, title: 'Mục Thần Ký', views: '8.9k' },
];

export const DISCOVER_BOOKS: Book[] = [
  {
    id: 'd-1',
    title: "The Nebula's Silence",
    author: 'E. R. Vance',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdMrx_IZHBzXwX_nucDh06nxE8gnCdOMsoBSJMGA6MbuHN_vZi1jZSaiiwr6Z_MR5UWq0JMAD8T6Fd9yoo7MY4yi-GH4jgI5aTm3lXcCo-we4Ox-3xPPvCkcS2BDjbwuLl27ja00lpi8RP47kXImOqtR7XS5w0u9pEHGfM8rdjTX7vQyxmjVZOTvEnZDT4ANvgZgDf8eOv01EIFohueZJDmV-bgGVViXUAFkI59M5brDDwxj6jWaOFrtRgAIdZnNycez4EEgUM_S11',
    genres: ['Sci-Fi'],
    status: 'Ongoing',
    chapterCount: 42
  },
  {
    id: 'd-2',
    title: 'Echoes of the Old Woods',
    author: 'Sarah Jenkins',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLdepWJvW5U6nidn1NM6VLt9mYdBFZh2jNigK_QtZP0W86E6_crExnz_m-U_ob9Yx1kJaN2UNwYJsF4ZkbS0xMo8WjHal2eCrSw1Ym692DfhB0nWl9KahaVNgbrM3t3rYzpyeMQCElKiOPGYSSSFvVOR6rmmvCEqRPX0FGsErz3sdS-utLK66UMRRyZIzUpfuS8KKLKgcSPawAOO1mxgVDNPxuiunFIxs4QK8i_dzhD0vp3OO3P8a4uvEfQrqo2X6ynlJ7G0KxSRep',
    genres: ['Fantasy', 'Mystery'],
    status: 'Completed',
    chapterCount: 128
  },
  {
    id: 'd-3',
    title: 'The Glass Labyrinth',
    author: 'M. K. Thorne',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm4WEYmJfP_8e3Qq_7jfZXHtgx1Vji_caVhh8c-HNqEiakzft1uphDXHf6uy54-P0GA2BoLDHeTRgTzHIqR_V86SbgACz8eIOidiG9f-UVs5u1YVRwRCRheuhJeSrJVVJ7N-M6gXAZ7Qe0tNp5TRMBfnnQitdXV5YFJ9svvEyKYzMVdxIrseY-lwBsa-5fLAU7GP7Ot277a13TifDlY0YfpT-5EuCd99I-85e1-84EXX55KLSH_1i8Qb2ei9SxDOF_svLnPFDy8bT-',
    genres: ['Mystery'],
    status: 'Ongoing',
    chapterCount: 15
  },
  {
    id: 'd-4',
    title: 'Rain in the City',
    author: 'A. L. Croft',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJZdsyQf8gjZUZEGTJAK26UjVH0NdZVO0Vv8QBy6OVXLn244D0AKBACUgPccM-AFgdwDEpu1AlOU36sLKy-RJoVgJhnzsBQLwni0P8dLkv-aS5mWjcQukoWy5TvMA99QDJMPhDYo_FYIm2MVz5wuEz2oJ2gU0iWaJtJFi-Q6lDZLnL2wC6WQyAQ5hT4uQsBr-OwKe6XY3Q8Zya9Ot4ez8PTWKYaFg4s4L_XkTiTHHGrZEbaBaoHlH4ZyN1XvNrBiPGxMklYaKNJiRa',
    genres: ['Slice of Life'],
    status: 'Completed',
    chapterCount: 89
  }
];

export const CURRENT_STORY_DETAIL: Book = {
  id: 'detail-1',
  title: 'Echoes of the Neon Citadel',
  author: 'Aria Vance',
  coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkM2R6zheb9eqEGUi4jXGsEyeP_DXGBu7rBQyMICcr1EL9YJAWHC7lhMzuk3Ac4UT2XwW8yhHygjWbmW2wBDtsvLyYP9nAORQBsUaygZaLcAX-VPHDqegxkUv71glg2xlSG752Q0nk8wevi_uMJLqu2ecwc0anQcgP-Za9uAvHNy6nL2SCiGDxCQ3dS15Y1G3FToR8v8VSeXhAHRAtKQCXKMYYxAeEKBnbjxt5_dRDDDkHpE7VmhKkXkCZcmNMAdxp6TmpgtIc9Cor',
  genres: ['SCI-FI', 'CYBERPUNK', 'MYSTERY'],
  status: 'Ongoing',
  chapterCount: 24,
  rating: 4.8,
  views: '342k',
  synopsis: 'In the sprawling metropolis of Neo-Veridia, memory is a currency traded on the black market. Elara, a "weaver," specializes in extracting traumatic memories, turning them into crystalline fragments. When a high-profile client is found dead, leaving behind an encrypted memory shard, Elara is thrust into a conspiracy that reaches the highest echelons of the Citadel. She must decode the fragment before the city\'s ruthless enforcers erase her own existence.'
};

export const CHAPTERS: Chapter[] = [
  { id: 'c1', title: 'Chapter 1: The Glass Shard', updatedAt: '2 DAYS AGO' },
  { id: 'c2', title: 'Chapter 2: Neon Reflections', updatedAt: '1 WEEK AGO' },
  { id: 'c3', title: 'Chapter 3: Whispers in the Code', updatedAt: '2 WEEKS AGO' },
];

export const COMMENTS: Comment[] = [
  {
    id: 'cmt1',
    author: 'Kael_Void',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGRrEe6WJ1StDbV0RDPl07ORXujwtnhmg8iHSZUyzXSXgBzx-UPv4jbtI5WjTr8x3X3Z9jgrxdfHlWuCYghIvP0D6b852vB1kmZHkzAiuoTigpYrVWOE-el28CN72mOjwh771fdpLmyHbeeW9RYE8arTk0sbBhVK_1HcANpmQWXUX_Hm5RF_vBUqe5smuxX5x1a0qY3kdL4LCcqk1_DMaZHqsbXtEZl8ri6uTrWFXlWnAe4i0rIVlQz7ob-nH2hW55LQym7qKZsV_2',
    timeAgo: '2 HOURS AGO',
    content: "The pacing in the latest chapter was incredible. I'm really curious to see how the memory mechanic plays out."
  },
  {
    id: 'cmt2',
    author: 'NovaReader',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEKpWWeb8cdLbtsxQUTj4rWfIkXhdnEsSRviT94puRc3rZq-Tst-xixMW7LYTWK10l3hTn9R44WC3vyEskGWs3YXkj2tO4trWcQH41lXvFKs0xcj8a8wpbOCBqC-P2hC9POx6uo3PViA-FvDV0g1g0xOa_HbMMv6P8N7Z34F0H_5oOeD_ondyAvc5zjDIzisdA3443g0CPlwtAyb3rVMboAIGcLIbQ-6PhRWi7zUrCYdI3nfshUAzQDTcOOwD8KbvNlzrvtIEt_rIn',
    timeAgo: '1 DAY AGO',
    content: "World-building is top tier. Reminds me of classic cyberpunk but with a unique magic system twist."
  }
];
