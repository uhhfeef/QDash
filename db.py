import sqlite3
import pandas as pd
import os

def create_database():
    # Connect to SQLite database (creates it if it doesn't exist)
    conn = sqlite3.connect('data/dashboard.db')
    
    # Get all CSV files from data directory
    csv_files = [f for f in os.listdir('data') if f.endswith('.csv')]
    
    for csv_file in csv_files:
        try:
            # Get table name from file name (remove .csv extension)
            table_name = os.path.splitext(csv_file)[0]
            
            # Read CSV file
            print(f"Processing {csv_file}...")
            df = pd.read_csv(f'data/{csv_file}')
            
            # Convert to SQL table
            df.to_sql(
                table_name, 
                conn, 
                if_exists='replace',  # Replace if table exists
                index=False
            )
            print(f"Created table: {table_name} with {len(df)} rows")
            
        except Exception as e:
            print(f"Error processing {csv_file}: {str(e)}")
    
    # Close connection
    conn.close()
    print("\nDatabase creation completed!")

if __name__ == "__main__":
    # Create data directory if it doesn't exist
    if not os.path.exists('data'):
        os.makedirs('data')
        print("Created data directory")
    
    create_database()