const Student = require("../models/Student");
const bcrypt = require("bcrypt");
const generatePassword = require("../utils/generatePassword");

const registerStudent = async (req, res) => {
  const { name, surname, studentNumber, country } = req.body;

  try {
    const generatedEmail = `${studentNumber}@schoolmail.com`;
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newStudent = new Student({
      name,
      surname,
      studentNumber,
      email: generatedEmail,
      password: hashedPassword,
      country
    });

    await newStudent.save();

    res.status(201).json({
      message: "Öğrenci başarıyla kaydedildi!",
      email: generatedEmail,
      password: plainPassword
    });
  } catch (error) {
    res.status(500).json({
      message: "Kayıt sırasında hata oluştu",
      error: error.message
    });
  }
};

const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Böyle bir kullanıcı yok" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Şifre hatalı" });
    }

    res.status(200).json({
      message: "Giriş başarılı!",
      student: {
        name: student.name,
        surname: student.surname,
        email: student.email,
        studentNumber: student.studentNumber
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Giriş sırasında hata oluştu",
      error: error.message
    });
  }
};

module.exports = {
  registerStudent,
  loginStudent
};