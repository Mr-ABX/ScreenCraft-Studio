export interface CursorThemeDefinition {
  id: string;
  name: string;
  category: 'vector' | 'themed';
  assetPath?: string; // Path if image based, e.g. /cursors/.../arrow.png
  previewSvg?: string;
  source?: string;
}

export const CURSOR_THEMES: CursorThemeDefinition[] = [
  // 1. Core High-DPI Vector Cursors
  { id: 'macos_arrow', name: 'macOS Dark', category: 'vector' },
  { id: 'macos_white', name: 'macOS Classic', category: 'vector' },
  { id: 'windows_arrow', name: 'Windows 11', category: 'vector' },
  { id: 'pointer', name: 'Pointer Hand', category: 'vector' },
  { id: 'precision_cross', name: 'Precision Cross', category: 'vector' },
  { id: 'glow_dot', name: 'Glass Glow Dot', category: 'vector' },

  // 2. OpenScreen Themed Cursors
  {
    id: 'hello-kitty-watermelon',
    name: 'Hello Kitty & Watermelon',
    category: 'themed',
    assetPath: '/cursors/hello-kitty-watermelon/arrow.png',
  },
  {
    id: 'among-us-sus-knife-and-red-animated',
    name: 'Among Us Sus Knife',
    category: 'themed',
    assetPath: '/cursors/among-us-sus-knife-and-red-animated/arrow.png',
  },
  {
    id: 'solo-leveling-sung-jinwoo-dark-flames',
    name: 'Solo Leveling Flames',
    category: 'themed',
    assetPath: '/cursors/solo-leveling-sung-jinwoo-dark-flames/arrow.png',
  },
  {
    id: 'pokemon-neon-gengar',
    name: 'Pokemon Neon Gengar',
    category: 'themed',
    assetPath: '/cursors/pokemon-neon-gengar/arrow.png',
  },
  {
    id: 'naruto-akatsuki-cloud-arrow',
    name: 'Naruto Akatsuki Cloud',
    category: 'themed',
    assetPath: '/cursors/naruto-akatsuki-cloud-arrow/arrow.png',
  },
  {
    id: 'hollow-knight-and-game-arrow',
    name: 'Hollow Knight Arrow',
    category: 'themed',
    assetPath: '/cursors/hollow-knight-and-game-arrow/arrow.png',
  },
  {
    id: 'hollow-knight-nail-sword-and-mask',
    name: 'Hollow Knight Nail',
    category: 'themed',
    assetPath: '/cursors/hollow-knight-nail-sword-and-mask/arrow.png',
  },
  {
    id: 'old-roblox',
    name: 'Classic Roblox',
    category: 'themed',
    assetPath: '/cursors/old-roblox/arrow.png',
  },
  {
    id: 'mickey-mouse-black-hand-inflated-glove',
    name: 'Mickey Glove',
    category: 'themed',
    assetPath: '/cursors/mickey-mouse-black-hand-inflated-glove/arrow.png',
  },
  {
    id: 'black-pixel',
    name: 'Retro Black Pixel',
    category: 'themed',
    assetPath: '/cursors/black-pixel/arrow.png',
  },
  {
    id: 'pinky-pixel',
    name: 'Retro Pink Pixel',
    category: 'themed',
    assetPath: '/cursors/pinky-pixel/arrow.png',
  },
  {
    id: 'pink-glossy-arrow-and-hand-3d',
    name: 'Pink Glossy 3D',
    category: 'themed',
    assetPath: '/cursors/pink-glossy-arrow-and-hand-3d/arrow.png',
  },
  {
    id: 'sanrio-gudetama-and-arrow-kawaii',
    name: 'Sanrio Gudetama',
    category: 'themed',
    assetPath: '/cursors/sanrio-gudetama-and-arrow-kawaii/arrow.png',
  },
  {
    id: 'sanrio-kuromi-skull-arrow',
    name: 'Sanrio Kuromi Skull',
    category: 'themed',
    assetPath: '/cursors/sanrio-kuromi-skull-arrow/arrow.png',
  },
  {
    id: 'christmas-miles-morales',
    name: 'Miles Morales',
    category: 'themed',
    assetPath: '/cursors/christmas-miles-morales/arrow.png',
  },
  {
    id: 'black-and-rainbow-stroke-gradient-animated',
    name: 'Rainbow Stroke',
    category: 'themed',
    assetPath: '/cursors/black-and-rainbow-stroke-gradient-animated/arrow.png',
  },
  {
    id: 'spring-gradient',
    name: 'Spring Gradient',
    category: 'themed',
    assetPath: '/cursors/spring-gradient/arrow.png',
  },
  {
    id: 'default',
    name: 'OpenScreen Classic',
    category: 'themed',
    assetPath: '/cursors/default/arrow.png',
  },
];
