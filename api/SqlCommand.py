import sqlite3
import os

def delete_question(question_id):
    try:
        conn = sqlite3.connect("sql.db")
        cursor = conn.cursor()
        query = "DELETE FROM questions WHERE id = ?"
        cursor.execute(query, (question_id,))
        conn.commit()
        
        # Close the cursor and connection
        cursor.close()
        conn.close()
        
        return True, None  # Deletion successful, no error

    except Exception as e:
        return False, str(e)  # Error occurred during deletion

def delete_student(student_id):
    try:
        conn = sqlite3.connect("sql.db")
        cursor = conn.cursor()
        query = "DELETE FROM Students WHERE studentId = ?"
        cursor.execute(query, (student_id,))
        conn.commit()        
        cursor.close()
        conn.close()
        return True, None  # Deletion successful, no error

    except Exception as e:
        return False, str(e)  # Error occurred during deletion

def delete_files_in_directory(directory_path):
    try:
        for item in os.listdir(directory_path):
            file_path = os.path.join(directory_path, item)
            if os.path.isfile(file_path):
                os.remove(file_path)
                os.rmdir(directory_path)
                print(f"Deleted file: {file_path}")
            else:
                print(f"Skipped directory: {file_path}")

    except FileNotFoundError:
        print("Error: The directory does not exist.")
    except PermissionError:
        print("Error: You do not have permission to delete some or all of the files.")
    except Exception as e:
        print(f"An error occurred: {e}")