
import sqlite3
import pandas as pd

df = pd.read_csv('data/orders.csv')

conn = sqlite3.connect('data/orders.db')
df.to_sql('orders', conn, if_exists='replace', index=False)
conn.close()

print("Database created successfully")