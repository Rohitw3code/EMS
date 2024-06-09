from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
from SqlCommand import *
from FaceAuth import *
import re

app = Flask(__name__)
CORS(app)


@app.route("/")
def home_page():
    return jsonify({"success": True})


@app.route("/add-question", methods=['POST'])
def addQuestion():
    print("Attempt to add question")
    if request.method == 'POST':
        data = request.get_json()
        
        question_data = (
            data.get('question'),
            data.get('optionA'),
            data.get('optionB'),
            data.get('optionC'),
            data.get('optionD'),
            data.get('correctOption')
        )

        # Check if any field is empty
        if any(not field for field in question_data):
            return jsonify({'success': False, 'error': 'All fields are required'})

        try:
            conn = sqlite3.connect("sql.db")
            cursor = conn.cursor()
        
            query = "INSERT INTO questions (question, optionA, optionB, optionC, optionD, correctAnswer) " \
                    "VALUES (?, ?, ?, ?, ?, ?)"
            
            cursor.execute(query, question_data)
            conn.commit()
        except Exception as e:
            print(f"Error adding question: {e}")
            return jsonify({'success': False, 'error': 'Database error'})
        finally:
            cursor.close()
            conn.close()
        
        print("Question added")
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Invalid request method'})        

@app.route("/get-questions", methods=['GET'])
def showQuestions():
    if request.method == 'GET':
        conn = sqlite3.connect("sql.db")
        cursor = conn.cursor()
        query = "SELECT * FROM questions"
        cursor.execute(query)
        questions = cursor.fetchall()
        cursor.close()
        conn.close()  
        questions_list = []
        for question in questions:
            questions_list.append({
                "id": question[0],
                "question": question[1],
                "optionA": question[2],
                "optionB": question[3],
                "optionC": question[4],
                "optionD": question[5],
                "correctAnswer": question[6]
            })
        return jsonify({"questions": questions_list})
    

@app.route('/get-testscore', methods=['GET'])
def get_testscore():
    student_id = request.args.get('studentId')
    conn = sqlite3.connect("sql.db")
    cursor = conn.cursor()
    query = "SELECT * FROM TestScores where studentId == ?"
    cursor.execute(query,(student_id,))
    test_score = cursor.fetchall()
    cursor.close()
    conn.close()  
    scores = []
    for i in test_score:
        scores.append({'testId':i[0],
                       'studentId':i[1],
                       'score':i[2],
                       'submitTime':i[3]})
    print("test score studentId : ",test_score,student_id)   
    return jsonify({'success':True,'scores':scores})

    
@app.route('/get-photos', methods=['GET'])
def get_photos():
    student_id = request.args.get('studentId')
    print("studentId : ",student_id)   
    directory = f"wisper\{student_id}"
    if not os.path.exists(directory):
        os.makedirs(directory)
    face_names = os.listdir(directory)
    images = []
    for name in face_names:
        face_filename = os.path.join(directory, name)
        with open(face_filename, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            images.append(f"data:image/jpeg;base64,{encoded_string}")

    # print("images : ",images)
    return jsonify({'studentId': student_id, 'images': images})


@app.route("/get-student-detail", methods=['POST'])
def get_student():
    if request.method == 'POST':
        data = request.get_json()
        studentId = data.get('studentId')
        conn = sqlite3.connect("sql.db")
        cursor = conn.cursor()
        query = "SELECT * FROM Students WHERE studentId = ?"
        cursor.execute(query, (studentId,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if row is None:
            return jsonify({'error': 'Student not found'}), 404
        return jsonify({'success':True,'student':{'studentId':row[0],'name':row[1],'email':row[2],'attempt':row[3]}})

@app.route("/get-students")
def get_students():
    try:
        conn = sqlite3.connect("sql.db")
        cursor = conn.cursor()        
        query = "SELECT * FROM Students"
        cursor.execute(query)
        students = cursor.fetchall()
        student_list = []
        for student in students:
            student_dict = {
                "studentId": student[0],
                "name": student[1],
                "email": student[2],
                "attempt": student[3]
            }
            student_list.append(student_dict)        
        cursor.close()
        conn.close()        
        return jsonify({"students": student_list})

    except Exception as e:
        return jsonify({"error": str(e)})
    

@app.route('/delete-student', methods=['POST'])
def delete_students():
    if request.method == 'POST':
        data = request.get_json()
        studentId = data.get('studentId')
        delete_student(studentId)
        directory = f"captured/{studentId}"
        delete_files_in_directory(directory)
        return jsonify({'success': True}), 200
    

@app.route("/delete-question", methods=["POST"])
def delete_question_endpoint():
    if request.method == 'POST':
        data = request.get_json()
        question_id = data.get('question_id')
        success, error = delete_question(question_id)
        if success:
            return jsonify({"success": True, "message": f"Question with ID {question_id} deleted successfully."}), 200
        else:
            return jsonify({"success": False, "error": error}), 500
