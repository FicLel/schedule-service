db.createUser({
	user : "mongo",
	pwd : "123456",
	roles : [{
		role: "readWrite",
		db: "example"
	}]
})