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


@app.route("/login", methods=['POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()  # Extract JSON data from the request body
        if data is None or 'Id' not in data or 'email' not in data:
            return jsonify({"error": "Invalid request"}), 400

        studentId = data.get('Id').lower()
        email = data.get('email').lower()
        snap = data.get("snapshot")

        if email.endswith('@gmail.com') ==False:
            return jsonify({'success':False,'error':'please add @gmail'})

        if studentId.isdigit() == False:
            return jsonify({'success':False,'error':'Please full fill the blank'})

        if snap == None:
            return jsonify({'success': False, 'error': 'Photo not taken'})

        if email.strip() == '' or studentId.strip() == '':
            return jsonify({'success': False, 'error': 'Field is empty'})
        
        verified = faceAuth(snap)

        if verified == False:
            return jsonify({"success": False,"error":"Face not detected try again"})  # Existing user found
        
        face_verified = verify_face(studentId,snap)
        print(face_verified)

        conn = sqlite3.connect("sql.db")
        cursor = conn.cursor()
        query = "SELECT COUNT(*),name FROM Students WHERE studentId = ? AND email = ?"
        cursor.execute(query, (studentId, email))
        res = cursor.fetchone()
        print("res : ",res[1])
        cursor.close()
        conn.close()
        
        if res[0] >= 1:
            return jsonify({"success": True,"data":{'name':res[1],'email':email,'studentId':studentId},"error":"loggined"}), 200  # Existing user found
        else:
            return jsonify({"success": False,"error":"Account not found or wrong password"})  # User not found
    else:
        # Method Not Allowed
        return jsonify({"error": "Method not allowed"}), 405


@app.route("/register", methods=['POST'])
def register():
    if request.method == "POST":
        data = request.get_json()
        if data is None or 'Id' not in data or 'email' not in data or 'name' not in data:
            return jsonify({"success": False, "error": "Invalid request"}), 400
        
        studentId = data.get('Id').lower()
        email = data.get('email').lower()
        name = data.get('name').lower()

        photos = data.get('photos')
        
        if email.endswith('@gmail.com') ==False:
            return jsonify({'success':False,'error':'please add @gmail'})


        if studentId.isdigit() == False:
            return jsonify({'success':False,'error':'Please full fill the blank'})


        saved = saveImages(studentId,email,name,photos)
        print("saved : ",saved)

        if saved['success'] != True:
            return jsonify({'success':False,'error':saved['error']})

        conn = sqlite3.connect("sql.db")
        cursor = conn.cursor()
        query = "SELECT COUNT(*) FROM Students WHERE studentId = ? OR email = ?"
        cursor.execute(query, (studentId, email))
        res = cursor.fetchone()
        if res[0] >= 1:
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'error': 'User Already Exists'})

        if email.strip() == '' or name.strip() == '' or studentId.strip() == '':
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Field is empty'})
        
        password = "1234"
        query = "INSERT INTO Students (studentId, name, email, attempt,password) VALUES (?, ?, ?, ?,?)"
        cursor.execute(query, (studentId, name, email, 0 ,password))
        conn.commit()
        cursor.close()
        conn.close()
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

@app.route("/submit", methods=['POST'])
def submit():
    if request.method == 'POST':
        data = request.get_json()
        data_list = data["selected"]
        studentId = data['studentId']
        print("submit data : ",data_list)
        score = 0
        for i in list(data_list):
            select = data_list[i]["select"]
            correct = data_list[i]["correct"]
            if select == correct:
                score += 1

        conn = sqlite3.connect("sql.db")
        cursor = conn.cursor()        
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Format the current datetime as a string
        query = "INSERT INTO TestScores (studentId, score, submitTime) VALUES (?, ?,?)"
        cursor.execute(query,(studentId,score,current_time))
        conn.commit()            
        cursor.close()
        conn.close()

        print("score : ",score)
        return jsonify({'success':True})
    

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
        
        

@app.route("/wisper-detected", methods=["POST"])
def wisperDetection():
        print("hellow")
        if request.method == 'POST':
            data = request.get_json()
            wisper = data.get('wisper')
            snapshot = data.get('snapshot')
            studentId = data.get('studentId')
            if snapshot:
                 saveWisperImage(studentId,snapshot)
                 print("saved wispered image")
            return jsonify({'success':True})


@app.route('/upload-audio', methods=['POST'])
def upload_audio():
    audio_file = request.files['file']
    studentId = request.form.get('studentId')
    print("Audio triggered : ",studentId)
    if audio_file:
        filename = 'received_audio.webm'  # You can generate a unique filename here
        directory = f"recording/{studentId}"
        if not os.path.exists(directory):
            os.makedirs(directory)

        current_time_millis = int(round(time.time() * 1000))
        record_filename = os.path.join(directory, f"{current_time_millis}.webm")
        print("Record : ",record_filename)
        audio_file.save(record_filename)
        print("Record file saved")
        return jsonify({'success':True,"message": "File uploaded successfully"}), 200
    return jsonify({'success':False,"error": "No file provided"}), 400

@app.route('/get-image', methods=['POST'])        
def get_photo():
    data = request.json
    questionId = data.get('questionId')
    if not questionId:
        return jsonify({'success': False, 'error': 'Missing questionId'}), 400
    
    directory = f'captured/{questionId}'
    try:
        image_name = os.listdir(directory)[0]  # Assume the first file is the image.
    except IndexError:
        return jsonify({'success': False, 'error': 'No images found for this ID'}), 404

    imagefile_path = os.path.join(directory, image_name)
    if not os.path.exists(imagefile_path):
        return jsonify({'success': False, 'error': 'Image file not found'}), 404

    img = cv2.imread(imagefile_path)
    if img is None:
        return jsonify({'success': False, 'error': 'Failed to load image'}), 500

    _, buffer = cv2.imencode('.jpg', img)
    img_str = base64.b64encode(buffer).decode('utf-8')  # Encode image to base64 string

    return jsonify({'success': True, 'image': img_str})
        
if __name__ == "__main__":
    app.run(debug=True)
