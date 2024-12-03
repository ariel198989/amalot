import requests
from prettytable import PrettyTable

def get_db_schema():
    SUPABASE_URL = "https://lbnvoiuqdoljiujsxbiu.supabase.co"
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxibnZvaXVxZG9saml1anN4Yml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2NTE2ODksImV4cCI6MjA0ODIyNzY4OX0.yah085dTce9-qIzI4BHG-BbPrVDiXsYkIqn39jGyQHk"
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    try:
        print(f"\n📋 Table: profiles")
        
        # Get profiles table structure
        profiles_url = f"{SUPABASE_URL}/rest/v1/profiles"
        response = requests.get(
            f"{profiles_url}?select=*&limit=1", 
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            if data:
                pt = PrettyTable()
                pt.field_names = ["Column Name"]
                
                # Get column names from the first row
                columns = data[0].keys()
                for column in columns:
                    pt.add_row([column])
                
                print(pt)
            else:
                print("No data in profiles table")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {str(e)}")
        if 'response' in locals():
            print(f"Response: {response.text}")

if __name__ == "__main__":
    get_db_schema()