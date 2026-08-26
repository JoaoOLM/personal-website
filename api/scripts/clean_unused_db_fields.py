import sqlite3
import json
import os

# Determina o caminho base (para garantir que funciona rodando da raiz ou de dentro da api/)
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
db_path = os.path.join(base_dir, "portfolio.db")

print(f"Lendo banco de dados em: {db_path}")

if not os.path.exists(db_path):
    print("ERRO: portfolio.db não encontrado. Verifique se o caminho está correto e se o arquivo existe.")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("SELECT data FROM profile_data WHERE id=1")
row = c.fetchone()

if row:
    db_data = json.loads(row[0])
    
    # Remove unused fields
    removed_items = []

    if "profile" in db_data and "location" in db_data["profile"]:
        del db_data["profile"]["location"]
        removed_items.append("profile.location")
        
    if "personal_space" in db_data:
        if "current_reading" in db_data["personal_space"]:
            del db_data["personal_space"]["current_reading"]
            removed_items.append("personal_space.current_reading")
        if "preferences_and_stack" in db_data["personal_space"]:
            del db_data["personal_space"]["preferences_and_stack"]
            removed_items.append("personal_space.preferences_and_stack")
            
    if "master_degree" in db_data:
        if "area" in db_data["master_degree"]:
            del db_data["master_degree"]["area"]
            removed_items.append("master_degree.area")
        if "status" in db_data["master_degree"]:
            del db_data["master_degree"]["status"]
            removed_items.append("master_degree.status")
            
    if removed_items:
        # Update db
        c.execute("UPDATE profile_data SET data=? WHERE id=1", (json.dumps(db_data, ensure_ascii=False),))
        conn.commit()
        print("Sucesso! Os seguintes campos inúteis foram removidos da produção:")
        for item in removed_items:
            print(f" - {item}")
    else:
        print("Nenhum campo inútil foi encontrado. O banco de dados já parece estar limpo.")
else:
    print("ERRO: Nenhum dado de profile_data foi encontrado no banco de dados.")

conn.close()
