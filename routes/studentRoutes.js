const express = require('express')
const routes = express.Router()
const studentController = require('../controllers/studentController')
const  {verifyAccessToken, verifyRefreshToken, restrict} = require('../helpers/JWT')



routes.post('/addStudent',verifyAccessToken, restrict("admin"), studentController.addStudent)


routes.get('/getAllStudents', verifyAccessToken, studentController.getAllStudents)

routes.get('/getStudent/:student_id',verifyAccessToken, restrict("admin"), studentController.getStudent)

routes.get('/getAllStudentWithCourse',verifyAccessToken, studentController.getAllStudentWithCourse);

routes.get('/getOneStudentWithCourse/:student_id',  studentController.getOneStudentWithCourse)

routes.patch('/updateStudent/:student_id',  studentController.updateStudent)

routes.delete('/deleteStudent/:student_id', studentController.deleteStudent)


module.exports = routes