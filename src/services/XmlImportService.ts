import { XMLParser, X2jOptions } from 'fast-xml-parser';

export class XmlImportService {
  private parser: XMLParser;

  constructor() {
    const options: X2jOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      allowBooleanAttributes: true,
      parseAttributeValue: true,
      trimValues: true
    };

    this.parser = new XMLParser(options);
  }

  parseXmlContent(xmlContent: string) {
    try {
      return this.parser.parse(xmlContent);
    } catch (error) {
      console.error('Error parsing XML:', error);
      throw new Error('Failed to parse XML content');
    }
  }

  processXmlFiles(xmlFiles: { name: string; content: string }[]) {
    return xmlFiles.map(file => ({
      name: file.name,
      data: this.parseXmlContent(file.content)
    }));
  }
}
