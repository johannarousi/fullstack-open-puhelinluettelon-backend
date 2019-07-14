require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

// MORGAN
// app.use(morgan("tiny"));
morgan.token("body", function(req, res) {
  return JSON.stringify(req.body);
});

const app = express();

app.use(express.static("build"));
app.use(bodyParser.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);
app.use(cors());

// let persons = [
//   {
//     name: "Arto Hellas",
//     number: "040-123456",
//     id: 1
//   },
//   {
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//     id: 2
//   },
//   {
//     name: "Dan Abramov",
//     number: "12-43-234345",
//     id: 3
//   },
//   {
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//     id: 4
//   }
// ];

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

// const errorHandler = (error, req, res, next) => {
//   // console.error(error.message);

//   if (error.name === "CastError" && error.kind == "ObjectId") {
//     return res.status(400).send({ error: "malformatted id" });
//   } else if (error.name === "ValidationError") {
//     console.log(error.name);
//     return res.status(400).json({ error: error.message });
//   }

//   next(error);
// };

// app.use(errorHandler);

app.get("/info", (req, res) => {
  Person.find({}).then(persons => {
    res.send(
      `<p>Phonebook has info for ${
        persons.length
      } people</p><p>${new Date()}</p>`
    );
  });
});

// app.get('/api/persons', (req, res) => {
//   res.json(persons)
// });

app.get("/api/persons", (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  });
});

//app.get("/api/persons/:id", (req, res) => {
// const id = Number(req.params.id);
// const person = persons.find(person => person.id === id);
// if (person) {
//   res.json(person);

//  });
// } else {
//   res.status(404).end();
// }
//});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON());
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end();
    })
    .catch(error => next(error));
});
// app.delete("/api/persons/:id", (req, res) => {
//   const id = Number(req.params.id);
//   persons = persons.filter(person => person.id !== id);

//   res.status(204).end();
// });

// const generateId = () => {
//   const generatedId =
//     persons.length > 0
//       ? Math.floor(Math.random() * 1000000) + persons.length + 1
//       : 0;
//   return generatedId;
// };

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  const person = new Person({
    name: body.name,
    number: body.number
  });

  person
    .save()
    .then(savedNumber => {
      res.json(savedNumber.toJSON());
    })
    .catch(error => next(error));
});

// app.post("/api/persons", (req, res) => {
//   const body = req.body;
//   if (!body.name) {
//     return res.status(400).json({
//       error: "name missing"
//     });
//   }
//   if (!body.number) {
//     return res.status(400).json({
//       error: "number missing"
//     });
//   }
//   if (persons.find(person => person.name === body.name)) {
//     return res.status(400).json({
//       error: `${body.name} already exists`
//     });
//   }
//   const person = {
//     name: body.name,
//     number: body.number,
//     id: generateId()
//   };
//   persons = persons.concat(person);
//   res.json(person);
// });

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON());
    })
    .catch(error => next(error));
});

// app.get("/info", (req, res) => {
//   res.send(
//     `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
//   );
// });

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError" && error.kind == "ObjectId") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
