
const dbConfig = require('../config/dbConfig')

const {Sequelize, DataTypes} = require('sequelize')

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,{
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        operatorAliases: false
    }
)

sequelize.authenticate()
.then(()=>{
    console.log('database connection succefull...');
    
})
.catch((err)=>{
    console.log('Error'+ err);
    
})

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize

db.students = require('./studentModel.js')(sequelize, DataTypes)
db.courses = require('./courseModel.js')(sequelize, DataTypes)
db.users = require('./authModel.js')(sequelize, DataTypes)

db.sequelize.sync({force: false})
.then(()=>{
    console.log('re-sync done');
    
})

db.students.belongsTo(db.courses, { 
    foreignKey: "course_id", 
    as: "course" // Define an alias
});

db.courses.hasMany(db.students, { 
    foreignKey: "course_id", 
    as: "students" // Define an alias
});


module.exports = db