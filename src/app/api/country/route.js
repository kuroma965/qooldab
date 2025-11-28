// src/app/api/country/route.js
import { NextResponse } from 'next/server';

// Mock data (ตัวอย่าง)
const mockCountries = [
  {
    code: 'TH',
    name: 'Thailand',
    capital: 'Bangkok',
    region: 'Asia',
    population: 69799978,
    flag: 'https://flagcdn.com/w320/th.png'
  },
  {
    code: 'JP',
    name: 'Japan',
    capital: 'Tokyo',
    region: 'Asia',
    population: 125960000,
    flag: 'https://flagcdn.com/w320/jp.png'
  },
  {
    code: 'US',
    name: 'United States',
    capital: 'Washington, D.C.',
    region: 'Americas',
    population: 331000000,
    flag: 'https://flagcdn.com/w320/us.png'
  },
  {
    code: 'FR',
    name: 'France',
    capital: 'Paris',
    region: 'Europe',
    population: 67000000,
    flag: 'https://flagcdn.com/w320/fr.png'
  },
  {
    code: 'BR',
    name: 'Brazil',
    capital: 'Brasília',
    region: 'Americas',
    population: 213000000,
    flag: 'https://flagcdn.com/w320/br.png'
  }
];

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code'); // optional query param ?code=TH
    const q = url.searchParams.get('q'); // optional search by name

    let results = mockCountries;

    if (code) {
      const found = results.find(
        (c) => c.code.toLowerCase() === code.toLowerCase()
      );
      if (!found) {
        return NextResponse.json({ error: 'country not found' }, { status: 404 });
      }
      return NextResponse.json(found);
    }

    if (q) {
      const term = q.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.capital.toLowerCase().includes(term) ||
          c.code.toLowerCase() === term
      );
    }

    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: 'server error', details: err.message }, { status: 500 });
  }
}
