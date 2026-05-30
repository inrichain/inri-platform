export const INRI_COLLECTIBLES_CONTRACT = '0xA1DD3d0809501080735543f9F65E2981d5ED9cD6'
export const IUSD_ADDRESS = '0x116b2fF23e062A52E2c0ea12dF7e2638b62Fa0FC'
export const CREATOR_WALLET = '0x2bD38c91696aBa907DF9b2D4240F19e30161350C'
export const LIQUIDITY_RECEIVER = '0x4788bb6101afcadd8daccfcb57531150684da2aa'
export const INRI_EXPLORER_URL = 'https://explorer.inri.life'
export const INRI_RPC_URL = 'https://rpc.inri.life'
export const PLATFORM_URL = 'https://platform.inri.life'

export type RarityBand = {
  label: string
  range: string
  reward: string
  tone: string
}

export const rarityBands: RarityBand[] = [
  {
    label: 'Genesis Creator',
    range: '#0',
    reward: '100 tokens to creator',
    tone: 'from-amber-300/35 to-yellow-600/12',
  },
  {
    label: 'Legendary',
    range: '#1–#10',
    reward: '100 country tokens',
    tone: 'from-yellow-300/30 to-amber-700/10',
  },
  {
    label: 'Epic',
    range: '#11–#50',
    reward: '50 country tokens',
    tone: 'from-fuchsia-400/26 to-purple-800/10',
  },
  {
    label: 'Rare',
    range: '#51–#150',
    reward: '25 country tokens',
    tone: 'from-sky-400/24 to-blue-800/10',
  },
  {
    label: 'Uncommon',
    range: '#151–#300',
    reward: '10 country tokens',
    tone: 'from-emerald-400/22 to-green-800/10',
  },
  {
    label: 'Common',
    range: '#301–#500',
    reward: '5 country tokens',
    tone: 'from-white/14 to-white/[0.03]',
  },
]

export type CollectibleCountry = {
  countryId: number
  countryName: string
  countryCode: string
  memeName: string
  slug: string
  region: string
  theme: string
  accent: string
}

// Importante:
// countryId precisa seguir a mesma ordem usada no contrato com addCountry().
// A China já foi adicionada primeiro no contrato, então countryId = 1.
export const collectibleCountries: CollectibleCountry[] = [
  {
    countryId: 1,
    countryName: 'China',
    countryCode: 'CHN',
    memeName: 'Dragon Noodles',
    slug: 'china-dragon-noodles',
    region: 'Asia',
    theme: 'Street food dragon energy',
    accent: 'Dragon fire',
  },
  {
    countryId: 2,
    countryName: 'United States',
    countryCode: 'USA',
    memeName: 'Eagle Burger',
    slug: 'united-states-eagle-burger',
    region: 'North America',
    theme: 'Burger eagle collector',
    accent: 'Stars & grill',
  },
  {
    countryId: 3,
    countryName: 'Indonesia',
    countryCode: 'IDN',
    memeName: 'Komodo Boss',
    slug: 'indonesia-komodo-boss',
    region: 'Asia',
    theme: 'Komodo island boss',
    accent: 'Island roar',
  },
  {
    countryId: 4,
    countryName: 'Japan',
    countryCode: 'JPN',
    memeName: 'Samurai Sushi Cat',
    slug: 'japan-samurai-sushi-cat',
    region: 'Asia',
    theme: 'Sushi samurai cat',
    accent: 'Neon katana',
  },
  {
    countryId: 5,
    countryName: 'Taiwan',
    countryCode: 'TWN',
    memeName: 'Boba Blast',
    slug: 'taiwan-boba-blast',
    region: 'Asia',
    theme: 'Boba-powered meme coin',
    accent: 'Bubble pop',
  },
  {
    countryId: 6,
    countryName: 'Spain',
    countryCode: 'ESP',
    memeName: 'Fiesta Bull',
    slug: 'spain-fiesta-bull',
    region: 'Europe',
    theme: 'Fiesta bull energy',
    accent: 'Red fiesta',
  },
  {
    countryId: 7,
    countryName: 'Hong Kong',
    countryCode: 'HKG',
    memeName: 'Neon Dim Sum',
    slug: 'hong-kong-neon-dim-sum',
    region: 'Asia',
    theme: 'Neon street dim sum',
    accent: 'Cyber neon',
  },
  {
    countryId: 8,
    countryName: 'Portugal',
    countryCode: 'PRT',
    memeName: 'Galo da Mata',
    slug: 'portugal-galo-da-mata',
    region: 'Europe',
    theme: 'Rooster legend',
    accent: 'Azulejo gold',
  },
  {
    countryId: 9,
    countryName: 'Poland',
    countryCode: 'POL',
    memeName: 'Pierogi Knight',
    slug: 'poland-pierogi-knight',
    region: 'Europe',
    theme: 'Pierogi armor knight',
    accent: 'Steel dumpling',
  },
  {
    countryId: 10,
    countryName: 'Italy',
    countryCode: 'ITA',
    memeName: 'Pizza Mafia',
    slug: 'italy-pizza-mafia',
    region: 'Europe',
    theme: 'Pizza boss collectible',
    accent: 'Tomato gold',
  },
  {
    countryId: 11,
    countryName: 'France',
    countryCode: 'FRA',
    memeName: 'Croissant Pup',
    slug: 'france-croissant-pup',
    region: 'Europe',
    theme: 'Croissant puppy boss',
    accent: 'Paris bakery',
  },
  {
    countryId: 12,
    countryName: 'Switzerland',
    countryCode: 'CHE',
    memeName: 'Alpine Cheese',
    slug: 'switzerland-alpine-cheese',
    region: 'Europe',
    theme: 'Alpine cheese collector',
    accent: 'Swiss alpine',
  },
  {
    countryId: 13,
    countryName: 'Singapore',
    countryCode: 'SGP',
    memeName: 'Merlion Mob',
    slug: 'singapore-merlion-mob',
    region: 'Asia',
    theme: 'Merlion city boss',
    accent: 'Marina shine',
  },
  {
    countryId: 14,
    countryName: 'Netherlands',
    countryCode: 'NLD',
    memeName: 'Bike Boss',
    slug: 'netherlands-bike-boss',
    region: 'Europe',
    theme: 'Bike culture boss',
    accent: 'Orange wheel',
  },
  {
    countryId: 15,
    countryName: 'Brazil',
    countryCode: 'BRA',
    memeName: 'Samba Capy',
    slug: 'brazil-samba-capy',
    region: 'South America',
    theme: 'Samba capybara meme',
    accent: 'Carnival green',
  },
  {
    countryId: 16,
    countryName: 'Australia',
    countryCode: 'AUS',
    memeName: 'Outback Roo',
    slug: 'australia-outback-roo',
    region: 'Oceania',
    theme: 'Outback kangaroo boss',
    accent: 'Desert jump',
  },
  {
    countryId: 17,
    countryName: 'Germany',
    countryCode: 'DEU',
    memeName: 'Pretzel Boss',
    slug: 'germany-pretzel-boss',
    region: 'Europe',
    theme: 'Pretzel power boss',
    accent: 'Bavarian gold',
  },
  {
    countryId: 18,
    countryName: 'Bangladesh',
    countryCode: 'BGD',
    memeName: 'Rickshaw Tiger',
    slug: 'bangladesh-rickshaw-tiger',
    region: 'Asia',
    theme: 'Rickshaw tiger rush',
    accent: 'Dhaka speed',
  },
  {
    countryId: 19,
    countryName: 'United Kingdom',
    countryCode: 'GBR',
    memeName: 'Tea Bulldog',
    slug: 'united-kingdom-tea-bulldog',
    region: 'Europe',
    theme: 'Tea bulldog collector',
    accent: 'Royal tea',
  },
  {
    countryId: 20,
    countryName: 'South Korea',
    countryCode: 'KOR',
    memeName: 'Kimchi Champ',
    slug: 'south-korea-kimchi-champ',
    region: 'Asia',
    theme: 'Kimchi champ energy',
    accent: 'K-wave red',
  },
  {
    countryId: 21,
    countryName: 'Russia',
    countryCode: 'RUS',
    memeName: 'Bear Boss',
    slug: 'russia-bear-boss',
    region: 'Europe/Asia',
    theme: 'Bear boss collectible',
    accent: 'Ice bear',
  },
  {
    countryId: 22,
    countryName: 'India',
    countryCode: 'IND',
    memeName: 'Masala Tiger',
    slug: 'india-masala-tiger',
    region: 'Asia',
    theme: 'Masala tiger heat',
    accent: 'Spice gold',
  },
  {
    countryId: 23,
    countryName: 'Liechtenstein',
    countryCode: 'LIE',
    memeName: 'Alpine Prince',
    slug: 'liechtenstein-alpine-prince',
    region: 'Europe',
    theme: 'Alpine prince collector',
    accent: 'Mountain royal',
  },
  {
    countryId: 24,
    countryName: 'Vietnam',
    countryCode: 'VNM',
    memeName: 'Pho Rider',
    slug: 'vietnam-pho-rider',
    region: 'Asia',
    theme: 'Pho rider speed',
    accent: 'Street broth',
  },
  {
    countryId: 25,
    countryName: 'New Zealand',
    countryCode: 'NZL',
    memeName: 'Kiwi Boss',
    slug: 'new-zealand-kiwi-boss',
    region: 'Oceania',
    theme: 'Kiwi boss energy',
    accent: 'Aotearoa green',
  },
  {
    countryId: 26,
    countryName: 'Norway',
    countryCode: 'NOR',
    memeName: 'Fjord Viking',
    slug: 'norway-fjord-viking',
    region: 'Europe',
    theme: 'Fjord viking collector',
    accent: 'Nordic blue',
  },
  {
    countryId: 27,
    countryName: 'Turkiye',
    countryCode: 'TUR',
    memeName: 'Kebab Sultan',
    slug: 'turkiye-kebab-sultan',
    region: 'Europe/Asia',
    theme: 'Kebab sultan meme',
    accent: 'Sultan red',
  },
  {
    countryId: 28,
    countryName: 'Slovakia',
    countryCode: 'SVK',
    memeName: 'Tatra Wolf',
    slug: 'slovakia-tatra-wolf',
    region: 'Europe',
    theme: 'Tatra mountain wolf',
    accent: 'Carpathian ice',
  },
  {
    countryId: 29,
    countryName: 'United Arab Emirates',
    countryCode: 'ARE',
    memeName: 'Desert Falcon',
    slug: 'united-arab-emirates-desert-falcon',
    region: 'Middle East',
    theme: 'Desert falcon collector',
    accent: 'Emirates gold',
  },
  {
    countryId: 30,
    countryName: 'Philippines',
    countryCode: 'PHL',
    memeName: 'Jeepney Star',
    slug: 'philippines-jeepney-star',
    region: 'Asia',
    theme: 'Jeepney street star',
    accent: 'Island chrome',
  },
]

export function getCountryByTokenId(tokenId: number) {
  const countryId = Math.floor(tokenId / 100000)
  const serial = tokenId % 100000
  const country = collectibleCountries.find((item) => item.countryId === countryId)

  return {
    country,
    countryId,
    serial,
  }
}

export function rarityForSerial(serial: number) {
  if (serial === 0) return 'Genesis Creator'
  if (serial <= 10) return 'Legendary'
  if (serial <= 50) return 'Epic'
  if (serial <= 150) return 'Rare'
  if (serial <= 300) return 'Uncommon'
  return 'Common'
}

export function rewardForSerial(serial: number) {
  if (serial === 0) return '100'
  if (serial <= 10) return '100'
  if (serial <= 50) return '50'
  if (serial <= 150) return '25'
  if (serial <= 300) return '10'
  return '5'
}

export function imageUrlForCountry(slug: string) {
  return `/nft-assets/countries/${slug}.png`
}

export function absoluteImageUrlForCountry(slug: string) {
  return `${PLATFORM_URL}/nft-assets/countries/${slug}.png`
}
