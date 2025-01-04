export const CustomerJourneyComponent = () => {
  return (
    {step === 'journey' && (
      <motion.div variants={staggerContainer}>
        <ResultsTable
          data={clients}
          columns={columns}
          onDownload={handleDownload}
          onShare={() => {}}
          onClear={() => setClients([])}
          customerName={clientName}
        />
      </motion.div>
    )} 