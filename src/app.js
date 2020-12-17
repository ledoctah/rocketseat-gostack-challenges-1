const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid, v4, validate } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

const findRepositoryIndex = (id) => {
	return repositories.findIndex(repository => repository.id === id);
}

const validateId = (request, response, next) => {
	const { id } = request.params;

	if(!validate(id)) return response.status(400).json({ error: 'Invalid repository ID' });

	const index = findRepositoryIndex(id);

	if(index < 0) return response.status(400).json({ error: 'Repository not found.'});

	request.body.index = index;

	return next();
}

app.use('/repositories/:id', validateId);

app.get("/repositories", (request, response) => {
	return response.json(repositories);
});

app.post("/repositories", (request, response) => {
	const { title, url, techs } = request.body;

	const repository = {
		id: v4(),
		title,
		url,
		techs,
		likes: 0
	}

	repositories.push(repository);

	return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
	const { title, url, techs, index } = request.body;

	const repository = {
		...repositories[index],
		title,
		url,
		techs
	}

	repositories[index] = repository;

	return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
	const { index } = request.body;

	repositories.splice(index, 1);

	return response.status(204).send();
});

app.post("/repositories/:id/like", validateId, (request, response) => {
	const { index } = request.body;

	repositories[index].likes++;

	return response.json(repositories[index]);
});

module.exports = app;
