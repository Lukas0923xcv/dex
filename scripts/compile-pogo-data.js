const https = require('https');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 69 Species from National Dex #001 to #1025 currently unreleased in Pokémon GO (source: Bulbapedia)
const UNRELEASED_DEX_NRS = new Set([
  489, 490, 493, // Phione, Manaphy, Arceus
  746, 771, 772, 773, 774, 801, // Wishiwashi, Pyukumuku, Type: Null, Silvally, Minior, Magearna
  833, 834, 868, 869, 871, 875, 878, 879, 880, 881, 882, 883, 896, 897, 898, 902, // Galar/Hisui unreleased
  946, 947, 951, 952, 953, 954, 963, 964, 967, 976, 981, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995,
  1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1014, 1015, 1016, 1017, 1018, 1020, 1021, 1022, 1023, 1024, 1025
]);

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchJson(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url} - Status ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function formatTypeName(rawType) {
  if (!rawType) return null;
  if (typeof rawType === 'object') {
    if (rawType.names && rawType.names.English) return rawType.names.English;
    if (rawType.type) return formatTypeName(rawType.type);
  }
  const clean = String(rawType).replace(/^POKEMON_TYPE_/, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

function cleanFormName(formId) {
  if (!formId) return 'Standard';
  return formId
    .replace(/^FORM_/, '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatCostumeName(costume) {
  if (!costume) return 'Costume';
  return costume
    .replace(/_NOEVOLVE/g, '')
    .replace(/^COSTUME_/, 'Costume ')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

async function main() {
  console.log('Fetching Pokémon GO Game Master Dex...');
  const pogoDexUrl = 'https://pokemon-go-api.github.io/pokemon-go-api/api/pokedex.json';
  
  let pogoData = [];
  try {
    pogoData = await fetchJson(pogoDexUrl);
    console.log(`Fetched ${pogoData.length} Pokémon GO entries.`);
  } catch (err) {
    console.error('Failed to fetch from pokemon-go-api:', err.message);
  }

  const allItems = [];
  const processedIds = new Set();

  for (const entry of pogoData) {
    const dexNr = entry.dexNr;
    const baseName = entry.names?.English || entry.id;
    const gen = entry.generation || (dexNr <= 151 ? 1 : dexNr <= 251 ? 2 : dexNr <= 386 ? 3 : dexNr <= 493 ? 4 : dexNr <= 649 ? 5 : dexNr <= 721 ? 6 : dexNr <= 809 ? 7 : dexNr <= 905 ? 8 : 9);
    const type1 = formatTypeName(entry.primaryType);
    const type2 = formatTypeName(entry.secondaryType);
    const isReleased = !UNRELEASED_DEX_NRS.has(dexNr);

    // 1. Standard entry
    const standardId = `poke_${dexNr}_base`;
    if (!processedIds.has(standardId)) {
      processedIds.add(standardId);
      
      const pogoIcon = entry.assets?.image || `https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/pm${dexNr}.icon.png`;
      const pogoShiny = entry.assets?.shinyImage || `https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/pm${dexNr}.s.icon.png`;
      const homeArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dexNr}.png`;
      const homeShiny = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${dexNr}.png`;
      const officialArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNr}.png`;

      allItems.push({
        id: standardId,
        dexNr: dexNr,
        name: baseName,
        names: entry.names || { English: baseName },
        formId: 'NORMAL',
        formName: 'Standard',
        category: 'standard',
        generation: gen,
        type1: type1 || 'Normal',
        type2: type2 || null,
        spriteUrl: pogoIcon,
        shinySpriteUrl: pogoShiny,
        fallbackSpriteUrl: homeArtwork,
        fallbackShinyUrl: homeShiny,
        officialArtworkUrl: officialArtwork,
        hasShiny: true,
        isMega: false,
        isForm: false,
        isCostume: false,
        releasedInGo: isReleased
      });
    }

    // 2. Mega & Primal Evolutions
    if (entry.megaEvolutions && typeof entry.megaEvolutions === 'object') {
      const megas = Array.isArray(entry.megaEvolutions) ? entry.megaEvolutions : Object.values(entry.megaEvolutions);
      megas.forEach((mega, index) => {
        const megaId = `poke_${dexNr}_mega_${index + 1}_${(mega.id || 'MEGA').toLowerCase()}`;
        if (!processedIds.has(megaId)) {
          processedIds.add(megaId);
          let megaName = `Mega ${baseName}`;
          if (mega.id?.includes('MEGA_X')) megaName = `Mega ${baseName} X`;
          else if (mega.id?.includes('MEGA_Y')) megaName = `Mega ${baseName} Y`;
          else if (mega.id?.includes('PRIMAL')) megaName = `Primal ${baseName}`;

          const megaType1 = formatTypeName(mega.primaryType) || type1;
          const megaType2 = formatTypeName(mega.secondaryType) || type2;
          const homeFallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dexNr}.png`;
          const homeShinyFallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${dexNr}.png`;
          const megaSprite = mega.assets?.image || entry.assets?.image || homeFallback;
          const megaShiny = mega.assets?.shinyImage || entry.assets?.shinyImage || homeShinyFallback;

          allItems.push({
            id: megaId,
            dexNr: dexNr,
            name: megaName,
            names: { English: megaName },
            formId: mega.id || 'MEGA',
            formName: megaName,
            category: 'mega',
            generation: gen,
            type1: megaType1,
            type2: megaType2,
            spriteUrl: megaSprite,
            shinySpriteUrl: megaShiny,
            fallbackSpriteUrl: homeFallback,
            fallbackShinyUrl: homeShinyFallback,
            officialArtworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNr}.png`,
            hasShiny: true,
            isMega: true,
            isForm: false,
            isCostume: false,
            releasedInGo: true
          });
        }
      });
    }

    // 3. Regional Forms (Alolan, Galarian, Hisuian, Paldean)
    if (entry.regionForms && typeof entry.regionForms === 'object') {
      const forms = Array.isArray(entry.regionForms) ? entry.regionForms : Object.values(entry.regionForms);
      forms.forEach((rf) => {
        const formKey = rf.formId || rf.form || 'REGION';
        const formId = `poke_${dexNr}_form_${formKey.toLowerCase()}`;
        if (!processedIds.has(formId)) {
          processedIds.add(formId);

          let regionLabel = 'Regional Form';
          if (formKey.includes('ALOLA')) regionLabel = 'Alolan';
          else if (formKey.includes('GALAR')) regionLabel = 'Galarian';
          else if (formKey.includes('HISUI')) regionLabel = 'Hisuian';
          else if (formKey.includes('PALDEA')) regionLabel = 'Paldean';
          else regionLabel = cleanFormName(formKey);

          const formName = `${regionLabel} ${baseName}`;
          const formType1 = formatTypeName(rf.primaryType) || type1;
          const formType2 = formatTypeName(rf.secondaryType) || null;
          const homeFallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dexNr}.png`;
          const homeShinyFallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${dexNr}.png`;
          const formSprite = rf.assets?.image || entry.assets?.image || homeFallback;
          const formShiny = rf.assets?.shinyImage || entry.assets?.shinyImage || homeShinyFallback;

          allItems.push({
            id: formId,
            dexNr: dexNr,
            name: formName,
            names: { English: formName },
            formId: formKey,
            formName: regionLabel,
            category: 'form',
            generation: gen,
            type1: formType1,
            type2: formType2,
            spriteUrl: formSprite,
            shinySpriteUrl: formShiny,
            fallbackSpriteUrl: homeFallback,
            fallbackShinyUrl: homeShinyFallback,
            officialArtworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNr}.png`,
            hasShiny: true,
            isMega: false,
            isForm: true,
            isCostume: false,
            releasedInGo: true
          });
        }
      });
    }

    // 4. Vivillon Patterns from assetForms (dexNr === 666)
    if (dexNr === 666 && entry.assetForms) {
      entry.assetForms.forEach(af => {
        if (af.form && af.form !== 'NORMAL') {
          const vPattern = af.form;
          const vId = `poke_666_form_vivillon_${vPattern.toLowerCase()}`;
          if (!processedIds.has(vId)) {
            processedIds.add(vId);
            const patternName = cleanFormName(vPattern) + ' Pattern';
            allItems.push({
              id: vId,
              dexNr: 666,
              name: `Vivillon (${patternName})`,
              names: { English: `Vivillon (${patternName})` },
              formId: vPattern,
              formName: patternName,
              category: 'form',
              generation: 6,
              type1: 'Bug',
              type2: 'Flying',
              spriteUrl: af.image,
              shinySpriteUrl: af.shinyImage || af.image,
              fallbackSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/666.png`,
              fallbackShinyUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/666.png`,
              officialArtworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/666.png`,
              hasShiny: Boolean(af.shinyImage),
              isMega: false,
              isForm: true,
              isCostume: false,
              releasedInGo: true
            });
          }
        }
      });
    }

    // 5. Costumed & Event Pokémon from assetForms (covering all Bulbapedia Event Pokémon)
    if (entry.assetForms && Array.isArray(entry.assetForms)) {
      const isEventForm = (af) => {
        if (af.costume) return true;
        if (!af.form) return false;
        const f = af.form.toUpperCase();
        if (f.includes('ALOLA') || f.includes('GALAR') || f.includes('HISUI') || f.includes('PALDEA') || f.includes('MEGA') || f === 'NORMAL' || dexNr === 666) {
          return false;
        }
        return f.includes('201') || f.includes('202') || f.includes('FALL') ||
               f.includes('SPRING') || f.includes('SUMMER') || f.includes('WINTER') ||
               f.includes('HOLIDAY') || f.includes('HALLOWEEN') || f.includes('PARTY') ||
               f.includes('CROWN') || f.includes('HAT') || f.includes('COSTUME') ||
               f.includes('BOW') || f.includes('FEST') || f.includes('ANNIVERSARY') ||
               f.includes('VALENTINE') || f.includes('NEW_YEAR') || f.includes('KARYUSHI');
      };

      const eventAssets = entry.assetForms.filter(isEventForm);
      eventAssets.forEach(af => {
        const costumeKey = af.costume || af.form;
        const costumeId = `poke_${dexNr}_costume_${costumeKey.toLowerCase()}${af.isFemale ? '_f' : ''}`;
        if (!processedIds.has(costumeId)) {
          processedIds.add(costumeId);
          const costumeLabel = formatCostumeName(costumeKey);
          const fullName = `${baseName} (${costumeLabel}${af.isFemale ? ' ♀' : ''})`;

          allItems.push({
            id: costumeId,
            dexNr: dexNr,
            name: fullName,
            names: { English: fullName },
            formId: costumeKey,
            formName: costumeLabel,
            category: 'costume',
            generation: gen,
            type1: type1 || 'Normal',
            type2: type2 || null,
            spriteUrl: af.image,
            shinySpriteUrl: af.shinyImage || af.image,
            fallbackSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dexNr}.png`,
            fallbackShinyUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${dexNr}.png`,
            officialArtworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNr}.png`,
            hasShiny: Boolean(af.shinyImage),
            isMega: false,
            isForm: false,
            isCostume: true,
            releasedInGo: true
          });
        }
      });
    }
  }

  // 6. Special Pokémon Alternate Forms (Castform, Deoxys, Furfrou, Rotom, Unown, etc.)
  const specialForms = [
    // Castform
    { dexNr: 351, base: 'Castform', formId: 'SUNNY', label: 'Sunny Form', type1: 'Fire', type2: null, icon: 'pm351.fSUNNY.icon.png' },
    { dexNr: 351, base: 'Castform', formId: 'RAINY', label: 'Rainy Form', type1: 'Water', type2: null, icon: 'pm351.fRAINY.icon.png' },
    { dexNr: 351, base: 'Castform', formId: 'SNOWY', label: 'Snowy Form', type1: 'Ice', type2: null, icon: 'pm351.fSNOWY.icon.png' },
    // Deoxys
    { dexNr: 386, base: 'Deoxys', formId: 'ATTACK', label: 'Attack Forme', type1: 'Psychic', type2: null, icon: 'pm386.fATTACK.icon.png' },
    { dexNr: 386, base: 'Deoxys', formId: 'DEFENSE', label: 'Defense Forme', type1: 'Psychic', type2: null, icon: 'pm386.fDEFENSE.icon.png' },
    { dexNr: 386, base: 'Deoxys', formId: 'SPEED', label: 'Speed Forme', type1: 'Psychic', type2: null, icon: 'pm386.fSPEED.icon.png' },
    // Giratina
    { dexNr: 487, base: 'Giratina', formId: 'ORIGIN', label: 'Origin Forme', type1: 'Ghost', type2: 'Dragon', icon: 'pm487.fORIGIN.icon.png' },
    // Shaymin
    { dexNr: 492, base: 'Shaymin', formId: 'SKY', label: 'Sky Forme', type1: 'Grass', type2: 'Flying', icon: 'pm492.fSKY.icon.png' },
    // Rotom
    { dexNr: 479, base: 'Rotom', formId: 'HEAT', label: 'Heat Rotom', type1: 'Electric', type2: 'Fire', icon: 'pm479.fHEAT.icon.png' },
    { dexNr: 479, base: 'Rotom', formId: 'WASH', label: 'Wash Rotom', type1: 'Electric', type2: 'Water', icon: 'pm479.fWASH.icon.png' },
    { dexNr: 479, base: 'Rotom', formId: 'FROST', label: 'Frost Rotom', type1: 'Electric', type2: 'Ice', icon: 'pm479.fFROST.icon.png' },
    { dexNr: 479, base: 'Rotom', formId: 'FAN', label: 'Fan Rotom', type1: 'Electric', type2: 'Flying', icon: 'pm479.fFAN.icon.png' },
    { dexNr: 479, base: 'Rotom', formId: 'MOW', label: 'Mow Rotom', type1: 'Electric', type2: 'Grass', icon: 'pm479.fMOW.icon.png' },
    // Therian Formes
    { dexNr: 641, base: 'Tornadus', formId: 'THERIAN', label: 'Therian Forme', type1: 'Flying', type2: null, icon: 'pm641.fTHERIAN.icon.png' },
    { dexNr: 642, base: 'Thundurus', formId: 'THERIAN', label: 'Therian Forme', type1: 'Electric', type2: 'Flying', icon: 'pm642.fTHERIAN.icon.png' },
    { dexNr: 645, base: 'Landorus', formId: 'THERIAN', label: 'Therian Forme', type1: 'Ground', type2: 'Flying', icon: 'pm645.fTHERIAN.icon.png' },
    { dexNr: 905, base: 'Enamorus', formId: 'THERIAN', label: 'Therian Forme', type1: 'Fairy', type2: 'Flying', icon: 'pm905.fTHERIAN.icon.png' },
    // Kyurem
    { dexNr: 646, base: 'Kyurem', formId: 'BLACK', label: 'Black Kyurem', type1: 'Dragon', type2: 'Ice', icon: 'pm646.fBLACK.icon.png' },
    { dexNr: 646, base: 'Kyurem', formId: 'WHITE', label: 'White Kyurem', type1: 'Dragon', type2: 'Ice', icon: 'pm646.fWHITE.icon.png' },
    // Necrozma
    { dexNr: 800, base: 'Necrozma', formId: 'DUSK_MANE', label: 'Dusk Mane', type1: 'Psychic', type2: 'Steel', icon: 'pm800.fDUSK_MANE.icon.png' },
    { dexNr: 800, base: 'Necrozma', formId: 'DAWN_WINGS', label: 'Dawn Wings', type1: 'Psychic', type2: 'Ghost', icon: 'pm800.fDAWN_WINGS.icon.png' },
    { dexNr: 800, base: 'Necrozma', formId: 'ULTRA', label: 'Ultra Necrozma', type1: 'Psychic', type2: 'Dragon', icon: 'pm800.fULTRA.icon.png' },
    // Zygarde
    { dexNr: 718, base: 'Zygarde', formId: '10_PERCENT', label: '10% Forme', type1: 'Dragon', type2: 'Ground', icon: 'pm718.fTEN_PERCENT.icon.png' },
    { dexNr: 718, base: 'Zygarde', formId: 'COMPLETE', label: 'Complete Forme', type1: 'Dragon', type2: 'Ground', icon: 'pm718.fCOMPLETE.icon.png' },
    // Hoopa
    { dexNr: 720, base: 'Hoopa', formId: 'UNBOUND', label: 'Unbound', type1: 'Psychic', type2: 'Dark', icon: 'pm720.fUNBOUND.icon.png' },
    // Oricorio
    { dexNr: 741, base: 'Oricorio', formId: 'POM_POM', label: 'Pom-Pom Style', type1: 'Electric', type2: 'Flying', icon: 'pm741.fPOM_POM.icon.png' },
    { dexNr: 741, base: 'Oricorio', formId: 'PA_U', label: 'Pa\'u Style', type1: 'Psychic', type2: 'Flying', icon: 'pm741.fPAU.icon.png' },
    { dexNr: 741, base: 'Oricorio', formId: 'SENSU', label: 'Sensu Style', type1: 'Ghost', type2: 'Flying', icon: 'pm741.fSENSU.icon.png' },
    // Lycanroc
    { dexNr: 745, base: 'Lycanroc', formId: 'MIDNIGHT', label: 'Midnight Form', type1: 'Rock', type2: null, icon: 'pm745.fMIDNIGHT.icon.png' },
    { dexNr: 745, base: 'Lycanroc', formId: 'DUSK', label: 'Dusk Form', type1: 'Rock', type2: null, icon: 'pm745.fDUSK.icon.png' }
  ];

  // Add Furfrou trims (Natural, Heart, Star, Diamond, Debutante, Matron, Dandy, La Reine, Kabuki, Pharaoh)
  const furfrouTrims = ['HEART', 'STAR', 'DIAMOND', 'DEBUTANTE', 'MATRON', 'DANDY', 'LA_REINE', 'KABUKI', 'PHARAOH'];
  furfrouTrims.forEach(trim => {
    specialForms.push({
      dexNr: 676,
      base: 'Furfrou',
      formId: trim,
      label: cleanFormName(trim) + ' Trim',
      type1: 'Normal',
      type2: null,
      icon: `pm676.f${trim}.icon.png`
    });
  });

  // Add Unown forms (A-Z, !, ?)
  const unownLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').concat(['EXCLAMATION_POINT', 'QUESTION_MARK']);
  unownLetters.forEach(letter => {
    const label = letter === 'EXCLAMATION_POINT' ? '!' : letter === 'QUESTION_MARK' ? '?' : letter;
    const fileSuffix = letter === 'EXCLAMATION_POINT' ? 'EXCLAMATION' : letter === 'QUESTION_MARK' ? 'QUESTION' : letter;
    specialForms.push({
      dexNr: 201,
      base: 'Unown',
      formId: letter,
      label: `Unown ${label}`,
      type1: 'Psychic',
      type2: null,
      icon: `pm201.f${fileSuffix}.icon.png`
    });
  });

  specialForms.forEach(sf => {
    const specialId = `poke_${sf.dexNr}_special_${sf.formId.toLowerCase()}`;
    if (!processedIds.has(specialId)) {
      processedIds.add(specialId);
      const name = `${sf.base} (${sf.label})`;
      const gen = sf.dexNr <= 151 ? 1 : sf.dexNr <= 251 ? 2 : sf.dexNr <= 386 ? 3 : sf.dexNr <= 493 ? 4 : sf.dexNr <= 649 ? 5 : sf.dexNr <= 721 ? 6 : sf.dexNr <= 809 ? 7 : sf.dexNr <= 905 ? 8 : 9;
      allItems.push({
        id: specialId,
        dexNr: sf.dexNr,
        name: name,
        names: { English: name },
        formId: sf.formId,
        formName: sf.label,
        category: 'form',
        generation: gen,
        type1: sf.type1,
        type2: sf.type2,
        spriteUrl: `https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/${sf.icon}`,
        shinySpriteUrl: `https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/${sf.icon.replace('.icon.png', '.s.icon.png')}`,
        fallbackSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${sf.dexNr}.png`,
        fallbackShinyUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${sf.dexNr}.png`,
        officialArtworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${sf.dexNr}.png`,
        hasShiny: true,
        isMega: false,
        isForm: true,
        isCostume: false,
        releasedInGo: true
      });
    }
  });

  // Sort: Standard first by dexNr, then Megas, then Forms, then Costumes
  allItems.sort((a, b) => {
    if (a.category !== b.category) {
      const order = { standard: 1, mega: 2, form: 3, costume: 4 };
      return (order[a.category] || 9) - (order[b.category] || 9);
    }
    if (a.dexNr !== b.dexNr) return a.dexNr - b.dexNr;
    return a.name.localeCompare(b.name);
  });

  console.log(`Total Pokémon compiled: ${allItems.length}`);
  const summary = {
    total: allItems.length,
    standard: allItems.filter(p => p.category === 'standard').length,
    megas: allItems.filter(p => p.category === 'mega').length,
    forms: allItems.filter(p => p.category === 'form').length,
    costumes: allItems.filter(p => p.category === 'costume').length,
    releasedInGo: allItems.filter(p => p.releasedInGo).length,
    unreleasedInGo: allItems.filter(p => !p.releasedInGo).length
  };
  console.log('Summary:', summary);

  const outputPath = path.join(dataDir, 'pokemon-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(allItems, null, 2), 'utf8');
  console.log(`Successfully written to ${outputPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
