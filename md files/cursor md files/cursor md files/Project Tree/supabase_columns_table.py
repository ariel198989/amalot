from supabase.client import create_client
from prettytable import PrettyTable

def get_website_data():
    """Fetch all records from websites table"""
    
    SUPABASE_URL = "https://edtkidztcwbazytuoenx.supabase.co"
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkdGtpZHp0Y3diYXp5dHVvZW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTE4ODk1OSwiZXhwIjoyMDQ2NzY0OTU5fQ.tK8TCArpMtdNn-qBKZCITH79lnzDyUTkgDNFrtwFQ58"
    
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        response = supabase.table('ai_models').select("*").execute()
        
        if response.data:
            print("\n📋 Table: ai_models")
            print(f"Total records: {len(response.data)}")
            
            # Get all columns from first record
            columns = list(response.data[0].keys())
            print("\nColumns:", ", ".join(columns))
            
            # Show data
            table = PrettyTable()
            table.field_names = columns
            
            for record in response.data:
                table.add_row([
                    str(record.get(col, 'NULL')) for col in columns
                ])
            
            print("\nData:")
            print(table)
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    get_website_data() 