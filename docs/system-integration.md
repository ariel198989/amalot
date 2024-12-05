# System Integration Documentation

## Overview
This document outlines the integration between the main system modules:
- Customer Journey (מסע לקוח)
- Agent Agreements (הסכמי סוכן)
- Reports (דוחות)
- Annual Plan (תכנית שנתית)

## Data Flow

### 1. Customer Journey → Sales Targets
- Updates performance metrics in real-time
- Categories tracked:
  - `risks` - Insurance premiums
  - `pension-transfer` - Pension accumulation
  - `finance-transfer` - Investment amounts
  - `regular-deposit` - Policy amounts

### 2. Customer Journey → Reports
- Saves detailed sales data to respective tables:
  - `pension_sales`
  - `insurance_sales`
  - `investment_sales`
  - `policy_sales`
- Each sale includes:
  - Client details
  - Product details
  - Commission calculations
  - Journey tracking ID

### 3. Agent Agreements → Customer Journey
- Provides commission rates for calculations
- Supports multiple companies:
  - מגדל
  - מורה
  - כלל
  - הראל
  - הפניקס
- Commission types:
  - Scope commission (עמלת היקף)
  - Monthly commission (נפרעים)
  - Accumulation commission (עמלה על צבירה)

### 4. Annual Plan → Sales Targets
- Sets yearly targets for:
  - Monthly meetings
  - Closing rates
  - Product-specific goals
- Targets affect commission calculations and performance tracking

## Database Structure

### Sales Tables
```sql
pension_sales
- user_id
- journey_id
- client_details
- commission_details
- product_details

insurance_sales
- user_id
- journey_id
- client_details
- commission_details
- product_details

investment_sales
- user_id
- journey_id
- client_details
- commission_details
- product_details

policy_sales
- user_id
- journey_id
- client_details
- commission_details
- product_details
```

### Performance Tracking
```sql
sales_targets
- user_id
- category
- month
- year
- performance
```

## Key Features

### Customer Journey (מסע לקוח)
1. Real-time commission calculations
2. Multi-product journey tracking
3. Automatic performance updates
4. Export to reports functionality

### Agent Agreements (הסכמי סוכן)
1. Company-specific commission rates
2. Product-type variations
3. Dynamic rate calculations
4. Integration with sales process

### Reports (דוחות)
1. Comprehensive sales data
2. Commission summaries
3. Performance tracking
4. Historical data access

### Annual Plan (תכנית שנתית)
1. Target setting
2. Performance monitoring
3. Goal tracking
4. Integration with sales targets

## Security

### Row Level Security (RLS)
- All tables implement RLS
- Users can only access their own data
- Policies for:
  - SELECT
  - INSERT
  - UPDATE operations

### Data Validation
1. Client data validation
2. Commission calculations verification
3. Performance updates validation
4. Target achievement checks

## Integration Points

### 1. Customer Journey Entry
```typescript
// Updates sales targets
updatePerformance(category, amount, month)

// Saves to sales tables
saveSaleDetails(type, data)

// Updates reports
sendToReports(journeyData)
```

### 2. Commission Calculations
```typescript
// Gets rates from agent agreements
calculateCommissions(type, company, ...params)

// Updates sales records
updateCommissions(saleId, commissions)
```

### 3. Performance Tracking
```typescript
// Updates targets
updateTargets(category, performance)

// Checks against annual plan
checkTargetAchievement(category, amount)
```

## Error Handling

### 1. Sales Process
- Commission calculation errors
- Data validation failures
- Database insertion errors

### 2. Performance Updates
- Target update failures
- Data consistency checks
- Real-time update errors

### 3. Report Generation
- Data aggregation errors
- Export failures
- Integration errors

## Future Improvements

### Planned Features
1. Enhanced reporting capabilities
2. Advanced commission calculations
3. Improved target tracking
4. Better data visualization

### Technical Debt
1. Schema optimization
2. Performance improvements
3. Code refactoring
4. Testing coverage 