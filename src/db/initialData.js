// Seed data for initial albums and media assets.
// Photos are high-quality, professional Unsplash links.
// Videos are fast, responsive CDN links (Pixabay & public loops).

export const SEED_ALBUMS = [
  {
    title: "Enchanted Forest Wedding",
    slug: "enchanted-forest-wedding",
    description: "A magical wedding ceremony nestled in a redwood canopy under golden-hour lighting. Beautiful moments captured in nature.",
    cover_url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Global Tech Summit 2026",
    slug: "global-tech-summit-2026",
    description: "Highlights from the world's leading technology and innovation panel discussions, networking hubs, and keynote stages.",
    cover_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Nordic Winter Expedition",
    slug: "nordic-winter-expedition",
    description: "Breathtaking landscapes, northern lights, and snow-capped fjords from a winter journey through Norway and Iceland.",
    cover_url: "https://images.unsplash.com/photo-1483168527879-c66136b56105?q=80&w=1200&auto=format&fit=crop"
  },
  {
    title: "Cyberpunk Cityscapes",
    slug: "cyberpunk-cityscapes",
    description: "Urban photography capturing neon-drenched alleyways, towering skyscrapers, and rainy evening reflections in Tokyo and Seoul.",
    cover_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop"
  }
];

export const SEED_MEDIA = [
  // Enchanted Forest Wedding
  {
    album_slug: "enchanted-forest-wedding",
    type: "image",
    name: "Wedding Rings",
    url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop",
    size: 450000
  },
  {
    album_slug: "enchanted-forest-wedding",
    type: "image",
    name: "Bride Portrait",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop",
    size: 620000
  },
  {
    album_slug: "enchanted-forest-wedding",
    type: "image",
    name: "Ceremony Arch",
    url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=1000&auto=format&fit=crop",
    size: 510000
  },
  {
    album_slug: "enchanted-forest-wedding",
    type: "image",
    name: "Forest Reception Table",
    url: "https://images.unsplash.com/photo-1519225495810-7512c696505a?q=80&w=1000&auto=format&fit=crop",
    size: 780000
  },
  {
    album_slug: "enchanted-forest-wedding",
    type: "video",
    name: "Sparklers Sendoff Loop",
    url: "https://assets.mixkit.co/videos/preview/mixkit-celebrating-with-sparklers-at-a-wedding-reception-34289-large.mp4",
    size: 4500000
  },
  {
    album_slug: "enchanted-forest-wedding",
    type: "video",
    name: "Wedding Toast Cinematic",
    url: "https://assets.mixkit.co/videos/preview/mixkit-cheering-with-glasses-of-champagne-at-a-party-34282-large.mp4",
    size: 6100000
  },

  // Global Tech Summit 2026
  {
    album_slug: "global-tech-summit-2026",
    type: "image",
    name: "Keynote Speaker",
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1000&auto=format&fit=crop",
    size: 340000
  },
  {
    album_slug: "global-tech-summit-2026",
    type: "image",
    name: "Audience Q&A",
    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1000&auto=format&fit=crop",
    size: 420000
  },
  {
    album_slug: "global-tech-summit-2026",
    type: "image",
    name: "Panel Discussion",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop",
    size: 580000
  },
  {
    album_slug: "global-tech-summit-2026",
    type: "video",
    name: "Abstract Digital Background",
    url: "https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-looking-digital-globe-spinning-33317-large.mp4",
    size: 9800000
  },

  // Nordic Winter Expedition
  {
    album_slug: "nordic-winter-expedition",
    type: "image",
    name: "Northern Lights Over Tent",
    url: "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1000&auto=format&fit=crop",
    size: 670000
  },
  {
    album_slug: "nordic-winter-expedition",
    type: "image",
    name: "Snowy Peak Reflection",
    url: "https://images.unsplash.com/photo-1483168527879-c66136b56105?q=80&w=1000&auto=format&fit=crop",
    size: 890000
  },
  {
    album_slug: "nordic-winter-expedition",
    type: "image",
    name: "Frozen Waterfall",
    url: "https://images.unsplash.com/photo-1489674262705-f933f27f805a?q=80&w=1000&auto=format&fit=crop",
    size: 520000
  },
  {
    album_slug: "nordic-winter-expedition",
    type: "video",
    name: "Ocean fjord waves loop",
    url: "https://assets.mixkit.co/videos/preview/mixkit-cinematic-shot-of-snowy-mountains-in-winter-41584-large.mp4",
    size: 8200000
  },

  // Cyberpunk Cityscapes
  {
    album_slug: "cyberpunk-cityscapes",
    type: "image",
    name: "Shibuya Intersection Rain",
    url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1000&auto=format&fit=crop",
    size: 790000
  },
  {
    album_slug: "cyberpunk-cityscapes",
    type: "image",
    name: "Neon Alley Signage",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop",
    size: 640000
  },
  {
    album_slug: "cyberpunk-cityscapes",
    type: "video",
    name: "Night traffic time-lapse",
    url: "https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-a-busy-city-crosswalk-at-night-42289-large.mp4",
    size: 5800000
  }
];

/**
 * Seed initial data to Supabase if tables are empty.
 * Ensures the app has gorgeous pre-loaded albums and media.
 */
export async function seedDatabase(supabase) {
  try {
    // 1. Check if albums already exist
    const { data: existingAlbums, error: albumCheckError } = await supabase
      .from('albums')
      .select('id')
      .limit(1);

    if (albumCheckError) throw albumCheckError;

    // If albums exist, don't seed again
    if (existingAlbums && existingAlbums.length > 0) {
      console.log('Database already has albums. Skipping seed.');
      return false;
    }

    console.log('Seeding initial albums...');
    
    // 2. Insert albums
    const { data: insertedAlbums, error: albumInsertError } = await supabase
      .from('albums')
      .insert(SEED_ALBUMS)
      .select();

    if (albumInsertError) throw albumInsertError;

    // Create a map from slug to id
    const albumSlugMap = {};
    insertedAlbums.forEach(album => {
      albumSlugMap[album.slug] = album.id;
    });

    // 3. Prepare media insert
    const mediaToInsert = SEED_MEDIA.map(item => {
      const albumId = albumSlugMap[item.album_slug];
      return {
        album_id: albumId,
        type: item.type,
        name: item.name,
        url: item.url,
        size: item.size
      };
    });

    console.log('Seeding media items...');
    const { error: mediaInsertError } = await supabase
      .from('media')
      .insert(mediaToInsert);

    if (mediaInsertError) throw mediaInsertError;

    console.log('Seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}
