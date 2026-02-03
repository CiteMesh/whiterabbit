import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export async function GET() {
  try {
    // Read OpenAPI spec from specs directory (3 levels up from this file)
    const specPath = path.join(process.cwd(), '..', '..', 'specs', 'openapi.yaml');
    const yamlContent = fs.readFileSync(specPath, 'utf8');
    const spec = yaml.load(yamlContent);

    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to load OpenAPI spec:', error);
    return NextResponse.json(
      { error: 'Failed to load OpenAPI specification' },
      { status: 500 }
    );
  }
}
