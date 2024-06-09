import sqlite3

conn = sqlite3.connect("sql.db")
cursor = conn.cursor()
print("DB init")

# create Test score

# query = '''
# CREATE TABLE TestScore (
#     testId INTEGER PRIMARY KEY AUTOINCREMENT,
#     studentId VARCHAR(100),
#     score INTEGER
# );
# '''

# cursor.execute(query)
# conn.commit()

# cursor.close()
# conn.close()

# cursor = conn.cursor()
# studentId = "exam01"
# score = 10

# cursor.execute('INSERT INTO TestScore (studentId, score) VALUES (?, ?)', (studentId, score))

cursor.execute('ALTER TABLE Students ADD password varchar(255);')

conn.commit()  # Commit the transaction to save the data
cursor.close()
conn.close()


# create student table

# query = '''CREATE TABLE Students (
#     studentId VARCHAR(100) PRIMARY KEY,
#     name VARCHAR(100),
#     email VARCHAR(100),
#     attempt INT
# );
# '''

#---Question  table

# query = '''
# CREATE TABLE questions (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     question TEXT,
#     optionA TEXT,
#     optionB TEXT,
#     optionC TEXT,
#     optionD TEXT,
#     correctAnswer TEXT
# );
# '''

# cursor.execute(query)
# conn.commit()

# Question Add

# dummy_values = [
#     ("What is the capital of France?", "Paris", "London", "Berlin", "Rome", "Paris"),
#     ("Who is the first President of the United States?", "George Washington", "Thomas Jefferson", "John Adams", "Abraham Lincoln", "George Washington"),
#     ("What is the chemical symbol for water?", "H2O", "CO2", "O2", "CH4", "H2O")
# ]

# insert_query = "INSERT INTO questions (question, optionA, optionB, optionC, optionD, correctAnswer) VALUES (?, ?, ?, ?, ?, ?)"
# cursor.executemany(insert_query, dummy_values)
# conn.commit()

# cursor.close()


# ----- Register ---------------

# query = '''INSERT INTO Students (studentId, name, email, attempt)
# VALUES ("exam001", 'John Doe', 'john.doe@example.com', 1);
# '''

# res = cursor.execute(query)
# conn.commit()

#----Login----------------------

# studentId_to_check = 'exam001'
# email_to_check = 'john.doe@example.com'
# query = "SELECT COUNT(*) FROM Students WHERE studentId = ? AND email = ?"
# cursor.execute(query, (studentId_to_check, email_to_check))

# res = cursor.fetchone()
# if res[0] >= 1:
#     print("Student Exist")
# else:
#     print("No user found")
# print(res)
# cursor.close()