require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.static('build'))

const cors = require('cors')

app.use(cors())

const Person = require('./models/person')

//morgan related stuff
const morgan = require('morgan')

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

const morganFormat =
  ':method :url :status :res[content-length] - :response-time ms :body'

app.use(morgan(morganFormat, {
  stream: process.stdout
}))

//express
app.use(express.json())

/* let persons = [
  {
    'id': 1,
    'name': 'Arto Hellas',
    'number': '040-123456'
  },
  {
    'id': 2,
    'name': 'Ada Lovelace',
    'number': '39-44-5323523'
  },
  {
    'id': 3,
    'name': 'Dan Abramov',
    'number': '12-43-234345'
  },
  {
    'id': 4,
    'name': 'Mary Poppendieck',
    'number': '39-23-6423122'
  }
] */


app.get('/api/persons',(request,response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info',(request,response,next) => {
  Person.countDocuments({})
    .then(count => {
      const date = new Date
      response.send(`<p>Phonebook has info for ${count} people </p> <p>  ${date.toString()} </p>`)
    })
    .catch(error => next(error))
})


app.get('/api/persons/:id',(request,response,next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})



app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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

  Person.findOne({ name: body.name })
    .then(existingPerson => {
      if (existingPerson) {
      // Update the existing person's number
        const id = existingPerson._id
        const person = {
          name: body.name,
          number: body.number,
        }

        Person.findByIdAndUpdate(id, person, { new: true })
          .then(updatedPerson => {
            response.json(updatedPerson)
            console.log(`${body.name} updated`)
          })
          .catch(error => next(error))
      } else {
      // Create new person
        const person = new Person({
          name: body.name,
          number: body.number,
        })

        person.save()
          .then(savedPerson => {
            response.json(savedPerson)
            console.log(`${body.name} saved as a new entry`)
          })
          .catch(error => next(error))
      }
    })
    .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' })

    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)