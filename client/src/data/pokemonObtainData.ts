import { PokemonDetailInfo, RegionalInfo, ObtainMethodDetail, DexAlternativeMethod, AvailabilityTag } from '../types/pokemonInfo';
import { AvailabilityFilterType } from '../types';

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
  423: { isRegional: true, regionName: 'Hemisphere-split', hemisphere: 'Western / Eastern Hemisphere', notes: 'West Sea: West · East Sea: East' },
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

  // ── Shellos & Gastrodon #422, #423 ──────────────────────────────
  'poke_422_base':             { isRegional: true, regionName: 'Western Hemisphere', hemisphere: 'Western Hemisphere', notes: 'West Sea spawns west of the prime meridian (Americas, Western Europe)' },
  'poke_422_special_east_sea': { isRegional: true, regionName: 'Eastern Hemisphere', hemisphere: 'Eastern Hemisphere', notes: 'East Sea spawns east of the prime meridian (Eastern Europe, Asia, Oceania)' },
  'poke_423_base':             { isRegional: true, regionName: 'Western Hemisphere', hemisphere: 'Western Hemisphere', notes: 'West Sea spawns west of the prime meridian (Americas, Western Europe)' },
  'poke_423_special_east_sea': { isRegional: true, regionName: 'Eastern Hemisphere', hemisphere: 'Eastern Hemisphere', notes: 'East Sea spawns east of the prime meridian (Eastern Europe, Asia, Oceania)' },

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
// ELITE RAID EXCLUSIVE POKÉMON (In-person Elite Raids at EX Gyms)
// ============================================================
export const ELITE_RAID_DEX_NRS = new Set<number>([
  905, // Enamorus
]);

// ============================================================
// 3-STAR RAID & RESEARCH EXCLUSIVE POKÉMON (Never in the wild)
// ============================================================
export const THREE_STAR_RAID_EXCLUSIVE_DEX_NRS = new Set<number>([
  621, // Druddigon (3-Star Raids & Field Research)
  776, // Turtonator (3-Star Raids, Field Research, 12km Eggs)
  780, // Drampa (3-Star Raids & Field Research)
  899, // Wyrdeer (3-Star Raids & Raid Day)
  900, // Kleavor (3-Star Raids & Raid Day)
  962, // Bombirdier (3-Star Raids)
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
  721, // Volcanion (GO Fest 2025 & "Pressure Rising" Special Research)
  789, // Cosmog
  790, // Cosmoem
  802, // Marshadow
  803, // Poipole
  890, // Eternatus
  891, // Kubfu
  892, // Urshifu
  893, // Zarude
]);

// ============================================================
// UNRELEASED IN POKÉMON GO
// ============================================================
export const UNRELEASED_DEX_NRS = new Set<number>([
  489, 490, 493, // Phione, Manaphy, Arceus
  801,           // Magearna (804 Naganadel is released)
  896, 897, 898, // Glastrier, Spectrier, Calyrex
  1001, 1002, 1003, 1004, // Treasures of Ruin
  1007, 1008, 1009, 1010, // Koraidon, Miraidon, Walking Wake, Iron Leaves
  1014, 1015, 1016, 1017, // Okidogi, Munkidori, Fezandipiti, Ogerpon
  1024, 1025     // Terapagos, Pecharunt
]);

// ============================================================
// EGG EXCLUSIVE POKÉMON (Eggs ONLY — No wild spawns or Raids)
// ============================================================
export const BABY_EGG_POKEMON = new Set<number>([
  172, 173, 174, 175, 236, 238, 239, 240, 298, 360,
  406, 433, 438, 439, 440, 446, 447, 458, 848
]);

export const STRANGE_12KM_EGG_POKEMON = new Set<number>([
  551, // Sandile
  624, // Pawniard
  629, // Vullaby
  757, // Salandit
  965, // Varoom
]);

export const SPECIAL_EGG_EXCLUSIVE_POKEMON = new Set<number>([
  636, // Larvesta (rare 2km/5km/10km)
  935, // Charcadet (10km)
  672, // Skiddo (Safari 7km Eggs / Special Research)
]);

export const EGG_EXCLUSIVE_DEX_NRS = new Set<number>([
  ...BABY_EGG_POKEMON,
  ...STRANGE_12KM_EGG_POKEMON,
  ...SPECIAL_EGG_EXCLUSIVE_POKEMON
]);

// ============================================================
// PAID RESEARCH / MASTERWORK EXCLUSIVES
// ============================================================
export const PAID_RESEARCH_DEX_NRS = new Set<number>([
  647, // Keldeo (Ordinary Form: "Something Extraordinary" Paid Ticket)
  893, // Zarude ("Rogue of the Jungle" Paid Masterwork Ticket)
]);

// ============================================================
// EVENT EXCLUSIVE POKÉMON (Spawns / research only during limited events)
// ============================================================
export const EVENT_EXCLUSIVE_DEX_NRS = new Set<number>([
  201, // Unown (28 letters during live/global events)
  225, // Delibird (Holiday/Winter events in December)
  292, // Shedinja (Special Bug/Halloween research breakthroughs)
  327, // Spinda (Rotating monthly Field Research "5 Great Curveballs in a row")
  442, // Spiritomb (Halloween Special/Timed Research in October)
  479, // Rotom (GO Fest/Tour snapshot photobombs & promo codes)
  562, // Yamask (Halloween events)
  563, // Cofagrigus (Halloween events)
  708, // Phantump (Halloween events)
  709, // Trevenant (Halloween events)
  710, // Pumpkaboo (Halloween events)
  711, // Gourgeist (Halloween events)
  749, // Mudbray (Event exclusive wild / research)
  807, // Zeraora (Event exclusive distributions)
]);

export const EVENT_EXCLUSIVE_FORM_IDS = new Set<string>([
  'poke_562_form_yamask_galarian',    // Galarian Yamask (Halloween)
  'poke_122_form_mr_mime_galarian',   // Galarian Mr. Mime (Holiday)
  'poke_676_special_heart',          // Furfrou Heart Trim (Valentine's Day)
  'poke_666_form_vivillon_fancy',     // Vivillon Fancy Pattern (Events)
  'poke_666_form_vivillon_pokeball',  // Vivillon Poké Ball Pattern (Events)
]);

// ============================================================
// BIOME EXCLUSIVE POKÉMON
// ============================================================
export const BIOME_EXCLUSIVE_DATA: Record<number, { biome: string; shortLabel: string; description: string }> = {
  960: {
    biome: 'Beach Biome',
    shortLabel: 'Beach Biome',
    description: 'Spawns exclusively along real-world ocean beaches and coastline biomes. Cannot be found inland!'
  },
  703: {
    biome: 'Mountain Biome',
    shortLabel: 'Mountain Biome',
    description: 'Spawns primarily in high-elevation, mountain, and rocky biomes.'
  },
  615: {
    biome: 'Snow Biome & Glacial Lure',
    shortLabel: 'Snow Biome',
    description: 'Spawns in snowy weather biomes or around active Glacial Lure Modules.'
  },
  843: {
    biome: 'Desert / Dry Biome',
    shortLabel: 'Desert Biome',
    description: 'Spawns exclusively in desert, arid, and dry sandy biomes.'
  }
};

// ============================================================
// EVOLUTION ONLY POKÉMON (Cannot spawn wild or in standard raids)
// ============================================================
export const EVOLUTION_ONLY_DEX_NRS = new Set<number>([
  // Evolutions of Egg-Exclusive / Baby species
  637, // Volcarona (from Larvesta)
  750, // Mudsdale (from Mudbray)
  758, // Salazzle (from female Salandit)
  844, // Sandaconda (from Silicobra)
  966, // Revavroom (from Varoom)
  936, // Armarouge (from Charcadet)
  937, // Ceruledge (from Charcadet)
  552, // Krokorok (from Sandile)
  553, // Krookodile (from Sandile)
  630, // Mandibuzz (from Vullaby)
  625, // Bisharp (from Pawniard)
  673, // Gogoat (from Skiddo)
  237, // Hitmontop (from Tyrogue)
  468, // Togekiss (from Togetic with Sinnoh Stone)

  // Mythical & Special Box evolutions
  804,  // Naganadel (from Poipole)
  809,  // Melmetal (from Meltan with 400 Candy)
  1000, // Gholdengo (from Gimmighoul with 999 Coins)

  // Special buddy & quest evolutions
  979, // Annihilape (Primeape + 30 Ghost/Psychic defeats)
  901, // Ursaluna (Ursaring + Full Moon)
  865, // Sirfetch'd (Galarian Farfetch'd + 10 Excellent Throws)
  866, // Mr. Rime (Galarian Mr. Mime + 50 Candy)
  867, // Runerigus (Galarian Yamask + 10 raids)
  864, // Cursola (Galarian Corsola + 50 Candy)
  862, // Obstagoon (Galarian Linoone + 100 Candy)
  863, // Perrserker (Galarian Meowth + 50 Candy)
  904, // Overqwil (Hisuian Qwilfish + 10 raids)
  903, // Sneasler (Hisuian Sneasel + 7km walk daytime)
  902, // Basculegion (White-Striped Basculin)
  980, // Clodsire (Paldean Wooper)
  982, // Dudunsparce (Dunsparce)
  923, // Pawmot (Pawmo + 25km explore)
  947, // Brambleghast (Bramblin + 25km explore)
  954, // Rabsca (Rellor + 25km explore)
  939, // Bellibolt (Tadbulb)
  961, // Wugtrio (Wiglett)
  841, // Flapple (Applin + Tart Apple)
  842, // Appletun (Applin + Sweet Apple)
  855, // Polteageist (Sinistea + Cracked/Chipped Pot)
  869, // Alcremie (Milcery + Sweet + spin)
  925, // Maushold (Tandemaus)
  886, // Drakloak (Dreepy)
  887, // Dragapult (Dreepy)
  997, // Arctibax (Frigibax)
  998, // Baxcalibur (Frigibax)

  // Starter middle & final evolutions (never wild in GO)
  811, 812, // Thwackey, Rillaboom
  814, 815, // Raboot, Cinderace
  817, 818, // Drizzile, Inteleon
  907, 908, // Floragato, Meowscarada
  910, 911, // Crocalor, Skeledirge
  913, 914, // Quaxwell, Quaquaval

  // Johto item evolutions
  182, // Bellossom (Sun Stone)
  186, // Politoed (King's Rock)
  192, // Sunflora (Sun Stone)
  199, // Slowking (King's Rock)
  208, // Steelix (Metal Coat)
  212, // Scizor (Metal Coat)
  230, // Kingdra (Dragon Scale)
  233, // Porygon2 (Up-Grade)

  // Sinnoh Stone & special mechanic evolutions
  407, // Roserade (Sinnoh Stone)
  424, // Ambipom (Sinnoh Stone)
  429, // Mismagius (Sinnoh Stone)
  430, // Honchkrow (Sinnoh Stone)
  461, // Weavile (Sinnoh Stone)
  462, // Magnezone (Magnetic Lure)
  463, // Lickilicky (Sinnoh Stone)
  464, // Rhyperior (Sinnoh Stone)
  465, // Tangrowth (Sinnoh Stone)
  466, // Electivire (Sinnoh Stone)
  467, // Magmortar (Sinnoh Stone)
  469, // Yanmega (Sinnoh Stone)
  470, // Leafeon (Mossy Lure)
  471, // Glaceon (Glacial Lure)
  472, // Gliscor (Sinnoh Stone)
  473, // Mamoswine (Sinnoh Stone)
  474, // Porygon-Z (Sinnoh Stone)
  475, // Gallade (Sinnoh Stone)
  476, // Probopass (Magnetic Lure)
  477, // Dusknoir (Sinnoh Stone)
  478, // Froslass (Sinnoh Stone)
  700, // Sylveon (70 Buddy Hearts)

  // Unova Stone evolutions
  512, // Simisage
  514, // Simisear
  516, // Simipour
  518, // Musharna
  604, // Eelektross
  609, // Chandelure
]);

// ============================================================
// MEGA / PRIMAL POKÉMON WITH RAIDS
// ============================================================
export const MEGA_RAID_POKEMON = new Set<number>([
  3, 6, 9, 15, 18, 65, 80, 94, 115, 127, 130, 142, 181, 208, 212, 214, 229, 248, 254, 257,
  260, 282, 302, 303, 306, 308, 310, 319, 323, 334, 354, 359, 362, 373, 376,
  380, 381, 382, 383, 384, 428, 445, 448, 460, 531, 719
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

  // ── Hoopa Unbound (Elite Raids & Form Change) ───────────────
  'poke_720_special_unbound': [
    { type: 'raid', label: 'Elite Raid', badgeColor: 'rose', description: 'Appeared in in-person Elite Raids and can be transformed from Hoopa Confined using Candy and Stardust.', available: true },
    { type: 'special', label: 'Form Change', badgeColor: 'pink', description: 'Can change form from Hoopa Confined using 50 Hoopa Candy and 10,000 Stardust.', available: true }
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
  721:  'Volcanion is a Mythical Pokémon obtainable via the "Pressure Rising" Special Research storyline (originally debuted during Pokémon GO Fest 2025).',
  789:  'Cosmog is a rare reward from special research storylines.',
  794:  'Buzzwole appears in 5-Star Raids in the Americas & Greenland. Remote Raids are globally accessible.',
  795:  'Pheromosa appears in 5-Star Raids in Europe, MEA & India. Remote Raids are globally accessible.',
  796:  'Xurkitree appears in 5-Star Raids in Asia-Pacific. Remote Raids are globally accessible.',
  797:  'Celesteela appears in 5-Star Raids in the Southern Hemisphere. Remote Raids are globally accessible.',
  798:  'Kartana appears in 5-Star Raids in the Northern Hemisphere. Remote Raids are globally accessible.',
  801:  'Magearna is not yet available in Pokémon GO.',
  805:  'Stakataka appears in 5-Star Raids in the Eastern Hemisphere. Remote Raids are globally accessible.',
  806:  'Blacephalon appears in 5-Star Raids in the Western Hemisphere. Remote Raids are globally accessible.',
  807:  'Zeraora is a Mythical Pokémon made available during limited-time event celebrations.',
  808:  'Meltan can only be caught using the Mystery Box, which is activated by transferring a Pokémon to Pokémon HOME or Let\'s Go.',
  809:  'Melmetal evolves from Meltan with 400 Meltan Candy and can appear in special raids.',
  843:  'Silicobra spawns exclusively in desert and arid biomes.',
  874:  'Stonjourner is a regional Pokémon that spawns exclusively in the wild in the United Kingdom.',
  890:  'Eternatus is a Legendary Pokémon introduced as the climax of the Special Research storyline during the Season of Max Out.',
  893:  'Zarude is obtainable via seasonal Special Research storylines.',
  896:  'Glastrier is not yet available in Pokémon GO.',
  897:  'Spectrier is not yet available in Pokémon GO.',
  898:  'Calyrex is not yet available in Pokémon GO.',
  905:  'Enamorus (Incarnate Forme) debuted exclusively in in-person Elite Raids at EX Gyms.',
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
  } else if (pokemon.releasedInGo === false || UNRELEASED_DEX_NRS.has(dex)) {
    // Unreleased in GO
    methods.push({
      type: 'special', label: 'Not in GO', badgeColor: 'slate',
      description: 'This Pokémon is currently not available in Pokémon GO.',
      available: false
    });
    return methods;
  } else if (PAID_RESEARCH_DEX_NRS.has(dex)) {
    // Paid Research / Masterwork Exclusive
    let desc = 'Obtainable exclusively through a Paid Special Research or Masterwork Research Ticket.';
    if (dex === 647) {
      desc = "Ordinary Form is exclusively obtainable via the 'Something Extraordinary' Special Research Paid Ticket ($7.99 USD). It has never been released to free players in Pokémon GO.";
    } else if (dex === 893) {
      desc = "Obtainable via the 'Rogue of the Jungle' Paid Masterwork Research Ticket ($7.99 USD) or limited movie promotional research.";
    }
    methods.push({
      type: 'paid_research', label: 'Paid Research Exclusive', badgeColor: 'amber',
      description: desc,
      available: true
    });
    return methods;
  } else if (EGG_EXCLUSIVE_DEX_NRS.has(dex)) {
    // Egg Exclusive (No wild spawns, no standard raids)
    let eggLabel = 'Egg Exclusive';
    let eggDesc = 'Hatches exclusively from Eggs (cannot be encountered in the wild or in Raids).';
    if (STRANGE_12KM_EGG_POKEMON.has(dex)) {
      eggLabel = '12km Strange Egg (Rocket Leader)';
      eggDesc = 'Hatches exclusively from 12km Strange Eggs obtained by defeating Team GO Rocket Leaders (Cliff, Sierra, Arlo). Cannot be encountered in the wild!';
    } else if (dex === 636) {
      eggLabel = 'Egg Exclusive (2km / 5km / 10km)';
      eggDesc = 'Extremely rare hatch exclusively from 2km, 5km, and 10km Eggs. Cannot be encountered in the wild!';
    } else if (dex === 935) {
      eggLabel = '10km Egg Exclusive';
      eggDesc = 'Hatches exclusively from 10km Eggs (cannot be encountered in the wild).';
    } else if (dex === 672) {
      eggLabel = '7km Egg & Event Research';
      eggDesc = 'Hatches from 7km Eggs during City Safari events or event research (cannot be found in regular wild spawns).';
    }
    methods.push({
      type: 'egg_exclusive', label: eggLabel, badgeColor: 'amber',
      description: eggDesc,
      available: true
    });
    return methods;
  } else if (EVOLUTION_ONLY_DEX_NRS.has(dex)) {
    // Evolution Only (No wild spawns, no standard raids)
    let evoDesc = 'Obtainable exclusively by evolving its pre-evolution (cannot be encountered in the wild or standard Raids).';
    if (dex === 637) evoDesc = 'Evolves from Larvesta with 400 Larvesta Candy. Cannot be encountered in the wild or in Raids!';
    else if (dex === 750) evoDesc = 'Evolves from Mudbray with 50 Mudbray Candy. Cannot be encountered in the wild or in standard Raids!';
    else if (dex === 758) evoDesc = 'Evolves exclusively from female Salandit with 50 Salandit Candy. Cannot be encountered in the wild or in Raids!';
    else if (dex === 844) evoDesc = 'Evolves from Silicobra with 50 Silicobra Candy. Cannot be encountered in the wild or in standard Raids!';
    else if (dex === 966) evoDesc = 'Evolves from Varoom with 50 Varoom Candy. Cannot be encountered in the wild or in Raids!';
    else if (dex === 936) evoDesc = 'Evolves from Charcadet with 50 Charcadet Candy after defeating 30 Psychic-type Pokémon with Charcadet as your buddy.';
    else if (dex === 937) evoDesc = 'Evolves from Charcadet with 50 Charcadet Candy after defeating 30 Ghost-type Pokémon with Charcadet as your buddy.';
    else if (dex === 979) evoDesc = 'Evolves from Primeape with 50 Mankey Candy after defeating 30 Ghost or Psychic-type Pokémon with Primeape as your buddy.';
    else if (dex === 901) evoDesc = 'Evolves from Ursaring with 100 Teddiursa Candy during a real-world Full Moon event.';
    else if (dex === 865) evoDesc = "Evolves from Galarian Farfetch'd with 50 Candy after achieving 10 Excellent Throws with Farfetch'd as your buddy.";
    else if (dex === 866) evoDesc = 'Evolves from Galarian Mr. Mime with 50 Mime Candy. Cannot be caught in the wild!';
    else if (dex === 867) evoDesc = 'Evolves from Galarian Yamask with 50 Yamask Candy after winning 10 raids with Yamask as your buddy.';
    else if (dex === 864) evoDesc = 'Evolves from Galarian Corsola with 50 Corsola Candy. Cannot be caught in the wild!';
    else if (dex === 862) evoDesc = 'Evolves from Galarian Linoone with 100 Zigzagoon Candy.';
    else if (dex === 863) evoDesc = 'Evolves from Galarian Meowth with 50 Meowth Candy.';
    else if (dex === 904) evoDesc = 'Evolves from Hisuian Qwilfish with 50 Candy after winning 10 raids with Qwilfish as your buddy.';
    else if (dex === 903) evoDesc = 'Evolves from Hisuian Sneasel with 100 Candy after walking 7km as your buddy during daytime.';
    else if (dex === 902) evoDesc = 'Evolves from White-Striped Basculin with 50 Basculin Candy.';
    else if (dex === 980) evoDesc = 'Evolves from Paldean Wooper with 50 Wooper Candy.';
    else if (dex === 982) evoDesc = 'Evolves from Dunsparce with 50 Dunsparce Candy.';
    else if (dex === 923) evoDesc = 'Evolves from Pawmo with 100 Pawmi Candy after exploring 25km as your buddy.';
    else if (dex === 947) evoDesc = 'Evolves from Bramblin with 50 Bramblin Candy after exploring 25km as your buddy.';
    else if (dex === 954) evoDesc = 'Evolves from Rellor with 50 Rellor Candy after exploring 25km as your buddy.';
    else if (dex === 939) evoDesc = 'Evolves from Tadbulb with 50 Tadbulb Candy.';
    else if (dex === 961) evoDesc = 'Evolves from Wiglett with 50 Wiglett Candy. Cannot be encountered in the wild!';
    else if (dex === 804) evoDesc = 'Evolves from Poipole with 200 Poipole Candy after catching 20 Dragon-type Pokémon as your buddy.';
    else if (dex === 809) evoDesc = 'Evolves from Meltan with 400 Meltan Candy. Cannot be caught in the wild!';
    else if (dex === 1000) evoDesc = 'Evolves from Gimmighoul using 999 Gimmighoul Coins. Cannot be caught in the wild!';

    methods.push({
      type: 'evolution_only', label: 'Evolution Only', badgeColor: 'indigo',
      description: evoDesc,
      available: true
    });
    return methods;
  } else if (pokemon.category === 'costume' || pokemon.isCostume) {
    // Event Costume
    methods.push({
      type: 'event_exclusive', label: 'Event Costume', badgeColor: 'pink',
      description: 'Exclusive event costume available only during designated limited-time celebration events and raids.',
      available: true
    });
    return methods;
  } else if (EVENT_EXCLUSIVE_DEX_NRS.has(dex) || EVENT_EXCLUSIVE_FORM_IDS.has(id)) {
    // Event Exclusive species
    let eventLabel = 'Event Exclusive';
    let eventDesc = 'Available exclusively during designated in-game events, festivals, or seasonal celebrations.';
    if (dex === 201) {
      eventLabel = 'Live Events & GO Fest';
      eventDesc = 'Unown spawns almost exclusively during special live and global events (e.g. GO Fest, Safari Zones, Pokémon GO Tour, Global Challenges).';
    } else if (dex === 225) {
      eventLabel = 'Holiday / Winter Event';
      eventDesc = 'Delibird appears in the wild exclusively during annual Holiday and Winter events in December.';
    } else if (dex === 292) {
      eventLabel = 'Research Breakthrough Event';
      eventDesc = 'Available exclusively as a Research Breakthrough reward during special bug-themed and Halloween events.';
    } else if (dex === 327) {
      eventLabel = 'Monthly Field Research';
      eventDesc = 'Available exclusively via rotating Monthly Field Research tasks ("Make 5 Great Curveball Throws in a row") with 9 different patterns.';
    } else if (dex === 442) {
      eventLabel = 'Halloween Special Research';
      eventDesc = 'Spiritomb is exclusively available via Halloween Special and Timed Research quest lines in October.';
    } else if (dex === 479) {
      eventLabel = 'Snapshot Photobomb / Promo';
      eventDesc = 'Rotom appears via snapshot photobombs or promo codes during in-person and global GO Fest and Tour events.';
    } else if (dex === 562 || dex === 563) {
      eventLabel = 'Halloween Event';
      eventDesc = 'Yamask and Cofagrigus spawn exclusively during Halloween events in October.';
    } else if (dex === 708 || dex === 709 || dex === 710 || dex === 711) {
      eventLabel = 'Halloween / Autumn Event';
      eventDesc = 'Spawns primarily during seasonal Halloween and Autumn events in October and November.';
    } else if (dex === 749) {
      eventLabel = 'Event Exclusive Wild / Research';
      eventDesc = 'Mudbray spawns exclusively during featured events and themed Field Research tasks (not part of the standard wild spawn pool).';
    } else if (dex === 807) {
      eventLabel = 'Event Exclusive';
      eventDesc = 'Zeraora is a Mythical Pokémon made available during limited-time special event celebrations (not part of the standard wild spawn pool).';
    }
    methods.push({
      type: 'event_exclusive', label: eventLabel, badgeColor: 'purple',
      description: eventDesc,
      available: true
    });
    return methods;
  } else if (BIOME_EXCLUSIVE_DATA[dex]) {
    // Biome Exclusive species
    const biomeInfo = BIOME_EXCLUSIVE_DATA[dex];
    methods.push({
      type: 'biome', label: biomeInfo.biome, badgeColor: 'teal',
      description: biomeInfo.description,
      available: true
    });
  } else if (dex === 808) {
    // Meltan
    methods.push({
      type: 'special', label: 'Mystery Box', badgeColor: 'pink',
      description: "Spawns after activating the Mystery Box by connecting to Pokémon HOME or Let's Go.",
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
    // Lake Trio: regional raid + ultra rare lake wild
    methods.push({
      type: 'raid', label: '5-Star Raid (Regional)', badgeColor: 'rose',
      description: 'Appears as a 5-Star Raid Boss in its native region (or worldwide via Remote Raid invitations).',
      available: true
    });
    methods.push({
      type: 'biome', label: 'Lake / Water Biome (Ultra Rare)', badgeColor: 'teal',
      description: 'Extremely rare wild spawn along natural lakes, rivers, and bodies of water in its native region.',
      available: true
    });
  } else if (ELITE_RAID_DEX_NRS.has(dex)) {
    // Elite Raid Exclusives (Enamorus)
    methods.push({
      type: 'raid', label: 'Elite Raid', badgeColor: 'rose',
      description: 'Appears exclusively in in-person Elite Raids at EX Gyms (cannot be encountered in the wild or via Remote Raid Pass).',
      available: true
    });
  } else if (THREE_STAR_RAID_EXCLUSIVE_DEX_NRS.has(dex)) {
    // 3-Star Raid Exclusives (Druddigon, Turtonator, Drampa, Bombirdier, etc.)
    let raidDesc = 'Appears as a 3-Star Raid Boss and in Field Research tasks during events (not found in standard wild spawns).';
    if (dex === 621) {
      raidDesc = 'Appears exclusively in 3-Star Raids and featured Field Research tasks (cannot be encountered in the wild).';
    } else if (dex === 776) {
      raidDesc = 'Appears in 3-Star Raids, event Field Research tasks, and hatches from 12km Strange Eggs (cannot be encountered in the wild).';
    } else if (dex === 780) {
      raidDesc = 'Appears exclusively in 3-Star Raids and themed Field Research tasks (cannot be encountered in the wild).';
    } else if (dex === 899 || dex === 900) {
      raidDesc = 'Appears as a 3-Star Raid Boss during featured Raid Days and events (cannot be encountered in the wild or evolved normally in GO).';
    } else if (dex === 962) {
      raidDesc = 'Appears exclusively as a 3-Star Raid Boss during featured events (cannot be encountered in the wild).';
    }
    methods.push({
      type: 'raid', label: '3-Star Raid', badgeColor: 'rose',
      description: raidDesc,
      available: true
    });
    if (dex === 621 || dex === 776 || dex === 780) {
      methods.push({
        type: 'research', label: 'Field Research', badgeColor: 'blue',
        description: 'Available as an encounter reward from event-specific Field Research tasks.',
        available: true
      });
    }
    if (dex === 776) {
      methods.push({
        type: 'egg', label: '12km Strange Egg', badgeColor: 'amber',
        description: 'Hatches from 12km Strange Eggs obtained by defeating Team GO Rocket Leaders.',
        available: true
      });
    }
  } else if (dex === 791 || dex === 792) {
    // Solgaleo & Lunala (Evolution from Cosmoem + GO Fest Raids)
    const isSolgaleo = dex === 791;
    const time = isSolgaleo ? 'daytime' : 'nighttime';
    methods.push({
      type: 'evolution', label: 'Evolution', badgeColor: 'indigo',
      description: `Evolves from Cosmoem with 100 Cosmog Candy during ${time}.`,
      available: true
    });
    methods.push({
      type: 'raid', label: '5-Star Raid (Event)', badgeColor: 'rose',
      description: 'Appeared in 5-Star Raids during GO Fest events (not found in standard wild spawns).',
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
    // Special research mythicals & box legendaries
    let resDesc = 'Obtainable exclusively through special or seasonal research storylines (not in the wild).';
    if (dex === 890) {
      resDesc = 'Obtainable exclusively through the Special Research storyline during the Season of Max Out (cannot be encountered in the wild or in standard Raids).';
    } else if (dex === 721) {
      resDesc = 'Obtainable via the "Pressure Rising" Special Research storyline (first debuted during Pokémon GO Fest 2025). Cannot be encountered in the wild or in standard Raids.';
    }
    methods.push({
      type: 'research', label: 'Special Research', badgeColor: 'blue',
      description: resDesc,
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

  // Alternative Pokédex methods only apply to the base/standard species entry!
  // Catching an alternative form (e.g. Galarian Farfetch'd, Alolan Raichu) registers the base entry,
  const isBasePokemon = pokemon.category === 'standard' || (!pokemon.isForm && !pokemon.isCostume && !pokemon.isMega);

  let alternativeDexMethods: DexAlternativeMethod[] = [];

  if (isBasePokemon) {
    const manualAlternatives = (ALTERNATIVE_DEX_METHODS[dex] || [])
      .filter(m => !m.relatedPokemonId || m.relatedPokemonId !== id);

    // Dynamically add form-based alternatives that register this base species
    const relatedForms = (allPokemonList || []).filter(
      p => p.dexNr === dex && p.id !== pokemon.id && p.category !== 'costume' && p.category !== 'mega'
    );

    const formAlternatives: DexAlternativeMethod[] = relatedForms
      .filter(f => {
        const fn = (f.formName || '').toLowerCase();
        return fn.includes('galar') || fn.includes('alola') || fn.includes('hisui') || fn.includes('paldea');
      })
      .map(f => {
        const formTag = f.formName ? `${f.formName} ` : '';
        const formMethod = FORM_OBTAIN_METHODS[f.id]?.[0]?.label;
        const formHint = formMethod ? ` (available via ${formMethod})` : '';
        const description = `${f.name} is an alternative ${formTag}form${formHint} that registers base Pokédex entry #${String(dex).padStart(4, '0')}. Catching it unlocks this entry in your Pokédex without needing the base form.`;

        return {
          type: 'form' as const,
          title: `Catch ${f.name}`,
          description,
          relatedPokemonId: f.id,
          badgeLabel: f.formName ? `${f.formName} Form` : 'Alternative Form'
        };
      });

    // Deduplicate: don't add form alternatives if manually specified
    const manualIds = new Set(manualAlternatives.map(m => m.relatedPokemonId).filter(Boolean));
    const filteredFormAlternatives = formAlternatives.filter(f => !manualIds.has(f.relatedPokemonId));

    alternativeDexMethods = [
      ...manualAlternatives,
      ...filteredFormAlternatives
    ];
  }

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

// ============================================================
// PRIMARY AVAILABILITY TAG HELPER (Used for Card Badges & Search)
// ============================================================
export function getPrimaryAvailabilityTag(pokemon: {
  dexNr: number;
  id?: string;
  category?: string;
  isCostume?: boolean;
  releasedInGo?: boolean;
  formName?: string;
}): AvailabilityTag | null {
  const dex = pokemon.dexNr;
  const id = pokemon.id || '';

  if (pokemon.releasedInGo === false || UNRELEASED_DEX_NRS.has(dex)) {
    return {
      type: 'special',
      label: 'Not in GO',
      shortLabel: 'Unreleased',
      badgeColor: 'slate',
      bg: 'bg-slate-100 dark:bg-slate-800/80',
      textColor: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-300 dark:border-slate-700/80'
    };
  }

  if (id === 'poke_144_form_articuno_galarian' || id === 'poke_145_form_zapdos_galarian' || id === 'poke_146_form_moltres_galarian') {
    return {
      type: 'special',
      label: 'Daily Adventure Incense',
      shortLabel: 'Daily Incense',
      badgeColor: 'pink',
      bg: 'bg-pink-100/70 dark:bg-pink-950/60',
      textColor: 'text-pink-700 dark:text-pink-300',
      border: 'border-pink-300 dark:border-pink-700/80'
    };
  }

  if (pokemon.category === 'costume' || pokemon.isCostume) {
    return {
      type: 'event_exclusive',
      label: 'Event Costume',
      shortLabel: 'Costume',
      badgeColor: 'pink',
      bg: 'bg-pink-100/70 dark:bg-pink-950/60',
      textColor: 'text-pink-700 dark:text-pink-300',
      border: 'border-pink-300 dark:border-pink-700/80'
    };
  }

  if (PAID_RESEARCH_DEX_NRS.has(dex)) {
    return {
      type: 'paid_research',
      label: 'Paid Research',
      shortLabel: 'Paid Ticket',
      badgeColor: 'amber',
      bg: 'bg-amber-100 dark:bg-amber-950/80',
      textColor: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-400 dark:border-amber-600/80'
    };
  }

  if (EGG_EXCLUSIVE_DEX_NRS.has(dex)) {
    return {
      type: 'egg_exclusive',
      label: 'Egg Exclusive',
      shortLabel: 'Egg Only',
      badgeColor: 'amber',
      bg: 'bg-amber-100/70 dark:bg-amber-950/60',
      textColor: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-700/80'
    };
  }

  if (EVENT_EXCLUSIVE_DEX_NRS.has(dex) || EVENT_EXCLUSIVE_FORM_IDS.has(id)) {
    return {
      type: 'event_exclusive',
      label: 'Event Exclusive',
      shortLabel: 'Event Only',
      badgeColor: 'purple',
      bg: 'bg-purple-100/70 dark:bg-purple-950/60',
      textColor: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-700/80'
    };
  }

  if (ELITE_RAID_DEX_NRS.has(dex)) {
    return {
      type: 'raid',
      label: 'Elite Raid',
      shortLabel: 'Elite Raid',
      badgeColor: 'rose',
      bg: 'bg-rose-100/70 dark:bg-rose-950/60',
      textColor: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-700/80'
    };
  }

  if (THREE_STAR_RAID_EXCLUSIVE_DEX_NRS.has(dex)) {
    return {
      type: 'raid',
      label: '3-Star Raid',
      shortLabel: '3-Star Raid',
      badgeColor: 'rose',
      bg: 'bg-rose-100/70 dark:bg-rose-950/60',
      textColor: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-700/80'
    };
  }

  if (dex === 791 || dex === 792) {
    return {
      type: 'evolution_only',
      label: 'Evolution / Raid',
      shortLabel: 'Evo / Raid',
      badgeColor: 'indigo',
      bg: 'bg-indigo-100/70 dark:bg-indigo-950/60',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-300 dark:border-indigo-700/80'
    };
  }

  if (BIOME_EXCLUSIVE_DATA[dex]) {
    const biomeData = BIOME_EXCLUSIVE_DATA[dex];
    return {
      type: 'biome',
      label: biomeData.biome,
      shortLabel: biomeData.shortLabel || biomeData.biome,
      badgeColor: 'teal',
      bg: 'bg-teal-100/70 dark:bg-teal-950/60',
      textColor: 'text-teal-800 dark:text-teal-300',
      border: 'border-teal-300 dark:border-teal-700/80'
    };
  }

  if (EVOLUTION_ONLY_DEX_NRS.has(dex)) {
    return {
      type: 'evolution_only',
      label: 'Evolution Only',
      shortLabel: 'Evo Only',
      badgeColor: 'indigo',
      bg: 'bg-indigo-100/70 dark:bg-indigo-950/60',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-300 dark:border-indigo-700/80'
    };
  }

  if (REGIONAL_RAID_DEX_NRS.has(dex)) {
    return {
      type: 'raid',
      label: '5-Star Raid (Regional)',
      shortLabel: 'Regional Raid',
      badgeColor: 'rose',
      bg: 'bg-rose-100/70 dark:bg-rose-950/60',
      textColor: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-700/80'
    };
  }

  if (RAID_ONLY_DEX_NRS.has(dex)) {
    return {
      type: 'raid',
      label: '5-Star Raid',
      shortLabel: 'Raid Only',
      badgeColor: 'rose',
      bg: 'bg-rose-100/70 dark:bg-rose-950/60',
      textColor: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-700/80'
    };
  }

  if (RESEARCH_ONLY_DEX_NRS.has(dex)) {
    return {
      type: 'research',
      label: 'Special Research',
      shortLabel: 'Research',
      badgeColor: 'blue',
      bg: 'bg-blue-100/70 dark:bg-blue-950/60',
      textColor: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-300 dark:border-blue-700/80'
    };
  }

  const isFormRegional = id ? (REGIONAL_DATA_BY_ID[id]?.isRegional === true) : false;
  if (REGIONAL_DEX_NRS.has(dex) || isFormRegional) {
    return {
      type: 'wild',
      label: 'Regional Exclusive',
      shortLabel: 'Regional',
      badgeColor: 'orange',
      bg: 'bg-orange-100/70 dark:bg-orange-950/60',
      textColor: 'text-orange-800 dark:text-orange-300',
      border: 'border-orange-300 dark:border-orange-700/80'
    };
  }

  if (dex === 808) {
    return {
      type: 'special',
      label: 'Mystery Box',
      shortLabel: 'Mystery Box',
      badgeColor: 'pink',
      bg: 'bg-pink-100/70 dark:bg-pink-950/60',
      textColor: 'text-pink-700 dark:text-pink-300',
      border: 'border-pink-300 dark:border-pink-700/80'
    };
  }

  if (dex === 999) {
    return {
      type: 'special',
      label: 'Coin Bag / Stop',
      shortLabel: 'Coin Bag',
      badgeColor: 'pink',
      bg: 'bg-pink-100/70 dark:bg-pink-950/60',
      textColor: 'text-pink-700 dark:text-pink-300',
      border: 'border-pink-300 dark:border-pink-700/80'
    };
  }

  return null;
}

// ============================================================
// AVAILABILITY SORT RANK HELPER
// ============================================================
export function getAvailabilitySortRank(pokemon: {
  dexNr: number;
  id?: string;
  category?: string;
  isCostume?: boolean;
  releasedInGo?: boolean;
  formName?: string;
}): number {
  if (pokemon.releasedInGo === false || UNRELEASED_DEX_NRS.has(pokemon.dexNr)) {
    return 999;
  }

  const tag = getPrimaryAvailabilityTag(pokemon);
  if (!tag) {
    // Standard wild spawn
    return 10;
  }

  switch (tag.type) {
    case 'biome':
      return 20;
    case 'wild':
      return 30; // Regional Exclusive
    case 'raid':
      if (tag.shortLabel === '3-Star Raid') return 40;
      if (tag.shortLabel === 'Raid Only') return 50; // 5-Star Raid
      if (tag.shortLabel === 'Regional Raid') return 60; // 5-Star Raid Regional
      if (tag.shortLabel === 'Elite Raid') return 70; // Elite Raid
      return 50;
    case 'egg_exclusive':
      return 80;
    case 'evolution_only':
      return 90;
    case 'research':
      return 100;
    case 'paid_research':
      return 110;
    case 'special':
      if (tag.shortLabel === 'Daily Incense') return 120;
      if (tag.shortLabel === 'Mystery Box' || tag.shortLabel === 'Coin Bag') return 125;
      return 120;
    case 'event_exclusive':
      if (tag.shortLabel === 'Costume') return 140;
      return 130;
    default:
      return 200;
  }
}

// ============================================================
// AVAILABILITY FILTER HELPER
// ============================================================
export function matchesAvailabilityFilter(
  pokemon: {
    dexNr: number;
    id?: string;
    category?: string;
    isCostume?: boolean;
    releasedInGo?: boolean;
    formName?: string;
  },
  filter: AvailabilityFilterType
): boolean {
  if (!filter || filter === 'all') return true;

  const isUnreleased = pokemon.releasedInGo === false || UNRELEASED_DEX_NRS.has(pokemon.dexNr);
  if (isUnreleased) {
    return false;
  }

  const tag = getPrimaryAvailabilityTag(pokemon);

  switch (filter) {
    case 'wild':
      // Standard wild spawn (no special availability tag)
      return tag === null;
    case 'biome':
      return tag?.type === 'biome';
    case 'regional':
      return tag?.type === 'wild' || tag?.shortLabel === 'Regional';
    case 'raid':
      return tag?.type === 'raid';
    case 'egg':
      return tag?.type === 'egg_exclusive';
    case 'evolution':
      return tag?.type === 'evolution_only';
    case 'research':
      return tag?.type === 'research' || tag?.type === 'paid_research';
    case 'event':
      return tag?.type === 'event_exclusive' && tag?.shortLabel !== 'Costume';
    case 'costume':
      return (
        pokemon.category === 'costume' ||
        Boolean(pokemon.isCostume) ||
        tag?.shortLabel === 'Costume'
      );
    case 'special':
      return tag?.type === 'special' && tag?.shortLabel !== 'Unreleased';
    default:
      return true;
  }
}

