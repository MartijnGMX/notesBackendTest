require('dotenv').config()
const express = require('express')
const Note = require('./models/note')

const app = express()

app.use(express.json())

app.use(express.static('dist')) // serve static web page

app.get('/api/notes', (req, resp) => {
    // resp.json(notes)
    Note.find({}).then(notes => {
        resp.json(notes)
    })
})

app.get('/api/notes/:id', (req, resp, next) => {
    const id = req.params.id
    //const note = notes.find(n => n.id === id)
    Note.findById(id)
        .then(note => {
            if (note) {
                resp.json(note)
            } else {
                resp.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {

    Note.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => Number(n.id)))
        : 0
    return String(maxId + 1)
}

app.post('/api/notes', (req, resp, next) => {

    const body = req.body
    if (!body.content) {
        return resp.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
    })

    note.save()
        .then(savedNote => {
            console.log('added note:', savedNote)
            resp.json(savedNote)

        })
        .catch(error => next(error))

})

app.put('/api/notes/:id', (request, response, next) => {
    const { content, important } = request.body

    Note.findById(request.params.id)
        .then(note => {
            if (!note) {
                return response.status(404).end()
            }

            note.content = content
            note.important = important

            console.log(`Changed note id ${note.id}: important=${note.important}`);
            return note.save().then((updatedNote) => {
                response.json(updatedNote)
            })
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name = 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {

    console.log(`Notes backend running on port ${PORT}`)
})
