export const CustomerJourneyComponent = () => {
  return (
    <div>
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
    </div>
  );
};

export default CustomerJourneyComponent; 