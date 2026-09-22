import { Pokemon } from '../types';

const formRankCache = new Map<string, number>();
const sizeRankCache = new Map<string, number>();

export const isBaseForm = (p: Pokemon): boolean =>
  p.category === 'standard' || (!p.isForm && !p.isMega && !p.isCostume && !p.isGenderDifference);

export function computeSizeRank(p: Pokemon): number {
  const s = `${p.id} ${p.formName || ''} ${p.name || ''}`.toLowerCase();
  if (s.includes('small') || s.includes('klein')) return 1;
  if (s.includes('average') || s.includes('fall_2022') || s.includes('fall 2022') || s.includes('normalgroß') || s.includes('mittel')) return 2;
  if (s.includes('large') || s.includes('groß') || s.includes('grosse')) return 3;
  if (s.includes('super') || s.includes('xl') || s.includes('übergröße')) return 4;
  return 99;
}

export function getSizeRank(p: Pokemon): number {
  let rank = sizeRankCache.get(p.id);
  if (rank === undefined) {
    rank = computeSizeRank(p);
    sizeRankCache.set(p.id, rank);
  }
  return rank;
}

export function computeInGameFormRank(p: Pokemon): number {
  const dex = p.dexNr;
  const fid = (p.formId || '').toUpperCase();
  const fname = (p.formName || '').toUpperCase();
  const name = (p.name || '').toUpperCase();

  // 1. Genesect (#649): Normal -> Shock -> Burn -> Chill -> Douse
  if (dex === 649) {
    if (fid === 'NORMAL' || (!fid && p.category === 'standard') || fname.includes('NORMAL')) return 1;
    if (fid.includes('SHOCK') || fname.includes('SHOCK') || fname.includes('BLITZ')) return 2;
    if (fid.includes('BURN') || fname.includes('BURN') || fname.includes('FLAMMEN')) return 3;
    if (fid.includes('CHILL') || fname.includes('CHILL') || fname.includes('GEFRIER')) return 4;
    if (fid.includes('DOUSE') || fname.includes('DOUSE') || fname.includes('AQUA')) return 5;
    return 99;
  }

  // 2. Castform (#351): Normal -> Sunny -> Rainy -> Snowy
  if (dex === 351) {
    if (fid === 'NORMAL' || fname.includes('NORMAL') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('SUNNY') || fname.includes('SUNNY') || fname.includes('SONNE')) return 2;
    if (fid.includes('RAINY') || fname.includes('RAINY') || fname.includes('REGEN')) return 3;
    if (fid.includes('SNOWY') || fname.includes('SNOWY') || fname.includes('SCHNEE')) return 4;
    return 99;
  }

  // 3. Deoxys (#386): Normal -> Attack -> Defense -> Speed
  if (dex === 386) {
    if (fid === 'NORMAL' || fname.includes('NORMAL') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('ATTACK') || fname.includes('ATTACK') || fname.includes('ANGRIFF')) return 2;
    if (fid.includes('DEFENSE') || fname.includes('DEFENSE') || fname.includes('VERTEIDIGUNG')) return 3;
    if (fid.includes('SPEED') || fname.includes('SPEED') || fname.includes('INITIATIVE')) return 4;
    return 99;
  }

  // 4. Rotom (#479): Normal -> Heat -> Wash -> Frost -> Fan -> Mow
  if (dex === 479) {
    if (fid === 'NORMAL' || fname.includes('NORMAL') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('HEAT') || fname.includes('HEAT') || fname.includes('HITZE')) return 2;
    if (fid.includes('WASH') || fname.includes('WASH') || fname.includes('WASCH')) return 3;
    if (fid.includes('FROST') || fname.includes('FROST')) return 4;
    if (fid.includes('FAN') || fname.includes('FAN') || fname.includes('WIRBEL')) return 5;
    if (fid.includes('MOW') || fname.includes('MOW') || fname.includes('SCHNEID')) return 6;
    return 99;
  }

  // 5. Deerling (#585) & Sawsbuck (#586): Spring -> Summer -> Autumn -> Winter
  if (dex === 585 || dex === 586) {
    if (fid.includes('SPRING') || fname.includes('SPRING') || fname.includes('FRÜHLING') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('SUMMER') || fname.includes('SUMMER') || fname.includes('SOMMER')) return 2;
    if (fid.includes('AUTUMN') || fname.includes('AUTUMN') || fname.includes('HERBST')) return 3;
    if (fid.includes('WINTER') || fname.includes('WINTER')) return 4;
    return 99;
  }

  // 6. Vivillon (#666): Standard Pokémon GO Pokédex Habitat Order
  if (dex === 666 || dex === 664 || dex === 665) {
    if (fid.includes('ARCHIPELAGO') || fname.includes('ARCHIPELAGO') || fname.includes('INSELN')) return 1;
    if (fid.includes('CONTINENTAL') || fname.includes('CONTINENTAL') || fname.includes('KONTINENTAL')) return 2;
    if (fid.includes('ELEGANT') || fname.includes('ELEGANT') || fname.includes('ZIER')) return 3;
    if (fid.includes('GARDEN') || fname.includes('GARDEN') || fname.includes('GARTEN')) return 4;
    if (fid.includes('HIGH_PLAINS') || fid.includes('HIGH PLAINS') || fname.includes('HIGH PLAINS') || fname.includes('PRÄRIE')) return 5;
    if (fid.includes('ICY_SNOW') || fid.includes('ICY SNOW') || fname.includes('ICY SNOW') || fname.includes('FROST')) return 6;
    if (fid.includes('JUNGLE') || fname.includes('JUNGLE') || fname.includes('DSCHUNGEL')) return 7;
    if (fid.includes('MARINE') || fname.includes('MARINE') || fname.includes('MARIN')) return 8;
    if (fid.includes('MEADOW') || fname.includes('MEADOW') || fname.includes('BLUMENMEER')) return 9;
    if (fid.includes('MODERN') || fname.includes('MODERN')) return 10;
    if (fid.includes('MONSOON') || fname.includes('MONSOON') || fname.includes('MONSUN')) return 11;
    if (fid.includes('OCEAN') || fname.includes('OCEAN') || fname.includes('OZEAN')) return 12;
    if (fid.includes('POLAR') || fname.includes('POLAR')) return 13;
    if (fid.includes('RIVER') || fname.includes('RIVER') || fname.includes('FLUSS')) return 14;
    if (fid.includes('SANDSTORM') || fname.includes('SANDSTORM') || fname.includes('SANDSTURM')) return 15;
    if (fid.includes('SAVANNA') || fname.includes('SAVANNA') || fname.includes('SAVANNEN')) return 16;
    if (fid.includes('SUN') || fname.includes('SUN') || fname.includes('SONNEN')) return 17;
    if (fid.includes('TUNDRA') || fname.includes('TUNDRA')) return 18;
    if (fid.includes('FANCY') || fname.includes('FANCY') || fname.includes('FANTASIE')) return 19;
    if (fid.includes('POKE_BALL') || fid.includes('POKEBALL') || fname.includes('POKEBALL') || fname.includes('POKÉBALL')) return 20;
    return 99;
  }

  // 7. Flabébé (#669), Floette (#670), Florges (#671): Red -> Yellow -> Orange -> Blue -> White
  if (dex === 669 || dex === 670 || dex === 671) {
    if (fid.includes('RED') || fname.includes('RED') || fname.includes('ROT') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('YELLOW') || fname.includes('YELLOW') || fname.includes('GELB')) return 2;
    if (fid.includes('ORANGE') || fname.includes('ORANGE')) return 3;
    if (fid.includes('BLUE') || fname.includes('BLUE') || fname.includes('BLAU')) return 4;
    if (fid.includes('WHITE') || fname.includes('WHITE') || fname.includes('WEISS') || fname.includes('WEIß')) return 5;
    return 99;
  }

  // 8. Furfrou (#676): Natural -> Matron -> Dandy -> Debutante -> Diamond -> Star -> La Reine -> Kabuki -> Pharaoh -> Heart
  if (dex === 676) {
    if (fid === 'NATURAL' || (!fid && p.category === 'standard') || fname.includes('NATURAL') || fname.includes('STRUPP')) return 1;
    if (fid.includes('MATRON') || fname.includes('MATRON') || fname.includes('DAMEN')) return 2;
    if (fid.includes('DANDY') || fname.includes('DANDY') || fname.includes('KAVALIER')) return 3;
    if (fid.includes('DEBUTANTE') || fname.includes('DEBUTANTE') || fname.includes('FRÄULEIN')) return 4;
    if (fid.includes('DIAMOND') || fname.includes('DIAMOND') || fname.includes('DIAMANT')) return 5;
    if (fid.includes('STAR') || fname.includes('STAR') || fname.includes('STERN')) return 6;
    if (fid.includes('LA_REINE') || fid.includes('LA REINE') || fname.includes('REINE') || fname.includes('KÖNIGIN')) return 7;
    if (fid.includes('KABUKI') || fname.includes('KABUKI')) return 8;
    if (fid.includes('PHARAOH') || fname.includes('PHARAOH') || fname.includes('PHARAONEN')) return 9;
    if (fid.includes('HEART') || fname.includes('HEART') || fname.includes('HERZ')) return 10;
    return 99;
  }

  // 9. Zygarde (#718): 10% Forme -> 50% Forme -> Complete Forme
  if (dex === 718) {
    if (fid.includes('TEN_PERCENT') || fid.includes('10') || fname.includes('10%')) return 1;
    if (fid.includes('FIFTY_PERCENT') || fid.includes('50') || fname.includes('50%') || (!fid && p.category === 'standard')) return 2;
    if (fid.includes('COMPLETE') || fname.includes('COMPLETE') || fname.includes('OPTIMAL')) return 3;
    return 99;
  }

  // 10. Oricorio (#741): Baile -> Pom-Pom -> Pa'u -> Sensu
  if (dex === 741) {
    if (fid.includes('BAILE') || fname.includes('BAILE') || fname.includes('FLAMENCO') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('POM_POM') || fid.includes('POM-POM') || fid.includes('POMPOM') || fname.includes('POM-POM') || fname.includes('CHEE')) return 2;
    if (fid.includes('PAU') || fid.includes('PA\'U') || fname.includes('PA\'U') || fname.includes('HULA')) return 3;
    if (fid.includes('SENSU') || fname.includes('SENSU') || fname.includes('BUYU')) return 4;
    return 99;
  }

  // 11. Lycanroc (#745): Midday -> Midnight -> Dusk
  if (dex === 745) {
    if (fid.includes('MIDDAY') || fname.includes('MIDDAY') || fname.includes('TAGFORM') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('MIDNIGHT') || fname.includes('MIDNIGHT') || fname.includes('NACHTFORM')) return 2;
    if (fid.includes('DUSK') || fname.includes('DUSK') || fname.includes('ZWERRICHT')) return 3;
    return 99;
  }

  // 12. Squawkabilly (#931): Green -> Blue -> Yellow -> White
  if (dex === 931) {
    if (fid.includes('GREEN') || fname.includes('GREEN') || fname.includes('GRÜN') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('BLUE') || fname.includes('BLUE') || fname.includes('BLAU')) return 2;
    if (fid.includes('YELLOW') || fname.includes('YELLOW') || fname.includes('GELB')) return 3;
    if (fid.includes('WHITE') || fname.includes('WHITE') || fname.includes('WEISS') || fname.includes('WEIß')) return 4;
    return 99;
  }

  // 13. Gastrodon (#423) & Shellos (#422): West Sea (Pink) -> East Sea (Blue)
  if (dex === 422 || dex === 423) {
    if (fid.includes('WEST') || fname.includes('WEST') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('EAST') || fname.includes('EAST') || fname.includes('OST')) return 2;
    return 99;
  }

  // 14. Pumpkaboo (#710) & Gourgeist (#711): Small -> Average -> Large -> Super
  if (dex === 710 || dex === 711) {
    return getSizeRank(p);
  }

  // 15. Tauros (#128): Standard (Kanto) -> Combat -> Blaze -> Aqua
  if (dex === 128) {
    if (!fid.includes('PALDEA') && !fname.includes('PALDEA')) return 1;
    if (fid.includes('COMBAT') || fname.includes('COMBAT') || fname.includes('GEFECHT')) return 2;
    if (fid.includes('BLAZE') || fname.includes('BLAZE') || fname.includes('FLAMMEN')) return 3;
    if (fid.includes('AQUA') || fname.includes('AQUA') || fname.includes('FLUTEN')) return 4;
    return 99;
  }

  // 16. Unown (#201): A through Z, then '!', then '?'
  if (dex === 201) {
    const rawFname = p.formName || '';
    if (rawFname === '!') return 27;
    if (rawFname === '?') return 28;
    if (rawFname.length === 1 && rawFname >= 'A' && rawFname <= 'Z') {
      return rawFname.charCodeAt(0) - 64;
    }
    return 99;
  }

  // 17. Kyurem (#646): Standard -> Black -> White
  if (dex === 646) {
    if (fid === 'NORMAL' || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('BLACK') || fname.includes('BLACK') || fname.includes('SCHWARZ')) return 2;
    if (fid.includes('WHITE') || fname.includes('WHITE') || fname.includes('WEISS') || fname.includes('WEIß')) return 3;
    return 99;
  }

  // 18. Basculin (#550): Red -> Blue -> White
  if (dex === 550) {
    if (fid.includes('RED') || fname.includes('RED') || fname.includes('ROT') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('BLUE') || fname.includes('BLUE') || fname.includes('BLAU')) return 2;
    if (fid.includes('WHITE') || fname.includes('WHITE') || fname.includes('WEISS') || fname.includes('WEIß')) return 3;
    return 99;
  }

  // 19. Burmy (#412) & Wormadam (#413): Plant -> Sandy -> Trash
  if (dex === 412 || dex === 413) {
    if (fid.includes('PLANT') || fname.includes('PLANT') || fname.includes('PFLANZEN') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('SANDY') || fname.includes('SANDY') || fname.includes('SAND')) return 2;
    if (fid.includes('TRASH') || fname.includes('TRASH') || fname.includes('LUMPEN')) return 3;
    return 99;
  }

  // 20. Shellos (#422) & Gastrodon (#423): West Sea -> East Sea
  if (dex === 422 || dex === 423) {
    if (fid.includes('WEST') || fname.includes('WEST') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('EAST') || fname.includes('EAST') || fname.includes('OST')) return 2;
    return 99;
  }

  // 21. Cherrim (#421): Overcast -> Sunshine
  if (dex === 421) {
    if (fid.includes('OVERCAST') || fname.includes('OVERCAST') || fname.includes('WOLKEN') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('SUNNY') || fid.includes('SUNSHINE') || fname.includes('SONNEN')) return 2;
    return 99;
  }

  // 22. Spinda (#327): Pattern 1 to 9
  if (dex === 327) {
    const match = `${fid} ${fname}`.match(/\b(?:PATTERN|MUSTER)\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
    if (fname.includes('HEART') || fname.includes('HERZ')) return 9;
    return 99;
  }

  // 23. Toxtricity (#849): Amped -> Low Key
  if (dex === 849) {
    if (fid.includes('AMPED') || fname.includes('AMPED') || fname.includes('HOCH') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('LOW_KEY') || fid.includes('LOW KEY') || fname.includes('TIEF')) return 2;
    return 99;
  }

  // 24. Urshifu (#892): Single Strike -> Rapid Strike
  if (dex === 892) {
    if (fid.includes('SINGLE') || fname.includes('SINGLE') || fname.includes('FOKUSSIERT') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('RAPID') || fname.includes('RAPID') || fname.includes('FLIESSEND') || fname.includes('FLIEßEND')) return 2;
    return 99;
  }

  // 25. Dialga (#483) & Palkia (#484) & Giratina (#487): Standard/Altered -> Origin
  if (dex === 483 || dex === 484 || dex === 487) {
    if (fid.includes('ORIGIN') || fname.includes('ORIGIN') || fname.includes('URFORM')) return 2;
    return 1;
  }

  // 26. Shaymin (#492): Land -> Sky
  if (dex === 492) {
    if (fid.includes('SKY') || fname.includes('SKY') || fname.includes('ZENIT')) return 2;
    return 1;
  }

  // 27. Keldeo (#647): Ordinary -> Resolute
  if (dex === 647) {
    if (fid.includes('RESOLUTE') || fname.includes('RESOLUTE') || fname.includes('ENTSCHLOSSEN')) return 2;
    return 1;
  }

  // 28. Hoopa (#720): Confined -> Unbound
  if (dex === 720) {
    if (fid.includes('UNBOUND') || fname.includes('UNBOUND') || fname.includes('ENTFESSELT')) return 2;
    return 1;
  }

  // 29. Indeedee (#876) / Meowstic (#678) / Oinkologne (#916): Male -> Female
  if (dex === 876 || dex === 678 || dex === 916) {
    if (fid.includes('MALE') || fname.includes('MALE') || fname.includes('MÄNNLICH') || (!fid && p.category === 'standard')) return 1;
    if (fid.includes('FEMALE') || fname.includes('FEMALE') || fname.includes('WEIBLICH')) return 2;
    return 99;
  }

  // 30. Maushold (#925): Family of 4 -> Family of 3
  if (dex === 925) {
    if (fid.includes('FOUR') || fname.includes('4') || fname.includes('VIERER')) return 1;
    if (fid.includes('THREE') || fname.includes('3') || fname.includes('DREIER')) return 2;
    return 99;
  }

  // 31. Dudunsparce (#982): Two-Segment -> Three-Segment
  if (dex === 982) {
    if (fid.includes('TWO') || fname.includes('2') || fname.includes('ZWEISTUFIG')) return 1;
    if (fid.includes('THREE') || fname.includes('3') || fname.includes('DREISTUFIG')) return 2;
    return 99;
  }

  // 32. Sinistea / Polteageist (#854, #855): Phony -> Antique
  if (dex === 854 || dex === 855) {
    if (fid.includes('PHONY') || fname.includes('PHONY') || fname.includes('FÄLSCHUNG')) return 1;
    if (fid.includes('ANTIQUE') || fname.includes('ANTIQUE') || fname.includes('ORIGINAL')) return 2;
    return 99;
  }

  // 33. Poltchageist / Sinistcha (#1012, #1013): Counterfeit/Unremarkable -> Masterpiece
  if (dex === 1012 || dex === 1013) {
    if (fid.includes('MASTERPIECE') || fname.includes('MASTERPIECE') || fname.includes('KOSTBAR')) return 2;
    return 1;
  }

  // 34. Regional forms general rule: Original (0) -> Alola (10) -> Galar (20) -> Hisui (30) -> Paldea (40)
  const isAlola = fid.includes('ALOLA') || fname.includes('ALOLA') || name.includes('ALOLAN');
  const isGalar = fid.includes('GALAR') || fname.includes('GALAR') || name.includes('GALARIAN');
  const isHisui = fid.includes('HISUI') || fname.includes('HISUI') || name.includes('HISUIAN');
  const isPaldea = fid.includes('PALDEA') || fname.includes('PALDEA') || name.includes('PALDEAN');

  if (isAlola) return 10;
  if (isGalar) return 20;
  if (isHisui) return 30;
  if (isPaldea) return 40;

  if (p.category === 'standard') return 0;
  return 50;
}

export function getInGameFormRank(p: Pokemon): number {
  let rank = formRankCache.get(p.id);
  if (rank === undefined) {
    rank = computeInGameFormRank(p);
    formRankCache.set(p.id, rank);
  }
  return rank;
}

/**
 * Standard comparator to sort Pokémon forms within the same species (dexNr).
 * Base/Standard form is always first, followed by canonical in-game forms,
 * gender differences, and finally event costumes.
 */
export function compareFormsWithinSpecies(a: Pokemon, b: Pokemon): number {
  // If one is costume and other is not, non-costume always comes first
  const aCostume = Boolean(a.isCostume || a.category === 'costume');
  const bCostume = Boolean(b.isCostume || b.category === 'costume');
  if (aCostume !== bCostume) {
    return aCostume ? 1 : -1;
  }

  // Size forms (Pumpkaboo #710, Gourgeist #711) sort from Small to Big: Small -> Average -> Large -> Super
  if (a.dexNr === 710 || a.dexNr === 711) {
    const aRank = getSizeRank(a);
    const bRank = getSizeRank(b);
    if (aRank !== bRank) {
      return aRank - bRank;
    }
  }

  // Check in-game Pokédex form rank
  const aFormRank = getInGameFormRank(a);
  const bFormRank = getInGameFormRank(b);
  if (aFormRank !== bFormRank) {
    return aFormRank - bFormRank;
  }

  const aBase = isBaseForm(a);
  const bBase = isBaseForm(b);
  if (aBase !== bBase) {
    return aBase ? -1 : 1;
  }

  if (Boolean(a.isGenderDifference) !== Boolean(b.isGenderDifference)) {
    return a.isGenderDifference ? 1 : -1;
  }

  return (a.formName || a.name).localeCompare(b.formName || b.name);
}
