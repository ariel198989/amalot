import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { XMLFile } from '@/types/xml-file';

interface XmlFileUploaderProps {
  onXmlFilesExtracted: (files: XMLFile[]) => void;
}

export function XmlFileUploader({ onXmlFilesExtracted }: XmlFileUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        onXmlFilesExtracted([{ name: file.name, content }]);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading XML file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        accept=".xml,.zip"
        onChange={handleFileUpload}
        className="hidden"
        id="xml-file-input"
      />
      <label htmlFor="xml-file-input">
        <Button
          variant="outline"
          disabled={isLoading}
          className="cursor-pointer"
          asChild
        >
          <span>
            {isLoading ? 'מעלה קובץ...' : 'בחר קובץ XML'}
          </span>
        </Button>
      </label>
    </div>
  );
} 