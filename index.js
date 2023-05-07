require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.static('build'))

const cors = require('cors')

app.use(cors())

const Person = require('./models/person')

//morgan related stuff
const morgan = require('morgan')

morgan.token('body', (req, res) => {
  return JSON.stringify(req.body)
})

const morganFormat =
  ':method :url :status :res[content-length] - :response-time ms :body'

app.use(morgan(morganFormat, {
  stream: process.stdout
}))

//express 
app.use(express.json())

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.get('/api/persons',(request,response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info',(request,response) => {
    console.log(persons.length)
    const count = persons.length
    const date = new Date 
   response.send(`<p>Phonebook has info for ${count} people </p> <p>  ${date.toString()} </p>`)
})


app.get('/api/persons/:id',(request,response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
/*   const id = Number(request.params.id)
  console.log(id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  }
  else {
    response.status(404).end()
  } */
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name ) {
    return response.status(400).json({ 
      error: 'name is missing' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number is missing' 
    })
  }

/*   const check = persons.find(person => person.name.toLowerCase().trim() === body.name.toLowerCase().trim())
  console.log(check)

  if (check) {
    return response.status(409).json({ 
      error: 'name must be unique' 
    })
  }

  else {
    const person = {
      id: generateId(),
      name: body.name,
      number: body.number
    }
    persons = persons.concat(person)
    response.json(person)
  } */
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})


const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)