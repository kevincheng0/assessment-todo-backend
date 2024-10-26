import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { v4 as uuidv4 } from 'uuid';
import { validateTodo, validateUser } from '../schemas/validators.js';
import auth from '../middleware/auth.js';
import { verifyToken } from '../functions/cookies.js';


dayjs.extend(utc);
const router = express.Router();

export default ({todoRepository}) => {
    // Get all todos by user id, sorted by recent first
    router.get('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const userID = session.userID;

            let results = await todoRepository.findByUserID(userID);
            const resultsWithUserID = results.map(todo => { 
                todo.userID = todo._id;
                return todo;
            });
            return res.status(201).send(resultsWithUserID);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo lookup failed."});
        }
    });

    // Create new todo
    router.post('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const todoID = uuidv4();
            const created = dayjs().utc().toISOString();

            let newTodo = {
                ...req.body,
                isDone: false,
                todoID,
                userID: session.userID,
                created
            };

            if (validateTodo(newTodo)) {
                let resultTodo = await todoRepository.insertOne(newTodo);
                resultTodo.created = created;
                return res.status(201).send(resultTodo);
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo creation failed."});
        }
    });

    router.put('/name', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const { todoID, name } = req.body;
            const userID = session.userID;

            let resultTodo = await todoRepository.updateName(todoID, userID, name);
            return res.status(201).send(resultTodo);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo name update failed."});
        }
    });

    router.put('/isDone', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const { todoID, isDone } = req.body;
            const userID = session.userID;

            let resultTodo = await todoRepository.updateIsDone(todoID, userID, isDone);
            return res.status(201).send(resultTodo);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo isDone update failed."});
        }
    });

    return router;
}
