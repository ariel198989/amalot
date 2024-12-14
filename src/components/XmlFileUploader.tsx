import { XMLFieldExtractor, YeshutLakoach, YeshutMaasik } from '../lib/XMLFieldExtractor';
import JSZip from 'jszip';
import React from 'react';

interface Props {
  onUploadComplete?: (results: Array<{
    fileName: string;
    data: {
      lakoach: YeshutLakoach;
      maasik: YeshutMaasik;
    };
    report: string;
    clientData: any;
  }>) => void;
}

const XmlFileUploader: React.FC<Props> = ({ onUploadComplete }) => {
  const extractor = new XMLFieldExtractor();

  const processZipFile = async (file: File) => {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      const xmlFiles: Array<{ name: string; content: string }> = [];
      
      await Promise.all(
        Object.keys(zipContent.files).map(async (fileName) => {
          if (fileName.endsWith('.xml')) {
            const content = await zipContent.files[fileName].async('text');
            xmlFiles.push({ name: fileName, content });
          }
        })
      );

      const results = await Promise.all(xmlFiles.map(async (xmlFile) => {
        const result = extractor.extractFieldsFromXml(xmlFile.content);
        const clientData = extractor.extractClientData(result.data);
        return {
          fileName: xmlFile.name,
          data: result.data,
          report: result.report,
          clientData
        };
      }));

      console.log('Processed files:', results);
      onUploadComplete?.(results);

    } catch (error) {
      console.error('Error processing zip file:', error);
      throw error;
    }
  };

  return (
    <div>
      {/* ... rest of the component JSX ... */}
    </div>
  );
};

export default XmlFileUploader;