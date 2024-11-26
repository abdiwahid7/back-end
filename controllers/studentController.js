const { where } = require('sequelize')
const db = require('../models/indexStart')
const creatError = require('http-errors')

const Student = db.students
const Course = db.courses

module.exports = {


    addStudent: async (req, res, next) => {
        try {
            const { firstname, lastname, gender, coursename } = req.body;
    
            // Find the course_id based on the coursename
            const course = await Course.findOne({ where: { coursename } });
    
            if (!course) {
                return res.status(404).send({ message: "Course not found" });
            }
    
            // Create the new student with the course_id
            const newStudent = await Student.create({
                firstname,
                lastname,
                gender,
                course_id: course.course_id, // Link the student with the course
            });
    
            // Fetch the new student with the associated course
            const createdStudent = await Student.findOne({
                where: { student_id: newStudent.student_id },
                include: [
                    {
                        model: Course,
                        as: 'course', // Alias as defined in associations
                        attributes: ['coursename'],
                    },
                ],
            });
    
            res.status(201).send(createdStudent);
        } catch (error) {
            next(error);
        }
    },
    


    getAllStudents: async (req, res, next) => {
        try{
            const students = await Student.findAll({})
            res.status(200).send(students)
        }
        catch(err){
            console.log(err)
        }
    },

    getStudent: async (req, res, next) => {
        try{
            const id = req.params.student_id
            const student = await Student.findOne({where: {student_id: id}})
            if(!student){
                throw (creatError(404), 'Student does not exist')
            }
            res.status(200).send(student)
        }
        catch(error){
            next(error)
        }
    },



    getAllStudentWithCourse: async (req, res, next) => {
        try {
            const students = await Student.findAll({
                include: [
                    {
                        model: Course,
                        as: 'course', // Use the alias defined in the association
                        attributes: ['coursename'],
                    },
                ],
            });
            res.status(200).send(students);
        } catch (error) {
            next(error);
        }
    },
    
    

    getOneStudentWithCourse: async (req, res, next) => {
        try {
            const id = req.params.student_id;
    
            // Use the alias 'course' defined in the association
            const student = await Student.findOne({
                where: { student_id: id },
                include: [
                    {
                        model: Course,
                        as: 'course',  // Ensure this matches the alias from the association
                        attributes: ['coursename']
                    },
                ],
            });
    
            if (!student) {
                return res.status(404).send({ message: "Student not found" });
            }
    
            res.status(200).send(student);
        } catch (error) {
            next(error);
        }
    },
    

    updateStudent: async (req, res, next) => {
        try {
            const id = req.params.student_id;
            console.log("Request body:", req.body); // Log received data
            const [updated] = await Student.update(req.body, { where: { student_id: id } });
    
            if (updated === 0) {
                throw creatError(404, 'Student does not exist');
            }
    
            res.status(200).send(`Student with id ${id} has been updated`);
        } catch (error) {
            next(error);
        }
    },
    
    

    deleteStudent: async(req, res, next) => {
        try{
            const id = req.params.student_id
            const student = await Student.destroy({where: {student_id: id}})
            res.status(200).send(`Student with id ${id} has been deleted`)
        }
        catch(error){
            next(error)
        }
    }


}