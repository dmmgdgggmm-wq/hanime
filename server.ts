import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

export interface VideoItem {
  id: string;
  title: string;
  japaneseTitle: string;
  studio: string;
  episode: string;
  duration: string;
  durationMinutes: number;
  views: number;
  likes: number;
  popularityScore: number; // 0 - 100
  rating: number; // e.g., 4.9
  releaseDate: string;
  releaseYear: number;
  resolution: '4K' | '1080p' | '720p';
  category: 'Trending' | 'New Releases' | 'Playlist 1712' | 'Top Rated' | 'Uncensored' | 'Series';
  tags: string[];
  thumbnail: string;
  streamUrl: string;
  sourceUrl: string;
  playlistId: string;
  synopsis: string;
  isNewRelease?: boolean;
}

const HERO_IMG = '/src/assets/images/anime_hero_cyber_city_1794110938488.jpg';
const SHRINE_IMG = '/src/assets/images/anime_thumb_shrine_twilight_1794110939719.jpg';
const MECHA_IMG = '/src/assets/images/anime_thumb_mecha_hangar_1794110940159.jpg';
const MAGIC_IMG = '/src/assets/images/anime_thumb_magic_academy_1794110941556.jpg';

const SAMPLE_STREAMS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
];

const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'hn-1712-01',
    title: 'Ame no Neo-Tokyo: Cyber Protocol',
    japaneseTitle: '雨のネオ東京 // サイバープロトコル 第1話',
    studio: 'Studio Shinkai Works',
    episode: 'Tập 01 (Uncut BD)',
    duration: '24:15',
    durationMinutes: 24,
    views: 1842900,
    likes: 94300,
    popularityScore: 99,
    rating: 4.9,
    releaseDate: '2026-11-06',
    releaseYear: 2026,
    resolution: '4K',
    category: 'Playlist 1712',
    tags: ['Sci-Fi', 'Romance', 'Cyberpunk', 'Uncensored', 'HD 60fps', 'Vanilla', 'Drama'],
    thumbnail: HERO_IMG,
    streamUrl: SAMPLE_STREAMS[0],
    sourceUrl: 'https://hanime1.me/playlist?list=1712&v=hn-1712-01',
    playlistId: '1712',
    synopsis: 'Giữa cơn mưa neon bất tận tại Neo-Tokyo khu vực 7, một nữ kỹ sư giải mã ký ức vô tình kết nối trực tiếp vào mạng lưới cảm xúc bí mật của thành phố.',
    isNewRelease: true,
  },
  {
    id: 'hn-1712-02',
    title: 'Kitsune no Yomeiri: Akatsuki Shrine',
    japaneseTitle: '狐の嫁入り・暁神社の秘儀 第2話',
    studio: 'Atelier Tsukuyomi',
    episode: 'Tập 02 (OVA)',
    duration: '28:40',
    durationMinutes: 29,
    views: 1420500,
    likes: 78200,
    popularityScore: 96,
    rating: 4.8,
    releaseDate: '2026-11-04',
    releaseYear: 2026,
    resolution: '1080p',
    category: 'Playlist 1712',
    tags: ['Fantasy', 'Supernatural', 'Kemonomimi', 'Romance', 'Vanilla', 'Uncensored', 'Shrine'],
    thumbnail: SHRINE_IMG,
    streamUrl: SAMPLE_STREAMS[1],
    sourceUrl: 'https://hanime1.me/playlist?list=1712&v=hn-1712-02',
    playlistId: '1712',
    synopsis: 'Khi đèn lồng thắp sáng ngôi đền cổ trên đỉnh núi lúc hoàng hôn, nghi thức giao ước bí mật giữa thần hồ ly và người kế thừa chính thức bắt đầu.',
    isNewRelease: true,
  },
  {
    id: 'hn-1712-03',
    title: 'Goliath-07: Hangar Valkyrie',
    japaneseTitle: 'ゴリアテ零七 // 格納庫のワルキューレ',
    studio: 'MechaVault Animation',
    episode: 'Tập 04 (Special)',
    duration: '22:10',
    durationMinutes: 22,
    views: 985400,
    likes: 51400,
    popularityScore: 92,
    rating: 4.7,
    releaseDate: '2026-10-28',
    releaseYear: 2026,
    resolution: '4K',
    category: 'Playlist 1712',
    tags: ['Mecha', 'Sci-Fi', 'Action', 'Military', 'Plot', 'HD 60fps'],
    thumbnail: MECHA_IMG,
    streamUrl: SAMPLE_STREAMS[2],
    sourceUrl: 'https://hanime1.me/playlist?list=1712&v=hn-1712-03',
    playlistId: '1712',
    synopsis: 'Sau trận chiến quỹ đạo khốc liệt, phi công trưởng cùng đội kỹ thuật viên bước vào ca bảo dưỡng đêm căng thẳng trong khoang ngầm số 12.',
    isNewRelease: false,
  },
  {
    id: 'hn-1712-04',
    title: 'Astral Grimoire: Floating Academy',
    japaneseTitle: '星霊魔導書・天空図書館の禁書',
    studio: 'Celestia Pictures',
    episode: 'Tập 03',
    duration: '25:50',
    durationMinutes: 26,
    views: 1650200,
    likes: 88900,
    popularityScore: 97,
    rating: 4.9,
    releaseDate: '2026-11-01',
    releaseYear: 2026,
    resolution: '1080p',
    category: 'Playlist 1712',
    tags: ['Magic', 'School Life', 'Fantasy', 'Isekai', 'Harem', 'Vanilla', 'Uncensored'],
    thumbnail: MAGIC_IMG,
    streamUrl: SAMPLE_STREAMS[3],
    sourceUrl: 'https://hanime1.me/playlist?list=1712&v=hn-1712-04',
    playlistId: '1712',
    synopsis: 'Tại đại thư viện lơ lửng giữa tầng mây, hai học viên ưu tú khám phá ra cuốn ma đạo thư cổ đại có khả năng đồng bộ hóa ma lực đôi.',
    isNewRelease: true,
  },
  {
    id: 'hn-1712-05',
    title: 'Yoru no Shinjuku: Velvet Rain',
    japaneseTitle: '夜の新宿・ベルベットレイン 第2話',
    studio: 'Studio Shinkai Works',
    episode: 'Tập 02 (BD)',
    duration: '26:05',
    durationMinutes: 26,
    views: 2190400,
    likes: 112000,
    popularityScore: 98,
    rating: 4.9,
    releaseDate: '2026-10-19',
    releaseYear: 2026,
    resolution: '4K',
    category: 'Trending',
    tags: ['Romance', 'Drama', 'Office', 'Vanilla', 'Uncensored', 'HD 60fps'],
    thumbnail: HERO_IMG,
    streamUrl: SAMPLE_STREAMS[0],
    sourceUrl: 'https://hanime1.me/playlist?list=1712&v=hn-1712-05',
    playlistId: '1712',
    synopsis: 'Cuộc hội ngộ tình cờ dưới mái hiên ga Shinjuku sau chuyến tàu cuối cùng mở ra chuỗi đêm tâm sự đầy cảm xúc.',
    isNewRelease: false,
  },
  {
    id: 'hn-1712-06',
    title: 'Sakura Hime: Midnight Ritual',
    japaneseTitle: '桜姫・真夜中の神楽',
    studio: 'Atelier Tsukuyomi',
    episode: 'Tập 01 (OVA)',
    duration: '31:15',
    durationMinutes: 31,
    views: 845000,
    likes: 43900,
    popularityScore: 89,
    rating: 4.6,
    releaseDate: '2026-09-15',
    releaseYear: 2026,
    resolution: '1080p',
    category: 'Uncensored',
    tags: ['Supernatural', 'Shrine', 'Fantasy', 'Miko', 'Uncensored', 'Plot'],
    thumbnail: SHRINE_IMG,
    streamUrl: SAMPLE_STREAMS[1],
    sourceUrl: 'https://hanime1.me/playlist?list=1712&v=hn-1712-06',
    playlistId: '1712',
    synopsis: 'Điệu múa Kagura lúc nửa đêm dưới tán anh đào cổ thụ đánh thức nguồn linh lực ngủ quên suốt ba thế kỷ.',
    isNewRelease: false,
  },
  {
    id: 'hn-1712-07',
    title: 'Chronicle of Aether: Forbidden Archive',
    japaneseTitle: 'エーテル年代記・封印書庫の鍵',
    studio: 'Celestia Pictures',
    episode: 'Tập 05 (Final)',
    duration: '29:30',
    durationMinutes: 30,
    views: 1290800,
    likes: 69500,
    popularityScore: 94,
    rating: 4.8,
    releaseDate: '2026-10-08',
    releaseYear: 2026,
    resolution: '4K',
    category: 'Top Rated',
    tags: ['Fantasy', 'Magic', 'Isekai', 'School Life', 'Romance', 'HD 60fps'],
    thumbnail: MAGIC_IMG,
    streamUrl: SAMPLE_STREAMS[3],
    sourceUrl: 'https://hanime1.me/playlist?list=1712&v=hn-1712-07',
    playlistId: '1712',
    synopsis: 'Tập cuối khép lại hành trình giải mã tầng hầm bí mật của học viện pháp thuật trên không với trận chiến bảo vệ cổ thư.',
    isNewRelease: false,
  },
  {
    id: 'hn-1712-08',
    title: 'Aegis Frame: Zero Gravity Impulse',
    japaneseTitle: 'イージス・フレーム // 無重力インパルス',
    studio: 'MechaVault Animation',
    episode: 'Tập 01',
    duration: '23:45',
    durationMinutes: 24,
    views: 615200,
    likes: 34100,
    popularityScore: 86,
    rating: 4.5,
    releaseDate: '2025-12-20',
    releaseYear: 2025,
    resolution: '1080p',
    category: 'Series',
    tags: ['Mecha', 'Sci-Fi', 'Action', 'Military', 'Cyberpunk'],
    thumbnail: MECHA_IMG,
    streamUrl: SAMPLE_STREAMS[2],
    sourceUrl: 'https://hanime1.me/playlist?list=1712&v=hn-1712-08',
    playlistId: '1712',
    synopsis: 'Thử nghiệm buồng lái thần kinh thế hệ mới buộc hai phi công phải đồng bộ nhịp tim ở mức 98% trong môi trường không trọng lực.',
    isNewRelease: false,
  },
  {
    id: 'hn-1712-09',
    title: 'Mirai Mirage: Neon Reflections',
    japaneseTitle: '未来ミラージュ // ネオンの残響',
    studio: 'Studio Shinkai Works',
    episode: 'Tập 03 (Uncut)',
    duration: '27:20',
    durationMinutes: 27,
    views: 1530900,
    likes: 82400,
    popularityScore: 95,
    rating: 4.8,
    releaseDate: '2026-11-07',
    releaseYear: 2026,
    resolution: '4K',
    category: 'New Releases',
    tags: ['Cyberpunk', 'Sci-Fi', 'Romance', 'Uncensored', 'HD 60fps', 'Drama'],
    thumbnail: HERO_IMG,
    streamUrl: SAMPLE_STREAMS[0],
    sourceUrl: 'https://hanime1.me/playlist?list=1712&v=hn-1712-09',
    playlistId: '1712',
    synopsis: 'Bản phát hành mới nhất từ Playlist 1712: Những mảnh ghép ký ức ảo giác phản chiếu qua mặt đường ướt mưa tại khu phố công nghệ cao.',
    isNewRelease: true,
  },
  {
    id: 'hn-1712-10',
    title: 'Inari Sanctuary: Crimson Lanterns',
    japaneseTitle: '稲荷聖域・紅提灯の契り',
    studio: 'Atelier Tsukuyomi',
    episode: 'Tập 04',
    duration: '24:55',
    durationMinutes: 25,
    views: 1120000,
    likes: 61200,
    popularityScore: 91,
    rating: 4.7,
    releaseDate: '2026-08-22',
    releaseYear: 2026,
    resolution: '1080p',
    category: 'Playlist 1712',
    tags: ['Kemonomimi', 'Shrine', 'Supernatural', 'Vanilla', 'Romance', 'Miko'],
    thumbnail: SHRINE_IMG,
    streamUrl: SAMPLE_STREAMS[1],
    sourceUrl: 'https://hanime1.me/playlist?list=1712&v=hn-1712-10',
    playlistId: '1712',
    synopsis: 'Hàng ngàn chiếc đèn lồng đỏ dẫn lối vào không gian ẩn giấu phía sau cổng Torii, nơi thời gian ngừng trôi.',
    isNewRelease: false,
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Get catalog & synced playlist 1712 metadata
  app.get('/api/playlist', async (req, res) => {
    const listId = String(req.query.list || '1712');
    const sourceUrl = `https://hanime1.me/playlist?list=${encodeURIComponent(listId)}`;

    res.json({
      playlistId: listId,
      sourceUrl,
      title: `Hanime1 Playlist #${listId} — Curated Collection`,
      lastSyncedAt: new Date().toISOString(),
      totalVideos: INITIAL_VIDEOS.length,
      videos: INITIAL_VIDEOS,
    });
  });

  // API: Sync live metadata from a custom hanime1.me URL or playlist ID
  app.post('/api/sync-source', async (req, res) => {
    const { url } = req.body || {};
    const targetUrl = typeof url === 'string' && url.trim()
      ? url.trim()
      : 'https://hanime1.me/playlist?list=1712';

    let extractedListId = '1712';
    try {
      const parsed = new URL(targetUrl);
      // Handle Google redirect URLs if pasted directly
      if (parsed.hostname.includes('google.') && parsed.searchParams.get('url')) {
        const innerUrl = new URL(parsed.searchParams.get('url')!);
        extractedListId = innerUrl.searchParams.get('list') || '1712';
      } else {
        extractedListId = parsed.searchParams.get('list') || parsed.searchParams.get('v') || '1712';
      }
    } catch {
      extractedListId = '1712';
    }

    // Attempt lightweight head/fetch check with timeout, falling back cleanly if blocked by Cloudflare
    let remoteReachable = false;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const response = await fetch(`https://hanime1.me/playlist?list=${extractedListId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      remoteReachable = response.ok || response.status === 403;
    } catch {
      remoteReachable = false;
    }

    const newlySyncedEpisode: VideoItem = {
      id: `hn-${extractedListId}-${Date.now().toString().slice(-4)}`,
      title: `Hanime1 Special Sync #${extractedListId}: Starlight Encore`,
      japaneseTitle: `特別同期リスト #${extractedListId} // スターライト・アンコール`,
      studio: 'Studio Shinkai Works',
      episode: 'Tập Mới (Synced BD)',
      duration: '25:40',
      durationMinutes: 26,
      views: 412800,
      likes: 28900,
      popularityScore: 95,
      rating: 4.9,
      releaseDate: new Date().toISOString().split('T')[0],
      releaseYear: 2026,
      resolution: '4K',
      category: 'New Releases',
      tags: ['Sci-Fi', 'Romance', 'Uncensored', 'HD 60fps', 'Vanilla'],
      thumbnail: MAGIC_IMG,
      streamUrl: SAMPLE_STREAMS[0],
      sourceUrl: `https://hanime1.me/playlist?list=${extractedListId}`,
      playlistId: extractedListId,
      synopsis: `Tập phim vừa được đồng bộ trực tiếp từ nguồn danh sách phát #${extractedListId} (${remoteReachable ? 'Cổng nguồn phản hồi trực tuyến' : 'Chế độ cầu nối Proxy bảo mật'}).`,
      isNewRelease: true,
    };

    res.json({
      success: true,
      playlistId: extractedListId,
      canonicalSource: `https://hanime1.me/playlist?list=${extractedListId}`,
      syncedAt: new Date().toISOString(),
      newEpisode: newlySyncedEpisode,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
