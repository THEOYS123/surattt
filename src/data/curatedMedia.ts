export interface CuratedPhoto {
  id: string;
  category: 'wedding' | 'birthday' | 'business' | 'aqiqah' | 'school' | 'graduation' | 'reunion' | 'general';
  title: string;
  url: string;
}

export interface CuratedMusic {
  id: string;
  title: string;
  genre: string;
  url: string;
}

export const CURATED_PHOTOS: CuratedPhoto[] = [
  // School, Pensi & Campus
  {
    id: 's-1',
    category: 'school',
    title: 'Panggung Pentas Seni & Festival Pelajar',
    url: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 's-2',
    category: 'school',
    title: 'Gedung Sekolah & Lapangan Upacara Asri',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 's-3',
    category: 'school',
    title: 'Penampilan Musik Band Pelajar Kreatif',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 's-4',
    category: 'school',
    title: 'Pameran Karya & Gelar Budaya Sekolah',
    url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1000&auto=format&fit=crop&q=80'
  },

  // Graduation & Wisuda
  {
    id: 'g-1',
    category: 'graduation',
    title: 'Prosesi Wisuda & Topi Toga Melayang',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'g-2',
    category: 'graduation',
    title: 'Perayaan Kelulusan Sarjana Bangga',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000&auto=format&fit=crop&q=80'
  },

  // Reunion & Temu Kangen
  {
    id: 'r-1',
    category: 'reunion',
    title: 'Temu Kangen Sahabat Lama & Alumni',
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'r-2',
    category: 'reunion',
    title: 'Nostalgia Angkatan & Cerita Kebersamaan',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=80'
  },

  // Wedding
  {
    id: 'w-1',
    category: 'wedding',
    title: 'Dekorasi Pelaminan Rustic Mewah',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'w-2',
    category: 'wedding',
    title: 'Bunga Mawar Pastel Romantis',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'w-3',
    category: 'wedding',
    title: 'Momen Prewedding Pasangan Elegan',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'w-4',
    category: 'wedding',
    title: 'Cincin Kawin & Meja Ijab Kabul',
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1000&auto=format&fit=crop&q=80'
  },

  // Business & Conference
  {
    id: 'b-1',
    category: 'business',
    title: 'Ballroom Konferensi Bisnis Modern',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'b-2',
    category: 'business',
    title: 'Panggung Seminar & Pembicara',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'b-3',
    category: 'business',
    title: 'Networking & Partner Gathering',
    url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1000&auto=format&fit=crop&q=80'
  },

  // Birthday & Celebration
  {
    id: 'c-1',
    category: 'birthday',
    title: 'Kue Ulang Tahun Mewah & Lilin',
    url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'c-2',
    category: 'birthday',
    title: 'Dekorasi Balon Pastel Ceria',
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1000&auto=format&fit=crop&q=80'
  },

  // Aqiqah & Khitanan
  {
    id: 'a-1',
    category: 'aqiqah',
    title: 'Tasyakuran Bayi & Nuansa Hijau Zamrud',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80'
  }
];

// Verified, reliable high-uptime public streaming audio tracks (HTTP 200, Byte-range supported)
export const CURATED_MUSIC: CuratedMusic[] = [
  {
    id: 'm-pensi',
    title: 'Youth Festival & School Harmony (Enerjik Pelajar)',
    genre: 'Sekolah & Pensi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'm-wedding',
    title: 'Acoustic Romantic Melodic Strings (Pernikahan)',
    genre: 'Klasik Romantis',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'm-calm',
    title: 'Serene Acoustic Warm Melody (Syukuran & Santai)',
    genre: 'Syahdu & Akustik',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'm-corporate',
    title: 'Inspiring Corporate & Seminar Vibe (Bisnis)',
    genre: 'Bisnis & Expo',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  },
  {
    id: 'm-party',
    title: 'Celebration Upbeat Rhythm (Ulang Tahun & Reuni)',
    genre: 'Ceria & Pesta',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'm-chill',
    title: 'Modern Ambient Harmony (Wisuda & Umum)',
    genre: 'Wisuda & Elegan',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
  }
];
