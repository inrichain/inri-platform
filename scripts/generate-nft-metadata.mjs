import fs from 'node:fs'
import path from 'node:path'

const PLATFORM_URL = 'https://platform.inri.life'
const CONTRACT = '0xA1DD3d0809501080735543f9F65E2981d5ED9cD6'
const CREATOR = '0x2bD38c91696aBa907DF9b2D4240F19e30161350C'
const CACHE_VERSION = '20260530-wallet-fix'

const countries = [
  [1, 'China', 'CHN', 'Dragon Noodles', 'china-dragon-noodles-v2', 'Asia', 'Street food dragon energy', 'Dragon fire'],
  [2, 'United States', 'USA', 'Eagle Burger', 'united-states-eagle-burger', 'North America', 'Burger eagle collector', 'Stars & grill'],
  [3, 'Indonesia', 'IDN', 'Komodo Boss', 'indonesia-komodo-boss', 'Asia', 'Komodo island boss', 'Island roar'],
  [4, 'Japan', 'JPN', 'Samurai Sushi Cat', 'japan-samurai-sushi-cat', 'Asia', 'Sushi samurai cat', 'Neon katana'],
  [5, 'Taiwan', 'TWN', 'Boba Blast', 'taiwan-boba-blast', 'Asia', 'Boba-powered meme coin', 'Bubble pop'],
  [6, 'Spain', 'ESP', 'Fiesta Bull', 'spain-fiesta-bull', 'Europe', 'Fiesta bull energy', 'Red fiesta'],
  [7, 'Hong Kong', 'HKG', 'Neon Dim Sum', 'hong-kong-neon-dim-sum', 'Asia', 'Neon street dim sum', 'Cyber neon'],
  [8, 'Portugal', 'PRT', 'Galo da Nata', 'portugal-galo-da-nata', 'Europe', 'Rooster and pastel de nata meme collectible', 'Azulejo gold'],
  [9, 'Poland', 'POL', 'Pierogi Knight', 'poland-pierogi-knight', 'Europe', 'Pierogi armor knight', 'Steel dumpling'],
  [10, 'Italy', 'ITA', 'Pizza Mafioso', 'italy-pizza-mafioso', 'Europe', 'Pizza mafioso meme collectible', 'Tomato gold'],
  [11, 'France', 'FRA', 'Croissant Pup', 'france-croissant-pup', 'Europe', 'Croissant puppy boss', 'Paris bakery'],
  [12, 'Switzerland', 'CHE', 'Alpine Cheese', 'switzerland-alpine-cheese', 'Europe', 'Alpine cheese collector', 'Swiss alpine'],
  [13, 'Singapore', 'SGP', 'Merlion Mob', 'singapore-merlion-mob', 'Asia', 'Merlion city boss', 'Marina shine'],
  [14, 'Netherlands', 'NLD', 'Bike Boss', 'netherlands-bike-boss', 'Europe', 'Bike culture boss', 'Orange wheel'],
  [15, 'Brazil', 'BRA', 'Samba Capy', 'brazil-samba-capy', 'South America', 'Samba capybara meme', 'Carnival green'],
  [16, 'Australia', 'AUS', 'Outback Roo', 'australia-outback-roo', 'Oceania', 'Outback kangaroo boss', 'Desert jump'],
  [17, 'Germany', 'DEU', 'Pretzel Boss', 'germany-pretzel-boss', 'Europe', 'Pretzel power boss', 'Bavarian gold'],
  [18, 'Bangladesh', 'BGD', 'Rickshaw Tiger', 'bangladesh-rickshaw-tiger', 'Asia', 'Rickshaw tiger rush', 'Dhaka speed'],
  [19, 'United Kingdom', 'GBR', 'Tea Bulldog', 'united-kingdom-tea-bulldog', 'Europe', 'Tea bulldog collector', 'Royal tea'],
  [20, 'South Korea', 'KOR', 'Kimchi Champ', 'south-korea-kimchi-champ', 'Asia', 'Kimchi champ energy', 'K-wave red'],
  [21, 'Russia', 'RUS', 'Bear Boss', 'russia-bear-boss', 'Europe/Asia', 'Bear boss collectible', 'Ice bear'],
  [22, 'India', 'IND', 'Masala Tiger', 'india-masala-tiger', 'Asia', 'Masala tiger heat', 'Spice gold'],
  [23, 'Liechtenstein', 'LIE', 'Alpine Prince', 'liechtenstein-alpine-prince', 'Europe', 'Alpine prince collector', 'Mountain royal'],
  [24, 'Vietnam', 'VNM', 'Pho Rider', 'vietnam-pho-rider', 'Asia', 'Pho rider speed', 'Street broth'],
  [25, 'New Zealand', 'NZL', 'Kiwi Boss', 'new-zealand-kiwi-boss', 'Oceania', 'Kiwi boss energy', 'Aotearoa green'],
  [26, 'Norway', 'NOR', 'Fjord Viking', 'norway-fjord-viking', 'Europe', 'Fjord viking collector', 'Nordic blue'],
  [27, 'Turkiye', 'TUR', 'Kebab Sultan', 'turkiye-kebab-sultan', 'Europe/Asia', 'Kebab sultan meme', 'Sultan red'],
  [28, 'Slovakia', 'SVK', 'Tatra Wolf', 'slovakia-tatra-wolf', 'Europe', 'Tatra mountain wolf', 'Carpathian ice'],
  [29, 'United Arab Emirates', 'ARE', 'Desert Falcon', 'united-arab-emirates-desert-falcon', 'Middle East', 'Desert falcon collector', 'Emirates gold'],
  [30, 'Philippines', 'PHL', 'Jeepney Star', 'philippines-jeepney-star', 'Asia', 'Jeepney street star', 'Island chrome'],
]

function rarity(serial) {
  if (serial === 0) return 'Genesis Creator'
  if (serial <= 10) return 'Legendary'
  if (serial <= 50) return 'Epic'
  if (serial <= 150) return 'Rare'
  if (serial <= 300) return 'Uncommon'
  return 'Common'
}

function reward(serial) {
  if (serial === 0) return '100'
  if (serial <= 10) return '100'
  if (serial <= 50) return '50'
  if (serial <= 150) return '25'
  if (serial <= 300) return '10'
  return '5'
}

const outDir = path.join(process.cwd(), 'public', 'api', 'nft', 'inri-world-meme')
fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outDir, { recursive: true })

for (const [countryId, countryName, countryCode, memeName, slug, region, theme, accent] of countries) {
  for (let serial = 0; serial <= 500; serial += 1) {
    const tokenId = countryId * 100000 + serial
    const currentRarity = rarity(serial)
    const cleanSlug = slug.replace('-v2', '')
    const data = {
      name: `${countryName} ${memeName} #${serial} - ${currentRarity}`,
      description: `INRI World Meme Collectibles - ${countryName} ${memeName}. Country meme NFT minted on INRI Chain. Lower serials have higher rarity and higher ${countryCode} reward tokens.`,
      image: `${PLATFORM_URL}/nft-assets/countries/${slug}.png?v=${CACHE_VERSION}`,
      external_url: `${PLATFORM_URL}/collectibles?country=${cleanSlug}&tokenId=${tokenId}`,
      background_color: '03070D',
      attributes: [
        { trait_type: 'Collection', value: 'INRI World Meme Collectibles' },
        { trait_type: 'Country', value: countryName },
        { trait_type: 'Code', value: countryCode },
        { trait_type: 'Meme', value: memeName },
        { trait_type: 'Region', value: region },
        { trait_type: 'Theme', value: theme },
        { trait_type: 'Accent', value: accent },
        { trait_type: 'Serial', value: serial },
        { trait_type: 'Rarity', value: currentRarity },
        { trait_type: 'Reward Token', value: countryCode },
        { trait_type: 'Reward Amount', value: reward(serial) },
        { trait_type: 'Contract', value: CONTRACT },
      ],
    }

    fs.writeFileSync(path.join(outDir, String(tokenId)), JSON.stringify(data))
    fs.writeFileSync(path.join(outDir, `${tokenId}.json`), JSON.stringify(data, null, 2))
  }
}

fs.writeFileSync(
  path.join(outDir, 'collection.json'),
  JSON.stringify(
    {
      name: 'INRI World Meme Collectibles',
      description: 'Official INRI Chain country meme NFT collection. Mint with iUSD and receive country reward tokens by rarity.',
      image: `${PLATFORM_URL}/nft-assets/countries/china-dragon-noodles-v2.png?v=${CACHE_VERSION}`,
      external_link: `${PLATFORM_URL}/collectibles`,
      seller_fee_basis_points: 0,
      fee_recipient: CREATOR,
    },
    null,
    2,
  ),
)

console.log(`Generated metadata for ${countries.length} countries.`)
