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

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadFile(res.headers.location, destPath));
      }
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`HTTP ${res.statusCode}`));
      }
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
  if (costume === 'GOFEST_2022_NOEVOLVE') return 'Gracidea Flower';
  if (costume === 'GOFEST_2022') return 'Shaymin Scarf';
  if (costume.includes('JAN_2020')) return 'Party Hat';
  if (costume.includes('SPRING_2020') || costume.includes('VISOR')) return 'Pikachu Visor';
  if (costume === 'FALL_2019') return 'Halloween Costume';
  if (costume === 'SUMMER_2018') return 'Sunglasses';
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
      
      let pogoIcon = entry.assets?.image || `https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/pm${dexNr}.icon.png`;
      let pogoShiny = entry.assets?.shinyImage || `https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/pm${dexNr}.s.icon.png`;
      let homeArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${dexNr}.png`;
      let homeShiny = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${dexNr}.png`;
      let officialArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexNr}.png`;

      // Override Zygarde base to use 50% serpent artwork instead of 10% dog
      if (dexNr === 718) {
        pogoIcon = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/718.png`;
        pogoShiny = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/718.png`;
      }
      // Override Vivillon base to use iconic pink Meadow pattern
      if (dexNr === 666) {
        pogoIcon = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/666.png`;
        pogoShiny = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/666.png`;
      }

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
          let germanRegionLabel = 'Regionalform';
          if (formKey.includes('ALOLA')) {
            regionLabel = 'Alolan';
            germanRegionLabel = 'Alola';
          } else if (formKey.includes('GALAR')) {
            if (formKey.includes('ZEN')) {
              regionLabel = 'Galarian (Zen Mode)';
              germanRegionLabel = 'Galar (Trance-Modus)';
            } else if (formKey.includes('STANDARD')) {
              regionLabel = 'Galarian (Standard Mode)';
              germanRegionLabel = 'Galar (Standardmodus)';
            } else {
              regionLabel = 'Galarian';
              germanRegionLabel = 'Galar';
            }
          } else if (formKey.includes('HISUI')) {
            regionLabel = 'Hisuian';
            germanRegionLabel = 'Hisui';
          } else if (formKey.includes('PALDEA')) {
            if (formKey.includes('AQUA')) {
              regionLabel = 'Paldean (Aqua Breed)';
              germanRegionLabel = 'Paldea (Flutenvariante)';
            } else if (formKey.includes('BLAZE')) {
              regionLabel = 'Paldean (Blaze Breed)';
              germanRegionLabel = 'Paldea (Flammenvariante)';
            } else if (formKey.includes('COMBAT')) {
              regionLabel = 'Paldean (Combat Breed)';
              germanRegionLabel = 'Paldea (Gefechtsvariante)';
            } else {
              regionLabel = 'Paldean';
              germanRegionLabel = 'Paldea';
            }
          } else {
            regionLabel = cleanFormName(formKey);
            germanRegionLabel = regionLabel;
          }

          let formName = `${regionLabel} ${baseName}`;
          let formGermanName = `${germanRegionLabel}-${entry.names?.German || baseName}`;
          if (regionLabel.includes('(')) {
            const prefix = regionLabel.split(' ')[0];
            const suffix = regionLabel.slice(prefix.length).trim();
            formName = `${prefix} ${baseName} ${suffix}`;
            const dePrefix = germanRegionLabel.split(' ')[0];
            const deSuffix = germanRegionLabel.slice(dePrefix.length).trim();
            formGermanName = `${dePrefix}-${entry.names?.German || baseName} ${deSuffix}`;
          }
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
            names: { English: formName, German: formGermanName },
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
        if (f.includes('ALOLA') || f.includes('GALAR') || f.includes('HISUI') || f.includes('PALDEA') || f.includes('MEGA') || f === 'NORMAL' || dexNr === 666 || dexNr === 585 || dexNr === 586) {
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
      // Deduplicate female asset forms: costume should only have 1 card per costume variation in the dex grid!
      const costumeMap = new Map();
      eventAssets.forEach(af => {
        const costumeKey = (af.costume || af.form).toUpperCase();
        // Prefer male / gender-neutral asset if both exist
        if (!costumeMap.has(costumeKey) || (costumeMap.get(costumeKey).isFemale && !af.isFemale)) {
          costumeMap.set(costumeKey, af);
        }
      });

      costumeMap.forEach((af, costumeKey) => {
        const costumeId = `poke_${dexNr}_costume_${costumeKey.toLowerCase()}`;
        if (!processedIds.has(costumeId)) {
          processedIds.add(costumeId);
          const costumeLabel = formatCostumeName(costumeKey);
          const fullName = `${baseName} (${costumeLabel})`;

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

  // Toxtricity Low Key Form (Correct PokeAPI ID: 10184)
  specialForms.push({
    dexNr: 849, base: 'Toxtricity', formId: 'LOW_KEY', label: 'Low Key Form', type1: 'Electric', type2: 'Poison',
    displayName: 'Toxtricity (Low Key Form)',
    germanName: 'Riffex (Tieffrequenz-Form)',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10184.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10184.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10184.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10184.png'
  });

  // Urshifu Rapid Strike Style (Correct PokeAPI ID: 10191)
  specialForms.push({
    dexNr: 892, base: 'Urshifu', formId: 'RAPID_STRIKE', label: 'Rapid Strike Style', type1: 'Fighting', type2: 'Water',
    displayName: 'Urshifu (Rapid Strike Style)',
    germanName: 'Wulaosu (Fließender Stil)',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10191.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10191.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10191.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10191.png'
  });

  // Genesect Drive Forms
  const genesectDrives = [
    { id: 'SHOCK', pogoId: 12, label: 'Shock Drive', de: 'Blitzmodul' },
    { id: 'BURN', pogoId: 13, label: 'Burn Drive', de: 'Flammenmodul' },
    { id: 'CHILL', pogoId: 14, label: 'Chill Drive', de: 'Gefriermodul' },
    { id: 'DOUSE', pogoId: 15, label: 'Douse Drive', de: 'Aquamodul' }
  ];
  genesectDrives.forEach(d => {
    specialForms.push({
      dexNr: 649,
      base: 'Genesect',
      formId: d.id,
      label: d.label,
      displayName: `Genesect (${d.label})`,
      germanName: `Genesect (${d.de})`,
      type1: 'Bug',
      type2: 'Steel',
      spriteUrl: `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_649_${d.pogoId}.png`,
      shinySpriteUrl: `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon/pokemon_icon_649_${d.pogoId}_shiny.png`,
      fallbackSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/649.png`,
      fallbackShinyUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/649.png`
    });
  });

  // Meowstic Female Form
  specialForms.push({
    dexNr: 678,
    base: 'Meowstic',
    formId: 'FEMALE',
    label: 'Female',
    displayName: 'Meowstic (Female)',
    germanName: 'Psiaugon (Weiblich)',
    type1: 'Psychic',
    type2: null,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10025.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10025.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10025.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10025.png'
  });

  // Indeedee Female Form
  specialForms.push({
    dexNr: 876,
    base: 'Indeedee',
    formId: 'FEMALE',
    label: 'Female',
    displayName: 'Indeedee (Female)',
    germanName: 'Servol (Weiblich)',
    type1: 'Psychic',
    type2: 'Normal',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10186.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10186.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10186.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10186.png'
  });

  // Oinkologne Female Form
  specialForms.push({
    dexNr: 916,
    base: 'Oinkologne',
    formId: 'FEMALE',
    label: 'Female',
    displayName: 'Oinkologne (Female)',
    germanName: 'Fragrunz (Weiblich)',
    type1: 'Normal',
    type2: null,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10254.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10254.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10254.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10254.png'
  });

  // Tatsugiri (Droopy & Stretchy Forms)
  specialForms.push({
    dexNr: 978,
    base: 'Tatsugiri',
    formId: 'DROOPY',
    label: 'Droopy Form',
    displayName: 'Tatsugiri (Droopy Form)',
    germanName: 'Nigiragi (Hängende Form)',
    type1: 'Dragon',
    type2: 'Water',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10258.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10258.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10258.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10258.png'
  });
  specialForms.push({
    dexNr: 978,
    base: 'Tatsugiri',
    formId: 'STRETCHY',
    label: 'Stretchy Form',
    displayName: 'Tatsugiri (Stretchy Form)',
    germanName: 'Nigiragi (Gestreckte Form)',
    type1: 'Dragon',
    type2: 'Water',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10259.png',
    shinySpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/10259.png',
    fallbackSpriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10259.png',
    fallbackShinyUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10259.png'
  });

  // Pumpkaboo & Gourgeist Size Variants (Average, Large, Super)
  const pumpkinSizes = [
    { id: 'AVERAGE', label: 'Average Size', de: 'Normalgröße' },
    { id: 'LARGE', label: 'Large Size', de: 'Große Größe' },
    { id: 'SUPER', label: 'Super Size', de: 'XL-Größe' }
  ];
  pumpkinSizes.forEach(sz => {
    specialForms.push({
      dexNr: 710,
      base: 'Pumpkaboo',
      formId: sz.id,
      label: sz.label,
      displayName: `Pumpkaboo (${sz.label})`,
      germanName: `Irrbis (${sz.de})`,
      type1: 'Ghost',
      type2: 'Grass',
      spriteUrl: `https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/pm710.f${sz.id}.icon.png`,
      shinySpriteUrl: `https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/pm710.f${sz.id}.s.icon.png`,
      fallbackSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/710.png`,
      fallbackShinyUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/710.png`
    });
    specialForms.push({
      dexNr: 711,
      base: 'Gourgeist',
      formId: sz.id,
      label: sz.label,
      displayName: `Gourgeist (${sz.label})`,
      germanName: `Pumpdjinn (${sz.de})`,
      type1: 'Ghost',
      type2: 'Grass',
      spriteUrl: `https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/pm711.f${sz.id}.icon.png`,
      shinySpriteUrl: `https://raw.githubusercontent.com/pokemon-go-api/assets/main/Pokemon/pm711.f${sz.id}.s.icon.png`,
      fallbackSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/711.png`,
      fallbackShinyUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/711.png`
    });
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

  // 7. Verified Bulbapedia Costume Additions (Costume evolutions, recent event debuts, and special variants missing from base snapshot)
  const bulbapediaCostumes = [
    // Starter Evolutions with Pikachu Visor (2026 Debuts)
    {
      dexNr: 2, name: 'Ivysaur (Pikachu Visor)', formId: 'SPRING_2020', formName: 'Pikachu Visor', gen: 1, type1: 'Grass', type2: 'Poison',
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/5/51/GO0002Visor.png'
    },
    {
      dexNr: 3, name: 'Venusaur (Pikachu Visor)', formId: 'SPRING_2020', formName: 'Pikachu Visor', gen: 1, type1: 'Grass', type2: 'Poison',
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/7/75/GO0003Visor.png'
    },
    {
      dexNr: 5, name: 'Charmeleon (Pikachu Visor)', formId: 'SPRING_2020', formName: 'Pikachu Visor', gen: 1, type1: 'Fire', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/7/73/GO0005Visor.png'
    },
    {
      dexNr: 6, name: 'Charizard (Pikachu Visor)', formId: 'SPRING_2020', formName: 'Pikachu Visor', gen: 1, type1: 'Fire', type2: 'Flying',
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/5/55/GO0006Visor.png'
    },
    {
      dexNr: 8, name: 'Wartortle (Pikachu Visor)', formId: 'SPRING_2020', formName: 'Pikachu Visor', gen: 1, type1: 'Water', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/0/0e/GO0008Visor.png'
    },
    {
      dexNr: 9, name: 'Blastoise (Pikachu Visor)', formId: 'SPRING_2020', formName: 'Pikachu Visor', gen: 1, type1: 'Water', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/2/2e/GO0009Visor.png'
    },

    // Pokémon Horizons / Friede's Goggles Series
    {
      dexNr: 4, name: "Charmander (Friede's Goggles)", formId: 'FRIEDE', formName: "Friede's Goggles", gen: 1, type1: 'Fire', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/1/13/GO0004Friede.png'
    },
    {
      dexNr: 5, name: "Charmeleon (Friede's Goggles)", formId: 'FRIEDE', formName: "Friede's Goggles", gen: 1, type1: 'Fire', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/2/21/GO0005Friede.png'
    },
    {
      dexNr: 6, name: "Charizard (Friede's Goggles)", formId: 'FRIEDE', formName: "Friede's Goggles", gen: 1, type1: 'Fire', type2: 'Flying',
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/d/da/GO0006Friede.png'
    },

    // Recent Event Debuts
    {
      dexNr: 10, name: 'Caterpie (Poké Ball Hat)', formId: 'GOFEST_2026', formName: 'Poké Ball Hat', gen: 1, type1: 'Bug', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/b/be/GO0010GOFest2026.png'
    },
    {
      dexNr: 68, name: 'Machamp (Modern Jacket)', formId: 'MODERN_JACKET', formName: 'Modern Jacket', gen: 1, type1: 'Fighting', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/c/c4/GO0068.png'
    },
    {
      dexNr: 222, name: 'Corsola (Pink Sunglasses)', formId: 'SUNGLASSES', formName: 'Pink Sunglasses', gen: 2, type1: 'Water', type2: 'Rock',
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/c/c7/GO0222GSunglasses.png'
    },
    {
      dexNr: 132, name: 'Ditto (Pokopia Hat)', formId: 'POKOPIA_HAT', formName: 'Pokopia Hat', gen: 1, type1: 'Normal', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/a/ac/GO0132PokopiaHat.png'
    },
    {
      dexNr: 132, name: 'Ditto (Pokopia Cap)', formId: 'POKOPIA_CAP', formName: 'Pokopia Cap', gen: 1, type1: 'Normal', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/5/59/GO0132PokopiaCap.png'
    },
    {
      dexNr: 999, name: 'Gimmighoul (9th Anniversary Coin)', formId: 'ANNIVERSARY_9', formName: '9th Anniversary Coin', gen: 9, type1: 'Ghost', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/0/01/GO0999Anniversary9.png'
    },
    {
      dexNr: 999, name: 'Gimmighoul (10th Anniversary Coin)', formId: 'ANNIVERSARY_10', formName: '10th Anniversary Coin', gen: 9, type1: 'Ghost', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/8/8c/GO0999Anniversary10.png'
    },

    // Pumpkaboo & Gourgeist Spooky Festival Sizes
    {
      dexNr: 710, name: 'Pumpkaboo (Spooky Festival - Small Size)', formId: 'SPOOKY_SMALL', formName: 'Spooky Festival (Small)', gen: 6, type1: 'Ghost', type2: 'Grass',
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/8/8e/GO0710SmHalloween2022.png'
    },
    {
      dexNr: 710, name: 'Pumpkaboo (Spooky Festival - Large Size)', formId: 'SPOOKY_LARGE', formName: 'Spooky Festival (Large)', gen: 6, type1: 'Ghost', type2: 'Grass',
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/c/c8/GO0710LaHalloween2022.png'
    },
    {
      dexNr: 710, name: 'Pumpkaboo (Spooky Festival - Super Size)', formId: 'SPOOKY_SUPER', formName: 'Spooky Festival (Super)', gen: 6, type1: 'Ghost', type2: 'Grass',
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/c/c9/GO0710SuHalloween2022.png'
    },
    {
      dexNr: 711, name: 'Gourgeist (Spooky Festival - Small Size)', formId: 'SPOOKY_SMALL', formName: 'Spooky Festival (Small)', gen: 6, type1: 'Ghost', type2: 'Grass',
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/b/b3/GO0711SmHalloween2022.png'
    },
    {
      dexNr: 711, name: 'Gourgeist (Spooky Festival - Large Size)', formId: 'SPOOKY_LARGE', formName: 'Spooky Festival (Large)', gen: 6, type1: 'Ghost', type2: 'Grass',
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/7/7e/GO0711LaHalloween2022.png'
    },
    {
      dexNr: 711, name: 'Gourgeist (Spooky Festival - Super Size)', formId: 'SPOOKY_SUPER', formName: 'Spooky Festival (Super)', gen: 6, type1: 'Ghost', type2: 'Grass',
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/4/44/GO0711SuHalloween2022.png'
    },

    // Special Pikachu Costumes
    {
      dexNr: 25, name: 'Pikachu (Captain Pikachu)', formId: 'CAPTAIN', formName: 'Captain Pikachu', gen: 1, type1: 'Electric', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/1/14/GO0025Captain.png'
    },
    {
      dexNr: 25, name: 'Pikachu (Marathon Visor)', formId: 'MARATHON_VISOR', formName: 'Marathon Visor', gen: 1, type1: 'Electric', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/f/f8/GO0025MarathonVisor.png'
    },
    {
      dexNr: 25, name: 'Pikachu (Excavator Pikachu)', formId: 'EXCAVATOR', formName: 'Excavator Pikachu', gen: 1, type1: 'Electric', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/6/62/GO0025Fossil.png'
    },
    {
      dexNr: 25, name: 'Pikachu (Team Mystic Hat)', formId: 'MYSTIC_HAT', formName: 'Team Mystic Hat', gen: 1, type1: 'Electric', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/e/ea/GO0025MysticHat.png'
    },
    {
      dexNr: 25, name: 'Pikachu (Team Instinct Hat)', formId: 'INSTINCT_HAT', formName: 'Team Instinct Hat', gen: 1, type1: 'Electric', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/8/84/GO0025InstinctHat.png'
    },
    {
      dexNr: 25, name: 'Pikachu (Team Valor Hat)', formId: 'VALOR_HAT', formName: 'Team Valor Hat', gen: 1, type1: 'Electric', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/0/06/GO0025ValorHat.png'
    },
    {
      dexNr: 25, name: "Pikachu (Professor Willow's Assistant)", formId: 'WILLOW_ASSISTANT', formName: "Professor Willow's Assistant", gen: 1, type1: 'Electric', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/8/8c/GO0025Willow.png'
    },
    {
      dexNr: 25, name: 'Pikachu (Cosmog Spacesuit)', formId: 'COSMOG_SPACESUIT', formName: 'Cosmog Spacesuit', gen: 1, type1: 'Electric', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/0/06/GO0025Cosmog.png'
    },
    {
      dexNr: 25, name: 'Pikachu (Baseball Shirt)', formId: 'BASEBALL_SHIRT', formName: 'Baseball Shirt', gen: 1, type1: 'Electric', type2: null,
      spriteUrl: 'https://archives.bulbagarden.net/media/upload/c/c0/GO0025BaseballJersey.png'
    }
  ];

  const costumesDir = path.join(__dirname, '..', 'client', 'public', 'images', 'costumes');
  const serverCostumesDir = path.join(__dirname, '..', 'server', 'public', 'images', 'costumes');
  if (!fs.existsSync(costumesDir)) fs.mkdirSync(costumesDir, { recursive: true });
  if (!fs.existsSync(serverCostumesDir)) fs.mkdirSync(serverCostumesDir, { recursive: true });

  for (const bc of bulbapediaCostumes) {
    const costumeId = `poke_${bc.dexNr}_costume_${bc.formId.toLowerCase()}`;
    if (!processedIds.has(costumeId)) {
      processedIds.add(costumeId);
      let localSpriteUrl = bc.spriteUrl;
      if (bc.spriteUrl && bc.spriteUrl.startsWith('http')) {
        const filename = path.basename(bc.spriteUrl);
        const clientFilePath = path.join(costumesDir, filename);
        const serverFilePath = path.join(serverCostumesDir, filename);
        if (!fs.existsSync(clientFilePath)) {
          try {
            await downloadFile(bc.spriteUrl, clientFilePath);
          } catch (e) {
            console.warn(`Could not download costume sprite for ${bc.name}:`, e.message);
          }
        }
        if (fs.existsSync(clientFilePath)) {
          if (!fs.existsSync(serverFilePath)) {
            try { fs.copyFileSync(clientFilePath, serverFilePath); } catch {}
          }
          localSpriteUrl = `/images/costumes/${filename}`;
        }
      }

      const homeFallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${bc.dexNr}.png`;
      const homeShinyFallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${bc.dexNr}.png`;
      allItems.push({
        id: costumeId,
        dexNr: bc.dexNr,
        name: bc.name,
        names: { English: bc.name },
        formId: bc.formId,
        formName: bc.formName,
        category: 'costume',
        generation: bc.gen,
        type1: bc.type1,
        type2: bc.type2 || null,
        spriteUrl: localSpriteUrl,
        shinySpriteUrl: localSpriteUrl,
        fallbackSpriteUrl: homeFallback,
        fallbackShinyUrl: homeShinyFallback,
        officialArtworkUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${bc.dexNr}.png`,
        hasShiny: true,
        isMega: false,
        isForm: false,
        isCostume: true,
        releasedInGo: true
      });
    }
  }

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

  const clientDataDir = path.join(__dirname, '..', 'client', 'src', 'data');
  if (fs.existsSync(clientDataDir)) {
    const clientOutputPath = path.join(clientDataDir, 'pokemon-data.json');
    fs.writeFileSync(clientOutputPath, JSON.stringify(allItems, null, 2), 'utf8');
    console.log(`Successfully synced to ${clientOutputPath}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
