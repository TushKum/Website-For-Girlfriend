import type { Memory } from '../types/memory';
import { localImageFor } from '../utils/localImages';

/**
 * The 24 memories that populate the globe.
 *
 * Images are pristine, elegant Unsplash placeholders requested at a fixed
 * crop/size/quality so textures are uniform and load predictably. Swap the
 * `imageURL`, `title`, `date`, `location`, and `caption` fields with the real
 * memories when you're ready — the rest of the engine adapts automatically.
 *
 * Tip: keep `imageURL` square-ish (the planes are rendered at a 3:4 portrait
 * ratio and centre-cropped), and keep captions to ~2–4 sentences so they sit
 * beautifully in the reveal modal.
 */

/**
 * The raw memories with their remote placeholder URLs. `MEMORIES` below
 * overrides each `imageURL` with a local drop-in photo when one exists.
 */
const RAW_MEMORIES: Memory[] = [
  {
    id: 1,
    imageURL: 'https://i.postimg.cc/rVjpkZTB/IMG-20260412-205201-(1).jpg',
    title: 'The First Coffee',
    date: '14 February 2023',
    location: 'A corner café, downtown',
    caption:
      'Two cups went cold because neither of us wanted to stop talking. I knew, somewhere between the second refill and your laugh, that this was the beginning of everything.',
  },
  {
    id: 2,
    imageURL: 'https://i.postimg.cc/wMKzVNLN/IMG-20260412-205111-(2).jpg',
    title: 'Golden Hour Hike',
    date: '03 March 2023',
    location: 'Ridgeline Trail',
    caption:
      'We climbed higher than we planned just to watch the valley catch fire in the light. You said it felt like the world was holding its breath. So was I.',
  },
  {
    id: 3,
    imageURL: 'https://i.postimg.cc/43mTRP1y/IMG-20260412-205238.jpg',
    title: 'The Lake That Mirrored Us',
    date: '21 April 2023',
    location: 'Still Water Reserve',
    caption:
      'Not a single ripple all morning — just the mountains, the sky, and the two of us reflected perfectly. Some mornings deserve to be framed.',
  },
  {
    id: 4,
    imageURL: 'https://i.postimg.cc/3rgQhd2L/IMG-20260412-205524.jpg',
    title: 'Beneath the Canopy',
    date: '09 May 2023',
    location: 'The old forest path',
    caption:
      'Sunlight fell through the leaves like scattered gold. You held my hand and we forgot we had anywhere else to be.',
  },
  {
    id: 5,
    imageURL: 'https://i.postimg.cc/zBK6qcb9/IMG-20260412-205612.jpg',
    title: 'City of a Thousand Lights',
    date: '17 June 2023',
    location: 'The rooftop, midnight',
    caption:
      'The whole city glittered below us and you only had eyes for the skyline. I only had eyes for you.',
  },
  {
    id: 6,
    imageURL: 'https://i.postimg.cc/3xqcmT2b/IMG-20260412-205659.jpg',
    title: 'Where the Light Lives',
    date: '02 July 2023',
    location: 'Sun-drenched meadow',
    caption:
      'You ran ahead into the light and turned to wave. I will keep that frame forever — the day felt endless and entirely ours.',
  },
  {
    id: 7,
    imageURL: 'https://i.postimg.cc/ZnjfRtbJ/IMG-20260424-211318.jpg',
    title: 'The Quiet Cabin',
    date: '19 August 2023',
    location: 'Up by the alpine lake',
    caption:
      'No signal, no schedule — just woodsmoke, your playlist, and a quiet that finally let us hear ourselves.',
  },
  {
    id: 8,
    imageURL: 'https://i.postimg.cc/Px7JkNZd/IMG-20260521-012417-329.webp',
    title: 'Among the Tall Pines',
    date: '06 September 2023',
    location: 'The northern woods',
    caption:
      'You said the trees made you feel small in the best possible way. With you, even feeling small felt like belonging.',
  },
  {
    id: 9,
    imageURL: 'https://i.postimg.cc/xdcqpKJR/IMG-20260528-093941.jpg',
    title: 'Our Stretch of Coast',
    date: '23 September 2023',
    location: 'The empty beach',
    caption:
      'We left the first footprints of the day. You collected shells; I collected the way you smiled at the sea.',
  },
  {
    id: 10,
    imageURL: 'https://i.postimg.cc/8khcYk5d/IMG-20260324-WA0018.jpg',
    title: 'The Valley Below',
    date: '11 October 2023',
    location: 'Overlook point',
    caption:
      'We sat with our feet over the edge of the world and planned a hundred tomorrows. I would choose every one of them with you.',
  },
  {
    id: 11,
    imageURL: 'https://i.postimg.cc/VLg6Y7XD/IMG-20260401-WA0021.jpg',
    title: 'Rolling Green',
    date: '28 October 2023',
    location: 'The countryside',
    caption:
      'Mile after mile of green, the windows down, your hand drumming on the door. Ordinary roads turn golden when you are next to me.',
  },
  {
    id: 12,
    imageURL: 'https://i.postimg.cc/K84ZmmZs/IMG-20260615-WA0025.jpg',
    title: 'Stars We Could Reach',
    date: '15 November 2023',
    location: 'Far from the city lights',
    caption:
      'We lay on the cold ground under a sky so full it ached. You named the constellations wrong on purpose, just to hear me laugh.',
  },
  {
    id: 13,
    imageURL: 'https://i.postimg.cc/nLDpQTQ8/IMG-20260615-WA0045.jpg',
    title: 'First Frost',
    date: '02 December 2023',
    location: 'The morning field',
    caption:
      'Everything silver and still. You breathed clouds into the cold and called it a small kind of magic. You are the magic.',
  },
  {
    id: 14,
    imageURL: 'https://i.postimg.cc/x8H6vJ3S/Snapchat-276829590.jpg',
    title: 'The Warm Window',
    date: '24 December 2023',
    location: 'Home, by the fire',
    caption:
      'Rain on the glass, a blanket, your head on my shoulder. I have travelled to beautiful places, but home is wherever you settle in.',
  },
  {
    id: 15,
    imageURL: 'https://i.postimg.cc/N0MbNPkb/Snapchat-278942846.jpg',
    title: 'New Year Bloom',
    date: '01 January 2024',
    location: 'The harbour',
    caption:
      'Fireworks bloomed over the water and you whispered your wish before I could. Mine was already standing beside me.',
  },
  {
    id: 16,
    imageURL: 'https://i.postimg.cc/QCpq9LjL/Snapchat-441835299.jpg',
    title: 'The Long Way Round',
    date: '20 January 2024',
    location: 'A road with no name',
    caption:
      'We missed the turn and found somewhere better. That is the whole story of us, really — beautifully, happily lost together.',
  },
  {
    id: 17,
    imageURL: 'https://i.postimg.cc/k4SQzr6K/Snapchat-446089284.jpg',
    title: 'First Bloom of Spring',
    date: '08 February 2024',
    location: 'The botanical garden',
    caption:
      'The first blossoms opened the day we walked through. You tucked one behind your ear and the whole garden seemed jealous.',
  },
  {
    id: 18,
    imageURL: 'https://i.postimg.cc/zGfn5HHm/Snapchat-504691051.jpg',
    title: 'The Far Fjord',
    date: '29 February 2024',
    location: 'Somewhere remote and wild',
    caption:
      'We drove until the map gave up. Standing at the edge of all that water, you said you felt brave. You make me brave too.',
  },
  {
    id: 19,
    imageURL: 'https://i.postimg.cc/NMRXb1S7/Snapchat-672225428.jpg',
    title: 'Mist Over the Hills',
    date: '16 March 2024',
    location: 'The fog-draped valley',
    caption:
      'The whole world was soft and grey except your bright coat moving through it. You are always the colour in my frame.',
  },
  {
    id: 20,
    imageURL: 'https://i.postimg.cc/jSCJBVBS/Snapchat-1625548601.jpg',
    title: 'Where the Water Falls',
    date: '04 April 2024',
    location: 'The hidden cascade',
    caption:
      'We had to shout over the roar of it, so mostly we just grinned. Some happiness is too loud and too full for words.',
  },
  {
    id: 21,
    imageURL: 'https://i.postimg.cc/x8H6vJ3S/Snapchat-276829590.jpg',
    title: 'Endless Horizon',
    date: '22 April 2024',
    location: 'The open road, dusk',
    caption:
      'The sky did that impossible pink it only does for the luckiest people. We pulled over just to let it happen to us.',
  },
  {
    id: 22,
    imageURL: 'https://i.postimg.cc/N0MbNPkb/Snapchat-278942846.jpg',
    title: 'Above the Clouds',
    date: '10 May 2024',
    location: 'The summit, at last',
    caption:
      'We climbed for hours and the clouds rolled in beneath our feet like a sea. You whooped into the wind. I fell a little harder.',
  },
  {
    id: 23,
    imageURL: 'https://i.postimg.cc/QCpq9LjL/Snapchat-441835299.jpg',
    title: 'The Soft Gold Evening',
    date: '28 May 2024',
    location: 'The wheat fields',
    caption:
      'Everything turned to honey in the last light. You spun once, arms out, and I understood exactly how lucky I am.',
  },
  {
    id: 24,
    imageURL: 'https://i.postimg.cc/k4SQzr6K/Snapchat-446089284.jpg',
    title: 'And Still, You',
    date: 'Today',
    location: 'Right here, with you',
    caption:
      'Twenty-three memories and a thousand more I have not photographed yet. Here is to every frame still to come. I love you — always.',
  },
];

/**
 * The final memories: each photo resolves to your local drop-in image
 * (`src/assets/memories/<id>.jpg|png|webp`) when present, otherwise the elegant
 * remote placeholder above.
 */
export const MEMORIES: Memory[] = RAW_MEMORIES.map((m) => ({
  ...m,
  imageURL: localImageFor(m.id) ?? m.imageURL,
}));

/** Stable list of every image URL — used by the preloader (referentially constant). */
export const IMAGE_URLS: string[] = MEMORIES.map((m) => m.imageURL);
