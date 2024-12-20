import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientsTable } from "@/components/tables/clients-table"
import { XmlFileUploader } from "@/components/xml-file-uploader"
import { useState } from "react"
import { Client } from "@/types/client"
import { XMLFile } from "@/types/xml-file"
import { XMLFieldExtractor } from "@/lib/XMLFieldExtractor"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [xmlFiles, setXmlFiles] = useState<XMLFile[]>([])
  const [parsedData, setParsedData] = useState<any[]>([])

  const handleXmlFilesExtracted = (files: XMLFile[]) => {
    setXmlFiles(files)
    const extractor = new XMLFieldExtractor()
    const parsedResults = files.map(file => extractor.processXmlContent(file.content))
    setParsedData(parsedResults)
    
    // Update clients list with the parsed data
    const newClients = parsedResults.map(result => ({
      id: result.client.id,
      first_name: result.client.firstName,
      last_name: result.client.lastName,
      email: result.client.email,
      phone: result.client.phone,
      // Add other required client fields
    }))
    setClients(prevClients => [...prevClients, ...newClients])
  }

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">רשימת לקוחות</TabsTrigger>
          <TabsTrigger value="import">ייבוא קבצי XML</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">רשימת לקוחות</h2>
            </CardHeader>
            <CardContent>
              {clients.length > 0 ? (
                <ClientsTable clients={clients} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  לא נמצאו לקוחות. אנא ייבא קבצי XML כדי להוסיף לקוחות.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">ייבוא קבצי XML</h2>
              <p className="text-sm text-gray-500">
                העלה קובץ ZIP המכיל קבצי XML לייבוא נתוני לקוחות
              </p>
            </CardHeader>
            <CardContent>
              <XmlFileUploader onXmlFilesExtracted={handleXmlFilesExtracted} />

              {xmlFiles.length > 0 && (
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">קבצים שנמצאו:</h3>
                    <div className="space-y-2">
                      {xmlFiles.map((file, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                        >
                          <span className="font-medium">{file.name}</span>
                          <span className="text-sm text-gray-500">
                            {(file.content.length / 1024).toFixed(2)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {parsedData.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">נתונים שחולצו:</h3>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(parsedData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 