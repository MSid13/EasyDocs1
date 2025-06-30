


# =============================
#  🚨 EasyDocs Database Utility 🚨
# =============================
#
# 🟨🟨🟨  READ THIS BEFORE USING!  🟨🟨🟨
#
# ⚠️  Deleting or modifying data is IRREVERSIBLE. Always make a backup first!  ⚠️
# 🟥  Make sure this file AND the database are NOT publicly accessible. If they are, it's a MAJOR security risk. 🔒
#
# 🟡 This script is for admins/developers to:
#   • 🟦 View all tables and their contents
#   • 🟩 Add, remove, or update users
#   • 🟩 Change user passwords (bcrypt)
#   • 🟥 Wipe all data (with confirmation)
#   • 🟦 Backup the database (auto-backup on every run)
#
# 📝 Usage:
#   1️⃣  Uncomment the section you need (see below)
#   2️⃣  Edit parameters as needed (e.g., username/password)
#   3️⃣  Run: python manage_db.py
#   4️⃣  Comment the section again after use
#
# 🚩 All lines with the emoji warnings (🟥, 🟨, ⚠️, and 🚨) are VERY important. Make sure to read them carefully!
#
# ─────────────────────────────────────────────────────────────
#
# 🚨🚨🚨  IF YOU DON'T UNDERSTAND WHAT THIS FILE DOES, DO NOT USE IT!  🚨🚨🚨
#
# ─────────────────────────────────────────────────────────────

import sqlite3
import os
import shutil
from datetime import datetime

# ⚠️ WARNING: Deleting or modifying data is irreversible. Always make a backup first!
# To change the admin password, uncomment the section near the bottom, set username/password, and run this script once.

import bcrypt

def view_tables(cursor):
    print("\n🟦 Tables in database:")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    for t in tables:
        print(f"  • {t[0]}")
    return [t[0] for t in tables]

def print_table_contents(cursor, tables):
    for t in tables:
        print(f"\n⬇️ Contents of table '{t}':")
        try:
            cursor.execute(f"SELECT * FROM {t}")
            rows = cursor.fetchall()
            if not rows:
                print("    (empty)")
            else:
                for row in rows:
                    print("   ", row)
        except Exception as e:
            print("    Error reading table:", e)

# ⚠️ WARNING: Deleting or modifying data is irreversible. Always make a backup first!

def change_user_password(cursor, username, new_password):
    """Change a user's password (bcrypt-hashed)."""
    hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    cursor.execute("UPDATE users SET password_hash = ? WHERE username = ?", (hashed, username))
    print(f"🟩 Password for user '{username}' updated.")

def remove_user(cursor, username):
    """Remove a user by username."""
    cursor.execute("DELETE FROM users WHERE username = ?", (username,))
    print(f"🟧 User '{username}' removed (if existed).")

def add_user(cursor, username, password):
    """Add a new user with a bcrypt-hashed password."""
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, hashed))
    print(f"🟩 User '{username}' added.")

def clear_all_tables(password, cursor, tables):
    """Delete all data in all tables (requires password confirmation)."""
    if password == "DELETEALLDATA":
        print("🟥🟥🟥 Clearing ALL data from ALL tables... 🟥🟥🟥")
    else:
        print("🟨 You did not agree. Aborting to clear data. (You must type 'DELETEALLDATA' to confirm, no database changes were made.)")
        return
    for t in tables:
        cursor.execute(f"DELETE FROM {t}")
        print(f"🟥 All data removed from table '{t}'.")

def backup_database(db_path='easydocs.db', backup_dir='Database_Backups'):
    """Backup the database file to a timestamped copy in Database_Backups."""
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = os.path.join(backup_dir, f'easydocs_backup_{timestamp}.db')
    shutil.copy2(db_path, backup_path)
    print(f"🟦 [Backup] Database backed up to: {backup_path}")



# ⚠️ WARNING: Deleting or modifying data is irreversible. Always make a backup first!

# Please make sure you have read the warnings & instructions at the top of this file before using it. There are warning comments throughout the file, however, 
# it is your responsibility to ensure you understand the risks of using this file.


# 🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨⚠️ Read all warnings before continuing ⚠️🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨 #

if __name__ == "__main__":
    print("\n🚨🚨🚨  EasyDocs Database Utility Started  🚨🚨🚨\n")
    print("🟦 [INFO] A backup will be created before any changes.\n")
    # --- Backup database before making any changes ---
    backup_database()

    conn = sqlite3.connect('easydocs.db')
    cursor = conn.cursor()

    # View all tables and their contents
    print("\n🟦 [INFO] Viewing all tables and their contents...\n")
    tables = view_tables(cursor)
    print_table_contents(cursor, tables)

    print("\n🟨 [INFO] Admin actions are below. Uncomment ONE section, edit as needed, then run this script. (after editing you will have to rerun) 🟨\n")

    # ---- Change user password ----
    # username = "admin"  # Change to the username you want
    # new_password = "admin123"  # Change to the new password
    # change_user_password(cursor, username, new_password)
    # conn.commit()

    # ---- Remove a user ----
    # username = "user_to_remove"
    # remove_user(cursor, username)
    # conn.commit()

    # ---- Add a user ----
    # username = "newuser"
    # password = "newpassword"
    # add_user(cursor, username, password)
    # conn.commit()

    # ---- Delete all data in all tables ----
    # =============================
    # 🟥 !!! Replace "a" with "DELETEALLDATA" to confirm you want to delete all data !!!
    # 🟥 After you delete all data, you will need to recreate the admin user using the "Add a user" section above.
    # 🟥 Also, make sure to change "DELETEALLDATA" to something else after you run this once, to avoid accidental deletions in the future.
    # 🚨⚠️🚨 WARNING: This will remove **ALL data**! Use with caution. (This is not reversible)
    # =============================

    # 🟥 ⬇️ 🟥 Make sure to read the warnings above before uncommenting this line 🟥 ⬇️ 🟥

# 🟥🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟥⚠️ Read all warnings before continuing ⚠️🟥🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟥 #

    # clear_all_tables("a", cursor, tables) # 🟥 !! ⚠️ WARNING ⚠️ !! -- Uncommenting this line will delete all data in all tables. -- Be very sure you want to do this -- 🟥
    # conn.commit()

    print("\n🟦 [INFO] Closing database connection.\n")
    conn.close() # 🟥 do not comment this line out (no matter what action, this should always run at the end of the script)


