import { PokemonDetailInfo, RegionalInfo, ObtainMethodDetail, DexAlternativeMethod } from '../types/pokemonInfo';

// ============================================================
// REGIONAL EXCLUSIVES DATA (Base species by Dex Number)
// ============================================================
export const REGIONAL_DATA: Record<number, RegionalInfo> = {
  // Gen 1
  83:  { isRegional: true, regionName: 'Japan / East Asia', countries: 'Japan, South Korea, Hong Kong, Taiwan', notes: "Galarian Farfetch'd (#083) is available worldwide and shares the same Pokédex entry" },
  115: { isRegional: true, regionName: 'Australia / Oceania', countries: 'Australia, New Zealand, parts of Southeast Asia', notes: 'Mega Kangaskhan can be battled worldwide in Mega Raids' },
  122: { isRegional: true, regionName: 'Europe', countries: 'All of Europe (including western Russia)', notes: "Galarian Mr. Mime is available worldwide during events; Mime Jr. hatches from 5km eggs from Europe" },
  128: { isRegional: true, regionName: 'North America', countries: 'USA, Canada, parts of Mexico', notes: 'Paldean Tauros Combat Breed is available worldwide; Blaze and Aqua Breeds are regional' },

  // Gen 2
  214: { isRegional: true, regionName: 'Latin America / Southern USA', countries: 'Latin America, South Florida, South Texas', notes: 'Mega Heracross can be battled worldwide in Mega Raids' },
  222: { isRegional: true, regionName: 'Tropical Regions', hemisphere: 'Within ±26° latitude (tropical zone)', countries: 'Southern USA, Caribbean, Southeast Asia, Northern Australia', notes: "Galarian Corsola also registers #222 and is available worldwide during events" },

  // Gen 3
  313: { isRegional: true, regionName: 'Europe / Asia / Oceania', countries: 'Europe, Asia, Australia, New Zealand', notes: 'Counterpart to Illumise (Americas/Africa)' },
  314: { isRegional: true, regionName: 'Americas / Africa', countries: 'North and South America, Africa', notes: 'Counterpart to Volbeat (Europe/Asia/Oceania)' },
  324: { isRegional: true, regionName: 'South Asia / Southeast Asia', countries: 'India, Nepal, Thailand, Indonesia, parts of China' },
  335: { isRegional: true, regionName: 'Europe / Asia / Oceania', countries: 'Europe, Asia, Australia', notes: 'Can occasionally swap hemispheres with Seviper during events' },
  336: { isRegional: true, regionName: 'Americas / Africa', countries: 'North and South America, Africa', notes: 'Can occasionally swap hemispheres with Zangoose during events' },
  337: { isRegional: true, regionName: 'Western Hemisphere', hemisphere: 'Western Hemisphere', notes: 'Can swap hemispheres with Solrock during solstice events' },
  338: { isRegional: true, regionName: 'Eastern Hemisphere', hemisphere: 'Eastern Hemisphere', notes: 'Can swap hemispheres with Lunatone during solstice events' },
  357: { isRegional: true, regionName: 'Africa / Middle East / Southern Spain', countries: 'Africa, Middle East, Southern Spain, Cyprus, Crete' },
  369: { isRegional: true, regionName: 'South Pacific / New Zealand', countries: 'New Zealand, Fiji, Vanuatu, New Caledonia' },

  // Gen 4
  417: { isRegional: true, regionName: 'Arctic / Subarctic Regions', countries: 'Canada, Alaska, Russia, Northern Scandinavia' },
  422: { isRegional: true, regionName: 'Hemisphere-split', hemisphere: 'Western / Eastern Hemisphere', notes: 'West Sea: West · East Sea: East' },
  439: { isRegional: true, regionName: 'Europe (5km Eggs)', countries: 'Europe (incl. Iceland, Cyprus)', notes: 'Hatches exclusively from 5km eggs sent by European friends' },
  441: { isRegional: true, regionName: 'Southern Hemisphere', hemisphere: 'Southern Hemisphere', countries: 'South America, South Africa, Australia, New Zealand' },
  455: { isRegional: true, regionName: 'Southeastern USA', countries: 'Florida, Georgia, North & South Carolina' },
  480: { isRegional: true, regionName: 'Asia-Pacific', countries: 'Japan, Australia, Southeast Asia, India', notes: '5-Star Raid Boss in Asia-Pacific (Remote Raid globally accessible). Extremely rare wild spawn near bodies of water.' },
  481: { isRegional: true, regionName: 'Europe / Africa / Middle East', countries: 'Europe, Africa, India, Middle East', notes: '5-Star Raid Boss in Europe/Africa/MEA (Remote Raid globally accessible). Extremely rare wild spawn near bodies of water.' },
  482: { isRegional: true, regionName: 'Americas & Greenland', countries: 'North and South America, Greenland', notes: '5-Star Raid Boss in Americas (Remote Raid globally accessible). Extremely rare wild spawn near bodies of water.' },

  // Gen 5
  511: { isRegional: true, regionName: 'Asia-Pacific', countries: 'Japan, Australia, Southeast Asia, India', notes: 'Counterpart to Pansear (Europe/MEA) and Panpour (Americas)' },
  512: { isRegional: true, regionName: 'Asia-Pacific', countries: 'Japan, Australia, Southeast Asia, India', notes: 'Evolves from Pansage with 50 Candy and an Unova Stone' },
  513: { isRegional: true, regionName: 'Europe / Africa / Middle East / India', countries: 'Europe, Africa, Middle East, India', notes: 'Counterpart to Pansage (Asia-Pacific) and Panpour (Americas)' },
  514: { isRegional: true, regionName: 'Europe / Africa / Middle East / India', countries: 'Europe, Africa, Middle East, India', notes: 'Evolves from Pansear with 50 Candy and an Unova Stone' },
  515: { isRegional: true, regionName: 'Americas & Greenland', countries: 'North and South America, Greenland', notes: 'Counterpart to Pansage (Asia-Pacific) and Pansear (Europe/MEA)' },
  516: { isRegional: true, regionName: 'Americas & Greenland', countries: 'North and South America, Greenland', notes: 'Evolves from Panpour with 50 Candy and an Unova Stone' },
  538: { isRegional: true, regionName: 'Americas / Africa', countries: 'North and South America, Africa', notes: 'Counterpart to Sawk (Europe/Asia/Oceania)' },
  539: { isRegional: true, regionName: 'Europe / Asia / Oceania', countries: 'Europe, Asia, Australia', notes: 'Counterpart to Throh (Americas/Africa)' },
  550: { isRegional: true, regionName: 'Hemisphere-split', hemisphere: 'Western / Eastern Hemisphere', notes: 'Red-Striped: Eastern Hemisphere · Blue-Striped: Western Hemisphere · White-Striped: Routes & Mateo' },
  556: { isRegional: true, regionName: 'Southern USA / Latin America / Caribbean', countries: 'Southern USA, Mexico, Central & South America, Caribbean' },
  561: { isRegional: true, regionName: 'Egypt / Greece / Middle East', countries: 'Egypt, Greece, Israel, Jordan' },
  626: { isRegional: true, regionName: 'New York City & Vicinity', countries: 'New York City, New York State and parts of adjacent US states' },
  631: { isRegional: true, regionName: 'Western Hemisphere', hemisphere: 'Western Hemisphere', notes: 'Counterpart to Durant (Eastern Hemisphere)' },
  632: { isRegional: true, regionName: 'Eastern Hemisphere', hemisphere: 'Eastern Hemisphere', notes: 'Counterpart to Heatmor (Western Hemisphere)' },

  // Gen 6
  701: { isRegional: true, regionName: 'Mexico & Surrounding Area', countries: 'Mexico and bordering southern US border regions' },
  707: { isRegional: true, regionName: 'France & Neighboring Areas', countries: 'France, Belgium, Luxembourg, Switzerland, Southern England' },
  741: { isRegional: true, regionName: 'Various Regions (Form-dependent)', countries: "Baile: Europe/MEA · Pom-Pom: Americas · Pa'u: Africa/Pacific · Sensu: Asia-Pacific", notes: 'Each form has a different native world region' },

  // Gen 7
  764: { isRegional: true, regionName: 'Hawaii', countries: 'Exclusively the Hawaiian Islands (USA)' },
  794: { isRegional: true, regionName: 'Americas & Greenland', hemisphere: 'Western Hemisphere', countries: 'North and South America, Greenland', notes: 'Appears as 5-Star Raid Boss only in Americas & Greenland (Remote Raid globally accessible)' },
  795: { isRegional: true, regionName: 'Europe / Africa / Middle East / India', countries: 'Europe, Middle East, Africa, India', notes: 'Appears as 5-Star Raid Boss only in Europe/MEA/India (Remote Raid globally accessible)' },
  796: { isRegional: true, regionName: 'Asia-Pacific', countries: 'Japan, Australia, New Zealand, Southeast Asia', notes: 'Appears as 5-Star Raid Boss only in Asia-Pacific (Remote Raid globally accessible)' },
  797: { isRegional: true, regionName: 'Southern Hemisphere', hemisphere: 'Southern Hemisphere', countries: 'South America, South Africa, Australia, New Zealand', notes: 'Appears as 5-Star Raid Boss only in Southern Hemisphere (Remote Raid globally accessible)' },
  798: { isRegional: true, regionName: 'Northern Hemisphere', hemisphere: 'Northern Hemisphere', countries: 'North America, Europe, North Asia', notes: 'Appears as 5-Star Raid Boss only in Northern Hemisphere (Remote Raid globally accessible)' },
  805: { isRegional: true, regionName: 'Eastern Hemisphere', hemisphere: 'Eastern Hemisphere', countries: 'Europe, Asia, Africa, Australia', notes: 'Appears as 5-Star Raid Boss only in Eastern Hemisphere (Remote Raid globally accessible)' },
  806: { isRegional: true, regionName: 'Western Hemisphere', hemisphere: 'Western Hemisphere', countries: 'North and South America', notes: 'Appears as 5-Star Raid Boss only in Western Hemisphere (Remote Raid globally accessible)' },

  // Gen 8 & 9
  874: { isRegional: true, regionName: 'United Kingdom', countries: 'United Kingdom (England, Scotland, Wales)', notes: 'Spawns exclusively in the wild in the United Kingdom' },
};

export const REGIONAL_DEX_NRS = new Set<number>(Object.keys(REGIONAL_DATA).map(Number));

// ============================================================
// PER-FORM REGIONAL DATA (form-specific regional exclusives)
// Keyed by exact Pokemon ID (e.g. 'poke_931_special_blue_plumage')
// ============================================================
const REGIONAL_DATA_BY_ID: Record<string, RegionalInfo> = {
  // ── Squawkabilly #931 ──────────────────────────────────────
  'poke_931_base':                    { isRegional: true, regionName: 'Europe / Middle East / Africa', countries: 'Europe, Middle East, Africa (Green Plumage)' },
  'poke_931_special_blue_plumage':    { isRegional: true, regionName: 'Americas', countries: 'North and South America (Blue Plumage)' },
  'poke_931_special_yellow_plumage':  { isRegional: true, regionName: 'Asia-Pacific', countries: 'Japan, China, Southeast Asia, Australia, New Zealand (Yellow Plumage)' },
  'poke_931_special_white_plumage':   { isRegional: true, regionName: 'Africa / India / Middle East', countries: 'India, parts of Africa, Middle East (White Plumage)' },

  // ── Oricorio #741 ──────────────────────────────────────────
  'poke_741_base':             { isRegional: true, regionName: 'Europe / Middle East / Africa', countries: 'Europe, Middle East, Africa (Baile Style)' },
  'poke_741_special_pom_pom':  { isRegional: true, regionName: 'Americas', countries: 'North and South America (Pom-Pom Style)' },
  'poke_741_special_pa_u':     { isRegional: true, regionName: 'Africa / Pacific Islands / South Asia', countries: "Sub-Saharan Africa, Pacific Islands, South Asia (Pa'u Style)" },
  'poke_741_special_sensu':    { isRegional: true, regionName: 'Asia-Pacific', countries: 'Japan, China, Southeast Asia, Australia (Sensu Style)' },

  // ── Shellos & Gastrodon #422 ──────────────────────────────
  'poke_422_base':             { isRegional: true, regionName: 'Western Hemisphere', hemisphere: 'Western Hemisphere', notes: 'West Sea spawns west of the prime meridian (Americas, Western Europe)' },
  'poke_422_special_east_sea': { isRegional: true, regionName: 'Eastern Hemisphere', hemisphere: 'Eastern Hemisphere', notes: 'East Sea spawns east of the prime meridian (Eastern Europe, Asia, Oceania)' },

  // ── Basculin #550 ──────────────────────────────────────────
  'poke_550_base':                   { isRegional: true, regionName: 'Eastern Hemisphere', hemisphere: 'Eastern Hemisphere', notes: 'Red-Striped Form spawns wild in the Eastern Hemisphere' },
  'poke_550_special_blue_striped':   { isRegional: true, regionName: 'Western Hemisphere', hemisphere: 'Western Hemisphere', notes: 'Blue-Striped Form spawns wild in the Western Hemisphere' },
  'poke_550_special_white_striped':  { isRegional: false, notes: 'White-Striped Form: Available worldwide via Routes & Mateo (7km Eggs)' },

  // ── Flabébé #669, Floette #670, Florges #671 ──────────────
  'poke_669_base':            { isRegional: true, regionName: 'Americas', countries: 'North and South America (Red Flower)' },
  'poke_669_special_blue':    { isRegional: true, regionName: 'Europe / Asia-Pacific', countries: 'Europe and parts of Asia (Blue Flower)' },
  'poke_669_special_yellow':  { isRegional: true, regionName: 'Americas / Asia-Pacific', countries: 'North and South America, Asia (Yellow Flower)' },
  'poke_669_special_white':   { isRegional: false, notes: 'White Flower: Very rare wild spawn worldwide' },
  'poke_669_special_orange':  { isRegional: false, notes: 'Orange Flower: Very rare wild spawn worldwide' },

  'poke_670_base':            { isRegional: true, regionName: 'Americas', countries: 'North and South America (Red Flower)' },
  'poke_670_special_blue':    { isRegional: true, regionName: 'Europe / Asia-Pacific', countries: 'Europe and parts of Asia (Blue Flower)' },
  'poke_670_special_yellow':  { isRegional: true, regionName: 'Americas / Asia-Pacific', countries: 'North and South America, Asia (Yellow Flower)' },
  'poke_670_special_white':   { isRegional: false, notes: 'White Flower: Evolves worldwide from Flabébé (White)' },
  'poke_670_special_orange':  { isRegional: false, notes: 'Orange Flower: Evolves worldwide from Flabébé (Orange)' },

  'poke_671_base':            { isRegional: true, regionName: 'Americas', countries: 'North and South America (Red Flower)' },
  'poke_671_special_blue':    { isRegional: true, regionName: 'Europe / Asia-Pacific', countries: 'Europe and parts of Asia (Blue Flower)' },
  'poke_671_special_yellow':  { isRegional: true, regionName: 'Americas / Asia-Pacific', countries: 'North and South America, Asia (Yellow Flower)' },
  'poke_671_special_white':   { isRegional: false, notes: 'White Flower: Evolves worldwide from Floette (White)' },
  'poke_671_special_orange':  { isRegional: false, notes: 'Orange Flower: Evolves worldwide from Floette (Orange)' },

  // ── Paldean Tauros #128 ────────────────────────────────────
  'poke_128_form_tauros_paldea_combat': { isRegional: false, notes: 'Combat Breed: Available worldwide during events' },
  'poke_128_form_tauros_paldea_blaze':  { isRegional: true, regionName: 'Spain / Portugal', countries: 'Spain and Portugal (Blaze Breed)', notes: 'Regional exclusive to Spain and Portugal' },
  'poke_128_form_tauros_paldea_aqua':   { isRegional: true, regionName: 'UK / Ireland', countries: 'United Kingdom and Ireland (Aqua Breed)', notes: 'Regional exclusive to UK and Ireland' },

  // ── Burmy #412 & Wormadam #413 ─────────────────────────────
  'poke_412_base':           { isRegional: true, regionName: 'Europe / Africa / Middle East / India', countries: 'Europe, Africa, Middle East, India (Plant Cloak)' },
  'poke_412_special_sandy':  { isRegional: true, regionName: 'Americas & Greenland', countries: 'North and South America, Greenland (Sandy Cloak)' },
  'poke_412_special_trash':  { isRegional: true, regionName: 'Asia-Pacific', countries: 'Japan, Southeast Asia, Australia (Trash Cloak)' },
  'poke_413_base':           { isRegional: true, regionName: 'Europe / Africa / Middle East / India', countries: 'Europe, Africa, Middle East, India (Plant Cloak)' },
  'poke_413_special_sandy':  { isRegional: true, regionName: 'Americas & Greenland', countries: 'North and South America, Greenland (Sandy Cloak)' },
  'poke_413_special_trash':  { isRegional: true, regionName: 'Asia-Pacific', countries: 'Japan, Southeast Asia, Australia (Trash Cloak)' },

  // ── Furfrou #676 (Regional Trims) ──────────────────────────
  'poke_676_base':               { isRegional: false, notes: 'Natural Form is available worldwide in the wild' },
  'poke_676_special_matron':     { isRegional: false, notes: 'Matron Trim: Available worldwide via form change (10,000 Stardust + 25 Candy)' },
  'poke_676_special_dandy':      { isRegional: false, notes: 'Dandy Trim: Available worldwide via form change (10,000 Stardust + 25 Candy)' },
  'poke_676_special_heart':      { isRegional: false, notes: "Heart Trim: Available worldwide exclusively during Valentine's Day events" },
  'poke_676_special_debutante':  { isRegional: true, regionName: 'Americas', countries: 'North and South America (Debutante Trim)' },
  'poke_676_special_diamond':    { isRegional: true, regionName: 'Europe / Middle East / Africa', countries: 'Europe, Middle East, Africa (Diamond Trim)' },
  'poke_676_special_star':       { isRegional: true, regionName: 'Asia-Pacific', countries: 'Asia-Pacific (Star Trim)' },
  'poke_676_special_la_reine':   { isRegional: true, regionName: 'France', countries: 'Exclusively in France (La Reine Trim)' },
  'poke_676_special_kabuki':     { isRegional: true, regionName: 'Japan', countries: 'Exclusively in Japan (Kabuki Trim)' },
  'poke_676_special_pharaoh':    { isRegional: true, regionName: 'Egypt', countries: 'Exclusively in Egypt (Pharaoh Trim)' },

  // ── Vivillon #666 (Postcard Regional Patterns) ─────────────
  'poke_666_base':                           { isRegional: true, regionName: 'Central Europe', countries: 'Germany, Switzerland, France, Italy (Meadow Pattern)' },
  'poke_666_form_vivillon_archipelago':      { isRegional: true, regionName: 'Caribbean / Florida', countries: 'Caribbean, Florida, South Africa (Archipelago Pattern)' },
  'poke_666_form_vivillon_continental':      { isRegional: true, regionName: 'Central & Eastern Europe / Argentina', countries: 'Germany, Poland, Czech Republic, Denmark, Argentina (Continental Pattern)' },
  'poke_666_form_vivillon_elegant':          { isRegional: true, regionName: 'Japan', countries: 'Japan (Elegant Pattern)' },
  'poke_666_form_vivillon_fancy':            { isRegional: false, notes: 'Fancy Pattern: Available worldwide during special events' },
  'poke_666_form_vivillon_garden':           { isRegional: true, regionName: 'UK / Ireland / New Zealand', countries: 'United Kingdom, Ireland, New Zealand (Garden Pattern)' },
  'poke_666_form_vivillon_high_plains':      { isRegional: true, regionName: 'Western USA / Mexico', countries: 'Western USA, Mexico (High Plains Pattern)' },
  'poke_666_form_vivillon_icy_snow':         { isRegional: true, regionName: 'Northern Europe / Greenland', countries: 'Norway, Finland, Northern Sweden, Greenland (Icy Snow Pattern)' },
  'poke_666_form_vivillon_jungle':           { isRegional: true, regionName: 'Equatorial South America / Southeast Asia', countries: 'Colombia, Brazil, Malaysia, Indonesia (Jungle Pattern)' },
  'poke_666_form_vivillon_marine':           { isRegional: true, regionName: 'Southern Europe / Mediterranean / Chile', countries: 'Spain, Portugal, Greece, Chile (Marine Pattern)' },
  'poke_666_form_vivillon_modern':           { isRegional: true, regionName: 'USA (Midwest & Southeast)', countries: 'USA: Central & Eastern states (Modern Pattern)' },
  'poke_666_form_vivillon_monsoon':          { isRegional: true, regionName: 'Southeast Asia / India', countries: 'India, Thailand, Vietnam, Taiwan (Monsoon Pattern)' },
  'poke_666_form_vivillon_ocean':            { isRegional: true, regionName: 'Hawaii / Galápagos / Madagascar', countries: 'Hawaii, Galápagos, Madagascar, Réunion (Ocean Pattern)' },
  'poke_666_form_vivillon_pokeball':         { isRegional: false, notes: 'Poké Ball Pattern: Available worldwide only during special events' },
  'poke_666_form_vivillon_polar':            { isRegional: true, regionName: 'Canada / Alaska / Northeast USA', countries: 'Canada, Alaska, New England, Southern Chile (Polar Pattern)' },
  'poke_666_form_vivillon_river':            { isRegional: true, regionName: 'Australia / South Africa', countries: 'Australia, South Africa (River Pattern)' },
  'poke_666_form_vivillon_sandstorm':        { isRegional: true, regionName: 'Middle East', countries: 'Saudi Arabia, UAE, Israel, Egypt (Sandstorm Pattern)' },
  'poke_666_form_vivillon_savanna':          { isRegional: true, regionName: 'Brazil', countries: 'Brazil (Savanna Pattern)' },
  'poke_666_form_vivillon_sun':              { isRegional: true, regionName: 'Mexico / Madagascar / Northern Australia', countries: 'Mexico, Madagascar, Northern Australia (Sun Pattern)' },
  'poke_666_form_vivillon_tundra':           { isRegional: true, regionName: 'Iceland / Northern Scandinavia', countries: 'Iceland, Northern Norway, Northern Sweden, Hokkaido (Tundra Pattern)' },

  // ── Explicit Non-Regional Overrides for Alternate Forms ────
  // Base species are regional, but these forms are globally accessible!
  'poke_83_form_farfetchd_galarian':  { isRegional: false, notes: "Galarian Farfetch'd is available worldwide via 7km Eggs and Raids (only Kantonian Farfetch'd is East Asia exclusive)" },
  'poke_122_form_mr_mime_galarian':   { isRegional: false, notes: "Galarian Mr. Mime is available worldwide during holiday events (only Kantonian Mr. Mime is Europe exclusive)" },
  'poke_222_form_corsola_galarian':   { isRegional: false, notes: "Galarian Corsola is available worldwide during events and from 7km Eggs (only Johtonian Corsola is tropical)" },
  'poke_222_costume_sunglasses':      { isRegional: false, notes: 'Event costume available worldwide' },
};

export const REGIONAL_FORM_IDS = new Set<string>(
  Object.entries(REGIONAL_DATA_BY_ID)
    .filter(([, v]) => v.isRegional)
    .map(([k]) => k)
);

// ============================================================
// REGIONAL RAID BOSSES (5-Star Raids only in specific regions)
// ============================================================
export const REGIONAL_RAID_DEX_NRS = new Set<number>([
  794, // Buzzwole (Americas & Greenland)
  795, // Pheromosa (Europe / MEA / India)
  796, // Xurkitree (Asia-Pacific)
  797, // Celesteela (Southern Hemisphere)
  798, // Kartana (Northern Hemisphere)
  805, // Stakataka (Eastern Hemisphere)
  806, // Blacephalon (Western Hemisphere)
]);

// Lake Trio: Regional 5-Star Raid Bosses AND ultra-rare wild spawns near water
export const REGIONAL_LAKE_TRIO_DEX_NRS = new Set<number>([
  480, // Uxie (Asia-Pacific)
  481, // Mesprit (Europe / Africa / MEA)
  482, // Azelf (Americas & Greenland)
]);

// ============================================================
// STANDARD 5-STAR RAID ONLY LEGENDARIES (Global / Non-Regional)
// ============================================================
export const RAID_ONLY_DEX_NRS = new Set<number>([
  // Gen 1 & 2
  144, 145, 146, 150,
  243, 244, 245, 249, 250,
  // Gen 3
  377, 378, 379, 380, 381, 382, 383, 384, 386,
  // Gen 4
  483, 484, 485, 486, 487, 488, 491,
  // Gen 5
  638, 639, 640, 641, 642, 643, 644, 645, 646, 649,
  // Gen 6
  716, 717,
  // Gen 7
  785, 786, 787, 788, 793, 799, 800,
  // Gen 8
  888, 889, 894, 895,
]);

// ============================================================
// SPECIAL RESEARCH ONLY (Mythicals & Box Legendaries)
// ============================================================
export const RESEARCH_ONLY_DEX_NRS = new Set<number>([
  151, // Mew
  251, // Celebi
  385, // Jirachi
  492, // Shaymin
  494, // Victini
  647, // Keldeo
  648, // Meloetta
  718, // Zygarde
  719, // Diancie
  720, // Hoopa
  789, // Cosmog
  790, // Cosmoem
  802, // Marshadow
  803, // Poipole
  891, // Kubfu
  892, // Urshifu
  893, // Zarude
]);

// ============================================================
// UNRELEASED IN POKÉMON GO
// ============================================================
export const UNRELEASED_DEX_NRS = new Set<number>([
  489, 490, 493, // Phione, Manaphy, Arceus
  721,           // Volcanion
  801, 804, 807, // Magearna, Naganadel, Zeraora
  890, 896, 897, 898, // Eternatus, Glastrier, Spectrier, Calyrex
  1001, 1002, 1003, 1004, // Treasures of Ruin
  1007, 1008, 1009, 1010, // Koraidon, Miraidon, Walking Wake, Iron Leaves
  1014, 1015, 1016, 1017, // Okidogi, Munkidori, Fezandipiti, Ogerpon
  1024, 1025     // Terapagos, Pecharunt
]);

// ============================================================
// BABY EGG POKÉMON (No wild spawns)
// ============================================================
export const BABY_EGG_POKEMON = new Set<number>([
  172, 173, 174, 175, 236, 237, 238, 239, 240, 298, 360,
  406, 438, 439, 440, 446, 447, 458, 459, 848
]);

// ============================================================
// MEGA / PRIMAL POKÉMON WITH RAIDS
// ============================================================
export const MEGA_RAID_POKEMON = new Set<number>([
  3, 6, 9, 65, 94, 115, 127, 130, 142, 181, 208, 212, 214, 229, 248, 257,
  260, 282, 302, 303, 306, 308, 310, 319, 323, 334, 354, 359, 362, 373, 376,
  380, 381, 384, 428, 445, 448, 460, 461, 531, 719, 720
]);

// ============================================================
// FORM-SPECIFIC OBTAIN METHODS (Keyed by Pokemon ID)
// Overrides generic species obtain methods for forms!
// ============================================================
const FORM_OBTAIN_METHODS: Record<string, ObtainMethodDetail[]> = {
  // ── Galarian Legendary Birds (Adventure Incense ONLY, NOT in Raids) ─
  'poke_144_form_articuno_galarian': [
    { type: 'special', label: 'Daily Adventure Incense', badgeColor: 'pink', description: 'Extremely rare spawn exclusively during the daily 15-minute Daily Adventure Incense (high flee rate). Not available in Raids!', available: true }
  ],
  'poke_145_form_zapdos_galarian': [
    { type: 'special', label: 'Daily Adventure Incense', badgeColor: 'pink', description: 'Extremely rare spawn exclusively during the daily 15-minute Daily Adventure Incense (high flee rate). Not available in Raids!', available: true }
  ],
  'poke_146_form_moltres_galarian': [
    { type: 'special', label: 'Daily Adventure Incense', badgeColor: 'pink', description: 'Extremely rare spawn exclusively during the daily 15-minute Daily Adventure Incense (high flee rate). Not available in Raids!', available: true }
  ],

  // ── Raid-Exclusive Regional Forms (3-Star Raids / Raid-Days, NOT wild) ─
  'poke_26_form_raichu_alola': [
    { type: 'raid', label: '3-Star Raid', badgeColor: 'rose', description: 'Appears as a 3-Star Raid Boss (cannot be encountered wild or evolved normally from Pikachu in GO).', available: true },
    { type: 'research', label: 'Field Research', badgeColor: 'blue', description: 'Occasionally available as an event Field Research encounter reward.', available: true }
  ],
  'poke_105_form_marowak_alola': [
    { type: 'raid', label: '3-Star Raid', badgeColor: 'rose', description: 'Appears as a 3-Star Raid Boss and GO Battle League encounter reward (not in the wild).', available: true },
    { type: 'research', label: 'Field Research', badgeColor: 'blue', description: 'Occasionally available in event Field Research tasks.', available: true }
  ],
  'poke_110_form_weezing_galarian': [
    { type: 'raid', label: '3-Star Raid', badgeColor: 'rose', description: 'Appears as a 3-Star Raid Boss during events (not in the wild).', available: true }
  ],
  'poke_628_form_braviary_hisuian': [
    { type: 'raid', label: '3-Star Raid', badgeColor: 'rose', description: 'Appears as a 3-Star Raid Boss during special Raid Days and events (not in the wild).', available: true }
  ],
  'poke_713_form_avalugg_hisuian': [
    { type: 'raid', label: '3-Star Raid', badgeColor: 'rose', description: 'Appears as a 3-Star Raid Boss during special Raid Days and events (not in the wild).', available: true }
  ],
  'poke_157_form_typhlosion_hisuian': [
    { type: 'raid', label: '3-Star Raid', badgeColor: 'rose', description: 'Appears as a 3-Star Raid Boss during special Raid Days and events (not in the wild).', available: true }
  ],
  'poke_503_form_samurott_hisuian': [
    { type: 'raid', label: '3-Star Raid', badgeColor: 'rose', description: 'Appears as a 3-Star Raid Boss during special Raid Days and events (not in the wild).', available: true }
  ],
  'poke_724_form_decidueye_hisuian': [
    { type: 'raid', label: '3-Star Raid', badgeColor: 'rose', description: 'Appears as a 3-Star Raid Boss during special Raid Days and events (not in the wild).', available: true }
  ],
  'poke_549_form_lilligant_hisuian': [
    { type: 'raid', label: '3-Star Raid', badgeColor: 'rose', description: 'Appears as a 3-Star Raid Boss during special events (not in the wild).', available: true }
  ],

  // ── White-Striped Basculin (Routes & Mateo 7km Eggs) ───────
  'poke_550_special_white_striped': [
    { type: 'special', label: 'Routes & Mateo (7km Egg)', badgeColor: 'amber', description: 'Spawns while walking Routes and hatches from Mateo Gift Eggs (7km). Not normally found in the wild!', available: true }
  ],

  // ── Research & Event Exclusive Regional Forms ─────────────
  'poke_122_form_mr_mime_galarian': [
    { type: 'research', label: 'Event Research', badgeColor: 'blue', description: 'Available during winter/holiday events via Special or Timed Research.', available: true },
    { type: 'raid', label: '3-Star Raid', badgeColor: 'rose', description: 'Also appears in Raids during holiday events.', available: true }
  ],
  'poke_222_form_corsola_galarian': [
    { type: 'egg', label: '7km Egg / Event', badgeColor: 'amber', description: 'Hatches from 7km Eggs during special events or as a Special Research reward (not normally in the wild).', available: true },
    { type: 'research', label: 'Special Research', badgeColor: 'blue', description: 'Special Research reward during Halloween events.', available: true }
  ],
  'poke_562_form_yamask_galarian': [
    { type: 'research', label: 'Halloween Research', badgeColor: 'blue', description: 'Available during Halloween events via Special Research and 7km Eggs.', available: true },
    { type: 'raid', label: '1-Star Raid', badgeColor: 'rose', description: 'Appears in 1-Star Raids during Halloween events.', available: true }
  ],
  'poke_570_form_zorua_hisuian': [
    { type: 'special', label: 'Buddy Disguise', badgeColor: 'pink', description: 'Appears on the map disguised as your current Buddy Pokémon during Halloween events.', available: true }
  ],

  // ── 7km Egg Primary / Exclusive Forms (Gift Eggs) ──────────
  'poke_83_form_farfetchd_galarian': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: "Hatches from 7km Gift Eggs. Available worldwide!", available: true },
    { type: 'raid', label: '1-Star Raid', badgeColor: 'rose', description: 'Periodically featured in 1-Star Raids during relevant events.', available: true }
  ],
  'poke_52_form_meowth_galarian': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Hatches from 7km Gift Eggs and Field Research.', available: true }
  ],
  'poke_77_form_ponyta_galarian': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Hatches from 7km Gift Eggs.', available: true },
    { type: 'raid', label: '1-Star Raid', badgeColor: 'rose', description: 'Appears in 1-Star Raids during events.', available: true }
  ],
  'poke_79_form_slowpoke_galarian': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Hatches from 7km Gift Eggs, or in 1-Star Raids and Field Research.', available: true },
    { type: 'raid', label: '1-Star Raid', badgeColor: 'rose', description: 'Appears in 1-Star Raids during events.', available: true }
  ],
  'poke_263_form_zigzagoon_galarian': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Hatches from 7km Gift Eggs.', available: true },
    { type: 'wild', label: 'Event Wild', badgeColor: 'emerald', description: 'Spawns in the wild during certain events.', available: true }
  ],
  'poke_554_form_darumaka_galarian': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Hatches from 7km Gift Eggs.', available: true },
    { type: 'wild', label: 'Winter Event Wild', badgeColor: 'emerald', description: 'Spawns in the wild and Raids during winter events.', available: true }
  ],
  'poke_618_form_stunfisk_galarian': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Hatches from 7km Gift Eggs.', available: true },
    { type: 'wild', label: 'Wild', badgeColor: 'emerald', description: 'Also spawns in the wild on the map.', available: true }
  ],
  'poke_27_form_sandshrew_alola': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Primarily hatches from 7km Gift Eggs.', available: true },
    { type: 'wild', label: 'Event Wild', badgeColor: 'emerald', description: 'Spawns in the wild during ice-themed events.', available: true }
  ],
  'poke_37_form_vulpix_alola': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Primarily hatches from 7km Gift Eggs and Field Research.', available: true }
  ],
  'poke_50_form_diglett_alola': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Hatches from 7km Gift Eggs.', available: true },
    { type: 'wild', label: 'Wild / Events', badgeColor: 'emerald', description: 'Spawns in the wild and during events.', available: true }
  ],
  'poke_52_form_meowth_alola': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Hatches from 7km Gift Eggs and Field Research.', available: true }
  ],
  'poke_74_form_geodude_alola': [
    { type: 'wild', label: 'Wild', badgeColor: 'emerald', description: 'Spawns in the wild on the map.', available: true },
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Also hatches from 7km Gift Eggs.', available: true }
  ],
  'poke_88_form_grimer_alola': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Primarily hatches from 7km Gift Eggs or during events.', available: true }
  ],
  'poke_103_form_exeggutor_alola': [
    { type: 'raid', label: '3-Star Raid', badgeColor: 'rose', description: 'Appears as a 3-Star Raid Boss during events.', available: true },
    { type: 'wild', label: 'Wild (Rare)', badgeColor: 'emerald', description: 'Spawns rarely in the wild on the map.', available: true }
  ],
  'poke_58_form_growlithe_hisuian': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Primarily hatches from 7km Gift Eggs and Field Research.', available: true }
  ],
  'poke_100_form_voltorb_hisuian': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Hatches from 7km Gift Eggs.', available: true },
    { type: 'wild', label: 'Event Wild', badgeColor: 'emerald', description: 'Spawns in the wild during Hisui-themed events.', available: true }
  ],
  'poke_211_form_qwilfish_hisuian': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Hatches from 7km Gift Eggs and spawns wild during events.', available: true }
  ],
  'poke_215_form_sneasel_hisuian': [
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Primarily hatches from 7km Gift Eggs or in 1-Star Raids.', available: true }
  ],
  'poke_194_form_wooper_paldea': [
    { type: 'wild', label: 'Wild', badgeColor: 'emerald', description: 'Spawns in the wild on the map.', available: true },
    { type: 'egg', label: '7km Egg', badgeColor: 'amber', description: 'Also hatches from 7km Eggs.', available: true }
  ],
  'poke_705_special_hisuian': [
    { type: 'raid', label: '3-Star Raid / Evolution', badgeColor: 'rose', description: 'Appears in 3-Star Raids or by evolving Goomy with Candy during rain.', available: true }
  ],

  // ── Evolved Regional Forms (Evolution from Regional Base) ─
  'poke_20_form_raticate_alola': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Alolan Rattata with 25 Candy at night.', available: true }
  ],
  'poke_28_form_sandslash_alola': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Alolan Sandshrew with 50 Candy.', available: true }
  ],
  'poke_38_form_ninetales_alola': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Alolan Vulpix with 50 Candy.', available: true }
  ],
  'poke_51_form_dugtrio_alola': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Alolan Diglett with 50 Candy.', available: true }
  ],
  'poke_53_form_persian_alola': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Alolan Meowth with 50 Candy.', available: true }
  ],
  'poke_75_form_graveler_alola': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Alolan Geodude with 25 Candy.', available: true }
  ],
  'poke_76_form_golem_alola': [
    { type: 'evolution', label: 'Evolution / Trade', badgeColor: 'indigo', description: 'Evolves from Alolan Graveler with 100 Candy (or free via Trade).', available: true }
  ],
  'poke_89_form_muk_alola': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Alolan Grimer with 50 Candy.', available: true }
  ],
  'poke_78_form_rapidash_galarian': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Galarian Ponyta with 50 Candy.', available: true }
  ],
  'poke_80_form_slowbro_galarian': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Galarian Slowpoke (50 Candy + catch 30 Poison-type Pokémon as buddy).', available: true }
  ],
  'poke_199_form_slowking_galarian': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Galarian Slowpoke (50 Candy + catch 30 Psychic-type Pokémon as buddy).', available: true }
  ],
  'poke_264_form_linoone_galarian': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Galarian Zigzagoon with 25 Candy.', available: true }
  ],
  'poke_555_form_darmanitan_galarian_standard': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Galarian Darumaka with 50 Candy.', available: true }
  ],
  'poke_555_form_darmanitan_galarian_zen': [
    { type: 'special', label: 'Zen Mode', badgeColor: 'pink', description: 'Special Zen Mode form featured during events.', available: true }
  ],
  'poke_59_form_arcanine_hisuian': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Hisuian Growlithe with 50 Candy.', available: true }
  ],
  'poke_101_form_electrode_hisuian': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Hisuian Voltorb with 50 Candy.', available: true }
  ],
  'poke_571_form_zoroark_hisuian': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Hisuian Zorua with 50 Candy.', available: true }
  ],
  'poke_706_special_hisuian': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from Hisuian Sliggoo with 100 Candy during rain / Rainy Lure Module.', available: true }
  ],

  // ── Paldean Tauros Breeds ──────────────────────────────────
  'poke_128_form_tauros_paldea_combat': [
    { type: 'wild', label: 'Event Wild', badgeColor: 'emerald', description: 'Spawns in the wild during worldwide Paldea events.', available: true }
  ],
  'poke_128_form_tauros_paldea_blaze': [
    { type: 'wild', label: 'Wild (Regional)', badgeColor: 'emerald', description: 'Spawns in the wild exclusively in Spain and Portugal.', available: true }
  ],
  'poke_128_form_tauros_paldea_aqua': [
    { type: 'wild', label: 'Wild (Regional)', badgeColor: 'emerald', description: 'Spawns in the wild exclusively in the United Kingdom and Ireland.', available: true }
  ],

  // ── Burmy & Wormadam Cloaks ────────────────────────────────
  'poke_412_base': [
    { type: 'wild', label: 'Wild (Regional)', badgeColor: 'emerald', description: 'Plant Cloak spawns wild in Europe, Africa, Middle East, and India.', available: true }
  ],
  'poke_412_special_sandy': [
    { type: 'wild', label: 'Wild (Regional)', badgeColor: 'emerald', description: 'Sandy Cloak spawns wild in North and South America, and Greenland.', available: true }
  ],
  'poke_412_special_trash': [
    { type: 'wild', label: 'Wild (Regional)', badgeColor: 'emerald', description: 'Trash Cloak spawns wild in the Asia-Pacific region.', available: true }
  ],
  'poke_413_base': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from female Plant Cloak Burmy with 50 Candy.', available: true }
  ],
  'poke_413_special_sandy': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from female Sandy Cloak Burmy with 50 Candy.', available: true }
  ],
  'poke_413_special_trash': [
    { type: 'evolution', label: 'Evolution', badgeColor: 'indigo', description: 'Evolves from female Trash Cloak Burmy with 50 Candy.', available: true }
  ],
};

// ============================================================
// SPECIAL NOTES PER SPECIES
// ============================================================
const SPECIAL_NOTES: Record<number, string> = {
  132:  'Ditto disguises itself as other common Pokémon. It cannot be caught directly — it reveals itself only after being caught.',
  151:  'Mew is only obtainable via the Special Research storyline "A Mythical Discovery".',
  201:  'Unown has 28 letter forms. Forms spawn rarely during global events or in specific regions.',
  235:  'Smeargle can appear via snapshot mode (photobomb) — it photobombs your picture and then spawns on the map.',
  480:  'Uxie appears worldwide in 5-Star Raids for trainers invited via Remote Raid Pass. Extremely rare wild spawn near lakes/water in Asia-Pacific.',
  481:  'Mesprit appears worldwide in 5-Star Raids for trainers invited via Remote Raid Pass. Extremely rare wild spawn near lakes/water in Europe/Africa/MEA.',
  482:  'Azelf appears worldwide in 5-Star Raids for trainers invited via Remote Raid Pass. Extremely rare wild spawn near lakes/water in the Americas & Greenland.',
  489:  'Phione is not yet available in Pokémon GO.',
  490:  'Manaphy is not yet available in Pokémon GO.',
  493:  'Arceus is not yet available in Pokémon GO.',
  649:  'Genesect has multiple Drive forms featured in 5-Star Raids during events.',
  664:  'Scatterbug is encountered by pinning postcards from friends around the world in your Postcard Book.',
  666:  "Vivillon's wing pattern depends on the region from which you pin postcards.",
  676:  'Furfrou can adopt different trims using form change, several of which are locked to specific real-world regions.',
  720:  'Hoopa Confined and Unbound are obtainable via special events and research storylines.',
  789:  'Cosmog is a rare reward from special research storylines.',
  794:  'Buzzwole appears in 5-Star Raids in the Americas & Greenland. Remote Raids are globally accessible.',
  795:  'Pheromosa appears in 5-Star Raids in Europe, MEA & India. Remote Raids are globally accessible.',
  796:  'Xurkitree appears in 5-Star Raids in Asia-Pacific. Remote Raids are globally accessible.',
  797:  'Celesteela appears in 5-Star Raids in the Southern Hemisphere. Remote Raids are globally accessible.',
  798:  'Kartana appears in 5-Star Raids in the Northern Hemisphere. Remote Raids are globally accessible.',
  801:  'Magearna is not yet available in Pokémon GO.',
  805:  'Stakataka appears in 5-Star Raids in the Eastern Hemisphere. Remote Raids are globally accessible.',
  806:  'Blacephalon appears in 5-Star Raids in the Western Hemisphere. Remote Raids are globally accessible.',
  808:  'Meltan can only be caught using the Mystery Box, which is activated by transferring a Pokémon to Pokémon HOME or Let\'s Go.',
  809:  'Melmetal evolves from Meltan with 400 Meltan Candy and can appear in special raids.',
  874:  'Stonjourner is a regional Pokémon that spawns exclusively in the wild in the United Kingdom.',
  893:  'Zarude is obtainable via seasonal Special Research storylines.',
  896:  'Glastrier is not yet available in Pokémon GO.',
  897:  'Spectrier is not yet available in Pokémon GO.',
  898:  'Calyrex is not yet available in Pokémon GO.',
  999:  'Gimmighoul (Roaming Form) appears exclusively around Golden PokéStops and when using the Coin Bag.',
  1000: 'Gholdengo evolves from Gimmighoul using 999 Gimmighoul Coins.',
};

// ============================================================
// ALTERNATIVE DEX ENTRY METHODS (Remote Raids, Forms, Megas)
// ============================================================
const ALTERNATIVE_DEX_METHODS: Record<number, DexAlternativeMethod[]> = {
  83: [
    { type: 'form', title: "Catch Galarian Farfetch'd", description: "Galarian Farfetch'd (#083) hatches worldwide from 7km Eggs or Raids and shares the same Pokédex entry as Kantonian Farfetch'd.", badgeLabel: 'Galarian Form', relatedPokemonId: 'poke_83_form_farfetchd_galarian' }
  ],
  115: [
    { type: 'mega_raid', title: 'Mega Kangaskhan Raid', description: 'Mega Kangaskhan can be battled worldwide in Mega Raids. A successful catch registers #115 Kangaskhan in your Pokédex.', badgeLabel: 'Mega Raid' }
  ],
  122: [
    { type: 'form', title: 'Catch Galarian Mr. Mime', description: 'Galarian Mr. Mime is available worldwide during events and registers Pokédex entry #122.', badgeLabel: 'Galarian Form', relatedPokemonId: 'poke_122_form_mr_mime_galarian' },
    { type: 'baby_egg', title: 'Hatch Mime Jr. from Gifts', description: 'Mime Jr. (#439) hatches from 5km Eggs sent by European friends and registers the Pokédex entry upon evolution.', badgeLabel: 'Baby Egg', relatedPokemonId: 'poke_439_base' }
  ],
  128: [
    { type: 'form', title: 'Catch Paldean Tauros', description: 'Paldean Tauros (Combat Breed) appears worldwide during events and shares Pokédex entry #128. Blaze and Aqua Breeds also register #128.', badgeLabel: 'Paldean Form', relatedPokemonId: 'poke_128_form_tauros_paldea_combat' }
  ],
  214: [
    { type: 'mega_raid', title: 'Mega Heracross Raid', description: 'Mega Heracross appears worldwide in Mega Raids and registers Pokédex entry #214 upon capture.', badgeLabel: 'Mega Raid' },
    { type: 'remote_raid', title: 'Remote Raid', description: 'When Heracross or Mega Heracross appears in Raids, Remote Raid Passes can be used worldwide.', badgeLabel: 'Remote Raid' }
  ],
  222: [
    { type: 'form', title: 'Catch Galarian Corsola', description: 'Galarian Corsola is available worldwide from 7km Eggs and Special Research, registering Pokédex entry #222.', badgeLabel: 'Galarian Form', relatedPokemonId: 'poke_222_form_corsola_galarian' }
  ],
  337: [
    { type: 'event', title: 'Hemisphere Swap Events', description: 'Lunatone and Solrock swap hemispheres during specific seasonal events (e.g. Solstice).', badgeLabel: 'Event Swap' }
  ],
  338: [
    { type: 'event', title: 'Hemisphere Swap Events', description: 'Solrock and Lunatone swap hemispheres during specific seasonal events (e.g. Solstice).', badgeLabel: 'Event Swap' }
  ],
  480: [
    { type: 'remote_raid', title: 'Remote Raid (Worldwide Invitation)', description: 'Uxie appears in 5-Star Raids in Asia-Pacific. Join remotely using a Remote Raid Pass via friend invitations or raid apps (e.g. PokéGenie).', badgeLabel: 'Remote Raid' }
  ],
  481: [
    { type: 'remote_raid', title: 'Remote Raid (Worldwide Invitation)', description: 'Mesprit appears in 5-Star Raids in Europe/Africa/MEA. Join remotely using a Remote Raid Pass via friend invitations.', badgeLabel: 'Remote Raid' }
  ],
  482: [
    { type: 'remote_raid', title: 'Remote Raid (Worldwide Invitation)', description: 'Azelf appears in 5-Star Raids in the Americas & Greenland. Join remotely using a Remote Raid Pass via friend invitations.', badgeLabel: 'Remote Raid' }
  ],
  794: [
    { type: 'remote_raid', title: 'Remote Raid (Worldwide Invitation)', description: 'Buzzwole appears in Raids in the Americas & Greenland. Join remotely using a Remote Raid Pass via friend invitations.', badgeLabel: 'Remote Raid' }
  ],
  795: [
    { type: 'remote_raid', title: 'Remote Raid (Worldwide Invitation)', description: 'Pheromosa appears in Raids in Europe/MEA/India. Join remotely using a Remote Raid Pass via friend invitations.', badgeLabel: 'Remote Raid' }
  ],
  796: [
    { type: 'remote_raid', title: 'Remote Raid (Worldwide Invitation)', description: 'Xurkitree appears in Raids in Asia-Pacific. Join remotely using a Remote Raid Pass via friend invitations.', badgeLabel: 'Remote Raid' }
  ],
  797: [
    { type: 'remote_raid', title: 'Remote Raid (Worldwide Invitation)', description: 'Celesteela appears in Raids in the Southern Hemisphere. Join remotely using a Remote Raid Pass via friend invitations.', badgeLabel: 'Remote Raid' }
  ],
  798: [
    { type: 'remote_raid', title: 'Remote Raid (Worldwide Invitation)', description: 'Kartana appears in Raids in the Northern Hemisphere. Join remotely using a Remote Raid Pass via friend invitations.', badgeLabel: 'Remote Raid' }
  ],
  805: [
    { type: 'remote_raid', title: 'Remote Raid (Worldwide Invitation)', description: 'Stakataka appears in Raids in the Eastern Hemisphere. Join remotely using a Remote Raid Pass via friend invitations.', badgeLabel: 'Remote Raid' }
  ],
  806: [
    { type: 'remote_raid', title: 'Remote Raid (Worldwide Invitation)', description: 'Blacephalon appears in Raids in the Western Hemisphere. Join remotely using a Remote Raid Pass via friend invitations.', badgeLabel: 'Remote Raid' }
  ],
};

// ============================================================
// OBTAIN METHODS BUILDER
// ============================================================
function buildObtainMethods(pokemon: any): ObtainMethodDetail[] {
  const methods: ObtainMethodDetail[] = [];
  const dex = pokemon.dexNr as number;
  const id = (pokemon.id as string) || '';

  const isFormOverride = Boolean(FORM_OBTAIN_METHODS[id]);

  // 1. Explicit form-specific obtain method overrides
  if (isFormOverride) {
    methods.push(...FORM_OBTAIN_METHODS[id]);
  } else if (UNRELEASED_DEX_NRS.has(dex)) {
    // Unreleased in GO
    methods.push({
      type: 'special', label: 'Not in GO', badgeColor: 'slate',
      description: 'This Pokémon is currently not available in Pokémon GO.',
      available: false
    });
    return methods;
  } else if (BABY_EGG_POKEMON.has(dex)) {
    // Baby egg only (no wild spawns)
    methods.push({
      type: 'egg', label: 'Egg', badgeColor: 'amber',
      description: 'Hatches exclusively from Eggs (2km, 5km, or 7km). Cannot be encountered in the wild.',
      available: true
    });
    return methods;
  } else if (dex === 808) {
    // Meltan
    methods.push({
      type: 'special', label: 'Mystery Box', badgeColor: 'pink',
      description: "Spawns after activating the Mystery Box by connecting to Pokémon HOME or Let's Go.",
      available: true
    });
    return methods;
  } else if (dex === 809) {
    // Melmetal
    methods.push({
      type: 'evolution', label: 'Evolution', badgeColor: 'indigo',
      description: 'Evolves from Meltan with 400 Meltan Candy.',
      available: true
    });
    return methods;
  } else if (dex === 235) {
    // Smeargle
    methods.push({
      type: 'special', label: 'Photobomb', badgeColor: 'pink',
      description: 'Appears via GO Snapshot mode. Randomly photobombs your photo and then spawns on the map.',
      available: true
    });
    return methods;
  } else if (dex === 132) {
    // Ditto
    methods.push({
      type: 'wild', label: 'Disguised Spawn', badgeColor: 'emerald',
      description: 'Disguises itself as common wild Pokémon. Only reveals itself after being caught.',
      available: true
    });
    return methods;
  } else if (dex === 999) {
    // Gimmighoul
    methods.push({
      type: 'special', label: 'Coin Bag / Golden Stop', badgeColor: 'pink',
      description: 'Spawns by activating the Coin Bag (connected to Pokémon Scarlet/Violet) or around Golden PokéStops.',
      available: true
    });
    return methods;
  } else if (dex === 1000) {
    // Gholdengo
    methods.push({
      type: 'evolution', label: 'Evolution', badgeColor: 'indigo',
      description: 'Evolves from Gimmighoul using 999 Gimmighoul Coins.',
      available: true
    });
    return methods;
  } else if (dex === 664 || dex === 666) {
    // Scatterbug & Vivillon
    methods.push({
      type: 'special', label: 'Postcard Book', badgeColor: 'pink',
      description: 'Unlocked by pinning postcards received from friend gifts across different world regions.',
      available: true
    });
  } else if (REGIONAL_RAID_DEX_NRS.has(dex)) {
    // Ultra Beasts & regional raid exclusives (NO wild spawns!)
    methods.push({
      type: 'raid', label: '5-Star Raid (Regional)', badgeColor: 'rose',
      description: 'Appears as a 5-Star Raid Boss exclusively in its native region (not in the wild). Can be caught worldwide via Remote Raid invitations.',
      available: true
    });
  } else if (REGIONAL_LAKE_TRIO_DEX_NRS.has(dex)) {
    // Lake Trio: regional raid + ultra rare wild
    methods.push({
      type: 'raid', label: '5-Star Raid (Regional)', badgeColor: 'rose',
      description: 'Appears as a 5-Star Raid Boss in its native region (or worldwide via Remote Raid invitations).',
      available: true
    });
    methods.push({
      type: 'wild', label: 'Wild (Regional - Extremely Rare)', badgeColor: 'emerald',
      description: 'Spawns in the wild extremely rarely near bodies of water / lakes in its native region.',
      available: true
    });
  } else if (RAID_ONLY_DEX_NRS.has(dex)) {
    // Standard raid-only legendaries (NO wild spawns!)
    methods.push({
      type: 'raid', label: '5-Star Raid', badgeColor: 'rose',
      description: 'Appears as a 5-Star Raid Boss during featured raid rotations or limited-time events (not in the wild).',
      available: true
    });
  } else if (RESEARCH_ONLY_DEX_NRS.has(dex)) {
    // Special research mythicals
    methods.push({
      type: 'research', label: 'Special Research', badgeColor: 'blue',
      description: 'Obtainable exclusively through special or seasonal research storylines (not in the wild).',
      available: true
    });
  } else {
    // Standard wild spawn
    const isFormRegional = id ? (REGIONAL_DATA_BY_ID[id]?.isRegional === true) : false;
    const isRegional = REGIONAL_DEX_NRS.has(dex) || isFormRegional;
    methods.push({
      type: 'wild', label: isRegional ? 'Wild (Regional)' : 'Wild',
      badgeColor: 'emerald',
      description: isRegional
        ? 'Spawns in the wild, but only in specific regions of the world.'
        : 'Spawns in the wild on the map.',
      available: true
    });
  }

  // Optional Egg-hatching additions (if not a form override and not already having an egg method)
  const eggDex: Record<number, string> = {
    16: '2km', 19: '2km', 27: '2km', 29: '2km', 32: '2km', 41: '2km', 43: '2km',
    46: '2km', 48: '2km', 50: '2km', 52: '2km', 56: '2km', 60: '2km', 63: '2km',
    66: '2km', 69: '2km', 72: '2km', 74: '2km', 77: '2km', 79: '2km', 81: '2km',
    25: '5km', 54: '5km', 58: '5km', 88: '5km', 92: '5km',
    439: '7km', 172: '7km', 173: '7km', 174: '7km',
    147: '10km', 371: '10km', 443: '10km', 447: '10km', 562: '10km', 599: '10km', 610: '10km',
    627: '10km', 636: '10km', 653: '10km', 661: '10km', 667: '10km', 679: '10km',
    453: '12km', 633: '12km', 624: '12km',
  };
  if (!isFormOverride && eggDex[dex] && !methods.some(m => m.type === 'egg')) {
    methods.push({
      type: 'egg', label: `${eggDex[dex]} Egg`, badgeColor: 'amber',
      description: `Can hatch from ${eggDex[dex]} Eggs.`,
      available: true
    });
  }

  // Rocket encounters
  if (pokemon.hasShadow) {
    methods.push({
      type: 'rocket', label: 'Team GO Rocket', badgeColor: 'purple',
      description: 'Can be caught as a Shadow Pokémon after defeating a Team GO Rocket Grunt or Leader.',
      available: true
    });
  }

  // Mega raids for eligible species
  if (MEGA_RAID_POKEMON.has(dex) && !methods.some(m => m.label.includes('Mega'))) {
    methods.push({
      type: 'raid', label: 'Mega Raid', badgeColor: 'rose',
      description: 'Can be battled as a Mega Evolution in Mega Raids and caught afterwards in its base form.',
      available: true
    });
  }

  // Field research (common pool)
  const researchCommon = new Set([25, 50, 56, 66, 92, 147, 246, 349]);
  if (!isFormOverride && researchCommon.has(dex) && !methods.some(m => m.type === 'research')) {
    methods.push({
      type: 'research', label: 'Field Research', badgeColor: 'blue',
      description: 'Frequently appears as an encounter reward in Field Research tasks.',
      available: true
    });
  }

  return methods;
}

// ============================================================
// MAIN EXPORT FUNCTION
// ============================================================
export function getPokemonDetailInfo(pokemon: any, allPokemonList: any[]): PokemonDetailInfo | null {
  if (!pokemon) return null;

  const dex = pokemon.dexNr as number;
  const id = (pokemon.id as string) || '';

  // Regional status resolution:
  // 1. Explicit per-form entry in REGIONAL_DATA_BY_ID takes absolute precedence
  // 2. Form variants / costumes do NOT inherit base species regional status unless defined in REGIONAL_DATA_BY_ID
  // 3. Standard base species use REGIONAL_DATA[dex]
  let regional: RegionalInfo;
  if (id && REGIONAL_DATA_BY_ID[id] !== undefined) {
    regional = REGIONAL_DATA_BY_ID[id];
  } else if (pokemon.category === 'form' || pokemon.category === 'costume' || pokemon.isForm || pokemon.isCostume) {
    regional = { isRegional: false };
  } else {
    regional = REGIONAL_DATA[dex] || { isRegional: false };
  }

  const obtainMethods = buildObtainMethods(pokemon);
  const manualAlternatives = (ALTERNATIVE_DEX_METHODS[dex] || [])
    .filter(m => !m.relatedPokemonId || m.relatedPokemonId !== id);

  // Dynamically add form-based alternatives
  const relatedForms = (allPokemonList || []).filter(
    p => p.dexNr === dex && p.id !== pokemon.id && p.category !== 'costume' && p.category !== 'mega'
  );

  const currentIsRegionalForm = Boolean(
    (pokemon.formName || '').toLowerCase().match(/galar|alola|hisui|paldea/)
  );

  const formAlternatives: DexAlternativeMethod[] = relatedForms
    .filter(f => {
      const fn = (f.formName || '').toLowerCase();
      // If current view is a regional form, include the standard form as an alternative!
      if (currentIsRegionalForm && (f.formName === 'Standard' || f.category === 'standard')) {
        return true;
      }
      return fn.includes('galar') || fn.includes('alola') || fn.includes('hisui') || fn.includes('paldea');
    })
    .map(f => {
      const isStandard = f.formName === 'Standard' || f.category === 'standard';
      const fullName = isStandard
        ? (f.name.toLowerCase().startsWith('standard') ? f.name : `Standard ${f.name}`)
        : f.name;

      let description: string;
      if (isStandard) {
        let obtainHint = 'the wild or eggs';
        if (RAID_ONLY_DEX_NRS.has(dex)) {
          obtainHint = '5-Star Raids';
        } else if (REGIONAL_DEX_NRS.has(dex)) {
          obtainHint = 'regional wild spawns';
        } else if (RESEARCH_ONLY_DEX_NRS.has(dex)) {
          obtainHint = 'Special Research';
        }
        description = `${fullName} is the original base form (available via ${obtainHint}) and shares Pokédex entry #${String(dex).padStart(4, '0')}. Catching it also registers this entry in your Pokédex.`;
      } else {
        const formTag = f.formName ? `${f.formName} ` : '';
        const formMethod = FORM_OBTAIN_METHODS[f.id]?.[0]?.label;
        const formHint = formMethod ? ` (available via ${formMethod})` : '';
        description = `${fullName} is an alternative ${formTag}form${formHint} that shares Pokédex entry #${String(dex).padStart(4, '0')}. Catching it also registers this entry in your Pokédex.`;
      }

      return {
        type: 'form' as const,
        title: `Catch ${fullName}`,
        description,
        relatedPokemonId: f.id,
        badgeLabel: isStandard ? 'Standard Form' : (f.formName ? `${f.formName} Form` : 'Alternative Form')
      };
    });

  // Deduplicate: don't add form alternatives if manually specified
  const manualIds = new Set(manualAlternatives.map(m => m.relatedPokemonId).filter(Boolean));
  const filteredFormAlternatives = formAlternatives.filter(f => !manualIds.has(f.relatedPokemonId));

  const alternativeDexMethods: DexAlternativeMethod[] = [
    ...manualAlternatives,
    ...filteredFormAlternatives
  ];

  return {
    dexNr: dex,
    name: pokemon.name,
    germanName: pokemon.names?.German || pokemon.name,
    generation: pokemon.generation,
    types: [pokemon.type1, pokemon.type2].filter(Boolean),
    regional,
    obtainMethods,
    alternativeDexMethods,
    specialNotes: SPECIAL_NOTES[dex]
  };
}
