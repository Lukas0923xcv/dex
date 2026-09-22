import { PokemonDetailInfo, RegionalInfo, ObtainMethodDetail, DexAlternativeMethod } from '../types/pokemonInfo';

// ============================================================
// REGIONAL EXCLUSIVES DATA (Base species by Dex Number)
// ============================================================
export const REGIONAL_DATA: Record<number, RegionalInfo> = {
  // Gen 1
  83:  { isRegional: true, regionName: 'Japan / Ostasien', countries: 'Japan, Südkorea, Hongkong, Taiwan', notes: 'Galar-Porenta (#083) ist weltweit verfügbar und teilt denselben Dex-Eintrag' },
  115: { isRegional: true, regionName: 'Australien / Ozeanien', countries: 'Australien, Neuseeland, Teile Südostasiens', notes: 'Mega-Kangama kann weltweit in Mega-Raids bekämpft werden' },
  122: { isRegional: true, regionName: 'Europa', countries: 'Ganz Europa (inklusive westliches Russland)', notes: 'Galar-Pantimos ist weltweit bei Events verfügbar; Mime Jr. schlüpft aus 5km-Eiern aus Europa' },
  128: { isRegional: true, regionName: 'Nordamerika', countries: 'USA, Kanada, Teile Mexikos', notes: 'Paldea-Tauros Combat Breed ist weltweit verfügbar; Blaze und Aqua Breed sind regional' },

  // Gen 2
  214: { isRegional: true, regionName: 'Lateinamerika / Südliche USA', countries: 'Lateinamerika, Süd-Florida, Süd-Texas', notes: 'Mega-Heracross kann weltweit in Mega-Raids bekämpft werden' },
  222: { isRegional: true, regionName: 'Tropische Regionen', hemisphere: 'Innerhalb ±26° Breitengrad (tropische Zone)', countries: 'Südliche USA, Karibik, Südostasien, Nordaustralien', notes: 'Galar-Corasonn registriert ebenfalls #222 und ist weltweit bei Events erhältlich' },

  // Gen 3
  313: { isRegional: true, regionName: 'Europa / Asien / Ozeanien', countries: 'Europa, Asien, Australien, Neuseeland', notes: 'Gegenstück zu Illumise (Amerika/Afrika)' },
  314: { isRegional: true, regionName: 'Amerika / Afrika', countries: 'Nord- und Südamerika, Afrika', notes: 'Gegenstück zu Volbeat (Europa/Asien/Ozeanien)' },
  324: { isRegional: true, regionName: 'Südasien / Südostasien', countries: 'Indien, Nepal, Thailand, Indonesien, Teile Chinas' },
  335: { isRegional: true, regionName: 'Europa / Asien / Ozeanien', countries: 'Europa, Asien, Australien', notes: 'Kann gelegentlich bei Events mit Vipitis die Hemisphäre tauschen' },
  336: { isRegional: true, regionName: 'Amerika / Afrika', countries: 'Nord- und Südamerika, Afrika', notes: 'Kann gelegentlich bei Events mit Sengo die Hemisphäre tauschen' },
  337: { isRegional: true, regionName: 'Westliche Hemisphäre', hemisphere: 'Westliche Hemisphäre', notes: 'Kann bei Sonnenwende-Events mit Sonnfel die Hemisphäre tauschen' },
  338: { isRegional: true, regionName: 'Östliche Hemisphäre', hemisphere: 'Östliche Hemisphäre', notes: 'Kann bei Sonnenwende-Events mit Lunastein die Hemisphäre tauschen' },
  357: { isRegional: true, regionName: 'Afrika / Naher Osten / Südspanien', countries: 'Afrika, Naher Osten, Südspanien, Zypern, Kreta' },
  369: { isRegional: true, regionName: 'Südpazifik / Neuseeland', countries: 'Neuseeland, Fidschi, Vanuatu, Neukaledonien' },

  // Gen 4
  417: { isRegional: true, regionName: 'Arktische / Subarktische Regionen', countries: 'Kanada, Alaska, Russland, nördliches Skandinavien' },
  422: { isRegional: true, regionName: 'Hemisphären-getrennt', hemisphere: 'West-/Östliche Hemisphäre', notes: 'Westliches Meer: Westen · Östliches Meer: Osten' },
  439: { isRegional: true, regionName: 'Europa (5km-Eier)', countries: 'Europa (inkl. Island, Zypern)', notes: 'Schlüpft ausschließlich aus 5km-Eiern aus europäischen Freundschaftsgeschenken' },
  441: { isRegional: true, regionName: 'Südliche Hemisphäre', hemisphere: 'Südliche Hemisphäre', countries: 'Südamerika, Südafrika, Australien, Neuseeland' },
  455: { isRegional: true, regionName: 'Südöstliche USA', countries: 'Florida, Georgia, North & South Carolina' },
  480: { isRegional: true, regionName: 'Asien-Pazifik', countries: 'Japan, Australien, Südostasien, Indien', notes: '5-Sterne-Raid-Boss in Asien-Pazifik (Fern-Raid weltweit möglich). Extrem selten wild an Gewässern.' },
  481: { isRegional: true, regionName: 'Europa / Afrika / Mittlerer Osten', countries: 'Europa, Afrika, Indien, Naher Osten', notes: '5-Sterne-Raid-Boss in Europa/Afrika/MEA (Fern-Raid weltweit möglich). Extrem selten wild an Gewässern.' },
  482: { isRegional: true, regionName: 'Amerika & Grönland', countries: 'Nord- und Südamerika, Grönland', notes: '5-Sterne-Raid-Boss in Amerika (Fern-Raid weltweit möglich). Extrem selten wild an Gewässern.' },

  // Gen 5
  511: { isRegional: true, regionName: 'Asien-Pazifik', countries: 'Japan, Australien, Südostasien, Indien', notes: 'Gegenstück zu Grillmak (Europa/MEA) und Sodamak (Amerika)' },
  512: { isRegional: true, regionName: 'Asien-Pazifik', countries: 'Japan, Australien, Südostasien, Indien', notes: 'Entwickelt sich aus Vegimak mit 50 Bonbons und Einall-Stein' },
  513: { isRegional: true, regionName: 'Europa / Afrika / Mittlerer Osten / Indien', countries: 'Europa, Afrika, Naher Osten, Indien', notes: 'Gegenstück zu Vegimak (Asien-Pazifik) und Sodamak (Amerika)' },
  514: { isRegional: true, regionName: 'Europa / Afrika / Mittlerer Osten / Indien', countries: 'Europa, Afrika, Naher Osten, Indien', notes: 'Entwickelt sich aus Grillmak mit 50 Bonbons und Einall-Stein' },
  515: { isRegional: true, regionName: 'Amerika & Grönland', countries: 'Nord- und Südamerika, Grönland', notes: 'Gegenstück zu Vegimak (Asien-Pazifik) und Grillmak (Europa/MEA)' },
  516: { isRegional: true, regionName: 'Amerika & Grönland', countries: 'Nord- und Südamerika, Grönland', notes: 'Entwickelt sich aus Sodamak mit 50 Bonbons und Einall-Stein' },
  538: { isRegional: true, regionName: 'Amerika / Afrika', countries: 'Nord- und Südamerika, Afrika', notes: 'Gegenstück zu Karadonis (Europa/Asien/Ozeanien)' },
  539: { isRegional: true, regionName: 'Europa / Asien / Ozeanien', countries: 'Europa, Asien, Australien', notes: 'Gegenstück zu Jiutesto (Amerika/Afrika)' },
  550: { isRegional: true, regionName: 'Hemisphären-getrennt', hemisphere: 'West-/Östliche Hemisphäre', notes: 'Rotlinig: Östliche Hemisphäre · Blaulinig: Westliche Hemisphäre · Weißlinig: Routen & Mateo' },
  556: { isRegional: true, regionName: 'Südliche USA / Lateinamerika / Karibik', countries: 'Südliche USA, Mexiko, Zentral- und Südamerika, Karibik' },
  561: { isRegional: true, regionName: 'Ägypten / Griechenland / Naher Osten', countries: 'Ägypten, Griechenland, Israel, Jordanien' },
  626: { isRegional: true, regionName: 'New York City & Umgebung', countries: 'New York City, New York State und Teile angrenzender US-Bundesstaaten' },
  631: { isRegional: true, regionName: 'Westliche Hemisphäre', hemisphere: 'Westliche Hemisphäre', notes: 'Gegenstück zu Fermicula (Östliche Hemisphäre)' },
  632: { isRegional: true, regionName: 'Östliche Hemisphäre', hemisphere: 'Östliche Hemisphäre', notes: 'Gegenstück zu Furnifraß (Westliche Hemisphäre)' },

  // Gen 6
  701: { isRegional: true, regionName: 'Mexiko & Umgebung', countries: 'Mexiko und angrenzende südliche US-Grenzregionen' },
  707: { isRegional: true, regionName: 'Frankreich & Nachbarländer', countries: 'Frankreich, Belgien, Luxemburg, Schweiz, Südengland' },
  741: { isRegional: true, regionName: 'Verschiedene Regionen (Form-abhängig)', countries: 'Baile: Europa/MEA · Pom-Pom: Amerika · Pa\'u: Afrika/Pazifik · Sensu: Asien-Pazifik', notes: 'Jede Form hat eine andere weltweite Heimatregion' },

  // Gen 7
  764: { isRegional: true, regionName: 'Hawaii', countries: 'Ausschließlich die Inseln Hawaiis (USA)' },
  794: { isRegional: true, regionName: 'Amerika & Grönland', hemisphere: 'Westliche Hemisphäre', countries: 'Nord- und Südamerika, Grönland', notes: 'Erscheint als 5-Sterne-Raid-Boss nur in Amerika & Grönland (Fern-Raid weltweit möglich)' },
  795: { isRegional: true, regionName: 'Europa / Afrika / Mittlerer Osten / Indien', countries: 'Europa, Mittlerer Osten, Afrika, Indien', notes: 'Erscheint als 5-Sterne-Raid-Boss nur in Europa/MEA/Indien (Fern-Raid weltweit möglich)' },
  796: { isRegional: true, regionName: 'Asien-Pazifik', countries: 'Japan, Australien, Neuseeland, Südostasien', notes: 'Erscheint als 5-Sterne-Raid-Boss nur in Asien-Pazifik (Fern-Raid weltweit möglich)' },
  797: { isRegional: true, regionName: 'Südliche Hemisphäre', hemisphere: 'Südliche Hemisphäre', countries: 'Südamerika, Südafrika, Australien, Neuseeland', notes: 'Erscheint als 5-Sterne-Raid-Boss nur auf der Südhalbkugel (Fern-Raid weltweit möglich)' },
  798: { isRegional: true, regionName: 'Nördliche Hemisphäre', hemisphere: 'Nördliche Hemisphäre', countries: 'Nordamerika, Europa, Nordasien', notes: 'Erscheint als 5-Sterne-Raid-Boss nur auf der Nordhalbkugel (Fern-Raid weltweit möglich)' },
  805: { isRegional: true, regionName: 'Östliche Hemisphäre', hemisphere: 'Östliche Hemisphäre', countries: 'Europa, Asien, Afrika, Australien', notes: 'Erscheint als 5-Sterne-Raid-Boss nur in der östlichen Hemisphäre (Fern-Raid weltweit möglich)' },
  806: { isRegional: true, regionName: 'Westliche Hemisphäre', hemisphere: 'Westliche Hemisphäre', countries: 'Nord- und Südamerika', notes: 'Erscheint als 5-Sterne-Raid-Boss nur in der westlichen Hemisphäre (Fern-Raid weltweit möglich)' },

  // Gen 8 & 9
  874: { isRegional: true, regionName: 'Großbritannien', countries: 'Großbritannien (England, Schottland, Wales)', notes: 'Erscheint exklusiv in Großbritannien in der Wildnis' },
};

export const REGIONAL_DEX_NRS = new Set<number>(Object.keys(REGIONAL_DATA).map(Number));

// ============================================================
// PER-FORM REGIONAL DATA (form-specific regional exclusives)
// Keyed by exact Pokemon ID (e.g. 'poke_931_special_blue_plumage')
// ============================================================
const REGIONAL_DATA_BY_ID: Record<string, RegionalInfo> = {
  // ── Squawkabilly #931 ──────────────────────────────────────
  'poke_931_base':                    { isRegional: true, regionName: 'Europa / Mittlerer Osten / Afrika', countries: 'Europa, Mittlerer Osten, Afrika (Grünes Gefieder)' },
  'poke_931_special_blue_plumage':    { isRegional: true, regionName: 'Amerika', countries: 'Nord- und Südamerika (Blaues Gefieder)' },
  'poke_931_special_yellow_plumage':  { isRegional: true, regionName: 'Asien-Pazifik', countries: 'Japan, China, Südostasien, Australien, Neuseeland (Gelbes Gefieder)' },
  'poke_931_special_white_plumage':   { isRegional: true, regionName: 'Afrika / Indien / Mittlerer Osten', countries: 'Indien, Teile Afrikas, Naher Osten (Weißes Gefieder)' },

  // ── Oricorio #741 ──────────────────────────────────────────
  'poke_741_base':             { isRegional: true, regionName: 'Europa / Mittlerer Osten / Afrika', countries: 'Europa, Mittlerer Osten, Afrika (Flamenco-Stil / Baile)' },
  'poke_741_special_pom_pom':  { isRegional: true, regionName: 'Amerika', countries: 'Nord- und Südamerika (Cheerleading-Stil / Pom-Pom)' },
  'poke_741_special_pa_u':     { isRegional: true, regionName: 'Afrika / Pazifik-Inseln / Südasien', countries: 'Subsahara-Afrika, Pazifik-Inseln, Südasien (Hula-Stil / Pa\'u)' },
  'poke_741_special_sensu':    { isRegional: true, regionName: 'Asien-Pazifik', countries: 'Japan, China, Südostasien, Australien (Tanztheater-Stil / Sensu)' },

  // ── Shellos & Gastrodon #422 ──────────────────────────────
  'poke_422_base':             { isRegional: true, regionName: 'Westliche Hemisphäre', hemisphere: 'Westliche Hemisphäre', notes: 'Westliches Meer erscheint westlich des Nullmeridians (Amerika, Westeuropa)' },
  'poke_422_special_east_sea': { isRegional: true, regionName: 'Östliche Hemisphäre', hemisphere: 'Östliche Hemisphäre', notes: 'Östliches Meer erscheint östlich des Nullmeridians (Osteuropa, Asien, Ozeanien)' },

  // ── Basculin #550 ──────────────────────────────────────────
  'poke_550_base':                   { isRegional: true, regionName: 'Östliche Hemisphäre', hemisphere: 'Östliche Hemisphäre', notes: 'Rotlinige Form erscheint wild in der östlichen Hemisphäre' },
  'poke_550_special_blue_striped':   { isRegional: true, regionName: 'Westliche Hemisphäre', hemisphere: 'Westliche Hemisphäre', notes: 'Blaulinige Form erscheint wild in der westlichen Hemisphäre' },
  'poke_550_special_white_striped':  { isRegional: false, notes: 'Weißlinige Form: Weltweit über Routen & Mateo (7km-Eier) erhältlich' },

  // ── Flabébé #669, Floette #670, Florges #671 ──────────────
  'poke_669_base':            { isRegional: true, regionName: 'Amerika', countries: 'Nord- und Südamerika (Rotblütler)' },
  'poke_669_special_blue':    { isRegional: true, regionName: 'Europa / Asien-Pazifik', countries: 'Europa und Teile Asiens (Blaublütler)' },
  'poke_669_special_yellow':  { isRegional: true, regionName: 'Amerika / Asien-Pazifik', countries: 'Nord- und Südamerika, Asien (Gelbblütler)' },
  'poke_669_special_white':   { isRegional: false, notes: 'Weißblütler: Weltweit sehr selten in freier Wildbahn anzutreffen' },
  'poke_669_special_orange':  { isRegional: false, notes: 'Orangeblütler: Weltweit sehr selten in freier Wildbahn anzutreffen' },

  'poke_670_base':            { isRegional: true, regionName: 'Amerika', countries: 'Nord- und Südamerika (Rotblütler)' },
  'poke_670_special_blue':    { isRegional: true, regionName: 'Europa / Asien-Pazifik', countries: 'Europa und Teile Asiens (Blaublütler)' },
  'poke_670_special_yellow':  { isRegional: true, regionName: 'Amerika / Asien-Pazifik', countries: 'Nord- und Südamerika, Asien (Gelbblütler)' },
  'poke_670_special_white':   { isRegional: false, notes: 'Weißblütler: Weltweit durch Entwicklung aus Flabébé (Weiß)' },
  'poke_670_special_orange':  { isRegional: false, notes: 'Orangeblütler: Weltweit durch Entwicklung aus Flabébé (Orange)' },

  'poke_671_base':            { isRegional: true, regionName: 'Amerika', countries: 'Nord- und Südamerika (Rotblütler)' },
  'poke_671_special_blue':    { isRegional: true, regionName: 'Europa / Asien-Pazifik', countries: 'Europa und Teile Asiens (Blaublütler)' },
  'poke_671_special_yellow':  { isRegional: true, regionName: 'Amerika / Asien-Pazifik', countries: 'Nord- und Südamerika, Asien (Gelbblütler)' },
  'poke_671_special_white':   { isRegional: false, notes: 'Weißblütler: Weltweit durch Entwicklung aus Floette (Weiß)' },
  'poke_671_special_orange':  { isRegional: false, notes: 'Orangeblütler: Weltweit durch Entwicklung aus Floette (Orange)' },

  // ── Paldean Tauros #128 ────────────────────────────────────
  'poke_128_form_tauros_paldea_combat': { isRegional: false, notes: 'Gefechtsvariante (Combat Breed): Weltweit bei Events verfügbar' },
  'poke_128_form_tauros_paldea_blaze':  { isRegional: true, regionName: 'Spanien / Portugal', countries: 'Spanien und Portugal (Flammenvariante)', notes: 'Regional exklusiv in Spanien und Portugal' },
  'poke_128_form_tauros_paldea_aqua':   { isRegional: true, regionName: 'UK / Irland', countries: 'Großbritannien und Irland (Flutenvariante)', notes: 'Regional exklusiv in UK und Irland' },

  // ── Burmy #412 & Wormadam #413 ─────────────────────────────
  'poke_412_base':           { isRegional: true, regionName: 'Europa / Afrika / Naher Osten / Indien', countries: 'Europa, Afrika, Naher Osten, Indien (Pflanzenumhang)' },
  'poke_412_special_sandy':  { isRegional: true, regionName: 'Amerika & Grönland', countries: 'Nord- und Südamerika, Grönland (Sandumhang)' },
  'poke_412_special_trash':  { isRegional: true, regionName: 'Asien-Pazifik', countries: 'Japan, Südostasien, Australien (Lumpenumhang)' },
  'poke_413_base':           { isRegional: true, regionName: 'Europa / Afrika / Naher Osten / Indien', countries: 'Europa, Afrika, Naher Osten, Indien (Pflanzenumhang)' },
  'poke_413_special_sandy':  { isRegional: true, regionName: 'Amerika & Grönland', countries: 'Nord- und Südamerika, Grönland (Sandumhang)' },
  'poke_413_special_trash':  { isRegional: true, regionName: 'Asien-Pazifik', countries: 'Japan, Südostasien, Australien (Lumpenumhang)' },

  // ── Furfrou #676 (Regional Trims) ──────────────────────────
  'poke_676_base':               { isRegional: false, notes: 'Naturform (Zottelform) ist weltweit in der Wildnis verfügbar' },
  'poke_676_special_matron':     { isRegional: false, notes: 'Fräuleinschnitt: Weltweit durch Formschnitt (10.000 Sternenstaub + 25 Bonbons) verfügbar' },
  'poke_676_special_dandy':      { isRegional: false, notes: 'Kavalierschnitt: Weltweit durch Formschnitt (10.000 Sternenstaub + 25 Bonbons) verfügbar' },
  'poke_676_special_heart':      { isRegional: false, notes: 'Herzchenschnitt: Weltweit exklusiv während des Valentinstag-Events verfügbar' },
  'poke_676_special_debutante':  { isRegional: true, regionName: 'Amerika', countries: 'Nord- und Südamerika (Damen-Schnitt / Debutante)' },
  'poke_676_special_diamond':    { isRegional: true, regionName: 'Europa / Mittlerer Osten / Afrika', countries: 'Europa, Mittlerer Osten, Afrika (Diamantenschnitt)' },
  'poke_676_special_star':       { isRegional: true, regionName: 'Asien-Pazifik', countries: 'Asien-Pazifik (Sternchenschnitt)' },
  'poke_676_special_la_reine':   { isRegional: true, regionName: 'Frankreich', countries: 'Ausschließlich in Frankreich (Königinnenschnitt / La Reine)' },
  'poke_676_special_kabuki':     { isRegional: true, regionName: 'Japan', countries: 'Ausschließlich in Japan (Kabuki-Schnitt)' },
  'poke_676_special_pharaoh':    { isRegional: true, regionName: 'Ägypten', countries: 'Ausschließlich in Ägypten (Pharaonenschnitt)' },

  // ── Vivillon #666 (Postcard Regional Patterns) ─────────────
  'poke_666_base':                           { isRegional: true, regionName: 'Mitteleuropa', countries: 'Deutschland, Schweiz, Frankreich, Italien (Wiesenmuster)' },
  'poke_666_form_vivillon_archipelago':      { isRegional: true, regionName: 'Karibik / Florida', countries: 'Karibik, Florida, Südafrika (Archipel-Muster)' },
  'poke_666_form_vivillon_continental':      { isRegional: true, regionName: 'Mittel- & Osteuropa / Argentinien', countries: 'Deutschland, Polen, Tschechien, Dänemark, Argentinien (Kontinentalmuster)' },
  'poke_666_form_vivillon_elegant':          { isRegional: true, regionName: 'Japan', countries: 'Japan (Ziereffektmuster)' },
  'poke_666_form_vivillon_fancy':            { isRegional: false, notes: 'Prunkmuster: Weltweit bei speziellen Events verfügbar' },
  'poke_666_form_vivillon_garden':           { isRegional: true, regionName: 'UK / Irland / Neuseeland', countries: 'Großbritannien, Irland, Neuseeland (Gartenmuster)' },
  'poke_666_form_vivillon_high_plains':      { isRegional: true, regionName: 'Westliche USA / Mexiko', countries: 'Westliche USA, Mexiko (Dürremuster)' },
  'poke_666_form_vivillon_icy_snow':         { isRegional: true, regionName: 'Nordeuropa / Grönland', countries: 'Norwegen, Finnland, Nordschweden, Grönland (Frostmuster)' },
  'poke_666_form_vivillon_jungle':           { isRegional: true, regionName: 'Äquatoriales Südamerika / Südostasien', countries: 'Kolumbien, Brasilien, Malaysia, Indonesien (Dschungelmuster)' },
  'poke_666_form_vivillon_marine':           { isRegional: true, regionName: 'Südeuropa / Mittelmeer / Chile', countries: 'Spanien, Portugal, Griechenland, Chile (Marinestil)' },
  'poke_666_form_vivillon_modern':           { isRegional: true, regionName: 'USA (Mittlerer Westen & Südosten)', countries: 'USA: Zentral- & Oststaaten (Modernes Muster)' },
  'poke_666_form_vivillon_monsoon':          { isRegional: true, regionName: 'Südostasien / Indien', countries: 'Indien, Thailand, Vietnam, Taiwan (Monsunmuster)' },
  'poke_666_form_vivillon_ocean':            { isRegional: true, regionName: 'Hawaii / Galápagos / Madagaskar', countries: 'Hawaii, Galápagos, Madagaskar, Réunion (Ozeanmuster)' },
  'poke_666_form_vivillon_pokeball':         { isRegional: false, notes: 'Pokéball-Muster: Weltweit nur bei speziellen Sonder-Events verfügbar' },
  'poke_666_form_vivillon_polar':            { isRegional: true, regionName: 'Kanada / Alaska / Nordost-USA', countries: 'Kanada, Alaska, Neuengland, Südchile (Schneefeldmuster)' },
  'poke_666_form_vivillon_river':            { isRegional: true, regionName: 'Australien / Südafrika', countries: 'Australien, Südafrika (Flussdelta-Muster)' },
  'poke_666_form_vivillon_sandstorm':        { isRegional: true, regionName: 'Naher Osten', countries: 'Saudi-Arabien, VAE, Israel, Ägypten (Sandsturmmuster)' },
  'poke_666_form_vivillon_savanna':          { isRegional: true, regionName: 'Brasilien', countries: 'Brasilien (Savannenmuster)' },
  'poke_666_form_vivillon_sun':              { isRegional: true, regionName: 'Mexiko / Madagaskar / Nordaustralien', countries: 'Mexiko, Madagaskar, Nordaustralien (Sonnenmuster)' },
  'poke_666_form_vivillon_tundra':           { isRegional: true, regionName: 'Island / Nord-Skandinavien', countries: 'Island, Nordnorwegen, Nordschweden, Hokkaido (Tundramuster)' },

  // ── Explicit Non-Regional Overrides for Alternate Forms ────
  // Base species are regional, but these forms are globally accessible!
  'poke_83_form_farfetchd_galarian':  { isRegional: false, notes: 'Galar-Porenta ist weltweit über 7km-Eier und Raids erhältlich (nur Kanto-Porenta ist Ostasien-exklusiv)' },
  'poke_122_form_mr_mime_galarian':   { isRegional: false, notes: 'Galar-Pantimos ist weltweit bei Feiertags-Events erhältlich (nur Kanto-Pantimos ist Europa-exklusiv)' },
  'poke_222_form_corsola_galarian':   { isRegional: false, notes: 'Galar-Corasonn ist weltweit bei Events und aus 7km-Eiern erhältlich (nur Johto-Corasonn ist tropisch)' },
  'poke_222_costume_sunglasses':      { isRegional: false, notes: 'Event-Kostüm weltweit verfügbar' },
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
    { type: 'special', label: 'Täglicher Abenteuer-Rauch', badgeColor: 'pink', description: 'Erscheint ausschließlich extrem selten während des täglichen 15-minütigen Abenteuer-Rauchs (hohe Fluchtrate). Nicht in Raids!', available: true }
  ],
  'poke_145_form_zapdos_galarian': [
    { type: 'special', label: 'Täglicher Abenteuer-Rauch', badgeColor: 'pink', description: 'Erscheint ausschließlich extrem selten während des täglichen 15-minütigen Abenteuer-Rauchs (hohe Fluchtrate). Nicht in Raids!', available: true }
  ],
  'poke_146_form_moltres_galarian': [
    { type: 'special', label: 'Täglicher Abenteuer-Rauch', badgeColor: 'pink', description: 'Erscheint ausschließlich extrem selten während des täglichen 15-minütigen Abenteuer-Rauchs (hohe Fluchtrate). Nicht in Raids!', available: true }
  ],

  // ── Raid-Exclusive Regional Forms (3-Star Raids / Raid-Days, NOT wild) ─
  'poke_26_form_raichu_alola': [
    { type: 'raid', label: '3-Sterne-Raid', badgeColor: 'rose', description: 'Erscheint als 3-Sterne-Raid-Boss (kann nicht wild gefangen oder normal aus Pikachu entwickelt werden).', available: true },
    { type: 'research', label: 'Feldforschung', badgeColor: 'blue', description: 'Gelegentlich als Belohnung bei Event-Feldforschungen.', available: true }
  ],
  'poke_105_form_marowak_alola': [
    { type: 'raid', label: '3-Sterne-Raid', badgeColor: 'rose', description: 'Erscheint als 3-Sterne-Raid-Boss und Belohnung in der GO-Kampfliga (nicht in der Wildnis).', available: true },
    { type: 'research', label: 'Feldforschung', badgeColor: 'blue', description: 'Gelegentlich bei Event-Feldforschungen.', available: true }
  ],
  'poke_110_form_weezing_galarian': [
    { type: 'raid', label: '3-Sterne-Raid', badgeColor: 'rose', description: 'Erscheint als 3-Sterne-Raid-Boss bei Events (nicht in freier Wildbahn).', available: true }
  ],
  'poke_628_form_braviary_hisuian': [
    { type: 'raid', label: '3-Sterne-Raid', badgeColor: 'rose', description: 'Erscheint als 3-Sterne-Raid-Boss bei speziellen Raid-Tagen und Events (nicht wild).', available: true }
  ],
  'poke_713_form_avalugg_hisuian': [
    { type: 'raid', label: '3-Sterne-Raid', badgeColor: 'rose', description: 'Erscheint als 3-Sterne-Raid-Boss bei speziellen Raid-Tagen und Events (nicht wild).', available: true }
  ],
  'poke_157_form_typhlosion_hisuian': [
    { type: 'raid', label: '3-Sterne-Raid', badgeColor: 'rose', description: 'Erscheint als 3-Sterne-Raid-Boss bei speziellen Raid-Tagen und Events (nicht wild).', available: true }
  ],
  'poke_503_form_samurott_hisuian': [
    { type: 'raid', label: '3-Sterne-Raid', badgeColor: 'rose', description: 'Erscheint als 3-Sterne-Raid-Boss bei speziellen Raid-Tagen und Events (nicht wild).', available: true }
  ],
  'poke_724_form_decidueye_hisuian': [
    { type: 'raid', label: '3-Sterne-Raid', badgeColor: 'rose', description: 'Erscheint als 3-Sterne-Raid-Boss bei speziellen Raid-Tagen und Events (nicht wild).', available: true }
  ],
  'poke_549_form_lilligant_hisuian': [
    { type: 'raid', label: '3-Sterne-Raid', badgeColor: 'rose', description: 'Erscheint als 3-Sterne-Raid-Boss bei speziellen Events (nicht wild).', available: true }
  ],

  // ── White-Striped Basculin (Routes & Mateo 7km Eggs) ───────
  'poke_550_special_white_striped': [
    { type: 'special', label: 'Routen & Mateo (7km-Ei)', badgeColor: 'amber', description: 'Erscheint beim Gehen von Routen und schlüpft aus Mateo-Geschenk-Eiern (7km). Nicht regulär in der Wildnis!', available: true }
  ],

  // ── Research & Event Exclusive Regional Forms ─────────────
  'poke_122_form_mr_mime_galarian': [
    { type: 'research', label: 'Event-Forschung', badgeColor: 'blue', description: 'Erhältlich bei Winter- und Feiertags-Events über Spezial- oder Befristete Forschung.', available: true },
    { type: 'raid', label: '3-Sterne-Raid', badgeColor: 'rose', description: 'Erscheint während Feiertags-Events auch in Raids.', available: true }
  ],
  'poke_222_form_corsola_galarian': [
    { type: 'egg', label: '7km-Ei / Event', badgeColor: 'amber', description: 'Schlüpft aus 7km-Eiern bei speziellen Events oder als Belohnung in Spezialforschungen (nicht regulär in der Wildnis).', available: true },
    { type: 'research', label: 'Spezialforschung', badgeColor: 'blue', description: 'Spezialforschungsbelohnung bei Halloween-Events.', available: true }
  ],
  'poke_562_form_yamask_galarian': [
    { type: 'research', label: 'Halloween-Forschung', badgeColor: 'blue', description: 'Erhältlich während Halloween-Events über Spezialforschungen und 7km-Eier.', available: true },
    { type: 'raid', label: '1-Stern-Raid', badgeColor: 'rose', description: 'Erscheint bei Halloween-Events in 1-Stern-Raids.', available: true }
  ],
  'poke_570_form_zorua_hisuian': [
    { type: 'special', label: 'Kumpel-Tarnung', badgeColor: 'pink', description: 'Erscheint bei Halloween-Events auf der Karte getarnt als dein Kumpel-Pokémon.', available: true }
  ],

  // ── 7km Egg Primary / Exclusive Forms (Gift Eggs) ──────────
  'poke_83_form_farfetchd_galarian': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft aus 7km-Freundschafts-Eiern (Geschenke). Weltweit verfügbar!', available: true },
    { type: 'raid', label: '1-Stern-Raid', badgeColor: 'rose', description: 'Erscheint zeitweise in 1-Stern-Raids bei passenden Events.', available: true }
  ],
  'poke_52_form_meowth_galarian': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft aus 7km-Freundschafts-Eiern (Geschenke) und Feldforschungen.', available: true }
  ],
  'poke_77_form_ponyta_galarian': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft aus 7km-Freundschafts-Eiern (Geschenke).', available: true },
    { type: 'raid', label: '1-Stern-Raid', badgeColor: 'rose', description: 'Erscheint bei Events in 1-Stern-Raids.', available: true }
  ],
  'poke_79_form_slowpoke_galarian': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft aus 7km-Freundschafts-Eiern (Geschenke) oder in 1-Stern-Raids/Feldforschungen.', available: true },
    { type: 'raid', label: '1-Stern-Raid', badgeColor: 'rose', description: 'Erscheint bei Events in 1-Stern-Raids.', available: true }
  ],
  'poke_263_form_zigzagoon_galarian': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft aus 7km-Freundschafts-Eiern (Geschenke).', available: true },
    { type: 'wild', label: 'Event-Wildnis', badgeColor: 'emerald', description: 'Erscheint während bestimmter Events auch in der Wildnis.', available: true }
  ],
  'poke_554_form_darumaka_galarian': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft aus 7km-Freundschafts-Eiern (Geschenke).', available: true },
    { type: 'wild', label: 'Winter-Event Wildnis', badgeColor: 'emerald', description: 'Erscheint während Winter-Events in der Wildnis und Raids.', available: true }
  ],
  'poke_618_form_stunfisk_galarian': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft aus 7km-Freundschafts-Eiern (Geschenke).', available: true },
    { type: 'wild', label: 'Wildnis', badgeColor: 'emerald', description: 'Erscheint auch in der Wildnis auf der Karte.', available: true }
  ],
  'poke_27_form_sandshrew_alola': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft primär aus 7km-Freundschafts-Eiern (Geschenke).', available: true },
    { type: 'wild', label: 'Event-Wildnis', badgeColor: 'emerald', description: 'Erscheint bei Eis-Events in der Wildnis.', available: true }
  ],
  'poke_37_form_vulpix_alola': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft primär aus 7km-Freundschafts-Eiern (Geschenke) und Feldforschungen.', available: true }
  ],
  'poke_50_form_diglett_alola': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft aus 7km-Freundschafts-Eiern.', available: true },
    { type: 'wild', label: 'Wildnis / Events', badgeColor: 'emerald', description: 'Erscheint in der Wildnis und bei Events.', available: true }
  ],
  'poke_52_form_meowth_alola': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft aus 7km-Freundschafts-Eiern (Geschenke) und Feldforschungen.', available: true }
  ],
  'poke_74_form_geodude_alola': [
    { type: 'wild', label: 'Wildnis', badgeColor: 'emerald', description: 'Erscheint in der Wildnis auf der Karte.', available: true },
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft auch aus 7km-Freundschafts-Eiern.', available: true }
  ],
  'poke_88_form_grimer_alola': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft primär aus 7km-Freundschafts-Eiern (Geschenke) oder bei Events.', available: true }
  ],
  'poke_103_form_exeggutor_alola': [
    { type: 'raid', label: '3-Sterne-Raid', badgeColor: 'rose', description: 'Erscheint als 3-Sterne-Raid-Boss bei Events.', available: true },
    { type: 'wild', label: 'Wildnis (selten)', badgeColor: 'emerald', description: 'Spawnt selten in freier Wildbahn auf der Karte.', available: true }
  ],
  'poke_58_form_growlithe_hisuian': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft primär aus 7km-Freundschafts-Eiern (Geschenke) und Feldforschungen.', available: true }
  ],
  'poke_100_form_voltorb_hisuian': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft aus 7km-Freundschafts-Eiern.', available: true },
    { type: 'wild', label: 'Event-Wildnis', badgeColor: 'emerald', description: 'Erscheint bei Hisui-Events in der Wildnis.', available: true }
  ],
  'poke_211_form_qwilfish_hisuian': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft aus 7km-Freundschafts-Eiern und erscheint bei Events wild.', available: true }
  ],
  'poke_215_form_sneasel_hisuian': [
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft primär aus 7km-Freundschafts-Eiern (Geschenke) oder in 1-Stern-Raids.', available: true }
  ],
  'poke_194_form_wooper_paldea': [
    { type: 'wild', label: 'Wildnis', badgeColor: 'emerald', description: 'Erscheint in der Wildnis auf der Karte.', available: true },
    { type: 'egg', label: '7km-Ei', badgeColor: 'amber', description: 'Schlüpft auch aus 7km-Eiern.', available: true }
  ],
  'poke_705_special_hisuian': [
    { type: 'raid', label: '3-Sterne-Raid / Entwicklung', badgeColor: 'rose', description: 'Erscheint in 3-Sterne-Raids oder durch Entwickeln von Viscora mit Bonbons bei Regen.', available: true }
  ],

  // ── Evolved Regional Forms (Evolution from Regional Base) ─
  'poke_20_form_raticate_alola': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Alola-Rattfratz mit 25 Bonbons bei Nacht.', available: true }
  ],
  'poke_28_form_sandslash_alola': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Alola-Sandan mit 50 Bonbons.', available: true }
  ],
  'poke_38_form_ninetales_alola': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Alola-Vulpix mit 50 Bonbons.', available: true }
  ],
  'poke_51_form_dugtrio_alola': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Alola-Digda mit 50 Bonbons.', available: true }
  ],
  'poke_53_form_persian_alola': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Alola-Mauzi mit 50 Bonbons.', available: true }
  ],
  'poke_75_form_graveler_alola': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Alola-Kleinstein mit 25 Bonbons.', available: true }
  ],
  'poke_76_form_golem_alola': [
    { type: 'evolution', label: 'Entwicklung / Tausch', badgeColor: 'indigo', description: 'Entwickelt sich aus Alola-Georok mit 100 Bonbons (oder kostenlos nach Tausch).', available: true }
  ],
  'poke_89_form_muk_alola': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Alola-Sleima mit 50 Bonbons.', available: true }
  ],
  'poke_78_form_rapidash_galarian': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Galar-Ponita mit 50 Bonbons.', available: true }
  ],
  'poke_80_form_slowbro_galarian': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Galar-Flegmon (50 Bonbons + 30 Gift-Pokémon fangen als Kumpel).', available: true }
  ],
  'poke_199_form_slowking_galarian': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Galar-Flegmon (50 Bonbons + 30 Psycho-Pokémon fangen als Kumpel).', available: true }
  ],
  'poke_264_form_linoone_galarian': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Galar-Zigzachs mit 25 Bonbons.', available: true }
  ],
  'poke_555_form_darmanitan_galarian_standard': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Galar-Flampion mit 50 Bonbons.', available: true }
  ],
  'poke_555_form_darmanitan_galarian_zen': [
    { type: 'special', label: 'Zen-Modus', badgeColor: 'pink', description: 'Spezielle Zen-Modus-Form bei Events.', available: true }
  ],
  'poke_59_form_arcanine_hisuian': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Hisui-Fukano mit 50 Bonbons.', available: true }
  ],
  'poke_101_form_electrode_hisuian': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Hisui-Voltobal mit 50 Bonbons.', available: true }
  ],
  'poke_571_form_zoroark_hisuian': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Hisui-Zorua mit 50 Bonbons.', available: true }
  ],
  'poke_706_special_hisuian': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus Hisui-Viscargot mit 100 Bonbons bei Regen / Regen-Lockmodul.', available: true }
  ],

  // ── Paldean Tauros Breeds ──────────────────────────────────
  'poke_128_form_tauros_paldea_combat': [
    { type: 'wild', label: 'Event-Wildnis', badgeColor: 'emerald', description: 'Erscheint während weltweiter Paldea-Events in der Wildnis.', available: true }
  ],
  'poke_128_form_tauros_paldea_blaze': [
    { type: 'wild', label: 'Wild (Regional)', badgeColor: 'emerald', description: 'Erscheint in freier Wildbahn exklusiv in Spanien und Portugal.', available: true }
  ],
  'poke_128_form_tauros_paldea_aqua': [
    { type: 'wild', label: 'Wild (Regional)', badgeColor: 'emerald', description: 'Erscheint in freier Wildbahn exklusiv in Großbritannien und Irland.', available: true }
  ],

  // ── Burmy & Wormadam Cloaks ────────────────────────────────
  'poke_412_base': [
    { type: 'wild', label: 'Wild (Regional)', badgeColor: 'emerald', description: 'Pflanzenumhang erscheint wild in Europa, Afrika, Naher Osten und Indien.', available: true }
  ],
  'poke_412_special_sandy': [
    { type: 'wild', label: 'Wild (Regional)', badgeColor: 'emerald', description: 'Sandumhang erscheint wild in Nord- und Südamerika sowie Grönland.', available: true }
  ],
  'poke_412_special_trash': [
    { type: 'wild', label: 'Wild (Regional)', badgeColor: 'emerald', description: 'Lumpenumhang erscheint wild im asiatisch-pazifischen Raum.', available: true }
  ],
  'poke_413_base': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus weiblichem Burmy (Pflanzenumhang) mit 50 Bonbons.', available: true }
  ],
  'poke_413_special_sandy': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus weiblichem Burmy (Sandumhang) mit 50 Bonbons.', available: true }
  ],
  'poke_413_special_trash': [
    { type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo', description: 'Entwickelt sich aus weiblichem Burmy (Lumpenumhang) mit 50 Bonbons.', available: true }
  ],
};

// ============================================================
// SPECIAL NOTES PER SPECIES
// ============================================================
const SPECIAL_NOTES: Record<number, string> = {
  132:  'Ditto versteckt sich als anderes Pokémon. Es kann nicht direkt gefangen werden — es enthüllt sich erst nach dem Fangen.',
  151:  'Mew ist nur über das spezielle Forschungsprojekt "Eine mysteriöse Entdeckung" erhältlich.',
  201:  'Unown hat 28 verschiedene Buchstaben-Formen. Jede Form erscheint selten bei Events oder in bestimmten Regionen.',
  235:  'Smeargle kann über den Fotomodus (Schnappschüsse) erscheinen — es schleicht sich ins Foto und kann danach gefangen werden.',
  480:  'Uxie erscheint weltweit in 5-Sterne-Raids für Trainer mit Fern-Raid-Einladung. In freier Wildbahn extrem selten an Seen in Asien-Pazifik.',
  481:  'Mesprit erscheint weltweit in 5-Sterne-Raids für Trainer mit Fern-Raid-Einladung. In freier Wildbahn extrem selten an Seen in Europa/Afrika/Nahost.',
  482:  'Azelf erscheint weltweit in 5-Sterne-Raids für Trainer mit Fern-Raid-Einladung. In freier Wildbahn extrem selten an Seen in Amerika & Grönland.',
  489:  'Phione ist noch nicht in Pokémon GO verfügbar.',
  490:  'Manaphy ist noch nicht in Pokémon GO verfügbar.',
  493:  'Arceus ist noch nicht in Pokémon GO verfügbar.',
  649:  'Genesect hat viele Antrieb-Formen, die bei Events in 5-Sterne-Raids erscheinen.',
  664:  'Purmel wird durch das Anheften von Postkarten von Freunden aus aller Welt im Postkartenbuch freigeschaltet.',
  666:  'Vivillons Muster hängt von der Region ab, aus der du Postkarten anheftest.',
  676:  'Coiffwaff kann durch Formschnitt verschiedene Frisuren annehmen, wovon einige an bestimmte Länder gebunden sind.',
  720:  'Hoopa Eingeschränkt und Entfesselt sind über spezielle Events und Forschungsaufgaben erhältlich.',
  789:  'Cosmog ist eine seltene Belohnung aus speziellen Forschungsaufgaben.',
  794:  'Masskito (Buzzwole) erscheint in 5-Sterne-Raids in Amerika & Grönland. Fern-Raids weltweit möglich.',
  795:  'Schabelle (Pheromosa) erscheint in 5-Sterne-Raids in Europa, MEA & Indien. Fern-Raids weltweit möglich.',
  796:  'Voltriant (Xurkitree) erscheint in 5-Sterne-Raids in Asien-Pazifik. Fern-Raids weltweit möglich.',
  797:  'Kaguron (Celesteela) erscheint in 5-Sterne-Raids auf der Südhalbkugel. Fern-Raids weltweit möglich.',
  798:  'Katagami (Kartana) erscheint in 5-Sterne-Raids auf der Nordhalbkugel. Fern-Raids weltweit möglich.',
  801:  'Magearna ist noch nicht in Pokémon GO verfügbar.',
  805:  'Muramura (Stakataka) erscheint in 5-Sterne-Raids in der östlichen Hemisphäre. Fern-Raids weltweit möglich.',
  806:  'Kopplosio (Blacephalon) erscheint in 5-Sterne-Raids in der westlichen Hemisphäre. Fern-Raids weltweit möglich.',
  808:  'Meltan kann nur mit der Meltan-Box gefangen werden. Diese wird durch Verbindung mit Pokémon HOME aktiviert.',
  809:  'Melmetal entwickelt sich aus Meltan mit 400 Bonbons und kann in speziellen Raids erscheinen.',
  874:  'Humanolith (Stonjourner) ist ein regionales Pokémon und spawnt ausschließlich in Großbritannien.',
  893:  'Zarude ist über saisonale spezielle Forschungsaufgaben erhältlich.',
  896:  'Glastrier ist noch nicht in Pokémon GO verfügbar.',
  897:  'Spectrier ist noch nicht in Pokémon GO verfügbar.',
  898:  'Coronospa ist noch nicht in Pokémon GO verfügbar.',
  999:  'Gimmighoul (Wandelform) erscheint ausschließlich an goldenen PokéStops und über den Münzbeutel.',
  1000: 'Gholdengo entwickelt sich aus Gimmighoul mit 999 Gimmighoul-Münzen.',
};

// ============================================================
// ALTERNATIVE DEX ENTRY METHODS (Remote Raids, Forms, Megas)
// ============================================================
const ALTERNATIVE_DEX_METHODS: Record<number, DexAlternativeMethod[]> = {
  83: [
    { type: 'form', title: 'Galar-Porenta fangen', description: 'Galar-Porenta (#083) schlüpft weltweit aus 7km-Eiern oder Raids und registriert denselben Dex-Eintrag wie Kanto-Porenta.', badgeLabel: 'Galar-Form' }
  ],
  115: [
    { type: 'mega_raid', title: 'Mega-Kangama Raid', description: 'Mega-Kangama kann weltweit in Mega-Raids bekämpft werden. Ein erfolgreicher Fang registriert #115 Kangama im Pokédex.', badgeLabel: 'Mega-Raid' }
  ],
  122: [
    { type: 'form', title: 'Galar-Pantimos fangen', description: 'Galar-Pantimos ist weltweit bei Events erhältlich und registriert denselben Dex-Eintrag #122 wie das reguläre Pantimos.', badgeLabel: 'Galar-Form' },
    { type: 'baby_egg', title: 'Pantimimi aus Geschenken schlüpfen', description: 'Pantimimi (#439) schlüpft aus 5km-Eiern, die von europäischen Freunden gesendet werden, und registriert den Dex-Eintrag beim Entwickeln.', badgeLabel: 'Baby-Ei' }
  ],
  128: [
    { type: 'form', title: 'Paldea-Tauros fangen', description: 'Paldea-Tauros (Gefechtsvariante) erscheint bei Events weltweit und teilt den Dex-Eintrag #128. Auch die Blaze- und Aqua-Formen registrieren #128.', badgeLabel: 'Paldea-Form' }
  ],
  214: [
    { type: 'mega_raid', title: 'Mega-Skaraborn Raid', description: 'Mega-Skaraborn (Heracross) erscheint weltweit in Mega-Raids und registriert bei erfolgreichem Fang den Dex-Eintrag #214.', badgeLabel: 'Mega-Raid' },
    { type: 'remote_raid', title: 'Remote-Raid', description: 'Wenn Skaraborn oder Mega-Skaraborn in Raids erscheint, können Remote-Raid-Pässe genutzt werden.', badgeLabel: 'Remote-Raid' }
  ],
  222: [
    { type: 'form', title: 'Galar-Corasonn fangen', description: 'Galar-Corasonn ist weltweit aus 7km-Eiern und bei Spezialforschungen erhältlich und registriert denselben Dex-Eintrag #222.', badgeLabel: 'Galar-Form' }
  ],
  337: [
    { type: 'event', title: 'Hemisphären-Tausch Events', description: 'Lunastein und Sonnfel tauschen bei bestimmten Events (z.B. Sommer/Winter) die Hemisphären.', badgeLabel: 'Event-Tausch' }
  ],
  338: [
    { type: 'event', title: 'Hemisphären-Tausch Events', description: 'Sonnfel und Lunastein tauschen bei bestimmten Events (z.B. Sommer/Winter) die Hemisphären.', badgeLabel: 'Event-Tausch' }
  ],
  480: [
    { type: 'remote_raid', title: 'Remote-Raid (Weltweite Einladung)', description: 'Uxie erscheint in 5-Sterne-Raids in Asien-Pazifik. Nutze einen Remote-Raid-Pass über Apps (z.B. PokeGenie) oder Freundeseinladungen.', badgeLabel: 'Remote-Raid' }
  ],
  481: [
    { type: 'remote_raid', title: 'Remote-Raid (Weltweite Einladung)', description: 'Mesprit erscheint in 5-Sterne-Raids in Europa/Afrika/Nahost. Nutze einen Remote-Raid-Pass über Freundeseinladungen.', badgeLabel: 'Remote-Raid' }
  ],
  482: [
    { type: 'remote_raid', title: 'Remote-Raid (Weltweite Einladung)', description: 'Azelf erscheint in 5-Sterne-Raids in Amerika & Grönland. Nutze einen Remote-Raid-Pass über Freundeseinladungen.', badgeLabel: 'Remote-Raid' }
  ],
  794: [
    { type: 'remote_raid', title: 'Remote-Raid (Weltweite Einladung)', description: 'Masskito (Buzzwole) erscheint in Raids in Amerika & Grönland. Du kannst über Fern-Raid-Einladungen von Freunden teilnehmen.', badgeLabel: 'Remote-Raid' }
  ],
  795: [
    { type: 'remote_raid', title: 'Remote-Raid (Weltweite Einladung)', description: 'Schabelle (Pheromosa) erscheint in Raids in Europa/MEA/Indien. Du kannst über Fern-Raid-Einladungen von Freunden teilnehmen.', badgeLabel: 'Remote-Raid' }
  ],
  796: [
    { type: 'remote_raid', title: 'Remote-Raid (Weltweite Einladung)', description: 'Voltriant (Xurkitree) erscheint in Raids in Asien-Pazifik. Du kannst über Fern-Raid-Einladungen von Freunden teilnehmen.', badgeLabel: 'Remote-Raid' }
  ],
  797: [
    { type: 'remote_raid', title: 'Remote-Raid (Weltweite Einladung)', description: 'Kaguron (Celesteela) erscheint in Raids auf der Südhalbkugel. Du kannst über Fern-Raid-Einladungen weltweit teilnehmen.', badgeLabel: 'Remote-Raid' }
  ],
  798: [
    { type: 'remote_raid', title: 'Remote-Raid (Weltweite Einladung)', description: 'Katagami (Kartana) erscheint in Raids auf der Nordhalbkugel. Du kannst über Fern-Raid-Einladungen weltweit teilnehmen.', badgeLabel: 'Remote-Raid' }
  ],
  805: [
    { type: 'remote_raid', title: 'Remote-Raid (Weltweite Einladung)', description: 'Muramura (Stakataka) erscheint in Raids in der östlichen Hemisphäre. Nutze einen Remote-Raid-Pass für Einladungen.', badgeLabel: 'Remote-Raid' }
  ],
  806: [
    { type: 'remote_raid', title: 'Remote-Raid (Weltweite Einladung)', description: 'Kopplosio (Blacephalon) erscheint in Raids in der westlichen Hemisphäre. Nutze einen Remote-Raid-Pass für Einladungen.', badgeLabel: 'Remote-Raid' }
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
      type: 'special', label: 'Nicht im Spiel', badgeColor: 'slate',
      description: 'Dieses Pokémon ist derzeit noch nicht in Pokémon GO verfügbar.',
      available: false
    });
    return methods;
  } else if (BABY_EGG_POKEMON.has(dex)) {
    // Baby egg only (no wild spawns)
    methods.push({
      type: 'egg', label: 'Ei', badgeColor: 'amber',
      description: 'Schlüpft ausschließlich aus Eiern (2km, 5km oder 7km). Kann nicht in freier Wildbahn gefangen werden.',
      available: true
    });
    return methods;
  } else if (dex === 808) {
    // Meltan
    methods.push({
      type: 'special', label: 'Meltan-Box', badgeColor: 'pink',
      description: 'Erscheint nach Aktivierung der Meltan-Box durch Verbindung mit Pokémon HOME oder Let\'s Go.',
      available: true
    });
    return methods;
  } else if (dex === 809) {
    // Melmetal
    methods.push({
      type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo',
      description: 'Entwickelt sich aus Meltan mit 400 Meltan-Bonbons.',
      available: true
    });
    return methods;
  } else if (dex === 235) {
    // Smeargle
    methods.push({
      type: 'special', label: 'Foto-Bomb', badgeColor: 'pink',
      description: 'Erscheint nach Schnappschüssen (Fotomodus). Schleicht sich zufällig ins Bild.',
      available: true
    });
    return methods;
  } else if (dex === 132) {
    // Ditto
    methods.push({
      type: 'wild', label: 'Als Tarnform', badgeColor: 'emerald',
      description: 'Tarnt sich als häufige Wildtiere (z.B. Taubsi, Digda). Enthüllt sich erst nach dem Fangen.',
      available: true
    });
    return methods;
  } else if (dex === 999) {
    // Gimmighoul
    methods.push({
      type: 'special', label: 'Münzbeutel / Gold-Stop', badgeColor: 'pink',
      description: 'Erscheint durch Aktivierung des Münzbeutels (Verbindung mit Pokémon Karmesin/Purpur) oder an Goldenen PokéStops.',
      available: true
    });
    return methods;
  } else if (dex === 1000) {
    // Gholdengo
    methods.push({
      type: 'evolution', label: 'Entwicklung', badgeColor: 'indigo',
      description: 'Entwickelt sich aus Gimmighoul mit 999 Gimmighoul-Münzen.',
      available: true
    });
    return methods;
  } else if (dex === 664 || dex === 666) {
    // Scatterbug & Vivillon
    methods.push({
      type: 'special', label: 'Postkarten-Buch', badgeColor: 'pink',
      description: 'Wird durch das Anheften von Postkarten (Geschenke von Freunden) aus verschiedenen Weltregionen freigeschaltet.',
      available: true
    });
  } else if (REGIONAL_RAID_DEX_NRS.has(dex)) {
    // Ultra Beasts & regional raid exclusives (NO wild spawns!)
    methods.push({
      type: 'raid', label: '5-Sterne-Raid (Regional)', badgeColor: 'rose',
      description: 'Erscheint als 5-Sterne-Raid-Boss exklusiv in seiner Heimatregion (nicht in freier Wildbahn). Kann weltweit über Fern-Raid-Einladungen gefangen werden.',
      available: true
    });
  } else if (REGIONAL_LAKE_TRIO_DEX_NRS.has(dex)) {
    // Lake Trio: regional raid + ultra rare wild
    methods.push({
      type: 'raid', label: '5-Sterne-Raid (Regional)', badgeColor: 'rose',
      description: 'Erscheint als 5-Sterne-Raid-Boss in seiner Heimatregion (oder weltweit per Fern-Raid-Einladung).',
      available: true
    });
    methods.push({
      type: 'wild', label: 'Wild (Regional - Extrem selten)', badgeColor: 'emerald',
      description: 'Spawnt in freier Wildbahn extrem selten an Gewässern/Seen in seiner Heimatregion.',
      available: true
    });
  } else if (RAID_ONLY_DEX_NRS.has(dex)) {
    // Standard raid-only legendaries (NO wild spawns!)
    methods.push({
      type: 'raid', label: '5-Sterne-Raid', badgeColor: 'rose',
      description: 'Erscheint als 5-Sterne-Raid-Boss bei speziellen Raid-Stunden oder zeitlich begrenzten Events (nicht in freier Wildbahn).',
      available: true
    });
  } else if (RESEARCH_ONLY_DEX_NRS.has(dex)) {
    // Special research mythicals
    methods.push({
      type: 'research', label: 'Spezialforschung', badgeColor: 'blue',
      description: 'Erhältlich ausschließlich über spezielle oder saisonale Forschungsaufgaben (nicht in der Wildnis).',
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
        ? 'Erscheint in der Wildnis, jedoch nur in bestimmten Regionen der Welt.'
        : 'Erscheint in der Wildnis auf der Karte.',
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
      type: 'egg', label: `${eggDex[dex]} Ei`, badgeColor: 'amber',
      description: `Kann aus ${eggDex[dex]}-Eiern schlüpfen.`,
      available: true
    });
  }

  // Rocket encounters
  if (pokemon.hasShadow) {
    methods.push({
      type: 'rocket', label: 'Team GO Rocket', badgeColor: 'purple',
      description: 'Kann als Crypto-Pokémon nach dem Besiegen eines Team GO Rocket-Rüpels oder -Bosses gefangen werden.',
      available: true
    });
  }

  // Mega raids for eligible species
  if (MEGA_RAID_POKEMON.has(dex) && !methods.some(m => m.label.includes('Mega'))) {
    methods.push({
      type: 'raid', label: 'Mega-Raid', badgeColor: 'rose',
      description: 'Kann als Mega-Entwicklung in Mega-Raids bekämpft und danach in der Basisform gefangen werden.',
      available: true
    });
  }

  // Field research (common pool)
  const researchCommon = new Set([25, 50, 56, 66, 92, 147, 246, 349]);
  if (!isFormOverride && researchCommon.has(dex) && !methods.some(m => m.type === 'research')) {
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
  const manualAlternatives = ALTERNATIVE_DEX_METHODS[dex] || [];

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
