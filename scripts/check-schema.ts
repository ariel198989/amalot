import { XMLFieldExtractor } from '../src/lib/XMLFieldExtractor';
import { readFileSync } from 'fs';

const checker = new XMLFieldExtractor();

try {
  const xmlContent = readFileSync(process.argv[2], { encoding: 'utf-8' });
  const result = checker.extractFieldsFromXml(xmlContent);
  console.log('Validation passed:', result);
} catch (error) {
  console.error('Validation failed:', error.message);
  process.exit(1);
}
