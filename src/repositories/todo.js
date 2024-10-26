export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function findByUserID(userID) {
        const cursor = await collection.find({ userID }).sort({ created: -1 })
        const results = await cursor.toArray();
        return results;
    }

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    async function updateName(todoID, userID, name) {
        return await collection.updateOne({ todoID, userID }, { $set: { name } });
    }

    async function updateIsDone(todoID, userID, isDone) {
        return await collection.updateOne({ todoID, userID }, { $set: { isDone } });
    }

    return {
        findByUserID,
        insertOne,
        updateName,
        updateIsDone,
    };
};