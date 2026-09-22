import { PokemonDetailInfo, RegionalInfo, ObtainMethodDetail, DexAlternativeMethod } from '../types/pokemonInfo';

// ============================================================
// REGIONAL EXCLUSIVES DATA
// ============================================================
const REGIONAL_DATA: Record<number, RegionalInfo> = {
  83:  { isRegional: true, regionName: 'Japan / Ostasien', countries: 'Japan, Südkorea, Hongkong, Taiwan', notes: 'Auch manchmal als 5km-Ei aus ostasiatischen Geschenken' },
  115: { isRegional: true, regionName: 'Australien / Ozeanien', countries: 'Australien, Neuseeland, Teile Südostasiens' },
  122: { isRegional: true, regionName: 'Europa', countries: 'Ganz Europa (inklusive westliches Russland)', notes: 'Mime Jr. kann aus 5km-Eiern von europäischen Freunden schlüpfen' },
  128: { isRegional: true, regionName: 'Nordamerika', countries: 'USA, Kanada, Mexiko (westliche Hemisphäre)', notes: 'Paldea-Formen teilen denselben Dex-Eintrag und können weltweit erscheinen' },
  214: { isRegional: true, regionName: 'Lateinamerika / Teile Europas', countries: 'Lateinamerika, Florida, Texas, Spanien, Portugal', notes: 'Kann als Mega-Heracross-Raid auch außerhalb erscheinen' },
  222: { isRegional: true, regionName: 'Tropische Regionen', hemisphere: 'Innerhalb ±26° Breitengrad (tropische Zone)', countries: 'Südliche USA, Karibbik, Südostasien, Nordaustralien', notes: 'Galar-Corsola registriert ebenfalls #222 und ist weltweit verfügbar' },
  313: { isRegional: true, regionName: 'Europa / Asien / Ozeanien', countries: 'Europa, Asien, Australien, Neuseeland', notes: 'Gegenstück zu Volbeat (Amerika/Afrika)' },
  314: { isRegional: true, regionName: 'Amerika / Afrika', countries: 'Nord- und Südamerika, Afrika', notes: 'Gegenstück zu Illumine (Europa/Asien/Ozeanien)' },
  324: { isRegional: true, regionName: 'Südasien / Südostasien', countries: 'Indien, Nepal, Thailand, Indonesien, Teile Chinas' },
  335: { isRegional: true, regionName: 'Europa / Asien / Ozeanien', countries: 'Europa, Asien, Australien', notes: 'Kann gelegentlich mit Seviper die Hemisphäre tauschen' },
  336: { isRegional: true, regionName: 'Amerika / Afrika', countries: 'Amerika, Afrika', notes: 'Kann gelegentlich mit Zangoose die Hemisphäre tauschen' },
  337: { isRegional: true, regionName: 'Westliche Hemisphäre', hemisphere: 'Westliche Hemisphäre', notes: 'Kann manchmal mit Sonnfel die Hemisphäre tauschen' },
  338: { isRegional: true, regionName: 'Östliche Hemisphäre', hemisphere: 'Östliche Hemisphäre', notes: 'Kann manchmal mit Lunastein die Hemisphäre tauschen' },
  357: { isRegional: true, regionName: 'Afrika / Naher Osten / Spanien', countries: 'Afrika, Naher Osten, Teile Spaniens und Portugals' },
  369: { isRegional: true, regionName: 'Südpazifik', countries: 'Neuseeland, Fiji, Vanuatu, Neukaledonien' },
  417: { isRegional: true, regionName: 'Arktische Regionen', countries: 'Kanada, Alaska, Russland, nördliche Skandinavien' },
  441: { isRegional: true, regionName: 'Südliche Hemisphäre', hemisphere: 'Südliche Hemisphäre', countries: 'Südamerika, Südafrika, Australien, Neuseeland' },
  455: { isRegional: true, regionName: 'Südostliche USA', countries: 'Carolinas, Georgia, Florida-Bereich' },
  480: { isRegional: true, regionName: 'Asien-Pazifik', countries: 'Japan, Australien, Südostasien, Indien', notes: 'Uxie erscheint in See-Raids für alle, aber nur in Asien-Pazifik-Regionen wild' },
  481: { isRegional: true, regionName: 'Europa / Afrika / Mittlerer Osten', countries: 'Europa, Afrika, Indien, Naher Osten', notes: 'Mesprit erscheint in See-Raids für alle, aber nur in Europa/Afrika/Nahost wild' },
  482: { isRegional: true, regionName: 'Amerika / Grönland', countries: 'Amerika, Grönland', notes: 'Azelf erscheint in See-Raids für alle, aber nur in Amerika wild' },
  538: { isRegional: true, regionName: 'Amerika / Afrika', countries: 'Nord- und Südamerika, Afrika', notes: 'Gegenstück zu Karadakra (Europa/Asien/Ozeanien)' },
  539: { isRegional: true, regionName: 'Europa / Asien / Ozeanien', countries: 'Europa, Asien, Australien', notes: 'Gegenstück zu Hadokhan (Amerika/Afrika)' },
  556: { isRegional: true, regionName: 'Südliche USA / Lateinamerika / Karibik', countries: 'Texas, Mexiko, Zentralamerika, Karibik' },
  561: { isRegional: true, regionName: 'Naher Osten / Ägypten / Griechenland', countries: 'Ägypten, Israel, Jordanien, Griechenland' },
  626: { isRegional: true, regionName: 'New York City', countries: 'Nur New York City und unmittelbare Umgebung' },
  631: { isRegional: true, regionName: 'Westliche Hemisphäre', hemisphere: 'Westliche Hemisphäre', notes: 'Gegenstück zu Durantula (östliche Hemisphäre)' },
  632: { isRegional: true, regionName: 'Östliche Hemisphäre', hemisphere: 'Östliche Hemisphäre', notes: 'Gegenstück zu Voltolos (westliche Hemisphäre)' },
  701: { isRegional: true, regionName: 'Mexiko / Zentralamerika / Texas', countries: 'Mexiko, Zentralamerika, Texas, Teile Südwestliche USA' },
  707: { isRegional: true, regionName: 'Frankreich und Umgebung', countries: 'Frankreich, Belgien, Luxemburg, Schweiz' },
  780: { isRegional: true, regionName: 'Hawaii', countries: 'Ausschließlich Hawaii (USA)' },
  796: { isRegional: true, regionName: 'Südliche Hemisphäre', hemisphere: 'Südliche Hemisphäre (Remote Raids möglich)' },
  797: { isRegional: true, regionName: 'Nördliche Hemisphäre', hemisphere: 'Nördliche Hemisphäre (Remote Raids möglich)' },
  805: { isRegional: true, regionName: 'Östliche Hemisphäre', hemisphere: 'Östliche Hemisphäre (Remote Raids möglich)' },
  806: { isRegional: true, regionName: 'Westliche Hemisphäre', hemisphere: 'Westliche Hemisphäre (Remote Raids möglich)' },
};

export const REGIONAL_DEX_NRS = new Set<number>(Object.keys(REGIONAL_DATA).map(Number));

// ============================================================
// SPECIAL OBTAIN NOTES
// ============================================================
const SPECIAL_NOTES: Record<number, string> = {
  132:  'Ditto versteckt sich als anderes Pokémon. Es kann nicht direkt gefangen werden — es enthüllt sich erst nach dem Fangen.',
  151:  'Mew ist nur über das spezielle Forschungsprojekt "Eine mysteriöse Entdeckung" erhältlich.',
  201:  'Unown hat 28 verschiedene Buchstaben-Formen. Jede Form erscheint selten bei Events oder in bestimmten Regionen.',
  235:  'Smeargle kann über den Fotomodus (Schnappschüsse) erscheinen — es schleicht sich ins Foto und kann danach gefangen werden.',
  480:  'Uxie erscheint weltweit in 5-Sterne-Raids. In freier Wildbahn nur in Asien-Pazifik.',
  481:  'Mesprit erscheint weltweit in 5-Sterne-Raids. In freier Wildbahn nur in Europa/Afrika/Mittlerer Osten.',
  482:  'Azelf erscheint weltweit in 5-Sterne-Raids. In freier Wildbahn nur in Amerika.',
  489:  'Phione ist noch nicht in Pokémon GO verfügbar.',
  490:  'Manaphy ist noch nicht in Pokémon GO verfügbar.',
  493:  'Arceus ist noch nicht in Pokémon GO verfügbar.',
  547:  'Whimsicott erscheint in freier Wildbahn und entwickelt sich aus Petilil (50 Bonbons).',
  649:  'Genesect hat viele Antrieb-Formen, die bei Events erscheinen. Der Dex-Eintrag zählt für alle.',
  720:  'Hoopa Eingeschränkt und Entfesselt sind über spezielle Events und Forschungsaufgaben erhältlich.',
  789:  'Cosmog ist eine seltene Belohnung aus speziellen Forschungsaufgaben.',
  801:  'Magearna ist noch nicht in Pokémon GO verfügbar.',
  808:  'Meltan kann nur mit der Meltan-Box gefangen werden. Diese wird durch Verbindung mit Pokémon HOME oder Let\'s Go aktiviert.',
  809:  'Melmetal entwickelt sich aus Meltan mit 400 Bonbons und kann in speziellen Raids erscheinen.',
  893:  'Zarude ist über saisonale spezielle Forschungsaufgaben erhältlich.',
  896:  'Glastrier ist noch nicht in Pokémon GO verfügbar.',
  897:  'Spectrier ist noch nicht in Pokémon GO verfügbar.',
  898:  'Coronospa ist noch nicht in Pokémon GO verfügbar.',
  999:  'Gimmighoul (Wandelform) erscheint ausschließlich auf goldenen PokéStops und Arenen. Die Truhen-Form erscheint nach Münzensammlung.',
  1000: 'Gholdengo entwickelt sich aus Gimmighoul mit 999 Gimmighoul-Münzen.',
};

// ============================================================
// BABY EGG POKÉMON
// ============================================================
const BABY_EGG_POKEMON = new Set([
  172, 173, 174, 175, 236, 237, 238, 239, 240, 298, 360,
  406, 438, 439, 440, 446, 447, 458, 459
]);

// ============================================================
// MEGA / PRIMAL POKEMON with Raids
// ============================================================
const MEGA_RAID_POKEMON = new Set([
  3, 6, 9, 65, 94, 115, 127, 130, 142, 181, 208, 212, 214, 229, 248, 257,
  260, 282, 302, 303, 306, 308, 310, 319, 323, 334, 354, 359, 362, 373, 376,
  380, 381, 384, 428, 445, 448, 460, 461, 531, 719, 720
]);

// ============================================================
// ALTERNATIVE DEX ENTRY METHODS
// ============================================================
const ALTERNATIVE_DEX_METHODS: Record<number, DexAlternativeMethod[]> = {
  83: [
    { type: 'form', title: 'Galar-Porenta fangen', description: 'Galar-Porenta (#083) wird in Raids und wild gefunden und registriert denselben Dex-Eintrag wie das original Farfetch\'d.', badgeLabel: 'Galar-Form' }
  ],
  115: [
    { type: 'mega_raid', title: 'Mega-Kangama Raid', description: 'Mega-Kangama kann weltweit in Mega-Raids bekämpft werden. Ein erfolgreicher Fang registriert #115 Kangama im Pokédex.', badgeLabel: 'Mega-Raid' }
  ],
  122: [
    { type: 'form', title: 'Galar-Pantimos fangen', description: 'Galar-Pantimos ist weltweit erhältlich und registriert denselben Dex-Eintrag #122 wie das reguläre Pantimos.', badgeLabel: 'Galar-Form' },
    { type: 'baby_egg', title: 'Pantimimi aus Geschenken schlüpfen', description: 'Pantimimi (#439) schlüpft aus 5km-Eiern, die von europäischen Freunden gesendet werden. Pantimimi ist das Baby von Pantimos und registriert den Dex-Eintrag beim Entwickeln.', badgeLabel: 'Baby-Ei' }
  ],
  128: [
    { type: 'form', title: 'Paldea-Tauros fangen', description: 'Paldea-Tauros erscheint bei Events weltweit und teilt den Dex-Eintrag #128. Alle drei Formen (Kampf, Aqua, Feuer) registrieren #128.', badgeLabel: 'Paldea-Form' }
  ],
  214: [
    { type: 'mega_raid', title: 'Mega-Heracross Raid', description: 'Mega-Heracross erscheint weltweit in Mega-Raids und registriert bei erfolgreichem Fang den Dex-Eintrag #214.', badgeLabel: 'Mega-Raid' },
    { type: 'remote_raid', title: 'Remote-Raid', description: 'Wenn Heracross oder Mega-Heracross weltweit in Featured Raids erscheint, können Remote-Raid-Pässe genutzt werden.', badgeLabel: 'Remote' }
  ],
  222: [
    { type: 'form', title: 'Galar-Corasonn fangen', description: 'Galar-Corasonn ist weltweit in der Wildnis und in Raids verfügbar und registriert denselben Dex-Eintrag #222.', badgeLabel: 'Galar-Form' }
  ],
  337: [
    { type: 'event', title: 'Hemisphären-Tausch Events', description: 'Lunastein und Sonnfel tauschen bei bestimmten Events (z.B. Sommer/Winter) die Hemisphären. Prüfe Events auf Tausch-Möglichkeiten.', badgeLabel: 'Event-Tausch' }
  ],
  338: [
    { type: 'event', title: 'Hemisphären-Tausch Events', description: 'Sonnfel und Lunastein tauschen bei bestimmten Events (z.B. Sommer/Winter) die Hemisphären. Prüfe Events auf Tausch-Möglichkeiten.', badgeLabel: 'Event-Tausch' }
  ],
  480: [
    { type: 'remote_raid', title: '5-Sterne-Raid (weltweit)', description: 'Uxie erscheint weltweit in 5-Sterne-Raids. Nutze einen Remote-Raid-Pass oder eine Einladung von einem Freund in Asien.', badgeLabel: 'Remote Raid' }
  ],
  481: [
    { type: 'remote_raid', title: '5-Sterne-Raid (weltweit)', description: 'Mesprit erscheint weltweit in 5-Sterne-Raids. Nutze einen Remote-Raid-Pass oder eine Einladung von einem Freund in Europa.', badgeLabel: 'Remote Raid' }
  ],
  482: [
    { type: 'remote_raid', title: '5-Sterne-Raid (weltweit)', description: 'Azelf erscheint weltweit in 5-Sterne-Raids. Nutze einen Remote-Raid-Pass oder eine Einladung von einem Freund in Amerika.', badgeLabel: 'Remote Raid' }
  ],
  796: [
    { type: 'remote_raid', title: 'Remote-Raid (Global-Event)', description: 'Während Ultra-Bestien-Events erscheint Stahlium weltweit in 5-Sterne-Raids. Remote-Raid-Pässe können genutzt werden.', badgeLabel: 'Remote Raid' }
  ],
  797: [
    { type: 'remote_raid', title: 'Remote-Raid (Global-Event)', description: 'Während Ultra-Bestien-Events erscheint Kartana weltweit in 5-Sterne-Raids. Remote-Raid-Pässe können genutzt werden.', badgeLabel: 'Remote Raid' }
  ],
  805: [
    { type: 'remote_raid', title: 'Remote-Raid (Global-Event)', description: 'Während Ultra-Bestien-Events erscheint Stakataka weltweit in 5-Sterne-Raids. Remote-Raid-Pässe können genutzt werden.', badgeLabel: 'Remote Raid' }
  ],
  806: [
    { type: 'remote_raid', title: 'Remote-Raid (Global-Event)', description: 'Während Ultra-Bestien-Events erscheint Blacephalon weltweit in 5-Sterne-Raids. Remote-Raid-Pässe können genutzt werden.', badgeLabel: 'Remote Raid' }
  ],
  808: [
    { type: 'special', title: 'Meltan-Box (Pokémon HOME)', description: 'Die Meltan-Box wird durch Verbindung deines Pokémon GO-Accounts mit Pokémon HOME freigeschaltet. Sie spawnt Meltan für 30 Minuten.', badgeLabel: 'Meltan-Box' }
  ],
  235: [
    { type: 'special', title: 'Foto-Bomben (Schnappschuss)', description: 'Mach Schnappschüsse von beliebigen Pokémon. Smeargle schleicht sich zufällig ins Bild und erscheint danach zum Fangen auf der Karte.', badgeLabel: 'Fotomodus' }
  ],
  132: [
    { type: 'special', title: 'Als anderes Pokémon getarnt', description: 'Ditto tarnt sich als häufige Pokémon (z.B. Taubsi, Wailmer, Zubat). Die Liste der Tarntiere ändert sich bei Events. Erst beim Fangen enthüllt es sich.', badgeLabel: 'Disguise' }
  ],
  999: [
    { type: 'special', title: 'Goldene PokéStops / Arenen', description: 'Gimmighoul (Wandelform) erscheint ausschließlich bei goldenen PokéStops und Arenen. Goldene PokéStops werden durch verbundene Konten oder Events freigeschaltet.', badgeLabel: 'Goldener Stop' }
  ],
};

// ============================================================
// OBTAIN METHODS BUILDER
// ============================================================
function buildObtainMethods(pokemon: any): ObtainMethodDetail[] {
  const methods: ObtainMethodDetail[] = [];
  const dex = pokemon.dexNr as number;

  // Special-only catches (no wild spawn)
  const specialOnlyDex = new Set([151, 201, 235, 480, 481, 482, 489, 490, 493, 720, 789, 808, 999]);
  const raidOnlyDex = new Set([144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381,
    382, 383, 384, 385, 386, 480, 481, 482, 638, 639, 640, 641, 642, 643, 644, 645, 646,
    647, 648, 716, 717, 718]);
  const researchOnlyDex = new Set([151, 649, 720, 785, 786, 787, 788, 789, 893]);

  // Baby egg only
  if (BABY_EGG_POKEMON.has(dex)) {
    methods.push({
      type: 'egg', label: 'Ei', badgeColor: 'amber',
      description: 'Schlüpft ausschließlich aus Eiern (2km, 5km oder 7km). Kann nicht direkt gefangen werden.',
      available: true
    });
    return methods; // no wild spawn for babies
  }

  // Meltan box
  if (dex === 808) {
    methods.push({
      type: 'special', label: 'Meltan-Box', badgeColor: 'pink',
      description: 'Erscheint nach Aktivierung der Meltan-Box durch Verbindung mit Pokémon HOME.',
      available: true
    });
    return methods;
  }

  // Smeargle photobomb
  if (dex === 235) {
    methods.push({
      type: 'special', label: 'Foto-Bomb', badgeColor: 'pink',
      description: 'Erscheint nach Schnappschüssen (Fotomodus). Schleicht sich zufällig ins Bild.',
      available: true
    });
    return methods;
  }

  // Ditto disguise
  if (dex === 132) {
    methods.push({
      type: 'wild', label: 'Als Tarnform', badgeColor: 'emerald',
      description: 'Tarnt sich als häufige Wildtiere. Enthüllt sich erst nach dem Fangen.',
      available: true
    });
    return methods;
  }

  // Raid-only legendaries
  if (raidOnlyDex.has(dex)) {
    methods.push({
      type: 'raid', label: 'Raid-Boss', badgeColor: 'rose',
      description: 'Erscheint als 5-Sterne-Raid-Boss bei speziellen Raid-Stunden oder Events.',
      available: true
    });
    if (researchOnlyDex.has(dex)) {
      methods.push({
        type: 'research', label: 'Spezialforschung', badgeColor: 'blue',
        description: 'Kann auch als Belohnung aus speziellen Forschungsaufgaben erhalten werden.',
        available: true
      });
    }
    return methods;
  }

  // Research-only
  if (researchOnlyDex.has(dex)) {
    methods.push({
      type: 'research', label: 'Spezialforschung', badgeColor: 'blue',
      description: 'Erhältlich nur über spezielle oder saisonale Forschungsaufgaben.',
      available: true
    });
    return methods;
  }

  // Wild spawn (default for most standard pokemon)
  if (!specialOnlyDex.has(dex)) {
    const isRegional = REGIONAL_DEX_NRS.has(dex);
    methods.push({
      type: 'wild', label: isRegional ? 'Wild (Regional)' : 'Wild',
      badgeColor: 'emerald',
      description: isRegional
        ? 'Erscheint in der Wildnis, jedoch nur in bestimmten Regionen der Welt.'
        : 'Erscheint in der Wildnis auf der Karte.',
      available: true
    });
  }

  // Egg-hatching
  const eggDex: Record<number, string> = {
    // 2km eggs
    16: '2km', 19: '2km', 27: '2km', 29: '2km', 32: '2km', 41: '2km', 43: '2km',
    46: '2km', 48: '2km', 50: '2km', 52: '2km', 56: '2km', 60: '2km', 63: '2km',
    66: '2km', 69: '2km', 72: '2km', 74: '2km', 77: '2km', 79: '2km', 81: '2km',
    // 5km eggs - some
    25: '5km', 26: '5km', 54: '5km', 58: '5km', 88: '5km', 92: '5km',
    // 7km eggs (regional babies)
    439: '7km', 172: '7km', 173: '7km', 174: '7km',
    // 10km eggs (rare)
    147: '10km', 371: '10km', 443: '10km', 447: '10km', 562: '10km', 599: '10km', 610: '10km',
    627: '10km', 636: '10km', 653: '10km', 661: '10km', 667: '10km', 679: '10km',
    // 12km eggs (Strange Eggs - dark/poison types)
    453: '12km', 633: '12km', 624: '12km',
  };
  if (eggDex[dex]) {
    methods.push({
      type: 'egg', label: `${eggDex[dex]} Ei`, badgeColor: 'amber',
      description: `Kann aus ${eggDex[dex]}-Eiern schlüpfen.`,
      available: true
    });
  }

  // Rocket encounters
  if (pokemon.hasShadow) {
    methods.push({
      type: 'rocket', label: 'Team GO Rocket', badgeColor: 'purple',
      description: 'Kann als Crypto-Pokémon nach dem Besiegen eines Team GO Rocket-Rüpels gefangen werden.',
      available: true
    });
  }

  // Mega raids for eligible species
  if (MEGA_RAID_POKEMON.has(dex)) {
    methods.push({
      type: 'raid', label: 'Mega-Raid', badgeColor: 'rose',
      description: 'Kann als Mega-Entwicklung in Mega-Raids bekämpft und danach in der Basisform gefangen werden.',
      available: true
    });
  }

  // Field research (common species often appear)
  const researchCommon = new Set([25, 50, 56, 66, 92, 147, 246, 349]);
  if (researchCommon.has(dex)) {
    methods.push({
      type: 'research', label: 'Feldforschung', badgeColor: 'blue',
      description: 'Erscheint häufig als Belohnung in Feldforschungsaufgaben.',
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
  const regional: RegionalInfo = REGIONAL_DATA[dex] || { isRegional: false };
  const obtainMethods = buildObtainMethods(pokemon);
  const manualAlternatives = ALTERNATIVE_DEX_METHODS[dex] || [];

  // Dynamically add form-based alternatives
  const relatedForms = allPokemonList.filter(
    p => p.dexNr === dex && p.id !== pokemon.id && p.category !== 'costume' && p.category !== 'mega'
  );
  const formAlternatives: DexAlternativeMethod[] = relatedForms
    .filter(f => {
      const fn = (f.formName || '').toLowerCase();
      return fn.includes('galar') || fn.includes('alola') || fn.includes('hisui') || fn.includes('paldea');
    })
    .map(f => ({
      type: 'form' as const,
      title: `${f.name} fangen`,
      description: `${f.name} ist eine alternative Form und teilt den Dex-Eintrag #${String(dex).padStart(4, '0')}. Das Fangen dieser Form registriert ebenfalls den Pokédex-Eintrag.`,
      relatedPokemonId: f.id,
      badgeLabel: f.formName || 'Alternative Form'
    }));

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
