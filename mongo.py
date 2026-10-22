from pymongo import MongoClient
import certifi

uri = "mongodb+srv://karlylaischool_db_user:0wE7yJUHVpvrbqds@cluster0.tsask7c.mongodb.net"

client = MongoClient(
    uri,
    serverSelectionTimeoutMS=5000,
    tlsCAFile=certifi.where(),   # <-- this line fixes it
)

try:
    client.admin.command("ping")
    print("✅ Connected successfully")
except Exception as e:
    print("❌ Failed:", type(e).__name__)
    print(e)
finally:
    client.close()