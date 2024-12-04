# Sales Targets System Documentation

## Overview
The Sales Targets System is a comprehensive solution for tracking and managing sales performance across different categories. The system integrates with Supabase for data persistence and provides real-time updates of sales targets and achievements.

## Core Components

### 1. SalesTargetsContext
The central state management component that handles:
- Performance tracking and updates
- Basic sales metrics (closing rate, monthly meetings)
- Data persistence to Supabase

### 2. Sales Targets Table
A dynamic table system that displays:
- Monthly targets for each category
- Actual performance data
- Achievement percentages
- Yearly totals

## Data Structure

### Database Schema
```sql
Table: sales_targets
- category: string (e.g., 'pension-transfer', 'risks')
- month: integer (1-12)
- year: integer
- performance: numeric
```

### Categories
1. Investments & Finance
   - Risks
   - Pension
   - Pension Transfer
   - Finance Transfer
   - Regular Deposit

2. Services
   - Financial Planning
   - Family Economics
   - Employment
   - Organizational Consulting
   - Retirement
   - Organizational Recruitment
   - Loans
   - Real Estate
   - Mortgage

## Performance Tracking Logic

### Update Process
1. Fetch existing performance data for the category/month/year
2. Calculate new performance by adding the new amount
3. Upsert the updated total to the database

```typescript
const updatePerformance = async (category, amount, month) => {
  // Get existing data
  const existingData = await fetchExistingPerformance();
  
  // Calculate new total
  const newTotal = (existingData?.performance || 0) + amount;
  
  // Update database
  await upsertPerformance(category, month, year, newTotal);
};
```

### Data Loading
- Initializes empty arrays for all categories
- Loads actual performance data from Supabase
- Merges data into the display structure
- Updates UI with combined data

## Recent Fixes & Improvements

### API Response Handling
- Implemented proper error handling for 406 Not Acceptable responses
- Added `.maybeSingle()` for handling non-existent records
- Improved logging for debugging

### Performance Calculation
- Fixed accumulation logic for performance updates
- Added null checks for performance values
- Implemented proper data initialization

### Data Loading
- Added explicit error handling
- Optimized database queries
- Improved data structure initialization

## Best Practices

1. **Error Handling**
   - Comprehensive try-catch blocks
   - User-friendly error messages
   - Detailed console logging

2. **Data Integrity**
   - Initialization of empty data structures
   - Null value handling
   - Type checking and validation

3. **Performance**
   - Optimized database queries
   - Efficient state updates
   - Minimal re-renders

## Future Improvements

1. **Caching**
   - Implement local storage caching
   - Add cache invalidation strategy

2. **Performance Optimization**
   - Batch updates for multiple records
   - Implement data pagination

3. **User Experience**
   - Add loading states
   - Improve error messaging
   - Add data export functionality 