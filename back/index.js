const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();

const connectionString =
  "mongodb+srv://admin:dataCluster1@cluster0.qrlrgxr.mongodb.net/";

const client = new MongoClient(connectionString);

let conn;
let db;

app.use(cors());
app.use(express.json());

async function connect() {
  if (conn && db) {
    return;
  }
  try {
    conn = await client.connect();
    db = conn.db("dentistry_clinic_admin");
  } catch (e) {
    console.error(e);
  }
}

connect();

// doctors collection

app.get("/dentistry_clinic_admin/doctors", async (req, res) => {
  try {
    await connect();
    const collection = db.collection("doctors");
    const results = await collection.find({}).toArray();
    res.json(results);
  } catch (e) {
    console.error("Error fetching doctors:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/dentistry_clinic_admin/doctors/:id", async (req, res) => {
  try {
    await connect();
    const objectId = new ObjectId(req.params.id);
    const collection = db.collection("doctors");
    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json({ message: "Doctor deleted successfully" });
  } catch (e) {
    console.error("Error deleting doctor:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/dentistry_clinic_admin/doctors/", async (req, res) => {
  try {
    await connect();
    const collection = db.collection("doctors");
    const newDoctor = req.body;

    // validation

    const result = await collection.insertOne(newDoctor);
    res.json({
      message: "Doctor added successfully",
      doctorId: result.insertedId,
    });
  } catch (e) {
    console.error("Error adding new doctor:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/dentistry_clinic_admin/doctors/:id", async (req, res) => {
  try {
    await connect();
    const objectId = new ObjectId(req.params.id);
    const collection = db.collection("doctors");
    const editedInfo = req.body;

    const updateFields = {};
    if (editedInfo.name) {
      updateFields.name = editedInfo.name;
    }
    if (editedInfo.specialization) {
      updateFields.specialization = editedInfo.specialization;
    }
    if (editedInfo.contactInfo) {
      updateFields.contactInfo = {};
      if (editedInfo.contactInfo.phone) {
        updateFields.contactInfo.phone = editedInfo.contactInfo.phone;
      }
      if (editedInfo.contactInfo.email) {
        updateFields.contactInfo.email = editedInfo.contactInfo.email;
      }
    }

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json({ message: "Doctor information updated successfully" });
  } catch (e) {
    console.error("Error editing doctor information:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

//patients collection

app.get("/dentistry_clinic_admin/patients", async (req, res) => {
  try {
    await connect();
    const collection = db.collection("patients");
    const results = await collection.find({}).toArray();
    res.json(results);
  } catch (e) {
    console.error("Error fetching patients:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/dentistry_clinic_admin/patients/", async (req, res) => {
  try {
    await connect();
    const collection = db.collection("patients");
    const newPatient = req.body;

    // validation

    const result = await collection.insertOne(newPatient);
    res.json({ message: "Patient added successfully" });
  } catch (e) {
    console.error("Error adding new patient:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/dentistry_clinic_admin/patients/:id", async (req, res) => {
  try {
    await connect();
    const objectId = new ObjectId(req.params.id);
    const collection = db.collection("patients");
    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({ message: "Patient deleted successfully" });
  } catch (e) {
    console.error("Error deleting patient:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/dentistry_clinic_admin/patients/:id", async (req, res) => {
  try {
    await connect();
    const objectId = new ObjectId(req.params.id);
    const collection = db.collection("patients");
    const editedInfo = req.body;

    const updateFields = {};
    if (editedInfo.name) {
      updateFields.name = editedInfo.name;
    }
    if (editedInfo.lastname) {
      updateFields.name = editedInfo.lastname;
    }
    if (editedInfo.contactInfo) {
      updateFields.contactInfo = {};
      if (editedInfo.contactInfo.phone) {
        updateFields.contactInfo.phone = editedInfo.contactInfo.phone;
      }
      if (editedInfo.contactInfo.email) {
        updateFields.contactInfo.email = editedInfo.contactInfo.email;
      }
      if (editedInfo.contactInfo.address) {
        updateFields.contactInfo.address = editedInfo.contactInfo.address;
      }
    }

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({ message: "Patient information updated successfully" });
  } catch (e) {
    console.error("Error editing patient information:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post(
  "/dentistry_clinic_admin/patients/:id/add-medical-condition",
  async (req, res) => {
    try {
      await connect();
      const patientId = req.params.id;
      const newMedicalCondition = req.body;
      const collection = db.collection("patients");

      const patient = await collection.findOne({
        _id: new ObjectId(patientId),
      });
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      await collection.updateOne(
        { _id: new ObjectId(patientId) },
        { $push: { medicalHistory: newMedicalCondition } }
      );

      res.status(200).json({ message: "Medical condition added successfully" });
    } catch (e) {
      console.error("Error adding medical condition:", e);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// procedures

app.get("/dentistry_clinic_admin/procedures", async (req, res) => {
  try {
    await connect();
    const collection = db.collection("procedures");
    const results = await collection.find({}).toArray();
    res.json(results);
  } catch (e) {
    console.error("Error fetching procedures:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/dentistry_clinic_admin/procedures/:id", async (req, res) => {
  try {
    await connect();
    const objectId = new ObjectId(req.params.id);
    const collection = db.collection("procedures");
    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Procedure not found" });
    }

    res.json({ message: "Procedure deleted successfully" });
  } catch (e) {
    console.error("Error deleting procedure:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/dentistry_clinic_admin/procedures/", async (req, res) => {
  try {
    await connect();
    const collection = db.collection("procedures");
    const newProcedure = req.body;

    // Validation

    const result = await collection.insertOne(newProcedure);
    res.json({
      message: "Procedure added successfully",
      procedureId: result.insertedId,
    });
  } catch (e) {
    console.error("Error adding new procedure:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/dentistry_clinic_admin/procedures/:id", async (req, res) => {
  try {
    await connect();
    const objectId = new ObjectId(req.params.id);
    const collection = db.collection("procedures");
    const editedInfo = req.body;

    const updateFields = {};
    if (editedInfo.name) {
      updateFields.name = editedInfo.name;
    }
    if (editedInfo.duration) {
      updateFields.duration = editedInfo.duration;
    }
    if (editedInfo.price) {
      updateFields.price = editedInfo.price;
    }

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Procedure not found" });
    }

    res.json({ message: "Procedure information updated successfully" });
  } catch (e) {
    console.error("Error editing procedure information:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// appointments collection

app.get("/dentistry_clinic_admin/appointments", async (req, res) => {
  try {
    await connect();
    const collection = db.collection("appointments");
    const pipeline = [
      {
        $lookup: {
          from: "procedures",
          localField: "procedureName",
          foreignField: "name",
          as: "procedure",
        },
      },
      {
        $unwind: "$procedure",
      },
      {
        $project: {
          doctorName: 1,
          patientName: 1,
          procedureName: 1,
          price: "$procedure.price",
          report: 1,
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();
    res.send(results);
  } catch (e) {
    console.error("Error fetching appointments:", e);
    res.status(500).send("Internal server error");
  }
});

app.post("/dentistry_clinic_admin/appointments/", async (req, res) => {
  try {
    await connect();
    const collection = db.collection("appointments");
    const newAppointment = req.body;

    // Validation

    const result = await collection.insertOne(newAppointment);
    res.json({
      message: "Appointment added successfully",
      appointmentId: result.insertedId,
    });
  } catch (e) {
    console.error("Error adding new appointment:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/dentistry_clinic_admin/appointments/:id", async (req, res) => {
  try {
    await connect();
    const objectId = new ObjectId(req.params.id);
    const collection = db.collection("appointments");
    const editedInfo = req.body;

    const updateFields = {};
    if (editedInfo.doctorName) {
      updateFields.doctorName = editedInfo.doctorName;
    }
    if (editedInfo.patientName) {
      updateFields.patientName = editedInfo.patientName;
    }
    if (editedInfo.procedureName) {
      updateFields.procedureName = editedInfo.procedureName;
    }
    if (editedInfo.comment) {
      updateFields.comment = editedInfo.comment;
    }

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ message: "Appointment information updated successfully" });
  } catch (e) {
    console.error("Error editing appointment information:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// schedules

app.get("/dentistry_clinic_admin/schedules", async (req, res) => {
  try {
    await connect();
    const collection = db.collection("schedules");
    const pipeline = [
      {
        $lookup: {
          from: "procedures",
          localField: "procedureName",
          foreignField: "name",
          as: "procedure",
        },
      },
      {
        $unwind: "$procedure",
      },
      {
        $project: {
          doctorName: 1,
          patientName: 1,
          procedureName: 1,
          price: "$procedure.price",
          appointmentDate: 1,
          comment: 1,
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();
    res.send(results);
  } catch (e) {
    console.error("Error fetching schedules:", e);
    res.status(500).send("Internal server error");
  }
});

app.post("/dentistry_clinic_admin/schedules/", async (req, res) => {
  try {
    await connect();
    const collection = db.collection("schedules");
    const newSchedule = req.body;

    // Validation

    const result = await collection.insertOne(newSchedule);
    res.json({
      message: "Schedule added successfully",
      scheduleId: result.insertedId,
    });
  } catch (e) {
    console.error("Error adding new schedule:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/dentistry_clinic_admin/schedules/:id", async (req, res) => {
  try {
    await connect();
    const objectId = new ObjectId(req.params.id);
    const collection = db.collection("schedules");
    const editedInfo = req.body;

    const updateFields = {};
    if (editedInfo.doctorName) {
      updateFields.doctorName = editedInfo.doctorName;
    }
    if (editedInfo.patientName) {
      updateFields.patientName = editedInfo.patientName;
    }
    if (editedInfo.procedureName) {
      updateFields.procedureName = editedInfo.procedureName;
    }
    if (editedInfo.comment) {
      updateFields.comment = editedInfo.comment;
    }

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ message: "Schedule information updated successfully" });
  } catch (e) {
    console.error("Error editing schedule information:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(8080, () => {
  console.log("Server started");
});
