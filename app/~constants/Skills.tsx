import { SkillName } from '@prisma/client';

export const SkillMap: Record<number, SkillName> = {
  0: 'Attack',
  1: 'Defence',
  2: 'Strength',
  3: 'Constitution',
  4: 'Ranged',
  5: 'Prayer',
  6: 'Magic',
  7: 'Cooking',
  8: 'Woodcutting',
  9: 'Fletching',
  10: 'Fishing',
  11: 'Firemaking',
  12: 'Crafting',
  13: 'Smithing',
  14: 'Mining',
  15: 'Herblore',
  16: 'Agility',
  17: 'Thieving',
  18: 'Slayer',
  19: 'Farming',
  20: 'Runecrafting',
  21: 'Hunter',
  22: 'Construction',
  23: 'Summoning',
  24: 'Dungeoneering',
  25: 'Divination',
  26: 'Invention',
  27: 'Archaeology',
  28: 'Necromancy',
};

export const IdMap: Record<SkillName, number> = Object.fromEntries(
  Object.entries(SkillMap).map(([id, name]) => [name, Number(id)]),
) as Record<SkillName, number>;

export const SkillCategories = {
  Combat: [
    'Attack',
    'Strength',
    'Defence',
    'Constitution',
    'Ranged',
    'Prayer',
    'Magic',
    'Summoning',
    "Necromancy"
  ],
  Gathering: ['Mining', 'Fishing', 'Woodcutting', 'Farming', 'Hunter', 'Divination'],
  Artisan: [
    'Smithing',
    'Cooking',
    'Firemaking',
    'Fletching',
    'Crafting',
    'Construction',
    'Herblore',
    'Runecrafting',
  ],
  Support: ['Agility', 'Thieving', 'Slayer', 'Dungeoneering', 'Invention', 'Archaeology'],
};
