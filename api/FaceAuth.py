import cv2
from PIL import Image
import base64
import cv2
import numpy as np
import random as rd
from flask import Flask, request, jsonify
import os
from deepface import DeepFace
import shutil
import time


def saveWisperImage(studentId,snap):
    directory = f"wisper/{studentId}"
    if not os.path.exists(directory):
        os.makedirs(directory)
    image_bytes = base64.b64decode(snap.split(',')[1])
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    current_time_millis = int(round(time.time() * 1000))
    face_filename = os.path.join(directory, f"{current_time_millis}.png")
    cv2.imwrite(face_filename, img_np)


def faceAuth(snap):
    image_bytes = base64.b64decode(snap.split(',')[1])
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = face_cascade.detectMultiScale(
        img_np,
        scaleFactor=1.3,
        minNeighbors=3,
        minSize=(30, 30)
    )    
    if len(faces) > 0:
        return True
    else:
        return False

def checkFacePresent(path):
    img_np = cv2.imread(path,cv2.IMREAD_COLOR)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = face_cascade.detectMultiScale(
        img_np,
        scaleFactor=1.3,
        minNeighbors=3,
        minSize=(30, 30)
    )    
    if len(faces) > 0:
        return True
    else:
        return False
    
def saveImages(studentId, email, student_name, photos):
    # try:
        directory = f"captured/{studentId}"
        if not os.path.exists(directory):
            os.makedirs(directory)
        
        print(f"Number of photos received: {len(photos)} ",studentId)
        
        # Process each photo
        for index, snap in enumerate(photos):
            # Decode the image from Base64
            image_bytes = base64.b64decode(snap.split(',')[1])
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            face_filename = os.path.join(directory, f"{student_name}_photo{index+1}_face{index+1}.png")
            cv2.imwrite(face_filename, img_np)
            
            print(f"Face saved: {face_filename}")
        res = get_relative_paths(studentId)
        return res


def get_relative_paths(studentId):
    user_image_path = f"./captured/{studentId}/"
    user_image_path = user_image_path+os.listdir(user_image_path)[0]

    if checkFacePresent(user_image_path) == False:
        return {'success':False,'error':'Face Not Detected'}

    for folder in os.listdir("./captured"):
        temp_image = f"./captured/{folder}/"
        if studentId in str(temp_image):
            continue
        for img in os.listdir(temp_image):
            temp_image_path = temp_image+img
            try:
                print('matching : ',user_image_path,temp_image_path)

                res = DeepFace.verify(img1_path=user_image_path, img2_path=temp_image_path)

                print(temp_image_path,res['verified'])
                if res['verified']:
                    return {'success':'False','error':'User Already Exist'}
            except Exception as e:
                print("Error ",e)
                return {'success':False,'error':'Problem with captured image'}

    return {'success':True,'error':'no error'}




def verify_face(studentId,snap):
    try:
        directory = f"captured\{studentId}"
        face_name = os.listdir(directory)
        for name in face_name:
            face_filename = os.path.join(directory,name)
            print('matching with ',face_filename)
            image_bytes = base64.b64decode(snap.split(',')[1])
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            cv2.imwrite('snapshot.png', img_np)

            print(face_filename)
            res = DeepFace.verify(img1_path=face_filename,img2_path='snapshot.png')
            print(res)
            if res == None:
                continue
            if res['verified']:
                return {'verified':True,'error':'Verified'}
        else:
            return {'verified':False,'error':'Face does not match'}
    except:
        return {'verified':False,'error':'Not Verified'}

    

