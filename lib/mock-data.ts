import type { SteamGame, PlayerSummary, RarityBadge } from "@/lib/types";

export const MOCK_PLAYER: PlayerSummary = {
  steamid: "76561198000000001",
  personaname: "SteamWrapped_Demo",
  avatarfull:
    "https://avatars.steamstatic.com/b5bd56c1aa4644a474a2e4972be27ef9e82e517e_full.jpg",
  profileurl: "https://steamcommunity.com/id/steamwrapped_demo/",
  personastate: 1,
  loccountrycode: "US",
  lastlogoff: 1718640000,
};

// 12 played + 8 unplayed = 20 total
export const MOCK_GAMES: SteamGame[] = [
  // PLAYED (12)
  { appid: 730,     name: "Counter-Strike 2",             playtime_forever: 18240, playtime_2weeks: 420, img_icon_url: "8dbc71957312bbd3baea65848b545be9eae2a355" },
  { appid: 570,     name: "Dota 2",                       playtime_forever: 36000, playtime_2weeks: 180, img_icon_url: "0bbb630d63262dd66d2fdd0f7d37e8661a410075" },
  { appid: 1245620, name: "Elden Ring",                   playtime_forever: 5400,  img_icon_url: "3f48f9dc5ab4e0fd5a2e96a67c36a3e0e2d46a3d" },
  { appid: 292030,  name: "The Witcher 3: Wild Hunt",     playtime_forever: 9000,  img_icon_url: "b4f572a6cc5a6a84ae84b4c458d1e7a2b43927ae" },
  { appid: 105600,  name: "Terraria",                     playtime_forever: 4200,  playtime_2weeks: 60, img_icon_url: "858961e4ce4f3b9b28f5c8ae8040cf1d777dfaa5" },
  { appid: 413150,  name: "Stardew Valley",               playtime_forever: 7200,  img_icon_url: "5a99b9b6c00c50b86f6d6bc2a0f1c00c6d0e6d73" },
  { appid: 252490,  name: "Rust",                         playtime_forever: 3600,  img_icon_url: "6b5f1a3c8c7f48b18b5f67e2d6f2c31e2f8c71f4" },
  { appid: 1054340, name: "Hades",                        playtime_forever: 2400,  img_icon_url: "7db83f3eeee616047b4dd8a82b2b02a1dfe94e5f" },
  { appid: 218620,  name: "PAYDAY 2",                     playtime_forever: 1800,  playtime_2weeks: 90, img_icon_url: "2c9c49b5f81b12c94c50f16f29e0d4f5bbf0d9d3" },
  { appid: 230410,  name: "Warframe",                     playtime_forever: 8400,  img_icon_url: "4b8d7e3c9c0f4b8d3c9c0f4b8d3c9c0f4b8d3c9c" },
  { appid: 814380,  name: "Sekiro: Shadows Die Twice",    playtime_forever: 2100,  img_icon_url: "fd7a344c05c2c5f38e8b52c47c6a0a8d2b4e6c8d" },
  { appid: 391220,  name: "Rise of the Tomb Raider",      playtime_forever: 1560,  img_icon_url: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2" },
  // UNPLAYED (8, playtime_forever === 0)
  { appid: 1091500, name: "Cyberpunk 2077",                        playtime_forever: 0, img_icon_url: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4" },
  { appid: 1174180, name: "Red Dead Redemption 2",                 playtime_forever: 0, img_icon_url: "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5" },
  { appid: 1672970, name: "Hogwarts Legacy",                       playtime_forever: 0, img_icon_url: "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6" },
  { appid: 2050650, name: "Resident Evil 4",                       playtime_forever: 0, img_icon_url: "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1" },
  { appid: 1817070, name: "Starfield",                             playtime_forever: 0, img_icon_url: "a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3" },
  { appid: 1938090, name: "Call of Duty: Modern Warfare III",      playtime_forever: 0, img_icon_url: "b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4" },
  { appid: 1551360, name: "Forza Horizon 5",                       playtime_forever: 0, img_icon_url: "c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5" },
  { appid: 1517290, name: "Battlefield 2042",                      playtime_forever: 0, img_icon_url: "d5e6f7a2b3c4d5e6f7a2b3c4d5e6f7a2b3c4d5e6" },
];

export const MOCK_RARITY_BADGES: RarityBadge[] = [
  {
    appid: 1245620,
    gameName: "Elden Ring",
    achievementName: "Elden Lord",
    achievementApiName: "ACH_ENDING_A",
    globalPercentage: 4.2,
    description: "Achieved the Elden Lord ending.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/1245620/ach_ending_a.jpg",
  },
  {
    appid: 814380,
    gameName: "Sekiro: Shadows Die Twice",
    achievementName: "Shura",
    achievementApiName: "ACH_SHURA",
    globalPercentage: 2.8,
    description: "Obtained the Shura ending.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/814380/ach_shura.jpg",
  },
  {
    appid: 292030,
    gameName: "The Witcher 3: Wild Hunt",
    achievementName: "Walked the Path",
    achievementApiName: "ACH_COMPLETE_MAIN",
    globalPercentage: 12.1,
    description: "Completed the main story on Death March.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/292030/ach_complete_main.jpg",
  },
  {
    appid: 1054340,
    gameName: "Hades",
    achievementName: "Best in the House",
    achievementApiName: "ACH_BEST_IN_HOUSE",
    globalPercentage: 6.5,
    description: "Completed a run with each weapon at max heat.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/1054340/ach_best_in_house.jpg",
  },
  {
    appid: 730,
    gameName: "Counter-Strike 2",
    achievementName: "The Wingman",
    achievementApiName: "ACH_WIN_WINGMAN_ROUNDS",
    globalPercentage: 3.1,
    description: "Won 200 Wingman rounds.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/730/ach_wingman.jpg",
  },
  {
    appid: 413150,
    gameName: "Stardew Valley",
    achievementName: "Master of the Five Ways",
    achievementApiName: "ACH_MASTER_FIVE",
    globalPercentage: 7.9,
    description: "Achieved level 10 in all five skills.",
    iconUrl: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/413150/ach_master_five.jpg",
  },
];
