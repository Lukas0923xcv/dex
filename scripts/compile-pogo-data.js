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
    // Meltan (808) and Melmetal (809) are in the "Unbekannt" / Unknown category in Pokémon GO
    const gen = (dexNr === 808 || dexNr === 809) ? 0 : (entry.generation || (dexNr <= 151 ? 1 : dexNr <= 251 ? 2 : dexNr <= 386 ? 3 : dexNr <= 493 ? 4 : dexNr <= 649 ? 5 : dexNr <= 721 ? 6 : dexNr <= 807 ? 7 : dexNr <= 905 ? 8 : 9));
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
        const isRegional = formKey.includes('ALOLA') || formKey.includes('GALAR') || formKey.includes('HISUI') || formKey.includes('PALDEA');
        if (!isRegional) return; // Skip non-regional forms (like Unown, Furfrou trims, etc.) to prevent duplicate/broken fallback sprites

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
    // Castform (351)
    {
      dexNr: 351, base: 'Castform', formId: 'SUNNY', label: 'Sunny Form', type1: 'Fire', type2: null,
      spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_351_12.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_351_12_shiny.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10013.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10013.png'
    },
    {
      dexNr: 351, base: 'Castform', formId: 'RAINY', label: 'Rainy Form', type1: 'Water', type2: null,
      spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_351_13.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_351_13_shiny.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10014.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10014.png'
    },
    {
      dexNr: 351, base: 'Castform', formId: 'SNOWY', label: 'Snowy Form', type1: 'Ice', type2: null,
      spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_351_14.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_351_14_shiny.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10015.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10015.png'
    },
    // Deoxys (386)
    {
      dexNr: 386, base: 'Deoxys', formId: 'ATTACK', label: 'Attack Forme', type1: 'Psychic', type2: null,
      spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_386_12.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_386_12_shiny.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10001.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10001.png'
    },
    {
      dexNr: 386, base: 'Deoxys', formId: 'DEFENSE', label: 'Defense Forme', type1: 'Psychic', type2: null,
      spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_386_13.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_386_13_shiny.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10002.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10002.png'
    },
    {
      dexNr: 386, base: 'Deoxys', formId: 'SPEED', label: 'Speed Forme', type1: 'Psychic', type2: null,
      spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_386_14.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_386_14_shiny.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10003.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10003.png'
    },
    // Giratina Origin (487)
    {
      dexNr: 487, base: 'Giratina', formId: 'ORIGIN', label: 'Origin Forme', type1: 'Ghost', type2: 'Dragon',
      spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_487_12.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_487_12_shiny.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10007.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10007.png'
    },
    // Shaymin Sky (492)
    {
      dexNr: 492, base: 'Shaymin', formId: 'SKY', label: 'Sky Forme', type1: 'Grass', type2: 'Flying',
      spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_492_12.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_492_12_shiny.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10006.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10006.png'
    },
    // Rotom (479)
    {
      dexNr: 479, base: 'Rotom', formId: 'HEAT', label: 'Heat Rotom', type1: 'Electric', type2: 'Fire',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10008.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10008.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10008.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10008.png'
    },
    {
      dexNr: 479, base: 'Rotom', formId: 'WASH', label: 'Wash Rotom', type1: 'Electric', type2: 'Water',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10009.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10009.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10009.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10009.png'
    },
    {
      dexNr: 479, base: 'Rotom', formId: 'FROST', label: 'Frost Rotom', type1: 'Electric', type2: 'Ice',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10010.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10010.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10010.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10010.png'
    },
    {
      dexNr: 479, base: 'Rotom', formId: 'FAN', label: 'Fan Rotom', type1: 'Electric', type2: 'Flying',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10011.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10011.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10011.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10011.png'
    },
    {
      dexNr: 479, base: 'Rotom', formId: 'MOW', label: 'Mow Rotom', type1: 'Electric', type2: 'Grass',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10012.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10012.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10012.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10012.png'
    },
    // Therian Formes
    {
      dexNr: 641, base: 'Tornadus', formId: 'THERIAN', label: 'Therian Forme', type1: 'Flying', type2: null,
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10019.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10019.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10019.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10019.png'
    },
    {
      dexNr: 642, base: 'Thundurus', formId: 'THERIAN', label: 'Therian Forme', type1: 'Electric', type2: 'Flying',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10020.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10020.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10020.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10020.png'
    },
    {
      dexNr: 645, base: 'Landorus', formId: 'THERIAN', label: 'Therian Forme', type1: 'Ground', type2: 'Flying',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10021.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10021.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10021.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10021.png'
    },
    {
      dexNr: 905, base: 'Enamorus', formId: 'THERIAN', label: 'Therian Forme', type1: 'Fairy', type2: 'Flying',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10249.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10249.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10249.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10249.png'
    },
    // Kyurem
    {
      dexNr: 646, base: 'Kyurem', formId: 'BLACK', label: 'Black Kyurem', type1: 'Dragon', type2: 'Ice',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10022.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10022.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10022.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10022.png'
    },
    {
      dexNr: 646, base: 'Kyurem', formId: 'WHITE', label: 'White Kyurem', type1: 'Dragon', type2: 'Ice',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10023.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10023.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10023.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10023.png'
    },
    // Necrozma
    {
      dexNr: 800, base: 'Necrozma', formId: 'DUSK_MANE', label: 'Dusk Mane', type1: 'Psychic', type2: 'Steel',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10155.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10155.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10155.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10155.png'
    },
    {
      dexNr: 800, base: 'Necrozma', formId: 'DAWN_WINGS', label: 'Dawn Wings', type1: 'Psychic', type2: 'Ghost',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10156.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10156.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10156.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10156.png'
    },
    // Zygarde
    {
      dexNr: 718, base: 'Zygarde', formId: '10_PERCENT', label: '10% Forme', type1: 'Dragon', type2: 'Ground',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10181.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10181.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10181.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10181.png'
    },
    {
      dexNr: 718, base: 'Zygarde', formId: 'COMPLETE', label: 'Complete Forme', type1: 'Dragon', type2: 'Ground',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10120.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10120.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10120.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10120.png'
    },
    // Hoopa
    {
      dexNr: 720, base: 'Hoopa', formId: 'UNBOUND', label: 'Unbound', type1: 'Psychic', type2: 'Dark',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10086.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10086.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10086.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10086.png'
    },
    // Oricorio
    {
      dexNr: 741, base: 'Oricorio', formId: 'POM_POM', label: 'Pom-Pom Style', type1: 'Electric', type2: 'Flying',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10123.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10123.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10123.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10123.png'
    },
    {
      dexNr: 741, base: 'Oricorio', formId: 'PA_U', label: 'Pa\'u Style', type1: 'Psychic', type2: 'Flying',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10124.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10124.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10124.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10124.png'
    },
    {
      dexNr: 741, base: 'Oricorio', formId: 'SENSU', label: 'Sensu Style', type1: 'Ghost', type2: 'Flying',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10125.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10125.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10125.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10125.png'
    },
    // Lycanroc
    {
      dexNr: 745, base: 'Lycanroc', formId: 'MIDNIGHT', label: 'Midnight Form', type1: 'Rock', type2: null,
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10126.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10126.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10126.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10126.png'
    },
    {
      dexNr: 745, base: 'Lycanroc', formId: 'DUSK', label: 'Dusk Form', type1: 'Rock', type2: null,
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10152.png',
      shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10152.png',
      fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10152.png',
      fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10152.png'
    }
  ];

  // Shellos & Gastrodon East Sea
  specialForms.push({
    dexNr: 422, base: 'Shellos', formId: 'EAST_SEA', label: 'East Sea', type1: 'Water', type2: null,
    spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_422_12.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_422_12_shiny.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/422-east.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/422-east.png'
  });
  specialForms.push({
    dexNr: 423, base: 'Gastrodon', formId: 'EAST_SEA', label: 'East Sea', type1: 'Water', type2: 'Ground',
    spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_423_12.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_423_12_shiny.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/423-east.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/423-east.png'
  });

  // Deerling & Sawsbuck Seasonal Forms
  const seasons = [
    { id: 'SUMMER', label: 'Summer Form', pogoId: 12, slug: 'summer' },
    { id: 'AUTUMN', label: 'Autumn Form', pogoId: 13, slug: 'autumn' },
    { id: 'WINTER', label: 'Winter Form', pogoId: 14, slug: 'winter' }
  ];
  seasons.forEach(s => {
    specialForms.push({
      dexNr: 585, base: 'Deerling', formId: s.id, label: s.label, type1: 'Normal', type2: 'Grass',
      spriteUrl: `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_585_${s.pogoId}.png`,
      shinySpriteUrl: `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_585_${s.pogoId}_shiny.png`,
      fallbackSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/585-${s.slug}.png`,
      fallbackShinyUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/585-${s.slug}.png`
    });
    specialForms.push({
      dexNr: 586, base: 'Sawsbuck', formId: s.id, label: s.label, type1: 'Normal', type2: 'Grass',
      spriteUrl: `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_586_${s.pogoId}.png`,
      shinySpriteUrl: `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_586_${s.pogoId}_shiny.png`,
      fallbackSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/586-${s.slug}.png`,
      fallbackShinyUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/586-${s.slug}.png`
    });
  });

  // Cherrim Sunshine Form
  specialForms.push({
    dexNr: 421, base: 'Cherrim', formId: 'SUNSHINE', label: 'Sunshine Form', type1: 'Grass', type2: null,
    spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_421_12.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_421_12_shiny.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/421-sunshine.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/421-sunshine.png'
  });

  // Burmy & Wormadam Cloaks
  specialForms.push({
    dexNr: 412, base: 'Burmy', formId: 'SANDY', label: 'Sandy Cloak', type1: 'Bug', type2: null,
    spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_412_12.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_412_12_shiny.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/412-sandy.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/412-sandy.png'
  });
  specialForms.push({
    dexNr: 412, base: 'Burmy', formId: 'TRASH', label: 'Trash Cloak', type1: 'Bug', type2: null,
    spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_412_13.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_412_13_shiny.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/412-trash.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/412-trash.png'
  });
  specialForms.push({
    dexNr: 413, base: 'Wormadam', formId: 'SANDY', label: 'Sandy Cloak', type1: 'Bug', type2: 'Ground',
    spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_413_12.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_413_12_shiny.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10004.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10004.png'
  });
  specialForms.push({
    dexNr: 413, base: 'Wormadam', formId: 'TRASH', label: 'Trash Cloak', type1: 'Bug', type2: 'Steel',
    spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_413_13.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_413_13_shiny.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10005.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10005.png'
  });

  // Flabebe, Floette, Florges Color Variants
  const flowerColors = ['BLUE', 'ORANGE', 'WHITE', 'YELLOW'];
  flowerColors.forEach(col => {
    const colSlug = col.toLowerCase();
    const colName = cleanFormName(col) + ' Flower';
    [
      { nr: 669, base: 'Flabébé', de: 'Flabébé' },
      { nr: 670, base: 'Floette', de: 'Floette' },
      { nr: 671, base: 'Florges', de: 'Florges' }
    ].forEach(spec => {
      specialForms.push({
        dexNr: spec.nr, base: spec.base, formId: col, label: colName, type1: 'Fairy', type2: null,
        germanBase: spec.de,
        spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${spec.nr}-${colSlug}.png`,
        shinySpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${spec.nr}-${colSlug}.png`,
        fallbackSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spec.nr}-${colSlug}.png`,
        fallbackShinyUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${spec.nr}-${colSlug}.png`
      });
    });
  });

  // Dialga & Palkia Origin Formes
  specialForms.push({
    dexNr: 483, base: 'Dialga', formId: 'ORIGIN', label: 'Origin Forme', type1: 'Steel', type2: 'Dragon',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10245.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10245.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10245.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10245.png'
  });
  specialForms.push({
    dexNr: 484, base: 'Palkia', formId: 'ORIGIN', label: 'Origin Forme', type1: 'Water', type2: 'Dragon',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10246.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10246.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10246.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10246.png'
  });

  // Basculin (Blue-Striped & White-Striped)
  specialForms.push({
    dexNr: 550, base: 'Basculin', formId: 'BLUE_STRIPED', label: 'Blue-Striped', type1: 'Water', type2: null,
    spriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_550_12.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_550_12_shiny.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10016.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10016.png'
  });
  specialForms.push({
    dexNr: 550, base: 'Basculin', formId: 'WHITE_STRIPED', label: 'White-Striped', type1: 'Water', type2: null,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10247.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10247.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10247.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10247.png'
  });

  // Toxtricity Low Key
  specialForms.push({
    dexNr: 849, base: 'Toxtricity', formId: 'LOW_KEY', label: 'Low Key Form', type1: 'Electric', type2: 'Poison',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10168.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10168.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10168.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10168.png'
  });

  // Urshifu Rapid Strike
  specialForms.push({
    dexNr: 892, base: 'Urshifu', formId: 'RAPID_STRIKE', label: 'Rapid Strike Style', type1: 'Fighting', type2: 'Water',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10178.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10178.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10178.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10178.png'
  });

  // Furfrou Trims with distinct PokeAPI Home 3D sprites
  const furfrouTrims = ['HEART', 'STAR', 'DIAMOND', 'DEBUTANTE', 'MATRON', 'DANDY', 'LA_REINE', 'KABUKI', 'PHARAOH'];
  furfrouTrims.forEach(trim => {
    const slug = trim.toLowerCase().replace('_', '-');
    const trimName = cleanFormName(trim) + ' Trim';
    specialForms.push({
      dexNr: 676,
      base: 'Furfrou',
      formId: trim,
      label: trimName,
      displayName: `Furfrou (${trimName})`,
      germanName: `Coiffwaff (${trimName})`,
      type1: 'Normal',
      type2: null,
      spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/676-${slug}.png`,
      shinySpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/676-${slug}.png`,
      fallbackSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/676-${slug}.png`,
      fallbackShinyUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/676-${slug}.png`
    });
  });

  // Unown Forms (A-Z, !, ?) with 100% working PokeMiners icons + PokeAPI Home 3D fallbacks
  const unownLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').concat(['EXCLAMATION_POINT', 'QUESTION_MARK']);
  unownLetters.forEach((letter, idx) => {
    const charLabel = letter === 'EXCLAMATION_POINT' ? '!' : letter === 'QUESTION_MARK' ? '?' : letter;
    const pogoNum = 11 + idx; // 11 is A, 36 is Z, 37 is !, 38 is ?
    const homeSlug = letter === 'EXCLAMATION_POINT' ? 'exclamation' : letter === 'QUESTION_MARK' ? 'question' : letter.toLowerCase();
    specialForms.push({
      dexNr: 201,
      base: 'Unown',
      formId: letter,
      label: charLabel,
      displayName: `Unown (${charLabel})`,
      germanName: `Icognito (${charLabel})`,
      type1: 'Psychic',
      type2: null,
      spriteUrl: `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_201_${pogoNum}.png`,
      shinySpriteUrl: `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_201_${pogoNum}_shiny.png`,
      fallbackSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/201-${homeSlug}.png`,
      fallbackShinyUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/201-${homeSlug}.png`,
      officialArtworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/201-${homeSlug}.png`
    });
  });

  specialForms.forEach(sf => {
    const specialId = `poke_${sf.dexNr}_special_${sf.formId.toLowerCase()}`;
    if (!processedIds.has(specialId)) {
      processedIds.add(specialId);
      const name = sf.displayName || `${sf.base} (${sf.label})`;
      const gen = (sf.dexNr === 808 || sf.dexNr === 809) ? 0 : (sf.dexNr <= 151 ? 1 : sf.dexNr <= 251 ? 2 : sf.dexNr <= 386 ? 3 : sf.dexNr <= 493 ? 4 : sf.dexNr <= 649 ? 5 : sf.dexNr <= 721 ? 6 : sf.dexNr <= 807 ? 7 : sf.dexNr <= 905 ? 8 : 9);
      allItems.push({
        id: specialId,
        dexNr: sf.dexNr,
        name: name,
        names: { English: name, German: sf.germanName || name },
        formId: sf.formId,
        formName: sf.label,
        category: 'form',
        generation: gen,
        type1: sf.type1,
        type2: sf.type2,
        spriteUrl: sf.spriteUrl,
        shinySpriteUrl: sf.shinySpriteUrl || sf.spriteUrl,
        fallbackSpriteUrl: sf.fallbackSpriteUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${sf.dexNr}.png`,
        fallbackShinyUrl: sf.fallbackShinyUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${sf.dexNr}.png`,
        officialArtworkUrl: sf.officialArtworkUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${sf.dexNr}.png`,
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
